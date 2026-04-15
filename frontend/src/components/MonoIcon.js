import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export const MonoIcon = ({
  name,
  size = 18,
  color = COLORS.TEXT_PRIMARY,
  style
}) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
};
