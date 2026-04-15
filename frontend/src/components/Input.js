import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { getFormatter } from '../utils/formatters';

export const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  editable = true,
  style,
  minLength = 0,
  maxLength = undefined,
  required = false,
  format = null,
  multiline = false,
  numberOfLines = 1
}) => {
  const charCount = value?.length || 0;
  const isMinLengthMet = charCount >= minLength;
  const showCounter = minLength > 0 || maxLength;

  const handleChangeText = (text) => {
    let formattedText = text;
    
    // Aplicar formatação se especificada
    if (format) {
      const formatter = getFormatter(format);
      formattedText = formatter(text);
    }
    
    onChangeText(formattedText);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        )}
        {showCounter && (
          <Text style={[
            styles.counter,
            !isMinLengthMet && styles.counterError,
            isMinLengthMet && styles.counterSuccess
          ]}>
            {charCount}/{minLength || maxLength || '∞'}
          </Text>
        )}
      </View>

      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          isMinLengthMet && minLength > 0 && styles.inputValid
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
      />

      <View style={styles.helpContainer}>
        {minLength > 0 && (
          <Text style={[
            styles.helpText,
            !isMinLengthMet && styles.helpTextError,
            isMinLengthMet && styles.helpTextSuccess
          ]}>
            {isMinLengthMet ? '✓' : '○'} Mínimo {minLength} caracteres
          </Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1
  },
  required: {
    color: COLORS.ERROR,
    marginLeft: SPACING.XS
  },
  counter: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500'
  },
  counterError: {
    color: COLORS.ERROR
  },
  counterSuccess: {
    color: COLORS.ACCENT
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    textAlignVertical: 'top',
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.BACKGROUND
  },
  inputError: {
    borderColor: COLORS.ERROR,
    backgroundColor: '#FFF5F2'
  },
  inputDisabled: {
    backgroundColor: COLORS.SURFACE
  },
  inputValid: {
    borderColor: COLORS.ACCENT,
    backgroundColor: '#FFF8F1'
  },
  helpContainer: {
    marginTop: SPACING.XS
  },
  helpText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS
  },
  helpTextError: {
    color: COLORS.ERROR
  },
  helpTextSuccess: {
    color: '#4CAF50'
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.ERROR,
    marginTop: SPACING.XS
  }
});
