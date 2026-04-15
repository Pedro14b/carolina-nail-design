import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAppointmentDetailsViewModel } from '../presentation/viewmodels/useAppointmentDetailsViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const AppointmentDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const {
    appointment,
    isLoading,
    errorMessage,
    changeStatus,
    saveNotes,
    requestConfirmation,
    respondConfirmation
  } = useAppointmentDetailsViewModel(id);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      Alert.alert('Erro', errorMessage);
      navigation.goBack();
    }
  }, [errorMessage, navigation]);

  useEffect(() => {
    setNotes(appointment?.notes || '');
  }, [appointment?.notes]);

  const handleStatusChange = async (newStatus) => {
    const result = await changeStatus(newStatus);
    if (result.success) {
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
      return;
    }

    Alert.alert('Erro', result.error || 'Não foi possível atualizar o status');
  };

  const handleSaveNotes = async () => {
    try {
      setNotesSaving(true);
      const result = await saveNotes(notes);
      if (result.success) {
        Alert.alert('Sucesso', 'Observações atualizadas com sucesso!');
        return;
      }

      Alert.alert('Erro', result.error || 'Não foi possível salvar as observações');
    } finally {
      setNotesSaving(false);
    }
  };

  const confirmationStatusLabel = {
    pending: 'Aguardando resposta',
    confirmed: 'Confirmado pela cliente',
    declined: 'Recusado pela cliente',
    no_response: 'Sem solicitação ativa'
  };

  const handleRequestConfirmation = async () => {
    try {
      setConfirmationLoading(true);
      const result = await requestConfirmation('internal');
      if (result.success) {
        Alert.alert('Sucesso', 'Solicitação de confirmação enviada.');
        return;
      }

      Alert.alert('Erro', result.error || 'Não foi possível solicitar confirmação');
    } finally {
      setConfirmationLoading(false);
    }
  };

  const handleRespondConfirmation = async (responseStatus) => {
    try {
      setConfirmationLoading(true);
      const result = await respondConfirmation(responseStatus);
      if (result.success) {
        Alert.alert('Sucesso', 'Resposta de confirmação registrada com sucesso.');
        return;
      }

      Alert.alert('Erro', result.error || 'Não foi possível registrar a resposta de confirmação');
    } finally {
      setConfirmationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Agendamento não encontrado</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'confirmed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{appointment.serviceType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{appointment.status}</Text>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{appointment.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Horário:</Text>
          <Text style={styles.value}>{appointment.time}</Text>
        </View>
        {appointment.client && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{appointment.client.name}</Text>
          </View>
        )}
        {appointment.price && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
              <Text style={styles.value}>R$ {appointment.totalPrice.toFixed(2)}</Text>
          </View>
        )}
        {appointment.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{appointment.notes}</Text>
          </View>
        )}
      </Card>

      <Card title="Confirmação de presença" style={styles.card}>
        <View style={styles.infoRowCompact}>
          <Text style={styles.label}>Status de confirmação:</Text>
          <Text style={styles.value}>{confirmationStatusLabel[appointment.confirmationStatus] || appointment.confirmationStatus}</Text>
        </View>

        <View style={styles.infoRowCompact}>
          <Text style={styles.label}>Canal:</Text>
          <Text style={styles.value}>{appointment.confirmationChannel || 'internal'}</Text>
        </View>

        {!!appointment.confirmationRequestedAt && (
          <View style={styles.infoRowCompact}>
            <Text style={styles.label}>Solicitado em:</Text>
            <Text style={styles.value}>{new Date(appointment.confirmationRequestedAt).toLocaleString('pt-BR')}</Text>
          </View>
        )}

        {!!appointment.confirmationRespondedAt && (
          <View style={styles.infoRowCompact}>
            <Text style={styles.label}>Respondido em:</Text>
            <Text style={styles.value}>{new Date(appointment.confirmationRespondedAt).toLocaleString('pt-BR')}</Text>
          </View>
        )}

        <View style={styles.confirmationActions}>
          <Button
            title={confirmationLoading ? 'Enviando...' : 'Solicitar confirmação'}
            onPress={handleRequestConfirmation}
            variant="outline"
            disabled={confirmationLoading || ['cancelled', 'completed'].includes(appointment.status)}
          />

          <Button
            title="Marcar como confirmou"
            onPress={() => handleRespondConfirmation('confirmed')}
            variant="secondary"
            disabled={confirmationLoading || appointment.status === 'cancelled'}
          />

          <Button
            title="Marcar como recusou"
            onPress={() => handleRespondConfirmation('declined')}
            variant="outline"
            disabled={confirmationLoading || appointment.status === 'cancelled'}
          />
        </View>
      </Card>

      <Card title="Observações rápidas" style={styles.card}>
        <Input
          label="Notas do atendimento"
          placeholder="Escreva observações rápidas sobre a cliente ou atendimento"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={5}
          style={styles.notesInput}
        />

        <Button
          title={notesSaving ? 'Salvando...' : 'Salvar observações'}
          onPress={handleSaveNotes}
          disabled={notesSaving}
        />
      </Card>

      <View style={styles.actions}>
        {appointment.status !== 'completed' && (
          <Button
            title="Marcar como Concluído"
            iconName="check-circle-outline"
            onPress={() => handleStatusChange('completed')}
            variant="primary"
          />
        )}
        {appointment.status !== 'confirmed' && appointment.status !== 'completed' && (
          <Button
            title="Confirmar"
            iconName="thumb-up-outline"
            onPress={() => handleStatusChange('confirmed')}
            variant="secondary"
          />
        )}
        {appointment.status !== 'cancelled' && (
          <Button
            title="Cancelar"
            iconName="close-circle-outline"
            onPress={() => {
              Alert.alert('Confirmar', 'Tem certeza que deseja cancelar?', [
                { text: 'Não', onPress: () => {} },
                { text: 'Sim', onPress: () => handleStatusChange('cancelled') }
              ]);
            }}
            variant="outline"
          />
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
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    marginBottom: SPACING.LG
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: 20,
    marginLeft: SPACING.MD
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.XS,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  card: {
    marginBottom: SPACING.LG
  },
  infoRow: {
    marginBottom: SPACING.MD,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER
  },
  infoRowCompact: {
    marginBottom: SPACING.SM,
    paddingBottom: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS
  },
  value: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY
  },
  errorText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.ERROR
  },
  actions: {
    gap: SPACING.MD
  },
  notesInput: {
    minHeight: 120
  },
  confirmationActions: {
    marginTop: SPACING.SM,
    gap: SPACING.SM
  }
});
