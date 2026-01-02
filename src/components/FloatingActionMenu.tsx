/**
 * Floating Action Menu Component
 * Expandable FAB button with animated sub-buttons
 */

import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';

interface FABItem {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
}

interface FloatingActionMenuProps {
  items: FABItem[];
  mainIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  mainColor?: string;
  mainBackgroundColor?: string;
  position?: 'bottomRight' | 'bottomLeft';
}

export function FloatingActionMenu({
  items,
  mainIcon = 'plus',
  mainColor = '#fff',
  mainBackgroundColor = THEME.PRIMARY_COLOR,
  position = 'bottomRight',
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    // Set state first so buttons are immediately interactive
    setIsOpen(!isOpen);

    Animated.parallel([
      Animated.timing(animation, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleItemPress = (item: FABItem) => {
    console.log('FAB item pressed:', item.key);
    item.onPress();
    toggleMenu();
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <>
      {/* Overlay when menu is open */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View
            style={[
              styles.overlay,
              { opacity: overlayOpacity },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <View style={[styles.container, position === 'bottomLeft' ? styles.bottomLeft : styles.bottomRight]}>
        {/* Sub buttons */}
        {items.map((item, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -((index + 1) * 60)],
          });

          const scale = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.5, 0.8, 1],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 0.8, 1],
          });

          return (
            <Animated.View
              key={item.key}
              style={[
                styles.subButton,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                },
              ]}
              pointerEvents={isOpen ? 'auto' : 'none'}
            >
              <TouchableOpacity
                style={[
                  styles.subButtonTouchable,
                  { backgroundColor: item.backgroundColor || '#fff' },
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
                disabled={!isOpen}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={item.color || '#666'}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB button */}
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: mainBackgroundColor }]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <MaterialCommunityIcons
              name={isOpen ? 'close' : mainIcon}
              size={26}
              color={mainColor}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    zIndex: 999,
    alignItems: 'center',
  },
  bottomRight: {
    right: 20,
  },
  bottomLeft: {
    left: 20,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  subButton: {
    position: 'absolute',
    bottom: 0,
  },
  subButtonTouchable: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
