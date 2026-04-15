## 📱 Offline-First Implementation

### 🎯 Visão Geral

A aplicação agora suporta **Offline-First Write Queue**, permitindo que usuários continuem criando e atualizando dados mesmo sem conexão com a internet. As operações são enfileiradas localmente e sincronizadas automaticamente quando a conexão voltar.

### 🏗️ Arquitetura

#### 1. **SyncQueueService** (`infrastructure/services/SyncQueueService.js`)
Serviço responsável por gerenciar a fila persistente usando AsyncStorage.

**Métodos principais:**
```javascript
// Enfileirar uma operação
await SyncQueueService.enqueueOperation({
  type: 'create',           // 'create', 'update', 'delete'
  module: 'clients',         // 'clients', 'appointments'
  endpoint: '/clients',      // Endpoint da API
  method: 'POST',            // HTTP method
  data: { ... }              // Dados da operação
});

// Obter estatísticas
const stats = await SyncQueueService.getQueueStats();
// → { total: 5, pending: 2, processing: 1, success: 1, failed: 1 }

// Processamento manual
await SyncQueueService.processQueue();

// Limpeza
await SyncQueueService.clearQueue();
```

#### 2. **SyncContext** (`context/SyncContext.js`)
Context React fornecendo o hook `useSyncQueue` para toda a aplicação.

**Estados disponíveis:**
```javascript
const { syncStats, isProcessing, isSynced } = useSyncQueue();

// syncStats: { total, pending, processing, success, failed, lastSyncTime }
// isProcessing: boolean - está sincronizando agora?
// isSynced: boolean - todas operações sincronizadas com sucesso?
```

#### 3. **AppSync Component** (`components/AppSync.js`)
Componente que exibe indicadores visuais de sincronização:
- 🔄 Animação enquanto sincronizando
- ⚠️ Aviso se houver falhas na sincronização

#### 4. **ClientRepository & AppointmentRepository**
Repositórios atualizados com suporte offline:
- Detectam falta de conexão via `NetInfo`
- Criam IDs temporários para operações offline
- Enfileiram em vez de fazer requisição HTTP
- Atualizam cache localmente com flag `syncPending: true`

### 🔄 Fluxo de Sincronização

```
┌─────────────────────────────────────────────────────────┐
│         OPERAÇÃO DE ESCRITA (create/update)            │
└────────────────────┬────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │ Verificar Conectividade │
        │   (NetInfo.fetch())     │
        └────────┬────────┬───────┘
                 │        │
         OFFLINE │        │ ONLINE
                 ▼        ▼
        ┌──────────────┐ ┌──────────────┐
        │   Offline    │ │    Online    │
        │   Workflow   │ │   Workflow   │
        └────────┬─────┘ └──────┬───────┘
                 │               │
         1. ID temp        1. Req HTTP
         2. Enfileirar     2. Retorna ID
         3. Cache local    3. Cache
         4. Retorna temp   4. Retorna obj
                 │               │
                 └───────┬───────┘
                        ▼
            ┌──────────────────────┐
            │  SyncQueue Monitoring│
            │  (NetInfo listener)  │
            └────────┬─────────────┘
                     │
        Online volta? ▼
            YES: processQueue()
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────────┐  ┌──────────────┐
    │ Retry pending   │  │ Mark success │
    │ operações 1-3x  │  │ Remove queue │
    │ com backoff     │  │ Update cache │
    └────────┬────────┘  └──────────────┘
             │
         Success? ▼
         YES: ✅ Sincronizado
         NO:  ⚠️ Alert (retry depois)
```

### 📝 Exemplo de Uso

**Criar cliente offline:**
```javascript
import { useSyncQueue } from '../../hooks';

export const ClientsViewModel = () => {
  const { syncStats, isSynced } = useSyncQueue();

  const createClient = async (input) => {
    // Usar repository normalmente - ele detecta offline automaticamente
    const result = await clientRepository.create(input);
    
    // Se offline:
    // - result.id = "temp_123456"
    // - result.offline = true
    // - result.syncPending = true
    
    // Se online:
    // - result.id = "real_id_from_server"
    
    return result;
  };

  return {
    createClient,
    syncStats,
    isSynced,
    isPending: syncStats.pending > 0
  };
};
```

