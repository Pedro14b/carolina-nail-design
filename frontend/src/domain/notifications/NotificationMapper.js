export const mapApiNotificationToDomain = (raw) => ({
  id: raw?.id,
  type: raw?.type || 'system',
  title: raw?.title || '',
  message: raw?.message || '',
  isRead: !!raw?.isRead,
  createdAt: raw?.createdAt || null,
  data: raw?.data || null
});

export const mapApiNotificationsListToDomain = (rows) =>
  (rows || []).map(mapApiNotificationToDomain);
