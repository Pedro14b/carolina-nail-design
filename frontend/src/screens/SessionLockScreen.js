import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { BrandLogoImage } from '../components/BrandLogoImage';
import { PinPadInput } from '../components/PinPadInput';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const SessionLockScreen = () => {
  const { user, unlockSession, unlockWithBiometric, isBiometricAvailable, logout } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sanitizePin = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

  const handleUnlock = async () => {
    const sanitizedPin = sanitizePin(pin);

    if (sanitizedPin.length < 4) {
      setError('PIN deve ter de 4 a 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await unlockSession(sanitizedPin);
      setPin('');
    } catch (unlockError) {
      const message = unlockError?.response?.data?.error || unlockError?.message || 'Erro ao desbloquear';
      setError(message);
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricUnlock = async () => {
    try {
      setIsLoading(true);
      setError('');
      await unlockWithBiometric();
    } catch (unlockError) {
      const message = unlockError?.message || 'Erro na biometria';
      setError(message);
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backdropTop} />
      <View style={styles.backdropBottom} />

      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <BrandLogoImage width={280} />
        </View>

        <Text style={styles.title}>Sessão bloqueada</Text>
        <Text style={styles.subtitle}>
          {user?.name ? `${user.name}, digite seu PIN para continuar.` : 'Digite seu PIN para continuar.'}
        </Text>

        <PinPadInput
          label="PIN"
          value={pin}
          onChangeText={(value) => {
            setPin(sanitizePin(value));
            if (error) setError('');
          }}
          error={error}
          helperText="Use o teclado numérico do app para desbloquear."
          minLength={4}
          length={6}
        />

        <Button
          title={isLoading ? 'Desbloqueando...' : 'Desbloquear'}
          onPress={handleUnlock}
          disabled={isLoading}
        />

        {isBiometricAvailable && (
          <View style={styles.secondaryAction}>
            <Button
              title="Desbloquear com Biometria"
              variant="outline"
              onPress={handleBiometricUnlock}
              disabled={isLoading}
            />
          </View>
        )}

        <TouchableOpacity style={styles.logoutLink} onPress={logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
    backgroundColor: COLORS.BACKGROUND
  },
  backdropTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F8D7D0',
    opacity: 0.4
  },
  backdropBottom: {
    position: 'absolute',
    bottom: 40,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F3E2D0',
    opacity: 0.32
  },
  card: {
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 5
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.MD
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center'
  },
  subtitle: {
    marginTop: SPACING.XS,
    marginBottom: SPACING.LG,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center'
  },
  secondaryAction: {
    marginTop: SPACING.MD
  },
  logoutLink: {
    marginTop: SPACING.LG,
    alignSelf: 'center'
  },
  logoutText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '700'
  }
});