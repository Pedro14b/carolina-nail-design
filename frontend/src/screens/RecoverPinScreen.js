import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { PinPadInput } from '../components/PinPadInput';
import { authService } from '../services';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(0, 11);
const normalizeCode = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);
const normalizePin = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

const formatPhonePreview = (value) => {
  const rawDigits = String(value || '').replace(/\D/g, '');
  const digits = (rawDigits.startsWith('55') && (rawDigits.length === 12 || rawDigits.length === 13))
    ? rawDigits.slice(2)
    : rawDigits;

  if (digits.length < 10) return '';

  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);

  if (local.length >= 9) {
    return `+55 ${ddd} ${local.slice(0, 5)}-${local.slice(5, 9)}`;
  }

  return `+55 ${ddd} ${local.slice(0, 4)}-${local.slice(4, 8)}`;
};

export const RecoverPinScreen = ({ navigation }) => {
  const [channel, setChannel] = useState('email');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    const emailValue = normalizeEmail(email);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  };

  const validatePhone = () => {
    const phoneValue = normalizePhone(phone);
    return phoneValue.length >= 10 && phoneValue.length <= 11;
  };

  const getRecoveryTarget = () => (
    channel === 'sms'
      ? { channel, phone: normalizePhone(phone) }
      : { channel, email: normalizeEmail(email) }
  );

  const isRequestTargetValid = channel === 'sms' ? validatePhone() : validateEmail();

  const handleRequestCode = async () => {
    if (channel === 'sms' && !validatePhone()) {
      Alert.alert('Atenção', 'Informe um telefone válido com DDD.');
      return;
    }

    if (channel === 'email' && !validateEmail()) {
      Alert.alert('Atenção', 'Informe um email válido.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.requestPinRecovery(getRecoveryTarget());
      const debugCode = response?.debug?.recoveryCode;
      const warningMessage = response?.warning;
      const previewUrl = response?.previewUrl || response?.debug?.previewUrl;

      if (debugCode) {
        Alert.alert('Código de teste', `Use este código: ${debugCode}`);
      } else if (warningMessage) {
        Alert.alert('Aviso', warningMessage);
      } else if (previewUrl) {
        Alert.alert('Email de teste', `O email foi gerado para pré-visualização:\n${previewUrl}`);
      } else {
        Alert.alert(
          'Tudo certo',
          channel === 'sms'
            ? 'Se existir uma conta com este telefone, enviaremos um código por SMS.'
            : 'Se existir uma conta com este email, enviaremos um código.'
        );
      }

      setStep(2);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao solicitar recuperação';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const sanitizedCode = normalizeCode(code);
    if (sanitizedCode.length !== 6) {
      Alert.alert('Atenção', 'O código deve ter 6 dígitos.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.verifyPinRecoveryCode({
        ...getRecoveryTarget(),
        code: sanitizedCode
      });
      const token = response?.data?.resetToken || response?.resetToken;

      if (!token) {
        throw new Error('Token de recuperação não recebido');
      }

      setResetToken(token);
      setStep(3);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Código inválido';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    const sanitizedPin = normalizePin(newPin);
    const sanitizedConfirmPin = normalizePin(confirmPin);

    if (sanitizedPin.length < 4 || sanitizedPin.length > 6) {
      Alert.alert('Atenção', 'O novo PIN deve ter de 4 a 6 dígitos.');
      return;
    }

    if (sanitizedPin !== sanitizedConfirmPin) {
      Alert.alert('Atenção', 'A confirmação do PIN não confere.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPinWithRecoveryToken(resetToken, sanitizedPin, sanitizedConfirmPin);
      Alert.alert('Sucesso', 'PIN redefinido com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao redefinir PIN';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Recuperar PIN</Text>
        <Text style={styles.subtitle}>
          {step === 1 && 'Escolha um canal e informe email ou telefone para receber o código.'}
          {step === 2 && `Digite o código de 6 dígitos enviado por ${channel === 'sms' ? 'SMS' : 'email'}.`}
          {step === 3 && 'Defina seu novo PIN de acesso.'}
        </Text>
      </View>

      <View style={styles.form}>
        {step === 1 && (
          <>
            <View style={styles.channelPicker}>
              <TouchableOpacity
                style={[styles.channelBtn, channel === 'email' && styles.channelBtnActive]}
                onPress={() => setChannel('email')}
              >
                <Text style={[styles.channelBtnText, channel === 'email' && styles.channelBtnTextActive]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.channelBtn, channel === 'sms' && styles.channelBtnActive]}
                onPress={() => setChannel('sms')}
              >
                <Text style={[styles.channelBtnText, channel === 'sms' && styles.channelBtnTextActive]}>Telefone (SMS)</Text>
              </TouchableOpacity>
            </View>

            {channel === 'email' ? (
              <Input
                label="Email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                required
              />
            ) : (
              <View>
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  format="phone"
                  required
                />
                <Text style={styles.phoneHelpText}>
                  Informe com DDD. Se digitar com +55, o app também entende.
                </Text>
                {!!formatPhonePreview(phone) && (
                  <Text style={styles.phonePreviewText}>
                    Vamos enviar para {formatPhonePreview(phone)}.
                  </Text>
                )}
              </View>
            )}
            <Button
              title={isLoading ? 'Enviando...' : 'Enviar código'}
              onPress={handleRequestCode}
              disabled={isLoading || !isRequestTargetValid}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="Código"
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              required
            />
            <Button
              title={isLoading ? 'Validando...' : 'Validar código'}
              onPress={handleVerifyCode}
              disabled={isLoading}
            />
            <Button
              title="Enviar novo código"
              onPress={handleRequestCode}
              variant="outline"
              disabled={isLoading || !isRequestTargetValid}
              style={styles.secondaryBtn}
            />
          </>
        )}

        {step === 3 && (
          <>
            <PinPadInput
              label="Novo PIN"
              value={newPin}
              onChangeText={setNewPin}
              minLength={4}
              length={6}
              helperText="Escolha um novo PIN de 4 a 6 dígitos."
            />
            <PinPadInput
              label="Confirmar PIN"
              value={confirmPin}
              onChangeText={setConfirmPin}
              minLength={4}
              length={6}
              helperText="Repita o novo PIN para confirmar."
            />
            <Button
              title={isLoading ? 'Salvando...' : 'Redefinir PIN'}
              onPress={handleResetPin}
              disabled={isLoading}
            />
          </>
        )}
      </View>
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
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    justifyContent: 'center'
  },
  header: {
    marginBottom: SPACING.LG
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM
  },
  subtitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20
  },
  form: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 24,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD'
  },
  channelPicker: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.MD
  },
  channelBtn: {
    flex: 1,
    paddingVertical: SPACING.SM,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center'
  },
  channelBtnActive: {
    backgroundColor: '#FFF1ED',
    borderColor: COLORS.PRIMARY
  },
  channelBtnText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700'
  },
  channelBtnTextActive: {
    color: COLORS.PRIMARY
  },
  secondaryBtn: {
    marginTop: SPACING.SM
  },
  phoneHelpText: {
    marginTop: -SPACING.SM,
    marginBottom: SPACING.SM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY
  },
  phonePreviewText: {
    marginTop: -SPACING.XS,
    marginBottom: SPACING.SM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: '700'
  }
});
