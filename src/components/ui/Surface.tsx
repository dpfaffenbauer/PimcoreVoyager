import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';

interface SurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
}

const getShadowForElevation = (elevation: number): ViewStyle => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: elevation },
  shadowOpacity: 0.1 + elevation * 0.03,
  shadowRadius: elevation * 1.5,
  elevation,
});

export const Surface: React.FC<SurfaceProps> = ({ children, style, elevation = 2 }) => {
  const shadowStyle = getShadowForElevation(elevation);

  return <View style={[styles.surface, shadowStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  surface: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});
