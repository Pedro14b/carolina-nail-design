import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert
} from 'react-native';
import { AppointmentItem } from '../components/AppointmentItem';
import { Button } from '../components/Button';
import { useAppointmentsViewModel } from '../presentation/viewmodels/useAppointmentsViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const AppointmentsScreen = ({ navigation }) => {
  const {
    appointments,
    isLoading,
    filter,
    setFilter,
    confirmationFilter,
    setConfirmationFilter,
    requestConfirmation,
    requestBatchConfirmation,
    previewBatchConfirmation,
    errorMessage,
    refresh
  } = useAppointmentsViewModel();
  const [requestingId, setRequestingId] = useState(null);
  const [batchRequesting, setBatchRequesting] = useState(false);

  const handleQuickRequestConfirmation = async (appointmentId) => {
    try {
      setRequestingId(appointmentId);
      const result = await requestConfirmation(appointmentId, 'internal');

      if (result.success) {
        Alert.alert('Sucesso', 'Solicitação de confirmação enviada.');
        return;
      }

      Alert.alert('Erro', result.error || 'Não foi possível solicitar confirmação');
    } finally {
      setRequestingId(null);
    }
  };

  const handleBatchRequestConfirmation = async () => {
    try {
      setBatchRequesting(true);
      const today = new Date().toISOString().split('T')[0];
      const filters = {
        status: filter,
        confirmationStatuses: confirmationFilter === 'all'
          ? ['no_response', 'declined']
          : [confirmationFilter]
      };

      const preview = await previewBatchConfirmation(today, 'internal', filters);
      if (!preview.success) {
        Alert.alert('Erro', preview.error || 'Não foi possível calcular a prévia do lote');
        return;
      }

      const targetedCount = preview?.data?.targetedCount || 0;

      if (targetedCount <= 0) {
        Alert.alert('Sem alvos', 'Nenhum agendamento corresponde ao filtro atual para envio de confirmação.');
        return;
      }

      const shouldSend = await new Promise((resolve) => {
        Alert.alert(
          'Confirmar envio em lote',
          `Serão enviadas ${targetedCount} solicitações para os agendamentos filtrados de hoje. Deseja continuar?`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Enviar', style: 'default', onPress: () => resolve(true) }
          ]
        );
      });

      if (!shouldSend) {
        return;
      }

      const result = await requestBatchConfirmation(today, 'internal', filters);

      if (result.success) {
        const requestedCount = result?.data?.requestedCount || 0;
        Alert.alert('Sucesso', `Solicitações enviadas: ${requestedCount}`);
        return;
      }

      Alert.alert('Erro', result.error || 'Não foi possível solicitar confirmações em lote');
    } finally {
      setBatchRequesting(false);
    }
  };

  const getBatchTargetLabel = () => {
    const statusLabel =
      filter === 'all' ? 'status: todos' :
      filter === 'pending' ? 'status: pendentes' :
      filter === 'confirmed' ? 'status: confirmados' :
      filter === 'completed' ? 'status: concluídos' : `status: ${filter}`;

    const confirmationLabel =
      confirmationFilter === 'all' ? 'confirmação: sem resposta/recusadas' :
      confirmationFilter === 'pending' ? 'confirmação: aguardando' :
      confirmationFilter === 'confirmed' ? 'confirmação: confirmadas' :
      confirmationFilter === 'declined' ? 'confirmação: recusadas' :
      confirmationFilter === 'no_response' ? 'confirmação: sem resposta' : `confirmação: ${confirmationFilter}`;

    return `${statusLabel} • ${confirmationLabel}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.filterContainer}>
        {['all', 'pending', 'confirmed', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              filter === status && styles.filterBtnActive
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive
              ]}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'confirmed' ? 'Confirmados' : 'Concluídos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'confirmed', 'declined', 'no_response'].map((confirmation) => (
          <TouchableOpacity
            key={confirmation}
            style={[
              styles.filterBtn,
              confirmationFilter === confirmation && styles.filterBtnActive
            ]}
            onPress={() => setConfirmationFilter(confirmation)}
          >
            <Text
              style={[
                styles.filterText,
                confirmationFilter === confirmation && styles.filterTextActive
              ]}
            >
              {
                confirmation === 'all' ? 'Todas confirmações'
                  : confirmation === 'pending' ? 'Aguardando'
                  : confirmation === 'confirmed' ? 'Confirmadas'
                  : confirmation === 'declined' ? 'Recusadas'
                  : 'Sem resposta'
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Novo Agendamento"
        iconName="calendar-plus"
        onPress={() => navigation.navigate('NewAppointment')}
      />
      <Button
        title={batchRequesting ? 'Solicitando...' : 'Solicitar confirmação (hoje)'}
        onPress={handleBatchRequestConfirmation}
        variant="outline"
        style={styles.batchButton}
        disabled={batchRequesting}
      />
      <Text style={styles.batchTargetText}>{getBatchTargetLabel()}</Text>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );

  if (isLoading && appointments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <AppointmentItem
            appointment={item}
            onPress={() => navigation.navigate('AppointmentDetails', { id: item.id })}
            onRequestConfirmation={() => handleQuickRequestConfirmation(item.id)}
            requestingConfirmation={requestingId === item.id}
          />
        </View>
      )}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
        </View>
      }
      contentContainerStyle={styles.container}
      onRefresh={refresh}
      refreshing={isLoading}
    />
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#FFFDFC',
    borderRadius: 26,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: SPACING.MD
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1ED',
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    marginBottom: SPACING.SM
  },
  heroTitle: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: SPACING.MD
  },
  container: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND
  },
  header: {
    marginBottom: SPACING.LG
  },
  errorText: {
    marginTop: SPACING.SM,
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM
  },
  batchButton: {
    marginTop: SPACING.SM
  },
  batchTargetText: {
    marginTop: SPACING.XS,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: '600'
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.MD
  },
  filterBtn: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE
  },
  filterBtnActive: {
    backgroundColor: '#FFF1ED',
    borderColor: COLORS.PRIMARY
  },
  filterText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600'
  },
  filterTextActive: {
    color: 'white'
  },
  itemContainer: {
    marginBottom: SPACING.MD
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XL
  },
  emptyText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY
  }
});
