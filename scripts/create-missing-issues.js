#!/usr/bin/env node

/**
 * Script to create GitHub issues for missing Pimcore Data Object types
 * 
 * This script reads the pimcore-data-types.json file and creates issues
 * for data types that don't have an issue yet.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

const DATA_TYPES_FILE = path.join(__dirname, 'pimcore-data-types.json');
const REPO = 'dpfaffenbauer/PimcoreVoyager';
// Configuration for Pimcore Studio UI Bundle reference
const PIMCORE_STUDIO_CONFIG = {
  baseUrl: 'https://github.com/pimcore/studio-ui-bundle',
  branch: '1.x',
  typesPath: 'assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types'
};
const BASE_URL = `${PIMCORE_STUDIO_CONFIG.baseUrl}/blob/${PIMCORE_STUDIO_CONFIG.branch}/${PIMCORE_STUDIO_CONFIG.typesPath}`;

/**
 * Generate issue title for a data type
 */
function generateIssueTitle(dataType) {
  if (!dataType.name) {
    throw new Error('Data type must have a name property');
  }
  return `Implement Anzeige und Bearbeitung für Pimcore Data Object Typ: ${dataType.name}`;
}

/**
 * Generate issue body for a data type
 */
function generateIssueBody(dataType) {
  if (!dataType.filename) {
    throw new Error(`Data type ${dataType.name} must have a filename property`);
  }
  
  const referenceUrl = `${BASE_URL}/${dataType.filename}`;
  
  let body = `Implementiere die Anzeige und Bearbeitung des Pimcore Data Object Typs "${dataType.name}" in unserer React Native App.\n\n`;
  body += `Referenz zur Komponente:\n${referenceUrl}\n\n`;
  
  // Add category-specific implementation notes
  switch (dataType.category) {
    case 'text':
      body += `- Implementiere Textfeld-Komponente für mobile Eingabe.\n`;
      body += `- Unterstütze Validierung und Formatierung.\n`;
      body += `- Optimiere für Touch-Eingabe.`;
      break;
    case 'numeric':
      body += `- Implementiere numerische Eingabe mit entsprechender Tastatur.\n`;
      body += `- Validiere Zahlenwerte und Bereiche.\n`;
      body += `- Unterstütze Formatierung nach Locale.`;
      break;
    case 'date':
      body += `- Implementiere Datums-/Zeit-Picker für mobile Geräte.\n`;
      body += `- Unterstütze verschiedene Datumsformate.\n`;
      body += `- Optimiere für Touch-Interaktion.`;
      break;
    case 'select':
      body += `- Implementiere Auswahl-Komponente (Select/Picker).\n`;
      body += `- Unterstütze Suche bei vielen Optionen.\n`;
      body += `- Optimiere für mobile Nutzung.`;
      break;
    case 'media':
      body += `- Implementiere Medien-Anzeige und -Auswahl.\n`;
      body += `- Unterstütze Upload und Vorschau.\n`;
      body += `- Optimiere für mobile Performance.`;
      break;
    case 'relation':
      body += `- Implementiere Relationen-Auswahl und -Anzeige.\n`;
      body += `- Unterstütze Suche und Filterung.\n`;
      body += `- Optimiere für komplexe Relationen.`;
      break;
    case 'structured':
      body += `- Implementiere strukturierte Daten-Anzeige.\n`;
      body += `- Unterstütze Bearbeitung komplexer Strukturen.\n`;
      body += `- Optimiere für mobile Darstellung.`;
      break;
    case 'geo':
      body += `- Implementiere Geo-Daten-Anzeige und -Eingabe.\n`;
      body += `- Integriere Karten-Komponente.\n`;
      body += `- Unterstütze GPS-Funktionalität.`;
      break;
    case 'simple':
      body += `- Implementiere einfache Eingabe-/Anzeige-Komponente.\n`;
      body += `- Optimiere für mobile Nutzung.\n`;
      body += `- Unterstütze Validierung.`;
      break;
    default:
      body += `- UI- und Edit-Komponenten müssen für mobile Nutzung optimiert werden.\n`;
      body += `- Besondere Anforderungen an das Mapping und die Darstellung beachten.`;
  }
  
  return body;
}

/**
 * Cross-platform delay function
 */
function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * Create a GitHub issue using gh CLI
 */
