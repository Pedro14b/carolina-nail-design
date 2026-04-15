import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api';
import { mapApiNotificationToDomain, mapApiNotificationsListToDomain } from '../../domain/notifications/NotificationMapper';

const CACHE_KEY = 'notifications_cache_v1';

const readCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCache = async (rows) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    // best effort
  }
};

export class NotificationRepository {
  async list(page = 1, limit = 50) {
    try {
      const response = await apiClient.get('/notifications', { params: { page, limit } });
      const rows = mapApiNotificationsListToDomain(response?.data?.data || []);
      await writeCache(rows);
      return rows;
    } catch (error) {
      const cached = await readCache();
      if (cached.length > 0) return cached;
      throw error;
    }
  }

  async getById(id) {
    const response = await apiClient.get(`/notifications/${id}`);
    return mapApiNotificationToDomain(response?.data?.data || response?.data);
  }

  async markAsRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    const updated = mapApiNotificationToDomain(response?.data?.data || response?.data);

    const current = await readCache();
    await writeCache(current.map((n) => (n.id === id ? updated : n)));

    return updated;
  }

  async markAllAsRead() {
    await apiClient.post('/notifications/mark-all-read');
    const current = await readCache();
    await writeCache(current.map((n) => ({ ...n, isRead: true })));
  }

  async deleteById(id) {
    await apiClient.delete(`/notifications/${id}`);
    const current = await readCache();
    await writeCache(current.filter((n) => n.id !== id));
  }
}

export const notificationRepository = new NotificationRepository();
