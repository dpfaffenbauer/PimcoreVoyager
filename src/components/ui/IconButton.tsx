import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../config/constants';

interface IconButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  mode?: 'contained' | 'contained-tonal' | 'outlined';
  containerColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  color,
  disabled,
  mode,
  containerColor,
  iconColor,
  style,
  testID,
}) => {
  const buttonStyles: StyleProp<ViewStyle>[] = [
    styles.container,
    mode === 'contained' && { backgroundColor: containerColor || THEME.PRIMARY_COLOR },
    mode === 'contained-tonal' && styles.containedTonal,
    mode === 'outlined' && styles.outlined,
    disabled && styles.disabled,
    style,
  ];

  const finalIconColor = disabled
    ? THEME.ICON_DISABLED
    : iconColor || color || (mode === 'contained' ? '#fff' : THEME.TEXT_PRIMARY);

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <MaterialCommunityIcons name={icon} size={size} color={finalIconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containedTonal: {
    backgroundColor: '#f0f0f0',
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});
