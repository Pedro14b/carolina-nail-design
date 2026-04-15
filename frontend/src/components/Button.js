import React, { useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, Animated, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { MonoIcon } from './MonoIcon';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  iconName,
  iconSize = 18,
  style 
}) => {
  const isLoading = false;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.spring(scaleAnim, {
      toValue,
      friction: 6,
      tension: 160,
      useNativeDriver: true
    }).start();
  };

  const variants = {
    primary: {
      backgroundColor: COLORS.PRIMARY,
      color: '#FFFFFF'
    },
    secondary: {
      backgroundColor: '#FFF1ED',
      borderColor: COLORS.ACCENT,
      borderWidth: 1,
      color: COLORS.TEXT_PRIMARY
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: COLORS.PRIMARY,
      borderWidth: 2,
      color: COLORS.PRIMARY
    },
    danger: {
      backgroundColor: COLORS.ERROR,
      color: '#FFFFFF'
    }
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          variantStyle,
          disabled && styles.disabled,
          style
        ]}
        onPress={onPress}
        onPressIn={() => !disabled && animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        activeOpacity={0.92}
        disabled={disabled || isLoading}
      >
        <View style={styles.content}>
          {!!iconName && !isLoading && (
            <MonoIcon
              name={iconName}
              size={iconSize}
              color={variantStyle.color}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, { color: variantStyle.color }]}>
            {isLoading ? 'Carregando...' : title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: 18,
    alignItems: 'center',
    minHeight: 54,
    shadowColor: COLORS.ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    marginRight: SPACING.SM
  },
  text: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0
  }
});
