import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

const logoImage = require('../assets/logo-carolina.png');
const LOGO_ASPECT_RATIO = 1.5;

export const BrandLogoImage = ({ width = 300, style }) => {
  const height = Math.round(width / LOGO_ASPECT_RATIO);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoImage}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  }
});
