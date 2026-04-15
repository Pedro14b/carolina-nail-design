import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSyncQueue } from '../hooks';

/**
 * AppSync - Componente wrapper que gerencia a fila de sincronização offline
 * 
 * Inicializa o hook useSyncQueue que:
 * - Monitora conectividade
 * - Processa a fila quando online
 * - Mostra indicador visual de sincronização
 */

export default function AppSync({ children }) {
  const { syncStats, isProcessing, isSynced } = useSyncQueue();

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* Indicador de sincronização */}
      {isProcessing && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: '#FFF',
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            elevation: 3
          }}
        >
          <ActivityIndicator size="small" color="#FF69B4" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 14, color: '#333', flex: 1 }}>
            Sincronizando {syncStats.pending}/{syncStats.total} operações...
          </Text>
        </View>
      )}

      {/* Notificação de pendências */}
      {!isProcessing && !isSynced && syncStats.total > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: '#FFF3CD',
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            elevation: 3
          }}
        >
          <Text style={{ fontSize: 14, color: '#856404', flex: 1 }}>
            {syncStats.failed} operações falharam. Tentará novamente.
          </Text>
        </View>
      )}
    </View>
  );
}
