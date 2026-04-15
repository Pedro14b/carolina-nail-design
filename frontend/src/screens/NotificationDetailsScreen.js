import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MonoIcon } from '../components/MonoIcon';
import { useNotificationDetailsViewModel } from '../presentation/viewmodels/useNotificationDetailsViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const NotificationDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { notification, isLoading, errorMessage, deleteNotification } = useNotificationDetailsViewModel(id);

  useEffect(() => {
    if (errorMessage) {
      Alert.alert('Erro', errorMessage);
      navigation.goBack();
    }
  }, [errorMessage, navigation]);

  const handleDelete = async () => {
    Alert.alert('Confirmar', 'Deseja deletar esta notificação?', [
      { text: 'Não', onPress: () => {} },
      {
        text: 'Sim',
        onPress: async () => {
          const result = await deleteNotification();
          if (result.success) {
            Alert.alert('Sucesso', 'Notificação deletada');
            navigation.goBack();
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível deletar');
          }
        }
      }
    ]);
  };

  const getTypeLabel = (type) => {
    const labels = {
      'appointment': 'Agendamento',
      'reminder': 'Lembrete',
      'payment': 'Pagamento',
      'system': 'Sistema'
    };
    return labels[type] || 'Notificação';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'appointment': 'calendar-month-outline',
      'reminder': 'bell-outline',
      'payment': 'credit-card-outline',
      'system': 'information-outline'
    };
    return icons[type] || 'information-outline';
  };

  const getTypeColor = (type) => {
    const colors = {
      'appointment': '#2196F3',
      'reminder': '#FF9800',
      'payment': '#4CAF50',
      'system': COLORS.TEXT_SECONDARY
    };
    return colors[type] || COLORS.TEXT_SECONDARY;
  };

  const appointmentId = notification?.data?.appointmentId;

  const handleOpenRelatedAppointment = () => {
    if (!appointmentId) return;

    navigation.navigate('Appointments', {
      screen: 'AppointmentDetails',
      params: { id: appointmentId }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!notification) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Notificação não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(notification.type) }]}>
            <MonoIcon name={getTypeIcon(notification.type)} size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.MD }}>
            <Text style={styles.typeLabel}>{getTypeLabel(notification.type)}</Text>
            <Text style={styles.title}>{notification.title}</Text>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Mensagem</Text>
          <Text style={styles.message}>{notification.message}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data:</Text>
            <Text style={styles.detailValue}>
              {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Horário:</Text>
            <Text style={styles.detailValue}>
              {new Date(notification.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[
              styles.statusBadge,
              notification.isRead ? styles.statusRead : styles.statusUnread
            ]}>
              <Text style={styles.statusText}>
                {notification.isRead ? 'Lida' : 'Não lida'}
              </Text>
            </View>
          </View>
        </View>

        {appointmentId && (
          <>
            <View style={styles.divider} />
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Ação Relacionada</Text>
              <TouchableOpacity style={styles.actionLink} onPress={handleOpenRelatedAppointment}>
                <Text style={styles.actionLinkText}>
                  Ver {notification.type === 'appointment' ? 'agendamento' : 'detalhes'} →
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Deletar Notificação"
          iconName="delete-outline"
          onPress={handleDelete}
          variant="danger"
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  typeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  typeIcon: {
    fontSize: 28
  },
  typeLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS
  },
  title: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY
  },
  card: {
    marginBottom: SPACING.LG
  },
  contentSection: {
    marginBottom: SPACING.MD
  },
  sectionTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
    textTransform: 'uppercase'
  },
  message: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.MD
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    paddingBottom: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  detailLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500'
  },
  detailValue: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: 12
  },
  statusRead: {
    backgroundColor: '#E8F5E9'
  },
  statusUnread: {
    backgroundColor: '#FFF3E0'
  },
  statusText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  actionLink: {
    paddingVertical: SPACING.MD
  },
  actionLinkText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  errorText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.ERROR
  },
  actions: {
    gap: SPACING.MD
  }
});
