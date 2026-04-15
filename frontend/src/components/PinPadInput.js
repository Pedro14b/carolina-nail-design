import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace']
];

export const PinPadInput = ({
  label = 'PIN',
  value = '',
  onChangeText,
  length = 6,
  minLength = 4,
  error,
  helperText,
  disabled = false
}) => {
  const digits = useMemo(() => String(value || '').replace(/\D/g, '').slice(0, length), [length, value]);

  const setDigits = (nextValue) => {
    if (disabled) return;
    onChangeText?.(String(nextValue || '').replace(/\D/g, '').slice(0, length));
  };

  const handlePress = (key) => {
    if (disabled) return;

    if (key === 'clear') {
      setDigits('');
      return;
    }

    if (key === 'backspace') {
      setDigits(digits.slice(0, -1));
      return;
    }

    if (digits.length >= length) return;
    setDigits(`${digits}${key}`);
  };

  const isComplete = digits.length >= minLength;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}<Text style={styles.required}>*</Text>
        </Text>
        <Text style={[styles.counter, isComplete ? styles.counterSuccess : styles.counterIdle]}>
          {digits.length}/{length}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length }).map((_, index) => {
          const filled = index < digits.length;
          const active = index === digits.length && !disabled;

          return (
            <View
              key={`pin-dot-${index}`}
              style={[
                styles.dot,
                filled && styles.dotFilled,
                active && styles.dotActive
              ]}
            >
              <Text style={[styles.dotText, filled && styles.dotTextFilled]}>{filled ? '•' : ''}</Text>
            </View>
          );
        })}
      </View>

      {!!helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.keypad}>
        {KEY_ROWS.map((row, rowIndex) => (
          <View key={`pin-row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((key) => {
              const isSpecial = key === 'clear' || key === 'backspace';
              const labelText = key === 'clear' ? 'Limpar' : key === 'backspace' ? '⌫' : key;

              return (
                <TouchableOpacity
                  key={`pin-key-${key}`}
                  style={[
                    styles.key,
                    isSpecial && styles.keySpecial,
                    disabled && styles.keyDisabled
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handlePress(key)}
                  disabled={disabled}
                >
                  <Text style={[styles.keyText, isSpecial && styles.keyTextSpecial]}>{labelText}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY
  },
  required: {
    color: COLORS.ERROR
  },
  counter: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '700'
  },
  counterIdle: {
    color: COLORS.TEXT_SECONDARY
  },
  counterSuccess: {
    color: COLORS.ACCENT
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.SM,
    marginBottom: SPACING.SM
  },
  dot: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9D8D2',
    backgroundColor: '#FFFDFC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1
  },
  dotActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#FFF5F1'
  },
  dotFilled: {
    borderColor: '#D7B8AC',
    backgroundColor: '#FAF1ED'
  },
  dotText: {
    fontSize: FONT_SIZES.XL,
    color: 'transparent',
    fontWeight: '900'
  },
  dotTextFilled: {
    color: COLORS.TEXT_PRIMARY
  },
  helperText: {
    marginBottom: SPACING.SM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY
  },
  errorText: {
    marginBottom: SPACING.SM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.ERROR,
    fontWeight: '600'
  },
  keypad: {
    marginTop: SPACING.XS,
    gap: SPACING.SM
  },
  keypadRow: {
    flexDirection: 'row',
    gap: SPACING.SM
  },
  key: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: '#F0E1DC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  keySpecial: {
    backgroundColor: '#FFF3EF',
    borderColor: '#E6C6BC'
  },
  keyDisabled: {
    opacity: 0.45
  },
  keyText: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY
  },
  keyTextSpecial: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY
  }
});