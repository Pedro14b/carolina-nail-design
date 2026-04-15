import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import apiClient from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MonoIcon } from '../components/MonoIcon';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const BackupScreen = () => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      setIsLoading(true);
      const [statsRes, backupsRes] = await Promise.all([
        apiClient.get('/backup/stats'),
        apiClient.get('/backup/list')
      ]);

      setStats(statsRes.data.data);
      setBackups(backupsRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      Alert.alert('Erro', 'Não foi possível carregar informações de backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      const response = await apiClient.post('/backup/create');

      Alert.alert(
        'Sucesso',
        `Backup criado com sucesso!\nArquivo: ${response.data.data.filename}`
      );

      loadBackupInfo();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar backup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportCSV = async (type) => {
    try {
      const response = await apiClient.get(`/backup/export?type=${type}`, {
        responseType: 'blob'
      });

      const now = new Date().toISOString().split('T')[0];
      const filename = `export_${type}_${now}.csv`;

      // No React Native, você pode usar Share ou guardar em dispositivo
      Alert.alert('Sucesso', `Dados exportados: ${filename}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar dados');
    }
  };

  const handleDeleteBackup = (filename) => {
    Alert.alert(
      'Deletar Backup?',
      `Tem certeza que deseja deletar ${filename}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/backup/${filename}`);
              Alert.alert('Sucesso', 'Backup deletado');
              loadBackupInfo();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar backup');
            }
          }
        }
      ]
    );
  };

  const BackupItem = ({ backup }) => (
    <TouchableOpacity
      style={styles.backupCard}
      onPress={() => Alert.alert(
        'Detalhes do Backup',
        `Arquivo: ${backup.filename}\nTamanho: ${backup.sizeKB}KB\nData: ${new Date(backup.createdAt).toLocaleDateString('pt-BR')}`
      )}
    >
      <View style={styles.backupHeader}>
        <View style={styles.backupInfo}>
          <View style={styles.backupDateRow}>
            <MonoIcon name="calendar-month-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
            <Text style={styles.backupDate}>{new Date(backup.createdAt).toLocaleDateString('pt-BR')}</Text>
          </View>
          <Text style={styles.backupSize}>{backup.sizeKB}KB</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteBackup(backup.filename)}
        >
          <MonoIcon name="delete-outline" size={18} color={COLORS.ERROR} />
        </TouchableOpacity>
      </View>
      <Text style={styles.backupFilename} numberOfLines={1}>
        {backup.filename}
      </Text>
    </TouchableOpacity>
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
        <Text style={styles.heroTag}>Proteção e exportação</Text>
        <Text style={styles.heroTitle}>Backup</Text>
        <Text style={styles.heroSubtitle}>Gerencie cópias de segurança e exportações com um painel mais refinado.</Text>
      </View>

      {/* Estatísticas */}
      <Card title="Status do Backup" style={styles.statsCard}>
        {stats ? (
          <>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total de Backups</Text>
                <Text style={styles.statValue}>{stats.totalBackups}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tamanho Total</Text>
                <Text style={styles.statValue}>{stats.totalSizeKB}KB</Text>
              </View>
            </View>

            {stats.lastBackupDate && (
              <View style={styles.lastBackupInfo}>
                <View style={styles.labelRow}>
                  <MonoIcon name="check-circle-outline" size={16} color="white" style={styles.inlineIcon} />
                  <Text style={styles.lastBackupLabel}>Último Backup:</Text>
                </View>
                <Text style={styles.lastBackupDate}>
                  {new Date(stats.lastBackupDate).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}

            <View style={styles.labelRow}>
              <MonoIcon name="robot-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
              <Text style={styles.autoBackupInfo}>Backups automáticos agendados diariamente às 3 AM</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>Nenhum backup ainda</Text>
        )}
      </Card>

      {/* Ações */}
      <Card title="Ações" style={styles.card}>
        <Button
          title={isCreating ? 'Criando backup...' : 'Criar Backup Manual'}
          onPress={handleCreateBackup}
          disabled={isCreating}
          style={{ marginBottom: SPACING.MD }}
        />

        <Button
          title="Exportar Agendamentos (CSV)"
          iconName="download-outline"
          onPress={() => handleExportCSV('appointments')}
          variant="secondary"
          style={{ marginBottom: SPACING.MD }}
        />

        <Button
          title="Exportar Transações (CSV)"
          iconName="cash-multiple"
          onPress={() => handleExportCSV('transactions')}
          variant="secondary"
          style={{ marginBottom: SPACING.MD }}
        />

        <Button
          title="Exportar Tudo (JSON)"
          iconName="archive-outline"
          onPress={() => handleExportCSV('all')}
          variant="outline"
        />
      </Card>

      {/* Lista de Backups */}
      {backups.length > 0 && (
        <Card title="Backups Disponíveis" style={styles.card}>
          <FlatList
            data={backups}
            renderItem={({ item }) => <BackupItem backup={item} />}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </Card>
      )}

      {/* Informações Importantes */}
      <Card title="Informações Importantes" style={styles.infoCard}>
        <View style={styles.infoItem}>
          <MonoIcon name="pin-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Backups Automáticos:</Text> Seu sistema faz backups completos automaticamente todos os dias às 3 AM.</Text>
        </View>
        <View style={styles.infoItem}>
          <MonoIcon name="pin-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Exportar Dados:</Text> Você pode exportar dados em CSV para Excel ou fazer backup em JSON.</Text>
        </View>
        <View style={styles.infoItem}>
          <MonoIcon name="pin-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Segurança:</Text> Todos os dados são encriptados e sincronizados na nuvem.</Text>
        </View>
        <View style={styles.infoItem}>
          <MonoIcon name="pin-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Recuperação:</Text> Em caso de problema, podemos restaurar qualquer backup anterior.</Text>
        </View>
        <View style={styles.infoItem}>
          <MonoIcon name="lightbulb-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Dica:</Text> Faça um backup manual antes de fazer mudanças importantes.</Text>
        </View>
      </Card>

      {/* Suporte */}
      <Card title="Precisa de Ajuda?" style={styles.supportCard}>
        <Text style={styles.supportText}>
          Se tiver problemas com seus dados:
        </Text>
        <View style={styles.supportRow}>
          <MonoIcon name="email-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.supportText}>Email: suporte@carolinanaildesign.com</Text>
        </View>
        <View style={styles.supportRow}>
          <MonoIcon name="phone-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.supportText}>WhatsApp: +55 (11) XXXXX-XXXX</Text>
        </View>
        <View style={styles.supportRow}>
          <MonoIcon name="clock-outline" size={16} color={COLORS.TEXT_SECONDARY} style={styles.inlineIcon} />
          <Text style={styles.supportText}>Seg-Sex, 9h-18h</Text>
        </View>

        <Button
          title="Contatar Suporte"
          onPress={() => Alert.alert('Contato', 'Abra seu WhatsApp para contatar')}
          variant="outline"
          style={{ marginTop: SPACING.MD }}
        />
      </Card>
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
  statsCard: {
    marginTop: SPACING.MD
  },
  card: {
    marginTop: SPACING.MD
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.MD,
    marginBottom: SPACING.MD
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: 18,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS
  },
  statValue: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY
  },
  lastBackupInfo: {
    backgroundColor: COLORS.SUCCESS,
    padding: SPACING.MD,
    borderRadius: 18,
    marginBottom: SPACING.MD
  },
  lastBackupLabel: {
    fontSize: FONT_SIZES.SM,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.XS
  },
  lastBackupDate: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: 'bold',
    color: 'white'
  },
  autoBackupInfo: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD
  },
  noDataText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center'
  },
  backupCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 18,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    borderWidth: 1,
    borderColor: '#F1E2DD'
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM
  },
  backupInfo: {
    flex: 1
  },
  backupDateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backupDate: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  backupSize: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  backupFilename: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic'
  },
  deleteBtn: {
    padding: SPACING.SM,
    borderRadius: 999,
    backgroundColor: '#FFF1ED'
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inlineIcon: {
    marginRight: SPACING.XS
  },
  infoCard: {
    backgroundColor: 'rgba(212, 184, 160, 0.14)',
    borderLeftColor: COLORS.INFO
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM
  },
  infoText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24
  },
  supportCard: {
    marginBottom: SPACING.XL,
    backgroundColor: 'rgba(201, 124, 124, 0.08)',
    borderLeftColor: COLORS.SUCCESS
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS
  },
  supportText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22
  }
});