**Usar em tela:**
```javascript
import { useSyncQueue } from '../../hooks';

export default function ClientsScreen() {
  const { syncStats, isProcessing } = useSyncQueue();

  return (
    <View>
      {isProcessing && (
        <Text>🔄 Sincronizando {syncStats.pending}/{syncStats.total}...</Text>
      )}
      
      {!isSynced && syncStats.failed > 0 && (
        <Text>⚠️ {syncStats.failed} operações falharam</Text>
      )}
    </View>
  );
}
```

### 🔒 Garantias de Dados

#### Retry Logic
- Até **3 tentativas** por operação
- **30 segundos timeout** por requisição
- Delay progressivo entre tentativas

#### Integridade
- Operações enfileiradas sequencialmente (não paralelas)
- Cache sincronizado logo após enfileiramento
- IDs temporários evitam conflitos

#### Persistência
- AsyncStorage: Fila persiste em reinicializações da app
- Mesmo que app feche, fila continua quando voltar online

### 📊 Monitoramento

**Ver fila atual:**
```javascript
import { SyncQueueService } from '../infrastructure/services';

const stats = await SyncQueueService.getQueueStats();
console.log(stats);
// { total: 5, pending: 2, processing: 0, success: 2, failed: 1 }
```

**Ver operações pendentes:**
```javascript
const pending = await SyncQueueService.getPendingOperations();
pending.forEach(op => {
  console.log(`${op.type} ${op.module} - tentativa ${op.retries}/${op.maxRetries}`);
});
```

**Limpar fila (com filtros):**
```javascript
// Limpar tudo
await SyncQueueService.clearQueue();

// Limpar fulhas completadas
await SyncQueueService.clearQueue(item => item.status !== 'success');

// Limpar falhas
await SyncQueueService.clearQueue(item => item.status !== 'failed');
```

### 🚀 Próximas Fases

#### Phase 3: Conflict Resolution
- Last-write-wins (padrão atual)
- Merge por campo (quando ambos modificam parts diferentes)
- User prompt para conflitos críticos

#### Phase 4: Offline Reads
- SQLite local paraquery complexas offline
- Sincronização bidirecional de dados

#### Phase 5: Compressão
- Batch operações similares (ex: 10 updates no mesmo cliente = 1 operação)
- Dedup automático (update 3x = armazena última versão)

### ⚠️ Limitações Conhecidas

1. **Não recomendado para:**
   - Delete massivo (>10 items por vez)
   - Updates concorrentes no mesmo record (sem merge logic)
   - Transações complexas (múltiplos records interdependentes)

2. **Comportamento esperado:**
   - ID temporário até sincronizar (pode aparecer em cache)
   - Atualizações de status (pending→completed) ocorrem async
   - Falhas silenciosas se servidor está down (retry automático)

3. **Edge cases:**
   - Se servidor rejeita operação após 3 tentativas: fica marcado `failed`, usuário deve ser notificado
   - Se conexão ping-pong (liga/desliga), retries podem ser lentos

### 📋 Checklist de Testes

- [ ] Criar cliente offline → nome aparece em cache
- [ ] Ir online → aparece notificação 🔄 sincronizando
- [ ] Verificar que cliente recebeu ID real do servidor
- [ ] Criar agendamento offline → enfileira com serviceType
- [ ] Atualizar status agendamento offline → cache atualiza
- [ ] Forçar falha (desligar backend) → marcado `failed`
- [ ] Backend volta → retoma sincronização
- [ ] Fechar app → fila persiste
- [ ] Abrir app offline → mostra cache da fila anterior
- [ ] Ir online → sincroniza tudo

### 🛠️ Debug

**Ativar logs:**
```javascript
// No console do Expo/React Native:
$ adb logcat | grep -i sync
$ xcrun simctl spawn booted log stream --predicate 'eventMessage contains "sync"'
```

**Forçar sync manual:**
```javascript
// No DevTools React
import { useSyncQueue } from 'hooks';
const { processQueue } = useSyncQueue();
await processQueue(); // ✅ Síncrono
```

**Limpar cache de debug:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('@sync_queue'); // Remove fila
await AsyncStorage.removeItem('clients_cache_v1'); // Remove cache
```

---

**Status:** ✅ Phase 2 Concluído
**Data:** 13/04/2026
**Próximo:** Phase 3 - Conflict Resolution
