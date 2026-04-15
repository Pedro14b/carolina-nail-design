import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const AppointmentItem = ({ appointment, onPress, onRequestConfirmation, requestingConfirmation = false }) => {
  const getStatusColor = (status) => {
    const colors = {
      'pending': COLORS.WARNING,
      'confirmed': COLORS.INFO,
      'completed': COLORS.SUCCESS,
      'cancelled': COLORS.ERROR
    };
    return colors[status] || COLORS.TEXT_SECONDARY;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getConfirmationColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#22C55E',
      declined: '#EF4444',
      no_response: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getConfirmationLabel = (status) => {
    const labels = {
      pending: 'Aguardando',
      confirmed: 'Confirmou',
      declined: 'Recusou',
      no_response: 'Sem resposta'
    };
    return labels[status] || 'Sem resposta';
  };

  const fallbackDate = new Date(appointment.date);
  const dateStr = appointment?.time ? appointment.date : fallbackDate.toLocaleDateString('pt-BR');
  const timeStr = appointment?.time
    ? appointment.time
    : fallbackDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.clientName}>{appointment.client?.name}</Text>
          <Text style={styles.service}>{appointment.Service?.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.dateTime}>{dateStr} às {timeStr}</Text>
        <Text style={styles.price}>{new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(appointment.totalPrice)}</Text>
      </View>

      <View style={styles.confirmationRow}>
        <Text style={styles.confirmationLabel}>Confirmação:</Text>
        <View
          style={[
            styles.confirmationBadge,
            { backgroundColor: getConfirmationColor(appointment.confirmationStatus) }
          ]}
        >
          <Text style={styles.confirmationText}>{getConfirmationLabel(appointment.confirmationStatus)}</Text>
        </View>
      </View>

      {!!onRequestConfirmation && !['cancelled', 'completed'].includes(appointment.status) && (
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={onRequestConfirmation}
          disabled={requestingConfirmation}
          activeOpacity={0.8}
        >
          <Text style={styles.quickActionText}>
            {requestingConfirmation ? 'Enviando solicitação...' : 'Solicitar confirmação'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM
  },
  clientName: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY
  },
  service: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12
  },
  statusText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.BACKGROUND,
    fontWeight: 'bold'
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateTime: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  price: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: 'bold',
    color: COLORS.PRIMARY
  },
  confirmationRow: {
    marginTop: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.SM
  },
  confirmationLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600'
  },
  confirmationBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: 3,
    borderRadius: 10
  },
  confirmationText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.XS,
    fontWeight: '700'
  },
  quickActionBtn: {
    marginTop: SPACING.SM,
    alignSelf: 'flex-end',
    backgroundColor: '#FFF1ED',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 999,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS
  },
  quickActionText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: '700'
  }
});
