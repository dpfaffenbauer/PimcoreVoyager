/**
 * Link Demo Screen
 * Demonstrates the Link data type components
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { LinkDisplay } from '../components/dataTypes/Link/LinkDisplay';
import { LinkEdit } from '../components/dataTypes/Link/LinkEdit';
import { LinkValue, LinkConfig } from '../components/dataTypes/Link/Link.types';
import { validateLink } from '../components/dataTypes/Link/Link.validator';
import { LinkTransformer } from '../components/dataTypes/Link/Link.transformer';

export default function LinkDemoScreen() {
  const [editMode, setEditMode] = useState(false);
  const [linkValue, setLinkValue] = useState<LinkValue | null>({
    text: 'Example Website',
    linktype: 'direct',
    direct: 'https://example.com',
    internal: null,
    internalType: null,
    fullPath: '',
    target: '_blank',
    parameters: '',
    anchor: '',
    title: 'Visit Example',
    accesskey: '',
    rel: 'noopener',
    tabindex: '',
    class: '',
  });

  const [internalLinkValue, setInternalLinkValue] = useState<LinkValue | null>({
    text: 'Internal Page',
    linktype: 'internal',
    direct: null,
    internal: 123,
    internalType: 'document',
    fullPath: '/path/to/internal/page',
    target: null,
    parameters: '',
    anchor: '',
    title: '',
    accesskey: '',
    rel: '',
    tabindex: '',
    class: '',
  });

  const config: LinkConfig = {
    label: 'Example Link',
    required: false,
    allowedTypes: ['direct', 'internal'],
  };

  const configRequired: LinkConfig = {
    label: 'Required Link',
    required: true,
  };

  const handleValidate = () => {
    const result = validateLink(linkValue, configRequired);
    alert(
      result.valid
        ? 'Validation passed!'
        : `Validation failed:\n${result.errors.join('\n')}`
    );
  };

  const handleTransform = () => {
    const apiValue = LinkTransformer.toAPI(linkValue);
    alert(`API Format:\n${JSON.stringify(apiValue, null, 2)}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Link Data Type Demo" />
        <Card.Content>
          <Text style={styles.description}>
            This screen demonstrates the Link data type components for Pimcore
            Data Objects. The Link type supports both direct URLs and internal
            object references.
          </Text>
        </Card.Content>
      </Card>

      {/* Direct Link Example */}
      <Card style={styles.card}>
        <Card.Title title="Direct Link Example" />
        <Card.Content>
          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Display Mode:</Text>
            <LinkDisplay value={linkValue} config={config} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Edit Mode:</Text>
            <LinkEdit
              value={linkValue}
              onChange={setLinkValue}
              config={config}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleValidate} style={styles.button}>
              Validate
            </Button>
            <Button mode="outlined" onPress={handleTransform} style={styles.button}>
              Transform to API
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Internal Link Example */}
      <Card style={styles.card}>
        <Card.Title title="Internal Link Example" />
        <Card.Content>
          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Display Mode:</Text>
            <LinkDisplay
              value={internalLinkValue}
              config={{ label: 'Internal Link' }}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Edit Mode:</Text>
            <LinkEdit
              value={internalLinkValue}
              onChange={setInternalLinkValue}
              config={{ label: 'Internal Link' }}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Empty/Null Example */}
      <Card style={styles.card}>
        <Card.Title title="Empty Link Example" />
        <Card.Content>
          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Display Mode (Empty):</Text>
            <LinkDisplay value={null} config={{ label: 'Empty Link' }} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Edit Mode (Empty):</Text>
            <LinkEdit
              value={null}
              onChange={(value) => console.log('Link changed:', value)}
              config={{ label: 'Empty Link' }}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Inherited Example */}
      <Card style={styles.card}>
        <Card.Title title="Inherited Link Example" />
        <Card.Content>
          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Display Mode (Inherited):</Text>
            <LinkDisplay
              value={linkValue}
              config={config}
              inherited={true}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Features List */}
      <Card style={styles.card}>
        <Card.Title title="Features" />
        <Card.Content>
          <Text style={styles.feature}>✅ Display and edit direct URLs</Text>
          <Text style={styles.feature}>✅ Display and edit internal object references</Text>
          <Text style={styles.feature}>✅ Support for link text, target, title, etc.</Text>
          <Text style={styles.feature}>✅ Validation for required fields</Text>
          <Text style={styles.feature}>✅ Transform between API and UI formats</Text>
          <Text style={styles.feature}>✅ Inherited field indication</Text>
          <Text style={styles.feature}>✅ Read-only mode support</Text>
          <Text style={styles.feature}>✅ Clickable links in display mode</Text>
          <Text style={styles.feature}>✅ Advanced link options (anchor, parameters, rel, etc.)</Text>
        </Card.Content>
      </Card>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  demoSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  feature: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    height: 32,
  },
});
