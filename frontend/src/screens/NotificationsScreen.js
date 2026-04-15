import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNotificationsViewModel } from '../presentation/viewmodels/useNotificationsViewModel';
import { MonoIcon } from '../components/MonoIcon';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const NotificationsScreen = ({ navigation }) => {
  const {
    notifications,
    isLoading,
    errorMessage,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotificationsViewModel();

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
      'appointment': COLORS.INFO,
      'reminder': COLORS.WARNING,
      'payment': COLORS.SUCCESS,
      'system': COLORS.TEXT_SECONDARY
    };
    return colors[type] || COLORS.TEXT_SECONDARY;
  };

  const NotificationItem = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard
      ]}
      onPress={async () => {
        await markAsRead(notification.id, notification.isRead);
        navigation.navigate('NotificationDetails', { id: notification.id });
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <MonoIcon
            name={getTypeIcon(notification.type)}
            size={20}
            color={getTypeColor(notification.type)}
            style={styles.notificationIcon}
          />
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </View>
        </View>
        <Text style={styles.notificationTime}>
          {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      {!notification.isRead && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTag}>Central de alertas</Text>
        <Text style={styles.heroTitle}>Notificações</Text>
        <Text style={styles.heroSubtitle}>Acompanhe lembretes, pagamentos e avisos do sistema com uma leitura mais limpa.</Text>
      </View>

      {unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={styles.unreadText}>
            {unreadCount} notificação{unreadCount !== 1 ? 's' : ''} não lida{unreadCount !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllBtnText}>Marcar tudo como lido</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem notification={item} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MonoIcon name="bell-outline" size={30} color={COLORS.TEXT_SECONDARY} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Sem notificações</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND
  },
  hero: {
    marginHorizontal: SPACING.LG,
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
  header: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
    padding: SPACING.MD,
    borderRadius: 18,
    backgroundColor: '#FFF8F5',
    borderWidth: 1,
    borderColor: '#F1E2DD'
  },
  unreadText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM
  },
  markAllBtn: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    backgroundColor: '#FFF1ED',
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F0D4CD'
  },
  markAllBtnText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '700'
  },
  errorContainer: {
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.SM,
    marginBottom: SPACING.SM,
    backgroundColor: '#FFF1ED',
    borderRadius: 14,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: '#F4D8D2'
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    paddingBottom: SPACING.XL
  },
  notificationCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 20,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  unreadCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderLeftColor: COLORS.PRIMARY
  },
  notificationContent: {
    marginBottom: SPACING.SM
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: SPACING.MD
  },
  notificationIcon: {
    fontSize: FONT_SIZES.LG
  },
  notificationText: {
    flex: 1
  },
  notificationTitle: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  notificationMessage: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  notificationTime: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 28
  },
  unreadIndicator: {
    position: 'absolute',
    right: SPACING.MD,
    top: SPACING.MD,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XL
  },
  emptyIcon: {
    fontSize: FONT_SIZES.XXL,
    marginBottom: SPACING.MD
  },
  emptyText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY
  }
});
