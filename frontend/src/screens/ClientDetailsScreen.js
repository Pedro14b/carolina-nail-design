import React, { useEffect, useMemo, useState } from 'react';
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
import { useClientDetailsViewModel } from '../presentation/viewmodels/useClientDetailsViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { dateUtils, currencyUtils } from '../utils';

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  rescheduled: 'Reagendado'
};

export const ClientDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { client, isLoading, errorMessage } = useClientDetailsViewModel(id);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    if (errorMessage) {
      Alert.alert('Erro', errorMessage);
      navigation.goBack();
    }
  }, [errorMessage, navigation]);

  const filteredHistory = useMemo(() => {
    const items = client?.history || [];
    const now = new Date();

    return items.filter((appointment) => {
      if (historyFilter !== 'all' && appointment.status !== historyFilter) {
        return false;
      }

      if (periodFilter === 'all') {
        return true;
      }

      const appointmentDate = appointment?.date ? new Date(appointment.date) : null;
      if (!appointmentDate || Number.isNaN(appointmentDate.getTime())) {
        return false;
      }

      const limit = new Date(now);
      if (periodFilter === '30d') {
        limit.setDate(limit.getDate() - 30);
      } else if (periodFilter === '90d') {
        limit.setDate(limit.getDate() - 90);
      }

      return appointmentDate >= limit;
    });
  }, [client?.history, historyFilter, periodFilter]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Cliente não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{client.name}</Text>
        <Text style={styles.subtitle}>{client.phone}</Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{client.stats?.totalAppointments || 0}</Text>
          <Text style={styles.statLabel}>Atendimentos</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{client.stats?.completedAppointments || 0}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{currencyUtils.format(client.stats?.totalSpent || 0)}</Text>
          <Text style={styles.statLabel}>Total gasto</Text>
        </Card>
      </View>

      <Card style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{client.phone}</Text>
        </View>
        {client.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{client.email}</Text>
          </View>
        )}
        {client.birthDate && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>{client.birthDate}</Text>
          </View>
        )}
        {client.address && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{client.address}</Text>
          </View>
        )}
        {client.city && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cidade:</Text>
            <Text style={styles.value}>{client.city}, {client.state}</Text>
          </View>
        )}
        {client.zipCode && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>CEP:</Text>
            <Text style={styles.value}>{client.zipCode}</Text>
          </View>
        )}
        {client.totalSpent && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Gasto:</Text>
            <Text style={styles.value}>R$ {client.totalSpent.toFixed(2)}</Text>
          </View>
        )}
        {client.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{client.notes}</Text>
          </View>
        )}
        {client.allergies && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Alergias:</Text>
            <Text style={styles.value}>{client.allergies}</Text>
          </View>
        )}
        {client.preferences && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Preferências:</Text>
            <Text style={styles.value}>{client.preferences}</Text>
          </View>
        )}
        {client.favoriteServices && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Serviços favoritos:</Text>
            <Text style={styles.value}>{client.favoriteServices}</Text>
          </View>
        )}
      </Card>

      {client.nextAppointment && (
        <Card title="Próxima visita" style={styles.card}>
          <Text style={styles.nextAppointmentTitle}>{client.nextAppointment.service?.name || 'Serviço sem nome'}</Text>
          <Text style={styles.nextAppointmentValue}>
            {dateUtils.formatDateTime(client.nextAppointment.date)}
          </Text>
          <Text style={styles.nextAppointmentMeta}>
            Duração: {client.nextAppointment.service?.duration || 0} min
          </Text>
        </Card>
      )}

      <Card title="Histórico de atendimentos" style={styles.card}>
        <View style={styles.filterGroup}>
          {['all', 'completed', 'confirmed', 'cancelled'].map((status) => (
            <Text
              key={status}
              style={[styles.filterChip, historyFilter === status && styles.filterChipActive]}
              onPress={() => setHistoryFilter(status)}
            >
              {status === 'all' ? 'Todos' : statusLabels[status]}
            </Text>
          ))}
        </View>

        <View style={styles.filterGroup}>
          {['all', '30d', '90d'].map((period) => (
            <Text
              key={period}
              style={[styles.filterChip, periodFilter === period && styles.filterChipActive]}
              onPress={() => setPeriodFilter(period)}
            >
              {period === 'all' ? 'Tudo' : period === '30d' ? '30 dias' : '90 dias'}
            </Text>
          ))}
        </View>

        {filteredHistory.length > 0 ? (
          filteredHistory.map((appointment) => (
            <View key={appointment.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{appointment.service?.name || 'Serviço'}</Text>
                  <Text style={styles.timelineStatus}>{statusLabels[appointment.status] || appointment.status}</Text>
                </View>
                <Text style={styles.timelineMeta}>{dateUtils.formatDateTime(appointment.date)}</Text>
                <Text style={styles.timelineMeta}>
                  Profissional: {appointment.professional?.name || 'Não informado'}
                </Text>
                <Text style={styles.timelineMeta}>
                  Valor: {currencyUtils.format(appointment.totalPrice || 0)}
                </Text>
                {appointment.notes ? (
                  <Text style={styles.timelineNotes}>{appointment.notes}</Text>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyHistory}>Nenhum atendimento encontrado com os filtros atuais.</Text>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Editar"
          iconName="pencil-outline"
          onPress={() => navigation.navigate('NewClient', { client })}
          variant="secondary"
        />
        <Button
          title="Novo Agendamento"
          iconName="calendar-month-outline"
          onPress={() => navigation.navigate('NewAppointment', { clientId: id })}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    marginBottom: SPACING.LG
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY
  },
  subtitle: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.MD
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
    padding: SPACING.MD,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    textAlign: 'center'
  },
  statLabel: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center'
  },
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
    marginBottom: SPACING.MD
  },
  filterChip: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: 999,
    backgroundColor: '#F7EFEA',
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: '700'
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    color: '#FFFFFF'
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
  nextAppointmentTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  nextAppointmentValue: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  nextAppointmentMeta: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.LG
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.PRIMARY,
    marginTop: 6,
    marginRight: SPACING.MD
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.MD
  },
  timelineTitle: {
    flex: 1,
    fontSize: FONT_SIZES.BASE,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY
  },
  timelineStatus: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: '700'
  },
  timelineMeta: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  timelineNotes: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontStyle: 'italic'
  },
  emptyHistory: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SM
  },
  errorText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.ERROR
  },
  actions: {
    gap: SPACING.MD
  }
});
