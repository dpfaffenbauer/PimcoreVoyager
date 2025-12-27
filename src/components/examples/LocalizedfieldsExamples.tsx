/**
 * Localizedfields Usage Example
 * 
 * This example demonstrates how to use the Localizedfields data type
 * in your screens and forms.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { 
  LocalizedfieldsDisplay, 
  LocalizedfieldsEdit,
  validateLocalizedfields,
  LocalizedfieldsTransformer,
  LocalizedValue,
  LocalizedfieldsConfig 
} from '../dataTypes/Localizedfields';
import { getDataType } from '../dataTypes/registry';

/**
 * Example 1: Basic Display Component
 */
export function LocalizedfieldsDisplayExample() {
  const config: LocalizedfieldsConfig = {
    name: 'productInfo',
    title: 'Product Information',
    type: 'localizedfields',
    fieldDefinitions: [
      {
        name: 'name',
        title: 'Product Name',
        fieldtype: 'input',
        mandatory: true,
      },
      {
        name: 'description',
        title: 'Description',
        fieldtype: 'textarea',
      },
      {
        name: 'features',
        title: 'Features',
        fieldtype: 'textarea',
      },
    ],
  };

  const value: LocalizedValue = {
    de: {
      name: 'Hochleistungslaptop',
      description: 'Ein leistungsstarker Laptop für professionelle Anwender',
      features: 'Intel i7, 16GB RAM, 512GB SSD',
    },
    en: {
      name: 'High Performance Laptop',
      description: 'A powerful laptop for professional users',
      features: 'Intel i7, 16GB RAM, 512GB SSD',
    },
    fr: {
      name: 'Ordinateur portable haute performance',
      description: 'Un ordinateur portable puissant pour les utilisateurs professionnels',
      features: 'Intel i7, 16 Go de RAM, SSD de 512 Go',
    },
  };

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.exampleTitle}>Display Example</Text>
      <LocalizedfieldsDisplay value={value} config={config} />
    </View>
  );
}

/**
 * Example 2: Editable Form Component
 */
export function LocalizedfieldsEditExample() {
  const [value, setValue] = useState<LocalizedValue>({
    de: {
      name: 'Beispielprodukt',
      description: '',
    },
    en: {
      name: 'Sample Product',
      description: '',
    },
  });
  const [error, setError] = useState<string>('');

  const config: LocalizedfieldsConfig = {
    name: 'productInfo',
    title: 'Product Information',
    type: 'localizedfields',
    mandatory: true,
    fieldDefinitions: [
      {
        name: 'name',
        title: 'Product Name',
        fieldtype: 'input',
        mandatory: true,
      },
      {
        name: 'description',
        title: 'Description',
        fieldtype: 'textarea',
      },
    ],
  };

  const handleSave = () => {
    // Validate before saving
    const validation = validateLocalizedfields(value, config);
    
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    // Transform to API format
    const apiValue = LocalizedfieldsTransformer.toAPI(value);
    
    // Send to API...
    console.log('Saving to API:', apiValue);
    setError('');
    alert('Data saved successfully!');
  };

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.exampleTitle}>Edit Example</Text>
      <LocalizedfieldsEdit 
        value={value} 
        onChange={setValue} 
        config={config}
        error={error}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

/**
 * Example 3: Using the Data Type Registry
 */
export function RegistryExample() {
  const [value, setValue] = useState<LocalizedValue>({
    de: { title: 'Deutscher Text' },
    en: { title: 'English Text' },
  });

  const config: LocalizedfieldsConfig = {
    name: 'content',
    title: 'Content',
    type: 'localizedfields',
    fieldDefinitions: [
      { name: 'title', title: 'Title', fieldtype: 'input' },
    ],
  };

  // Get the data type from registry
  const dataType = getDataType('localizedfields');
  
  if (!dataType) {
    return <Text>Data type not found</Text>;
  }

  const DisplayComponent = dataType.display;
  const EditComponent = dataType.edit;

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.exampleTitle}>Registry Example</Text>
      
      <Text style={styles.sectionTitle}>Display (from Registry):</Text>
      <DisplayComponent value={value} config={config} />
      
      <View style={styles.separator} />
      
      <Text style={styles.sectionTitle}>Edit (from Registry):</Text>
      <EditComponent 
        value={value} 
        onChange={setValue} 
        config={config}
      />
    </View>
  );
}

/**
 * Example 4: API Integration
 */
export function ApiIntegrationExample() {
  const [value, setValue] = useState<LocalizedValue>({});
  const [loading, setLoading] = useState(false);

  const config: LocalizedfieldsConfig = {
    name: 'productData',
    title: 'Product Data',
    type: 'localizedfields',
    fieldDefinitions: [
      { name: 'title', title: 'Title', fieldtype: 'input', mandatory: true },
      { name: 'description', title: 'Description', fieldtype: 'textarea' },
    ],
  };

  // Simulate loading from API
  const loadFromApi = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const apiResponse = {
      de: { title: 'API Titel', description: 'API Beschreibung' },
      en: { title: 'API Title', description: 'API Description' },
    };
    
    // Transform from API format
    const uiValue = LocalizedfieldsTransformer.fromAPI(apiResponse);
    setValue(uiValue);
    setLoading(false);
  };

  // Simulate saving to API
  const saveToApi = async () => {
    setLoading(true);
    
    // Validate
    const validation = validateLocalizedfields(value, config);
    if (!validation.valid) {
      alert('Validation failed: ' + validation.errors.join(', '));
      setLoading(false);
      return;
    }
    
    // Transform to API format
    const apiValue = LocalizedfieldsTransformer.toAPI(value);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saved to API:', apiValue);
    
    setLoading(false);
    alert('Saved successfully!');
  };

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.exampleTitle}>API Integration Example</Text>
      
      <View style={styles.buttonRow}>
        <Button 
          title={loading ? 'Loading...' : 'Load from API'} 
          onPress={loadFromApi}
          disabled={loading}
        />
        <Button 
          title={loading ? 'Saving...' : 'Save to API'} 
          onPress={saveToApi}
          disabled={loading}
        />
      </View>
      
      <LocalizedfieldsEdit 
        value={value} 
        onChange={setValue} 
        config={config}
      />
    </View>
  );
}

/**
 * Complete Demo Screen with All Examples
 */
export default function LocalizedfieldsExamplesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Localizedfields Examples</Text>
      
      <LocalizedfieldsDisplayExample />
      <LocalizedfieldsEditExample />
      <RegistryExample />
      <ApiIntegrationExample />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  exampleContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#6200ee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
});
