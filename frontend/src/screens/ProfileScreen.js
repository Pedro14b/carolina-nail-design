import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PinPadInput } from '../components/PinPadInput';
import { authService } from '../services';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const PROFILE_PREFS_KEY = 'profilePreferences';

const roleLabelMap = {
  admin: 'Administradora',
  professional: 'Profissional',
  client: 'Cliente'
};

export const ProfileScreen = ({ navigation }) => {
  const { user, isBiometricAvailable, logout } = useAuth();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinErrors, setPinErrors] = useState({});
  const [prefs, setPrefs] = useState({
    remindersEnabled: true,
    weeklySummaryEnabled: true,
    biometricQuickUnlock: false
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const rawPrefs = await AsyncStorage.getItem(PROFILE_PREFS_KEY);
      if (rawPrefs) {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(rawPrefs) }));
      }
    } catch (error) {
      console.error('Erro ao carregar preferências de perfil:', error);
    }
  };

  const updatePreference = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);

    try {
      await AsyncStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Erro ao salvar preferências de perfil:', error);
      Alert.alert('Aviso', 'Não foi possível salvar a preferência neste momento.');
    }
  };

  const initials = useMemo(() => {
    const name = user?.name || 'Usuária';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
  }, [user?.name]);

  const roleLabel = roleLabelMap[user?.role] || 'Usuária';

  const sanitizePin = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

  const validatePinForm = () => {
    const errors = {};

    if (!/^\d{4,6}$/.test(currentPin)) {
      errors.currentPin = 'PIN atual deve ter de 4 a 6 dígitos';
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      errors.newPin = 'Novo PIN deve ter de 4 a 6 dígitos';
    }

    if (newPin === currentPin && /^\d{4,6}$/.test(newPin)) {
      errors.newPin = 'Novo PIN deve ser diferente do PIN atual';
    }

    if (confirmPin !== newPin) {
      errors.confirmPin = 'Confirmação não confere com o novo PIN';
    }

    setPinErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isPinFormValid =
    /^\d{4,6}$/.test(currentPin) &&
    /^\d{4,6}$/.test(newPin) &&
    /^\d{4,6}$/.test(confirmPin) &&
    currentPin !== newPin &&
    confirmPin === newPin;

  const handleChangePin = async () => {
    if (!validatePinForm()) return;

    try {
      setIsChangingPin(true);
      await authService.changePin(currentPin, newPin, confirmPin);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPinErrors({});
      Alert.alert('Sucesso', 'PIN alterado com sucesso.');
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao alterar PIN';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleDataExportRecommendation = () => {
    navigation.navigate('Backup');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Usuária'}</Text>
        <Text style={styles.roleTag}>{roleLabel}</Text>
      </View>

      <Card title="Informações da Conta" style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefone</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Não informado'}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Não informado'}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID da conta</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{user?.id || '---'}</Text>
        </View>
      </Card>

      <Card title="Preferências" style={styles.card}>
        <View style={styles.prefRow}>
          <View style={styles.prefTextWrap}>
            <Text style={styles.prefTitle}>Lembretes de agenda</Text>
            <Text style={styles.prefSubtitle}>Mostrar alertas de compromissos próximos</Text>
          </View>
          <Switch
            value={prefs.remindersEnabled}
            onValueChange={(value) => updatePreference('remindersEnabled', value)}
            trackColor={{ true: COLORS.PRIMARY, false: '#DDCFC9' }}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.prefRow}>
          <View style={styles.prefTextWrap}>
            <Text style={styles.prefTitle}>Resumo semanal</Text>
            <Text style={styles.prefSubtitle}>Preparar resumo de atendimentos e faturamento</Text>
          </View>
          <Switch
            value={prefs.weeklySummaryEnabled}
            onValueChange={(value) => updatePreference('weeklySummaryEnabled', value)}
            trackColor={{ true: COLORS.PRIMARY, false: '#DDCFC9' }}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.prefRow}>
          <View style={styles.prefTextWrap}>
            <Text style={styles.prefTitle}>Desbloqueio rápido por biometria</Text>
            <Text style={styles.prefSubtitle}>
              {isBiometricAvailable ? 'Disponível neste dispositivo' : 'Biometria não disponível neste dispositivo'}
            </Text>
          </View>
          <Switch
            value={prefs.biometricQuickUnlock && isBiometricAvailable}
            onValueChange={(value) => updatePreference('biometricQuickUnlock', value)}
            disabled={!isBiometricAvailable}
            trackColor={{ true: COLORS.PRIMARY, false: '#DDCFC9' }}
          />
        </View>
      </Card>

      <Card title="Segurança" style={styles.card}>
        <PinPadInput
          label="PIN atual"
          value={currentPin}
          onChangeText={(value) => setCurrentPin(sanitizePin(value))}
          minLength={4}
          length={6}
          error={pinErrors.currentPin}
          helperText="Digite o PIN atual para liberar a alteração."
        />

        <PinPadInput
          label="Novo PIN"
          value={newPin}
          onChangeText={(value) => setNewPin(sanitizePin(value))}
          minLength={4}
          length={6}
          error={pinErrors.newPin}
          helperText="Escolha um novo PIN de 4 a 6 dígitos."
        />

        <PinPadInput
          label="Confirmar novo PIN"
          value={confirmPin}
          onChangeText={(value) => setConfirmPin(sanitizePin(value))}
          minLength={4}
          length={6}
          error={pinErrors.confirmPin}
          helperText="Repita o novo PIN para confirmar."
        />

        <Button
          title={isChangingPin ? 'Atualizando PIN...' : 'Atualizar PIN'}
          onPress={handleChangePin}
          disabled={!isPinFormValid || isChangingPin}
        />
      </Card>

      <Card title="Atalhos úteis" style={styles.card}>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.linkTitle}>Ver desempenho no mês</Text>
          <Text style={styles.linkSubtitle}>Acesso rápido aos relatórios financeiros e atendimentos</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.linkTitle}>Central de notificações</Text>
          <Text style={styles.linkSubtitle}>Acompanhar alertas e lembretes do sistema</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.linkRow} onPress={handleDataExportRecommendation}>
          <Text style={styles.linkTitle}>Backup e exportação</Text>
          <Text style={styles.linkSubtitle}>Exportar dados e manter cópias de segurança</Text>
        </TouchableOpacity>
      </Card>

      <Card title="Recomendações" style={styles.card}>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Backup')}>
          <Text style={styles.linkTitle}>Criar backup antes de grandes mudanças</Text>
          <Text style={styles.linkSubtitle}>Boa prática para proteger dados antes de atualizar o app</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Alert.alert('Sugestão', 'Ative um bloqueio automático após 2 minutos sem uso para proteger o app.')}
        >
          <Text style={styles.linkTitle}>Bloqueio automático por inatividade</Text>
          <Text style={styles.linkSubtitle}>Recomendado para evitar acesso não autorizado</Text>
        </TouchableOpacity>
      </Card>

      <Button title="Sair da conta" variant="danger" onPress={logout} style={styles.logoutButton} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND
  },
  content: {
    padding: SPACING.LG,
    paddingBottom: SPACING.XL * 2
  },
  hero: {
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8E7E1',
    borderWidth: 1,
    borderColor: '#EBCFC7'
  },
  avatarText: {
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '800'
  },
  name: {
    marginTop: SPACING.SM,
    fontSize: FONT_SIZES.XL,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY
  },
  roleTag: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600'
  },
  card: {
    marginBottom: SPACING.MD
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600'
  },
  infoValue: {
    maxWidth: '62%',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    textAlign: 'right'
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  prefTextWrap: {
    flex: 1,
    marginRight: SPACING.MD
  },
  prefTitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700'
  },
  prefSubtitle: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY
  },
  linkRow: {
    paddingVertical: SPACING.XS
  },
  linkTitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700'
  },
  linkSubtitle: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY
  },
  separator: {
    height: 1,
    backgroundColor: '#F1E2DD',
    marginVertical: SPACING.MD
  },
  logoutButton: {
    marginTop: SPACING.SM
  }
});
