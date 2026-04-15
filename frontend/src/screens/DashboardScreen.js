import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { appointmentService, notificationService, reportService } from '../services';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AppointmentItem } from '../components/AppointmentItem';
import { BrandLogoImage } from '../components/BrandLogoImage';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [retention, setRetention] = useState(null);
  const [confirmationSummary, setConfirmationSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.role]);

  const loadData = async () => {
    try {
      const today = new Date();
      const response = await appointmentService.listAppointments({
        date: today.toISOString().split('T')[0],
        limit: 5
      });
      setAppointments(response.data || []);

      const confirmationResponse = await appointmentService.getConfirmationSummary(
        today.toISOString().split('T')[0]
      );
      setConfirmationSummary(confirmationResponse.data?.summary || null);

      const notifResponse = await notificationService.listNotifications(1, 5);
      setNotifications(notifResponse.data || []);

      if (user?.role === 'admin') {
        const retentionStart = new Date();
        retentionStart.setDate(retentionStart.getDate() - 30);
        const retentionResponse = await reportService.getRetentionReport(
          retentionStart.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        setRetention(retentionResponse.data || null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const openClientDetails = (clientId) => {
    if (!clientId) return;
    navigation.navigate('ClientDetails', { id: clientId });
  };

  const scheduleReturn = (clientId) => {
    if (!clientId) return;
    navigation.navigate('NewAppointment', { clientId });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
            <View style={styles.logoHeader}>
              <BrandLogoImage width={260} />
            </View>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroTag}>Bem-vinda de volta</Text>
            <Text style={styles.greeting}>Olá, {user?.name}!</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{appointments.length}</Text>
            <Text style={styles.heroStatLabel}>Agendamentos</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{getUnreadCount()}</Text>
            <Text style={styles.heroStatLabel}>Alertas</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>📊</Text>
            <Text style={styles.heroStatLabel}>Relatórios</Text>
          </View>
        </View>
      </View>

      {appointments.length > 0 && (
        <Card title="Próximos Agendamentos" style={styles.card}>
          {appointments.slice(0, 3).map(apt => (
            <AppointmentItem
              key={apt.id}
              appointment={apt}
              onPress={() => navigation.navigate('AppointmentDetails', { id: apt.id })}
            />
          ))}
          <Button
            title="Ver Todos"
            onPress={() => navigation.navigate('Appointments')}
            variant="outline"
          />
        </Card>
      )}

      {confirmationSummary && (
        <Card title="Confirmações de Hoje" style={styles.card}>
          <View style={styles.confirmationGrid}>
            <View style={styles.confirmationTile}>
              <Text style={styles.confirmationNumber}>{confirmationSummary.pending || 0}</Text>
              <Text style={styles.confirmationLabel}>Aguardando</Text>
            </View>
            <View style={styles.confirmationTile}>
              <Text style={styles.confirmationNumber}>{confirmationSummary.confirmed || 0}</Text>
              <Text style={styles.confirmationLabel}>Confirmados</Text>
            </View>
            <View style={styles.confirmationTile}>
              <Text style={styles.confirmationNumber}>{confirmationSummary.declined || 0}</Text>
              <Text style={styles.confirmationLabel}>Recusados</Text>
            </View>
            <View style={styles.confirmationTile}>
              <Text style={styles.confirmationNumber}>{confirmationSummary.no_response || 0}</Text>
              <Text style={styles.confirmationLabel}>Sem resposta</Text>
            </View>
          </View>

          <View style={styles.expiredTodayRow}>
            <Text style={styles.expiredTodayLabel}>Expiradas hoje</Text>
            <Text style={styles.expiredTodayValue}>{confirmationSummary.expiredToday || 0}</Text>
          </View>
        </Card>
      )}

      {retention && (
        <Card title="Clientes em foco" style={styles.card}>
          <Text style={styles.smallSectionTitle}>Retorno sugerido</Text>
          {(retention.returnCandidates || []).slice(0, 3).map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.smallListItemPressable}
              activeOpacity={0.8}
            >
              <View style={styles.smallListItemRow}>
                <View style={styles.smallListTextBlock}>
                  <Text style={styles.smallListTitle}>{client.name}</Text>
                  <Text style={styles.smallListMeta}>{client.daysSinceLastVisit ?? '-'} dias sem voltar</Text>
                </View>
                <View style={styles.quickActionsColumn}>
                  <TouchableOpacity onPress={() => openClientDetails(client.id)} activeOpacity={0.8}>
                    <Text style={styles.quickActionText}>Abrir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => scheduleReturn(client.id)} activeOpacity={0.8}>
                    <Text style={styles.quickActionSecondaryText}>Agendar retorno</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <Text style={styles.smallSectionTitle}>Mais faltas</Text>
          {(retention.mostAbsent || []).slice(0, 3).map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.smallListItemPressable}
              activeOpacity={0.8}
            >
              <View style={styles.smallListItemRow}>
                <View style={styles.smallListTextBlock}>
                  <Text style={styles.smallListTitle}>{client.name}</Text>
                  <Text style={styles.smallListMeta}>{client.cancelledCount} cancelamentos</Text>
                </View>
                <View style={styles.quickActionsColumn}>
                  <TouchableOpacity onPress={() => openClientDetails(client.id)} activeOpacity={0.8}>
                    <Text style={styles.quickActionText}>Abrir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => scheduleReturn(client.id)} activeOpacity={0.8}>
                    <Text style={styles.quickActionSecondaryText}>Agendar retorno</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <View style={styles.menuSection}>
        <Button
          title="Agendar Novo Serviço"
          onPress={() => navigation.navigate('NewAppointment')}
          style={styles.primaryAction}
        />
        <Button
          title="Gerenciar Clientes"
          onPress={() => navigation.navigate('Clients')}
          variant="secondary"
          style={styles.secondaryAction}
        />
        <Button
          title="Meu Perfil"
          onPress={() => navigation.navigate('Profile')}
          variant="outline"
          style={styles.secondaryAction}
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
    logoHeader: {
      alignItems: 'center',
      paddingTop: SPACING.MD,
      paddingBottom: SPACING.SM,
      paddingHorizontal: SPACING.LG
    },
  hero: {
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.MD,
    marginBottom: SPACING.LG,
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.LG
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1ED',
    color: COLORS.TEXT_PRIMARY,
    borderRadius: 999,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    fontSize: FONT_SIZES.XS,
    fontWeight: '700',
    marginBottom: SPACING.SM
  },
  greeting: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY
  },
  date: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS
  },
  logoutBtn: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: '#FFF1ED',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F0D4CD'
  },
  logoutText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '700'
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: SPACING.SM
  },
  heroStat: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 20,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1E2DD'
  },
  heroStatNumber: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '800',
    color: COLORS.PRIMARY
  },
  heroStatLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
    textAlign: 'center'
  },
  card: {
    marginHorizontal: SPACING.LG
  },
  smallSectionTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    marginBottom: SPACING.XS
  },
  smallListItemPressable: {
    marginBottom: SPACING.SM
  },
  smallListItem: {
    paddingVertical: SPACING.XS,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER
  },
  confirmationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM
  },
  confirmationTile: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: '#F2E3DF',
    paddingVertical: SPACING.MD,
    alignItems: 'center'
  },
  confirmationNumber: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '800',
    color: COLORS.PRIMARY
  },
  confirmationLabel: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '700'
  },
  expiredTodayRow: {
    marginTop: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.SM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  expiredTodayLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '700'
  },
  expiredTodayValue: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.PRIMARY,
    fontWeight: '800'
  },
  smallListItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.MD,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: '#F2E3DF'
  },
  smallListTextBlock: {
    flex: 1,
    paddingRight: SPACING.SM
  },
  quickActionsColumn: {
    alignItems: 'flex-end'
  },
  smallListTitle: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY
  },
  smallListMeta: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY
  },
  quickActionText: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '700',
    color: COLORS.PRIMARY
  },
  quickActionSecondaryText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2
  },
  menuSection: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD
  },
  primaryAction: {
    marginBottom: SPACING.MD
  },
  secondaryAction: {
    marginBottom: SPACING.XL
  }
});
