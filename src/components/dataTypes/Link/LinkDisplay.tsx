/**
 * Link Display Component
 * Displays a Pimcore Link field in read-only mode
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chip, Surface } from 'react-native-paper';
import { LinkDisplayProps } from './Link.types';

export const LinkDisplay: React.FC<LinkDisplayProps> = ({
  value,
  config,
  inherited = false,
  textPrefix = '',
  textSuffix = '',
}) => {
  /**
   * Get display text for the link
   */
  const getDisplayText = (): string => {
    if (value === null) {
      return 'Not set';
    } else if (value.text && value.text.trim() !== '') {
      return value.text;
    } else if (value.fullPath && value.fullPath.trim() !== '') {
      return value.fullPath;
    } else if (value.direct && value.direct.trim() !== '') {
      return value.direct;
    } else {
      return 'Not set';
    }
  };

  /**
   * Get the URL to open
   */
  const getUrl = (): string | null => {
    if (!value) return null;

    if (value.linktype === 'direct' && value.direct) {
      return value.direct;
    } else if (value.linktype === 'internal' && value.fullPath) {
      return value.fullPath;
    }

    return null;
  };

  /**
   * Handle opening the link
   */
  const handleOpenLink = async () => {
    const url = getUrl();
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  };

  const displayText = textPrefix + getDisplayText() + textSuffix;
  const url = getUrl();
  const isClickable = url !== null && value?.linktype === 'direct';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.label}</Text>
      
      {value === null ? (
        <Text style={styles.emptyValue}>-</Text>
      ) : (
        <Surface style={styles.linkContainer} elevation={0}>
          <View style={styles.linkHeader}>
            <Chip
              icon={value.linktype === 'internal' ? 'file-document' : 'link'}
              style={[
                styles.typeChip,
                value.linktype === 'internal' ? styles.internalChip : styles.directChip,
              ]}
              textStyle={styles.chipText}
            >
              {value.linktype === 'internal' ? 'Internal' : 'Direct'}
            </Chip>
            
            {inherited && (
              <Chip
                icon="download"
                style={styles.inheritedChip}
                textStyle={styles.chipText}
              >
                Inherited
              </Chip>
            )}
          </View>

          {isClickable ? (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleOpenLink}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="open-in-new"
                size={20}
                color="#2196F3"
                style={styles.linkIcon}
              />
              <Text style={styles.linkText} numberOfLines={2}>
                {displayText}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.textContainer}>
              <Text style={styles.valueText} numberOfLines={2}>
                {displayText}
              </Text>
            </View>
          )}

          {value.target && (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="target" size={16} color="#666" />
              <Text style={styles.metaText}>Target: {value.target}</Text>
            </View>
          )}

          {value.title && (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="card-text" size={16} color="#666" />
              <Text style={styles.metaText}>Title: {value.title}</Text>
            </View>
          )}
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyValue: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  linkContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linkHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  typeChip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  internalChip: {
    backgroundColor: '#E3F2FD',
  },
  directChip: {
    backgroundColor: '#E8F5E9',
  },
  inheritedChip: {
    backgroundColor: '#FFF3E0',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#2196F3',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  textContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
});
