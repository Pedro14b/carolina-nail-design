import React, { useState } from 'react';
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
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BrandLogoImage } from '../components/BrandLogoImage';
import { PinPadInput } from '../components/PinPadInput';
import { removeFormatting } from '../utils/formatters';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(24));
  const { register } = useAuth();

  React.useEffect(() => {
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

    if (!name || name.length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }
    if (!phone || phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 11) {
      newErrors.phone = 'Telefone deve ter de 10 a 11 dígitos';
    }
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      newErrors.pin = 'PIN deve ser numérico e ter de 4 a 6 dígitos';
    }
    if (pin !== confirmPin) {
      newErrors.confirmPin = 'PINs não correspondem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      name.length >= 3 &&
      phone.replace(/\D/g, '').length >= 10 &&
      /^\d{4,6}$/.test(pin) &&
      confirmPin.length >= 4 &&
      pin === confirmPin
    );
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // Remove formatação do telefone antes de enviar
      const phoneDigits = removeFormatting(phone);
      console.log('📝 Tentando registro com:', { name, phone: phoneDigits });
      await register(name, phoneDigits, pin);
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      // Limpar formulário após sucesso
      setName('');
      setPhone('');
      setPin('');
      setConfirmPin('');
    } catch (error) {
      // Tratamento detalhado de erros
      let errorMessage = 'Erro ao registrar';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Erro de registro:', error.response?.data || error.message || error);
      Alert.alert('Erro ao registrar', errorMessage);
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
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🚀 Primeiro acesso</Text>
          </View>
          <View style={styles.header}>
            <Text style={styles.subtitle}>Configure seu acesso profissional</Text>
          </View>
        </View>

      <View style={styles.form}>
        <Input
          label="Nome Completo"
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
          error={errors.name}
          minLength={3}
          required
        />

        <Input
          label="Telefone"
          placeholder="(XX) XXXXX-XXXX"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
          minLength={10}
          maxLength={15}
          required
          format="phone"
        />

        <PinPadInput
          label="PIN"
          value={pin}
          onChangeText={setPin}
          error={errors.pin}
          helperText="Crie um PIN de 4 a 6 dígitos."
          minLength={4}
          length={6}
        />

        <PinPadInput
          label="Confirmar PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          error={errors.confirmPin}
          helperText="Repita o PIN acima para confirmar."
          minLength={4}
          length={6}
        />

        <Button
          title={isLoading ? 'Criando conta...' : 'Criar Conta'}
          onPress={handleRegister}
          iconName="account-plus-outline"
          disabled={isLoading || !isFormValid()}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Faça login</Text>
        </TouchableOpacity>
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
  headerBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFF1ED',
    borderRadius: 999,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    marginBottom: SPACING.MD
  },
  headerBadgeText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: FONT_SIZES.XS
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
    borderColor: '#F1E2DD'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD
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
