import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueueService } from '../infrastructure/services/SyncQueueService';
import apiClient from '../services/api';

/**
 * useSyncQueue - Hook para sincronizar operações offline quando conexão voltar
 * 
 * Monitora mudanças de conectividade e processa a fila automaticamente
 */

export const useSyncQueue = () => {
  const [syncStats, setSyncStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  /**
   * Processar uma operação individual
   */
  const processOperation = useCallback(async (operation) => {
    try {
      await SyncQueueService.markAsProcessing(operation.id);

      // Executar a operação com timeout
      const response = await Promise.race([
        apiClient({
          method: operation.method,
          url: operation.endpoint,
          data: operation.data,
          headers: {
            'X-Offline-Operation': 'true' // Flag para indicar que veio de offline
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 30000)
        )
      ]);

      await SyncQueueService.markAsSuccess(operation.id, response.data);
      return true;
    } catch (error) {
      console.error(`[sync] Erro ao processar ${operation.id}:`, error.message);
      await SyncQueueService.markAsFailed(operation.id);
      return false;
    }
  }, []);

  /**
   * Processar toda a fila
   */
  const processQueue = useCallback(async () => {
    try {
      const pending = await SyncQueueService.getPendingOperations();

      if (pending.length === 0) {
        console.log('[sync] Nenhuma operação pendente para sincronizar');
        setIsSynced(true);
        return;
      }

      setIsProcessing(true);
      console.log(`[sync] Processando ${pending.length} operações pendentes...`);

      let successCount = 0;
      let failCount = 0;

      // Processar operações sequencialmente (importante para integridade de dados)
      for (const operation of pending) {
        const success = await processOperation(operation);
        if (success) {
          successCount++;
          // Remover operação bem-sucedida da fila após um tempo
          setTimeout(() => {
            SyncQueueService.removeOperation(operation.id);
          }, 1000);
        } else {
          failCount++;
        }

        // Pequeno delay entre operações
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`[sync] Sincronização concluída: ${successCount} sucesso(s) | ${failCount} falha(s)`);
      setIsSynced(failCount === 0);
      
      // Atualizar estatísticas
      const stats = await SyncQueueService.getQueueStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('[sync] Erro ao processar fila:', error);
      setIsSynced(false);
    } finally {
      setIsProcessing(false);
    }
  }, [processOperation]);

  /**
   * Monitorar mudanças de conectividade
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isConnected = state.isConnected && state.isInternetReachable;

      if (isConnected) {
        console.log('[sync] Conexão restaurada. Sincronizando fila...');
        await processQueue();
      } else {
        console.log('[sync] Sem conexão. Modo offline ativado.');
        setIsSynced(false);
      }
    });

    // Atualizar stats ao montar
    SyncQueueService.getQueueStats().then(setSyncStats);

    return () => unsubscribe();
  }, [processQueue]);

  /**
   * Forçar sincronização manual
   */
  const syncNow = useCallback(async () => {
    await processQueue();
  }, [processQueue]);

  /**
   * Limpar fila
   */
  const clearQueue = useCallback(async (type = null) => {
    if (type === 'failed') {
      await SyncQueueService.clearQueue(item => item.status !== 'failed');
    } else if (type === 'success') {
      await SyncQueueService.clearQueue(item => item.status !== 'success');
    } else {
      await SyncQueueService.clearQueue();
    }

    const stats = await SyncQueueService.getQueueStats();
    setSyncStats(stats);
  }, []);

  return {
    syncStats,
    isProcessing,
    isSynced,
    syncNow,
    clearQueue,
    processQueue
  };
};
