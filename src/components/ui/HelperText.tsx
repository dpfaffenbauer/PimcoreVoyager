import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';

interface HelperTextProps {
  type?: 'info' | 'error';
  visible?: boolean;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const HelperText: React.FC<HelperTextProps> = ({
  type = 'info',
  visible = true,
  children,
  style,
}) => {
  if (!visible) return null;

  return (
    <Text style={[styles.text, type === 'error' && styles.error, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  error: {
    color: '#f44336',
  },
});
