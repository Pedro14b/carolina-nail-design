import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import apiClient from '../../services/api';
import { mapApiClientToDomain, mapDomainCreateClientToApi } from '../../domain/clients/ClientMapper';
import { SyncQueueService } from '../services/SyncQueueService';

const CLIENTS_CACHE_KEY = 'clients_cache_v1';

const safeReadCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CLIENTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeWriteCache = async (clients) => {
  try {
    await AsyncStorage.setItem(CLIENTS_CACHE_KEY, JSON.stringify(clients));
  } catch {
    // cache best effort
  }
};

export class ClientRepository {
  async list({ page = 1, limit = 50, search = '' } = {}) {
    try {
      const response = await apiClient.get('/clients', {
        params: { page, limit, search }
      });

      const rows = response?.data?.data || [];
      const clients = rows.map(mapApiClientToDomain);
      await safeWriteCache(clients);
      return clients;
    } catch (error) {
      const cached = await safeReadCache();
      if (cached.length > 0) {
        if (!search) return cached;
        const normalized = search.toLowerCase();
        return cached.filter((c) =>
          c.name.toLowerCase().includes(normalized) || c.phone.includes(normalized)
        );
      }
      throw error;
    }
  }

  async getById(id) {
    const response = await apiClient.get(`/clients/${id}`);
    const payload = response?.data?.data || response?.data;
    return mapApiClientToDomain(payload);
  }

  async create(input) {
    const payload = mapDomainCreateClientToApi(input);

    // Verificar conectividade
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected !== false && state.isInternetReachable !== false;

    if (!isConnected) {
      // 📝 Criar um ID temporário para o cliente enquanto offline
      const tempId = `temp_${Date.now()}`;
      const optimisticClient = {
        ...input,
        id: tempId,
        offline: true,
        syncPending: true
      };

      // Enfileirar operação para sincronizar depois
      await SyncQueueService.enqueueOperation({
        type: 'create',
        module: 'clients',
        endpoint: '/clients',
        method: 'POST',
        data: payload
      });

      // Adicionar à cache com flag de offline
      const current = await safeReadCache();
      await safeWriteCache([optimisticClient, ...current]);

      console.log(`[sync] Cliente criado offline: ${optimisticClient.name} (será sincronizado quando online)`);
      return optimisticClient;
    }

    // Se online, fazer requisição normal
    const response = await apiClient.post('/clients', payload);
    const created = mapApiClientToDomain(response?.data?.data || response?.data);

    const current = await safeReadCache();
    await safeWriteCache([created, ...current.filter((c) => c.id !== created.id)]);

    console.log(`[sync] Cliente criado online: ${created.name}`);
    return created;
  }

  async update(id, input) {
    const payload = mapDomainCreateClientToApi(input);
    const response = await apiClient.put(`/clients/${id}`, payload);
    const updated = mapApiClientToDomain(response?.data?.data || response?.data);

    const current = await safeReadCache();
    await safeWriteCache([
      updated,
      ...current.filter((client) => client.id !== updated.id)
    ]);

    return updated;
  }
}

export const clientRepository = new ClientRepository();
