/**
 * Multiselect Demo Screen
 * Demonstrates the Multiselect data type component
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { MultiselectDisplay, MultiselectEdit, validateMultiselect, MultiselectConfig } from '../components/dataTypes/Multiselect';

export default function MultiselectDemoScreen() {
  // Demo data
  const [selectedColors, setSelectedColors] = useState<(string | number)[]>(['red', 'blue']);
  const [selectedCategories, setSelectedCategories] = useState<(string | number)[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<(string | number)[]>([1, 3, 5]);

  // Configuration for different multiselect examples
  const colorsConfig: MultiselectConfig = {
    label: 'Favorite Colors',
    name: 'colors',
    options: [
      { key: 'Red', value: 'red' },
      { key: 'Blue', value: 'blue' },
      { key: 'Green', value: 'green' },
      { key: 'Yellow', value: 'yellow' },
      { key: 'Purple', value: 'purple' },
      { key: 'Orange', value: 'orange' },
    ],
    placeholder: 'Select colors...',
    allowClear: true,
  };

  const categoriesConfig: MultiselectConfig = {
    label: 'Product Categories',
    name: 'categories',
    options: [
      { key: 'Electronics', value: 'electronics' },
      { key: 'Clothing', value: 'clothing' },
      { key: 'Books', value: 'books' },
      { key: 'Home & Garden', value: 'home-garden' },
      { key: 'Sports', value: 'sports' },
      { key: 'Toys', value: 'toys' },
      { key: 'Food & Beverages', value: 'food' },
      { key: 'Beauty', value: 'beauty' },
    ],
    mandatory: true,
    placeholder: 'Select at least one category...',
  };

  const countriesConfig: MultiselectConfig = {
    label: 'Countries Visited',
    name: 'countries',
    options: [
      { key: 'Germany', value: 1 },
      { key: 'France', value: 2 },
      { key: 'Italy', value: 3 },
      { key: 'Spain', value: 4 },
      { key: 'United Kingdom', value: 5 },
      { key: 'Netherlands', value: 6 },
      { key: 'Austria', value: 7 },
      { key: 'Switzerland', value: 8 },
      { key: 'Belgium', value: 9 },
      { key: 'Portugal', value: 10 },
      { key: 'Greece', value: 11 },
      { key: 'Poland', value: 12 },
      { key: 'Czech Republic', value: 13 },
      { key: 'Denmark', value: 14 },
      { key: 'Sweden', value: 15 },
    ],
    maxItems: 5,
    placeholder: 'Select up to 5 countries...',
  };

  // Validation
  const categoriesValidation = validateMultiselect(selectedCategories, categoriesConfig);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Multiselect Demo</Title>
        <Paragraph style={styles.subtitle}>
          Demonstriert die Pimcore Multiselect Komponente mit verschiedenen Konfigurationen
        </Paragraph>
      </View>

      {/* Example 1: Basic Multiselect */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>1. Basic Multiselect</Title>
          <Paragraph style={styles.description}>
            Einfache Mehrfachauswahl mit Farben. Erlaubt das Löschen aller Auswahlen.
          </Paragraph>
          <Divider style={styles.divider} />
          
          <MultiselectEdit
            value={selectedColors}
            onChange={setSelectedColors}
            config={colorsConfig}
          />
          
          <View style={styles.displaySection}>
            <Text style={styles.sectionLabel}>Display Component:</Text>
            <MultiselectDisplay
              value={selectedColors}
              config={colorsConfig}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Example 2: Mandatory Multiselect */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>2. Mandatory Multiselect</Title>
          <Paragraph style={styles.description}>
            Pflichtfeld mit Validierung. Mindestens eine Kategorie muss ausgewählt werden.
          </Paragraph>
          <Divider style={styles.divider} />
          
          <MultiselectEdit
            value={selectedCategories}
            onChange={setSelectedCategories}
            config={categoriesConfig}
            error={!categoriesValidation.valid ? categoriesValidation.errors[0] : undefined}
          />
          
          {selectedCategories.length > 0 && (
            <View style={styles.displaySection}>
              <Text style={styles.sectionLabel}>Display Component:</Text>
              <MultiselectDisplay
                value={selectedCategories}
                config={categoriesConfig}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Example 3: Multiselect with maxItems and Search */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>3. Limited Selection with Search</Title>
          <Paragraph style={styles.description}>
            Begrenzt auf maximal 5 Auswahlen. Mit Suchfunktion für viele Optionen.
          </Paragraph>
          <Divider style={styles.divider} />
          
          <MultiselectEdit
            value={selectedCountries}
            onChange={setSelectedCountries}
            config={countriesConfig}
          />
          
          <View style={styles.displaySection}>
            <Text style={styles.sectionLabel}>Display Component:</Text>
            <MultiselectDisplay
              value={selectedCountries}
              config={countriesConfig}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Example 4: Readonly Display */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>4. Readonly Mode</Title>
          <Paragraph style={styles.description}>
            Nur-Lese Modus für die Anzeige von Daten ohne Bearbeitung.
          </Paragraph>
          <Divider style={styles.divider} />
          
          <MultiselectEdit
            value={['red', 'blue', 'green']}
            onChange={() => {}}
            config={colorsConfig}
            readonly={true}
          />
        </Card.Content>
      </Card>

      {/* Debug Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Debug Information</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugLabel}>Colors Selected:</Text>
            <Text style={styles.debugValue}>{JSON.stringify(selectedColors)}</Text>
          </View>
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugLabel}>Categories Selected:</Text>
            <Text style={styles.debugValue}>{JSON.stringify(selectedCategories)}</Text>
          </View>
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugLabel}>Countries Selected:</Text>
            <Text style={styles.debugValue}>{JSON.stringify(selectedCountries)}</Text>
          </View>
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugLabel}>Categories Validation:</Text>
            <Text style={[styles.debugValue, !categoriesValidation.valid && styles.debugError]}>
              {categoriesValidation.valid ? 'Valid' : `Invalid: ${categoriesValidation.errors.join(', ')}`}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedColors([]);
              setSelectedCategories([]);
              setSelectedCountries([]);
            }}
            style={styles.button}
          >
            Reset All
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  displaySection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debugInfo: {
    marginBottom: 12,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  debugValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  debugError: {
    color: '#e53e3e',
  },
  button: {
    marginTop: 8,
  },
});
