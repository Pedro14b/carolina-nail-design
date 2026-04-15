import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Card } from '../components/Card';
import { useReportsViewModel } from '../presentation/viewmodels/useReportsViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const ReportsScreen = ({ navigation }) => {
  const {
    period,
    setPeriod,
    financialReport,
    appointmentReport,
    retentionReport,
    isLoading,
    errorMessage,
    refresh
  } = useReportsViewModel();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const openClientDetails = (clientId) => {
    if (!clientId) return;
    navigation.navigate('ClientDetails', { id: clientId });
  };

  const scheduleReturn = (clientId) => {
    if (!clientId) return;
    navigation.navigate('NewAppointment', { clientId });
  };

  const PeriodPicker = () => (
    <View style={styles.periodContainer}>
      {['week', 'month', 'year'].map((p) => (
        <TouchableOpacity
          key={p}
          style={[styles.periodBtn, period === p && styles.periodBtnActive]}
          onPress={() => setPeriod(p)}
        >
          <Text
            style={[
              styles.periodText,
              period === p && styles.periodTextActive
            ]}
          >
            {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTag}>Visão estratégica</Text>
        <Text style={styles.heroTitle}>Relatórios</Text>
        <Text style={styles.heroSubtitle}>Monitore faturamento e atendimentos com uma apresentação mais elegante.</Text>
      </View>

      <PeriodPicker />

      {!!errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {financialReport && (
        <Card title="Relatório Financeiro">
          <View style={styles.reportRow}>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Receita</Text>
              <Text style={[styles.reportValue, { color: COLORS.SUCCESS }]}>
                {formatCurrency(financialReport.summary?.totalIncome)}
              </Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Despesas</Text>
              <Text style={[styles.reportValue, { color: COLORS.ERROR }]}>
                {formatCurrency(financialReport.summary?.totalExpenses)}
              </Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            <Text style={[
              styles.balanceValue,
              {
                color: (financialReport.summary?.balance || 0) >= 0
                  ? COLORS.SUCCESS
                  : COLORS.ERROR
              }
            ]}>
              {formatCurrency(financialReport.summary?.balance)}
            </Text>
          </View>
        </Card>
      )}

      {appointmentReport && (
        <Card title="Relatório de Atendimentos">
          <View style={styles.reportRow}>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Total</Text>
              <Text style={styles.reportValue}>
                {appointmentReport.summary?.total || 0}
              </Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Concluídos</Text>
              <Text style={[styles.reportValue, { color: COLORS.SUCCESS }]}>
                {appointmentReport.summary?.completed || 0}
              </Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Cancelados</Text>
              <Text style={[styles.reportValue, { color: COLORS.ERROR }]}>
                {appointmentReport.summary?.cancelled || 0}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Taxa de Conclusão</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${appointmentReport.summary?.completionRate}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.progressValue}>
              {appointmentReport.summary?.completionRate}%
            </Text>
          </View>
        </Card>
      )}

      {retentionReport && (
        <Card title="Retenção e retorno">
          <View style={styles.reportRow}>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Clientes monitorados</Text>
              <Text style={styles.reportValue}>{retentionReport.summary?.totalTrackedClients || 0}</Text>
            </View>
            <View style={styles.reportItem}>
              <Text style={styles.reportLabel}>Sugestões de retorno</Text>
              <Text style={styles.reportValue}>{retentionReport.summary?.returnCandidates || 0}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Clientes para retorno</Text>
          {retentionReport.returnCandidates?.length > 0 ? (
            retentionReport.returnCandidates.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.listItemPressable}
                activeOpacity={0.8}
              >
                <View style={styles.listItemCard}>
                  <View style={styles.listItemTextBlock}>
                    <Text style={styles.listTitle}>{client.name}</Text>
                    <Text style={styles.listMeta}>Última visita: {client.lastVisitAt ? new Date(client.lastVisitAt).toLocaleDateString('pt-BR') : '-'}</Text>
                    <Text style={styles.listMeta}>Dias sem retornar: {client.daysSinceLastVisit ?? '-'}</Text>
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
            ))
          ) : (
            <Text style={styles.emptyText}>Sem clientes para retorno neste período.</Text>
          )}

          <Text style={styles.sectionTitle}>Mais faltas</Text>
          {retentionReport.mostAbsent?.length > 0 ? (
            retentionReport.mostAbsent.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.listItemPressable}
                activeOpacity={0.8}
              >
                <View style={styles.listItemCard}>
                  <View style={styles.listItemTextBlock}>
                    <Text style={styles.listTitle}>{client.name}</Text>
                    <Text style={styles.listMeta}>Cancelamentos: {client.cancelledCount}</Text>
                    <Text style={styles.listMeta}>Atendimentos concluídos: {client.completedCount}</Text>
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
            ))
          ) : (
            <Text style={styles.emptyText}>Sem registros de faltas neste período.</Text>
          )}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.LG
  },
  hero: {
    marginTop: SPACING.MD,
    marginBottom: SPACING.MD,
    backgroundColor: '#FFFDFC',
    borderRadius: 26,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3
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
    lineHeight: 22
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  periodContainer: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginVertical: SPACING.MD
  },
  periodBtn: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE
  },
  periodBtnActive: {
    backgroundColor: '#FFF1ED',
    borderColor: COLORS.PRIMARY
  },
  periodText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600'
  },
  periodTextActive: {
    color: 'white'
  },
  errorContainer: {
    backgroundColor: '#FFF1ED',
    borderRadius: 14,
    padding: SPACING.MD,
    marginBottom: SPACING.MD
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.XS
  },
  retryText: {
    color: COLORS.PRIMARY,
    fontWeight: '700'
  },
  reportRow: {
    flexDirection: 'row',
    gap: SPACING.MD,
    marginBottom: SPACING.MD
  },
  reportItem: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: 18,
    alignItems: 'center'
  },
  reportLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS
  },
  reportValue: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.PRIMARY
  },
  balanceCard: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.LG,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: SPACING.MD
  },
  balanceLabel: {
    fontSize: FONT_SIZES.SM,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.SM
  },
  balanceValue: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: 'white'
  },
  progressContainer: {
    marginTop: SPACING.MD
  },
  progressLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.SM
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS
  },
  progressValue: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'right'
  },
  sectionTitle: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    marginBottom: SPACING.SM
  },
  listItem: {
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER
  },
  listItemPressable: {
    marginBottom: SPACING.SM
  },
  listItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.MD,
    borderRadius: 18,
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  listItemTextBlock: {
    flex: 1,
    paddingRight: SPACING.SM
  },
  quickActionsColumn: {
    alignItems: 'flex-end'
  },
  listTitle: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY
  },
  listMeta: {
    marginTop: 2,
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
  emptyText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  }
});
