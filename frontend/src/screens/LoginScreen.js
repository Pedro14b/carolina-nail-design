import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { BrandLogoImage } from '../components/BrandLogoImage';
import { PinPadInput } from '../components/PinPadInput';
import { COLORS, SPACING, FONT_SIZES, API_BASE_URL } from '../constants';

export const LoginScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(24));
  const { login, canRegister } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validateForm = () => {
    const newErrors = {};

    const sanitizedPin = pin.replace(/\D/g, '');
    if (!sanitizedPin || sanitizedPin.length < 4 || sanitizedPin.length > 6) {
      newErrors.pin = 'PIN deve ter de 4 a 6 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    const sanitizedPin = pin.replace(/\D/g, '');
    return sanitizedPin.length >= 4 && sanitizedPin.length <= 6;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const sanitizedPin = pin.replace(/\D/g, '').slice(0, 6);
      console.log('🔐 Tentando login por PIN com API:', API_BASE_URL);
      await login(sanitizedPin);
    } catch (error) {
      let errorMessage = 'Erro ao fazer login';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Erro de login:', error.response?.data || error.message || error);
      Alert.alert('Erro ao fazer login', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.backdropTop} />
      <View style={styles.backdropBottom} />
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.heroCard}>
          <View style={styles.logoContainer}>
            <BrandLogoImage width={340} />
          </View>
        </View>

      <View style={styles.form}>
        <PinPadInput
          label="PIN"
          value={pin}
          onChangeText={setPin}
          error={errors.pin}
          helperText="Digite seu PIN usando o teclado personalizado do app."
          minLength={4}
          length={6}
        />

        <Button
          title={isLoading ? 'Entrando...' : 'Entrar'}
          onPress={handleLogin}
          disabled={isLoading || !isFormValid()}
        />

        <TouchableOpacity style={styles.recoveryLink} onPress={() => navigation.navigate('RecoverPin')}>
          <Text style={styles.recoveryLinkText}>Esqueci meu PIN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        {canRegister ? (
          <>
            <Text style={styles.footerText}>Novo por aqui? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Crie uma conta aqui</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.footerText}>Cadastro inicial ja realizado neste dispositivo.</Text>
        )}
      </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
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
  heroCard: {
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 5,
    marginBottom: SPACING.LG
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MD,
    width: '100%'
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM
  },
  subtitle: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY
  },
  form: {
    marginBottom: SPACING.LG,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 24,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    gap: SPACING.MD
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.LG
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER
  },
  dividerText: {
    marginHorizontal: SPACING.MD,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SM
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD
  },
  recoveryLink: {
    marginTop: SPACING.SM,
    alignSelf: 'center'
  },
  recoveryLinkText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '700'
  },
  footerText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SM
  },
  linkText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '700'
  }
});
