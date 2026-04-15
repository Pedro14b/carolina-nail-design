import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SyncQueueService - Gerencia fila persistente de operações offline
 * 
 * Armazena operações (create/update/delete) quando offline
 * Processa a fila quando conexão voltar
 */

const SYNC_QUEUE_KEY = '@sync_queue';
const OPERATION_TIMEOUT = 30000; // 30 segundos

export class SyncQueueService {
  /**
   * Enfileira uma operação para sincronizar quando online
   */
  static async enqueueOperation(operation) {
    try {
      const queue = await this.getQueue();
      
      const queueItem = {
        id: `${operation.type}_${operation.module}_${Date.now()}`,
        type: operation.type, // 'create', 'update', 'delete'
        module: operation.module, // 'clients', 'appointments'
        endpoint: operation.endpoint, // ex: '/clients'
        method: operation.method, // 'POST', 'PUT', 'DELETE'
        data: operation.data,
        timestamp: new Date().toISOString(),
        retries: 0,
        maxRetries: 3,
        status: 'pending' // 'pending', 'processing', 'success', 'failed'
      };

      queue.push(queueItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      console.log(`[sync] Operação enfileirada: ${queueItem.id}`);
      return queueItem;
    } catch (error) {
      console.error('[sync] Erro ao enfileirar operação:', error);
      throw error;
    }
  }

  /**
   * Obtém toda a fila
   */
  static async getQueue() {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('[sync] Erro ao ler fila:', error);
      return [];
    }
  }

  /**
   * Obtém operações pendentes
   */
  static async getPendingOperations() {
    const queue = await this.getQueue();
    return queue.filter(item => item.status === 'pending');
  }

  /**
   * Marcar operação como processando
   */
  static async markAsProcessing(operationId) {
    try {
      const queue = await this.getQueue();
      const index = queue.findIndex(item => item.id === operationId);
      
      if (index !== -1) {
        queue[index].status = 'processing';
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('[sync] Erro ao marcar como processando:', error);
    }
  }

  /**
   * Marcar operação como bem-sucedida
   */
  static async markAsSuccess(operationId, response) {
    try {
      const queue = await this.getQueue();
      const index = queue.findIndex(item => item.id === operationId);
      
      if (index !== -1) {
        queue[index].status = 'success';
        queue[index].response = response;
        queue[index].completedAt = new Date().toISOString();
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
      console.log(`[sync] Operação sincronizada: ${operationId}`);
    } catch (error) {
      console.error('[sync] Erro ao marcar como sucesso:', error);
    }
  }

  /**
   * Marcar operação como falha e incrementar retries
   */
  static async markAsFailed(operationId) {
    try {
      const queue = await this.getQueue();
      const index = queue.findIndex(item => item.id === operationId);
      
      if (index !== -1) {
        queue[index].retries += 1;
        
        if (queue[index].retries >= queue[index].maxRetries) {
          queue[index].status = 'failed';
          console.log(`[sync] Operação falhou após ${queue[index].maxRetries} tentativas: ${operationId}`);
        } else {
          queue[index].status = 'pending';
          console.log(`[sync] Operação será retentada: ${operationId}`);
        }
        
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('[sync] Erro ao marcar como falha:', error);
    }
  }

  /**
   * Remove operação concluída da fila
   */
  static async removeOperation(operationId) {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter(item => item.id !== operationId);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[sync] Erro ao remover operação:', error);
    }
  }

  /**
   * Limpar fila (com filtro opcional)
   */
  static async clearQueue(filter = null) {
    try {
      if (!filter) {
        await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
        console.log('[sync] Fila limpa completamente');
        return;
      }

      // Filtro para manter apenas certas operações
      const queue = await this.getQueue();
      const filtered = queue.filter(filter);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
      console.log('[sync] Fila parcialmente limpa');
    } catch (error) {
      console.error('[sync] Erro ao limpar fila:', error);
    }
  }

  /**
   * Obter estatísticas da fila
   */
  static async getQueueStats() {
    const queue = await this.getQueue();
    return {
      total: queue.length,
      pending: queue.filter(item => item.status === 'pending').length,
      processing: queue.filter(item => item.status === 'processing').length,
      success: queue.filter(item => item.status === 'success').length,
      failed: queue.filter(item => item.status === 'failed').length
    };
  }
}
