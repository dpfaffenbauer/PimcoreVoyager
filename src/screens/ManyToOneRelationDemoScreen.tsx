/**
 * Demo Screen for Many-to-One Relation Field
 * Showcases the Display and Edit components
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button, Card, Title, Divider } from 'react-native-paper';
import {
  ManyToOneRelationDisplay,
  ManyToOneRelationEdit,
  ManyToOneRelationValue,
  ManyToOneRelationConfig,
  validateManyToOneRelation,
} from '../components/dataTypes/ManyToOneRelation';

export default function ManyToOneRelationDemoScreen() {
  const [displayValue, setDisplayValue] = useState<ManyToOneRelationValue | null>({
    id: 123,
    type: 'object',
    className: 'Product',
    key: 'Sample Product',
    path: '/products',
    published: true,
  });

  const [editValue, setEditValue] = useState<ManyToOneRelationValue | null>(null);
  const [validationError, setValidationError] = useState<string | undefined>();

  const config: ManyToOneRelationConfig = {
    name: 'relatedProduct',
    title: 'Related Product',
    type: 'manyToOneRelation',
    mandatory: false,
    classes: ['Product', 'Category'],
    displayFields: ['name', 'sku', 'price'],
  };

  const mandatoryConfig: ManyToOneRelationConfig = {
    ...config,
    name: 'requiredRelation',
    title: 'Required Relation',
    mandatory: true,
  };

  const handleEditChange = (value: ManyToOneRelationValue | null) => {
    setEditValue(value);
    
    // Validate
    const result = validateManyToOneRelation(value, mandatoryConfig);
    if (!result.valid) {
      setValidationError(result.errors.join(', '));
    } else {
      setValidationError(undefined);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Title style={styles.title}>Many-to-One Relation Demo</Title>
          <Text style={styles.subtitle}>
            Demonstrates the display and edit functionality for Pimcore Many-to-One Relation fields
          </Text>
        </View>

        {/* Display Component Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Display Component</Title>
            <Text style={styles.description}>Read-only view of a relation field</Text>
            <Divider style={styles.divider} />

            <ManyToOneRelationDisplay value={displayValue} config={config} />

            <Button
              mode="outlined"
              onPress={() => setDisplayValue(null)}
              style={styles.button}
              disabled={!displayValue}
            >
              Clear Display Value
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                setDisplayValue({
                  id: 456,
                  type: 'object',
                  className: 'Category',
                  key: 'Electronics',
                  path: '/categories',
                  published: false,
                })
              }
              style={styles.button}
            >
              Set Draft Category
            </Button>
          </Card.Content>
        </Card>

        {/* Edit Component Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Edit Component</Title>
            <Text style={styles.description}>
              Interactive selection with search and filter capabilities
            </Text>
            <Divider style={styles.divider} />

            <ManyToOneRelationEdit
              value={editValue}
              onChange={handleEditChange}
              config={mandatoryConfig}
              error={validationError}
            />

            {editValue && (
              <View style={styles.valueDisplay}>
                <Text style={styles.valueTitle}>Selected Value:</Text>
                <Text style={styles.valueText}>ID: {editValue.id}</Text>
                <Text style={styles.valueText}>Type: {editValue.type}</Text>
                <Text style={styles.valueText}>Class: {editValue.className || 'N/A'}</Text>
                <Text style={styles.valueText}>Key: {editValue.key || 'N/A'}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Empty State Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Empty State</Title>
            <Text style={styles.description}>How the field appears with no value</Text>
            <Divider style={styles.divider} />

            <ManyToOneRelationDisplay value={null} config={config} />
          </Card.Content>
        </Card>

        {/* Readonly Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Readonly Edit Mode</Title>
            <Text style={styles.description}>Edit component in readonly mode</Text>
            <Divider style={styles.divider} />

            <ManyToOneRelationEdit
              value={displayValue}
              onChange={() => {}}
              config={config}
              readonly={true}
            />
          </Card.Content>
        </Card>

        {/* Asset Relation Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Asset Relation</Title>
            <Text style={styles.description}>Relation to an asset (image)</Text>
            <Divider style={styles.divider} />

            <ManyToOneRelationDisplay
              value={{
                id: 789,
                type: 'asset',
                className: 'Image',
                key: 'product-photo.jpg',
                path: '/assets/images',
                published: true,
              }}
              config={{
                ...config,
                title: 'Product Image',
              }}
            />
          </Card.Content>
        </Card>

        {/* Document Relation Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Document Relation</Title>
            <Text style={styles.description}>Relation to a document</Text>
            <Divider style={styles.divider} />

            <ManyToOneRelationDisplay
              value={{
                id: 999,
                type: 'document',
                className: 'Page',
                key: 'product-details',
                path: '/documents/products',
                published: true,
              }}
              config={{
                ...config,
                title: 'Related Page',
              }}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
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
    lineHeight: 20,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
  },
  valueDisplay: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  valueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
});
