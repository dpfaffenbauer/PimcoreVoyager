import React from 'react';
import { Text as RNText, TextStyle, StyleSheet, StyleProp, TextProps } from 'react-native';
import { THEME } from '../../config/constants';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const Title: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <RNText style={[styles.title, style]} {...props}>
    {children}
  </RNText>
);

export const Paragraph: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <RNText style={[styles.paragraph, style]} {...props}>
    {children}
  </RNText>
);

export const Caption: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <RNText style={[styles.caption, style]} {...props}>
    {children}
  </RNText>
);

export const Headline: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <RNText style={[styles.headline, style]} {...props}>
    {children}
  </RNText>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: THEME.TEXT_SECONDARY,
    lineHeight: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 12,
  },
});