async function createIssue(dataType) {
  const title = generateIssueTitle(dataType);
  const body = generateIssueBody(dataType);
  // Use cryptographically secure random filename to avoid conflicts in concurrent executions
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const tempFile = path.join(__dirname, `.issue-body-${timestamp}-${randomSuffix}.tmp`);
  
  try {
    console.log(`Creating issue for: ${dataType.name}`);
    
    // Write body to temporary file to avoid command injection
    fs.writeFileSync(tempFile, body, 'utf-8');
    
    // Use spawn with array of arguments to avoid shell escaping issues
    const result = spawnSync('gh', [
      'issue',
      'create',
      '--repo', REPO,
      '--title', title,
      '--body-file', tempFile,
      '--label', 'documentation'
    ], {
      encoding: 'utf-8',
      shell: false
    });
    
    if (result.error) {
      throw result.error;
    }
    
    if (result.status !== 0) {
      throw new Error(result.stderr || 'Command failed');
    }
    
    const issueUrl = result.stdout.trim();
    console.log(`✓ Created issue: ${issueUrl}`);
    return issueUrl;
  } catch (error) {
    console.error(`✗ Failed to create issue for ${dataType.name}:`, error.message);
    return null;
  } finally {
    // Clean up temp file
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (cleanupError) {
      console.warn(`Warning: Could not clean up temp file: ${cleanupError.message}`);
    }
  }
}

/**
 * Check if gh CLI is authenticated
 */
function isGhAuthenticated() {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Export issues as markdown for manual creation
 */
function exportAsMarkdown(missingIssues) {
  console.log('\n=== Issues for Manual Creation ===\n');
  
  missingIssues.forEach((dataType, index) => {
    const title = generateIssueTitle(dataType);
    const body = generateIssueBody(dataType);
    
    console.log(`## ${index + 1}. ${dataType.name}\n`);
    console.log(`**Title:**`);
    console.log(title);
    console.log('');
    console.log(`**Body:**`);
    console.log(body);
    console.log('');
    console.log(`**Labels:** documentation`);
    console.log('');
    console.log('---');
    console.log('');
  });
}

/**
 * Main function
 */
async function main() {
  console.log('Reading data types from:', DATA_TYPES_FILE);
  
  // Read and parse data types with error handling
  let dataTypes;
  try {
    const dataTypesJson = fs.readFileSync(DATA_TYPES_FILE, 'utf-8');
    const parsed = JSON.parse(dataTypesJson);
    dataTypes = parsed.dataTypes;
    
    if (!Array.isArray(dataTypes)) {
      throw new Error('Data types must be an array');
    }
  } catch (error) {
    console.error('Error reading or parsing data types file:');
    console.error(`  File: ${DATA_TYPES_FILE}`);
    console.error(`  Error: ${error.message}`);
    process.exit(1);
  }
  
  // Filter out data types that already have issues
  const missingIssues = dataTypes.filter(dt => !dt.hasIssue);
  
  console.log(`\nFound ${missingIssues.length} data types without issues:`);
  missingIssues.forEach(dt => {
    console.log(`  - ${dt.name} (${dt.category})`);
  });
  
  // Check if gh is authenticated
  if (!isGhAuthenticated()) {
    console.log('\n⚠ GitHub CLI (gh) is not authenticated.');
    console.log('To create issues automatically, run: gh auth login');
    console.log('\nAlternatively, use the markdown export below for manual issue creation:\n');
    
    exportAsMarkdown(missingIssues);
    return;
  }
  
  console.log('\n--- Starting issue creation ---\n');
  
  const createdIssues = [];
  for (const dataType of missingIssues) {
    const issueUrl = await createIssue(dataType);
    if (issueUrl) {
      createdIssues.push({ dataType: dataType.name, url: issueUrl });
    }
    
    // Cross-platform delay to avoid rate limiting
    await delay(1);
  }
  
  console.log('\n--- Summary ---');
  console.log(`Total data types: ${dataTypes.length}`);
  console.log(`Already have issues: ${dataTypes.filter(dt => dt.hasIssue).length}`);
  console.log(`Created new issues: ${createdIssues.length}`);
  console.log(`Failed: ${missingIssues.length - createdIssues.length}`);
  
  if (createdIssues.length > 0) {
    console.log('\nCreated issues:');
    createdIssues.forEach(({ dataType, url }) => {
      console.log(`  - ${dataType}: ${url}`);
    });
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateIssueTitle, generateIssueBody, createIssue, isGhAuthenticated, exportAsMarkdown };
