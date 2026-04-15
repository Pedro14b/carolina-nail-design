import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueueService } from '../infrastructure/services/SyncQueueService';
import apiClient from '../services/api';

const SyncQueueContext = createContext();

/**
 * SyncProvider - Context para gerenciar a fila de sincronização globalmente
 * 
 * Fornece estado e métodos para sincronização offline-first em toda a app
 */

export const SyncProvider = ({ children }) => {
  const [syncStats, setSyncStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0,
    lastSyncTime: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  /**
   * Processar uma operação individual
   */
  const processOperation = useCallback(async (operation) => {
    try {
      await SyncQueueService.markAsProcessing(operation.id);

      console.log(`[sync] Processando: ${operation.type} ${operation.module}`);

      // Executar a operação com timeout
      const response = await Promise.race([
        apiClient({
          method: operation.method,
          url: operation.endpoint,
          data: operation.data,
          headers: {
            'X-Offline-Operation': 'true'
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 30000)
        )
      ]);

      await SyncQueueService.markAsSuccess(operation.id, response.data);
      console.log(`[sync] Sincronizado: ${operation.id}`);
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
        setIsSynced(true);
        setSyncStats((prev) => ({ ...prev, lastSyncTime: new Date().toISOString() }));
        console.log('[sync] Nenhuma operação pendente');
        return;
      }

      setIsProcessing(true);
      console.log(`[sync] Sincronizando ${pending.length} operações...`);

      let successCount = 0;
      let failCount = 0;

      // Processar operações sequencialmente
      for (const operation of pending) {
        const success = await processOperation(operation);
        if (success) {
          successCount++;
          // Remover após sucesso
          setTimeout(() => SyncQueueService.removeOperation(operation.id), 1000);
        } else {
          failCount++;
        }

        // Pequeno delay entre operações
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      console.log(`[sync] Sincronização concluída: ${successCount} sucesso(s) | ${failCount} falha(s)`);

      setIsSynced(failCount === 0);
      setSyncStats((prev) => ({
        ...prev,
        lastSyncTime: new Date().toISOString()
      }));

      // Atualizar estatísticas
      const stats = await SyncQueueService.getQueueStats();
      setSyncStats((prev) => ({
        ...prev,
        ...stats
      }));
    } catch (error) {
      console.error('[sync] Erro ao processar fila:', error);
      setIsSynced(false);
    } finally {
      setIsProcessing(false);
    }
  }, [processOperation]);

  /**
   * Inicializar monitoramento de conectividade
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isConnected = state.isConnected && state.isInternetReachable;

      if (isConnected) {
        console.log('[sync] Conexão restaurada.');
        await processQueue();
      } else {
        console.log('[sync] Sem conexão. Modo offline ativado.');
        setIsSynced(false);
      }
    });

    // Carregar stats iniciais
    SyncQueueService.getQueueStats().then((stats) => {
      setSyncStats((prev) => ({
        ...prev,
        ...stats
      }));
    });

    return () => unsubscribe();
  }, [processQueue]);

  const value = {
    syncStats,
    isProcessing,
    isSynced,
    processQueue,
    SyncQueueService
  };

  return (
    <SyncQueueContext.Provider value={value}>
      {children}
    </SyncQueueContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de sincronização
 */
export const useSyncQueue = () => {
  const context = useContext(SyncQueueContext);

  if (!context) {
    throw new Error('useSyncQueue deve ser usado dentro de SyncProvider');
  }

  return context;
};
