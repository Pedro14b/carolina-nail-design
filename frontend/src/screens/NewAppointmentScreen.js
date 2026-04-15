import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native';
import { clientService } from '../services';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useCreateAppointmentViewModel } from '../presentation/viewmodels/useCreateAppointmentViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const NewAppointmentScreen = ({ route, navigation }) => {
  const clientId = route?.params?.clientId;
  const [clientName, setClientName] = useState('');
  const { form, errors, isLoading, isFormValid, setField, submit } = useCreateAppointmentViewModel(clientId);

  const services = ['Manicure', 'Pedicure', 'Limpeza', 'Alongamento', 'Gel', 'Outro'];

  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const loadClient = async () => {
    try {
      const response = await clientService.getClient(clientId);
      setClientName(response.data?.name || response.name);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!clientId) {
      Alert.alert('Info', 'Abra esta tela a partir do detalhe de um cliente para criar o agendamento.');
      return;
    }

    const result = await submit();
    if (result.success) {
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
      navigation.goBack();
      return;
    }

    Alert.alert('Erro', result.error || 'Erro ao criar agendamento');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Novo Agendamento</Text>
      </View>

      <View style={styles.form}>
        {clientId ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>{clientName}</Text>
          </View>
        ) : (
          <Input
            label="Cliente*"
            placeholder="Selecione o cliente"
            value={clientName}
            onChangeText={setClientName}
            error={errors.client}
            required
          />
        )}

        <Input
          label="Data*"
          placeholder="DD/MM/YYYY"
          value={form.date}
          onChangeText={(value) => setField('date', value)}
          keyboardType="numeric"
          error={errors.date}
          required
        />

        <Input
          label="Horário*"
          placeholder="HH:MM"
          value={form.time}
          onChangeText={(value) => setField('time', value)}
          keyboardType="numeric"
          error={errors.time}
          required
        />

        <View style={styles.serviceContainer}>
          <Text style={styles.serviceLabel}>Tipo de Serviço*</Text>
          <View style={styles.serviceOptions}>
            {services.map((service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.serviceBtn,
                  form.serviceType === service && styles.serviceBtnActive
                ]}
                onPress={() => setField('serviceType', service)}
              >
                <Text
                  style={[
                    styles.serviceBtnText,
                    form.serviceType === service && styles.serviceBtnTextActive
                  ]}
                >
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.service && (
            <Text style={styles.errorText}>{errors.service}</Text>
          )}
        </View>

        <Input
          label="Observações"
          placeholder="Notas sobre o agendamento"
          value={form.notes}
          onChangeText={(value) => setField('notes', value)}
        />

        <Button
          title={isLoading ? 'Salvando...' : 'Salvar Agendamento'}
          iconName="content-save-outline"
          onPress={handleCreateAppointment}
          disabled={isLoading || !isFormValid || !clientId}
        />
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
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG
  },
  header: {
    marginBottom: SPACING.XL
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY
  },
  form: {
    marginBottom: SPACING.XL
  },
  infoBox: {
    backgroundColor: '#F0F8FF',
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY
  },
  infoLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS
  },
  infoValue: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY
  },
  serviceContainer: {
    marginBottom: SPACING.MD
  },
  serviceLabel: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM
  },
  serviceBtn: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND
  },
  serviceBtnActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY
  },
  serviceBtnText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY
  },
  serviceBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.ERROR,
    marginTop: SPACING.XS
  }
});
