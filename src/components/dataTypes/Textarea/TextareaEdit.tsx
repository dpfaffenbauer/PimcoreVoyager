/**
 * Textarea Data Type - Edit Component
 * Multiline text input optimized for mobile devices
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, HelperText, useTheme } from 'react-native-paper';
import { TextareaConfig } from './Textarea.types';

export interface TextareaEditProps {
  value: string;
  onChange: (value: string) => void;
  config: TextareaConfig;
  error?: string;
  readonly?: boolean;
}

/**
 * TextareaEdit Component
 * Provides a multiline text input optimized for touch interaction
 * Features:
 * - Auto-adjusting height based on content
 * - Touch-optimized input area
 * - Character counter for maxLength
 * - Validation error display
 * - Read-only mode support
 */
export const TextareaEdit: React.FC<TextareaEditProps> = ({
  value,
  onChange,
  config,
  error,
  readonly = false,
}) => {
  const theme = useTheme();
  const isDisabled = readonly || config.readonly;

  // Calculate character count for display
  const currentLength = value?.length || 0;
  const showCharCount = config.maxLength !== undefined;

  return (
    <View style={styles.container}>
      <TextInput
        label={
          config.label
            ? `${config.label}${config.required ? ' *' : ''}`
            : undefined
        }
        value={value || ''}
        onChangeText={onChange}
        placeholder={config.placeholder || 'Text eingeben...'}
        mode="outlined"
        multiline
        numberOfLines={config.rows || 4}
        maxLength={config.maxLength}
        disabled={isDisabled}
        error={!!error}
        style={[
          styles.input,
          {
            minHeight: config.height || (config.rows || 4) * 24 + 32,
            backgroundColor: isDisabled
              ? theme.colors.surfaceDisabled
              : theme.colors.surface,
          },
        ]}
        // Optimize for mobile text input
        textAlignVertical="top"
        autoCorrect={true}
        autoCapitalize="sentences"
        keyboardType="default"
        returnKeyType="default"
        blurOnSubmit={false}
        // Enable multiline editing on iOS
        scrollEnabled={Platform.OS === 'ios'}
      />

      {/* Character counter */}
      {showCharCount && (
        <Text
          style={[
            styles.charCount,
            {
              color:
                currentLength > (config.maxLength || 0)
                  ? theme.colors.error
                  : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {currentLength}
          {config.maxLength ? ` / ${config.maxLength}` : ''}
        </Text>
      )}

      {/* Error message */}
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    paddingTop: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
});
