# Fase 2 - Plano de Sprint (4 semanas)

## Objetivo
Aumentar retorno de clientes e produtividade com foco em:
- Confirmacao automatica de presenca
- Lista de espera com encaixe
- Fidelizacao e retencao
- Controles de performance operacional

## Prioridade de Entrega
1. Confirmacao automatica de presenca
2. Lista de espera e encaixe automatico
3. Pacotes e fidelidade
4. Comissoes e metas
5. Perfil avancado (sessoes ativas e logout remoto)

## Sprint 1 (Semanas 1 e 2)

### Item 1 - Confirmacao automatica de presenca (MVP)
Status: Planejado

Escopo MVP:
- Criar estado de confirmacao no agendamento:
  - `confirmationStatus`: `pending | confirmed | declined | no_response`
  - `confirmationChannel`: `internal | whatsapp | sms`
  - `confirmationRequestedAt`, `confirmationRespondedAt`
- Endpoint para disparo de solicitacao de confirmacao.
- Endpoint para resposta de confirmacao (sim/nao).
- Job para enviar solicitacoes automaticamente para atendimentos do dia seguinte.
- Painel no dashboard com:
  - aguardando confirmacao
  - confirmados
  - recusados/sem resposta

Criterios de aceite:
- Dado um agendamento futuro, quando o job roda, entao o status de confirmacao vira `pending`.
- Dada uma resposta de cliente, quando confirmada, entao status vira `confirmed`.
- Dada uma resposta negativa, quando recusada, entao status vira `declined`.
- O dashboard mostra contadores corretos por status.

Arquivos alvo (estimados):
- `backend/src/models/Appointment.js`
- `backend/src/controllers/appointmentController.js`
- `backend/src/routes/appointmentRoutes.js`
- `backend/src/services/` (novo servico de confirmacao)
- `frontend/src/screens/DashboardScreen.js`
- `frontend/src/screens/AppointmentDetailsScreen.js`

### Item 2 - Lista de espera + encaixe automatico (MVP)
Status: Planejado

Escopo MVP:
- Criar entidade de lista de espera com prioridade e janela de horario.
- Ao cancelar agendamento, buscar cliente elegivel e sugerir encaixe.
- Registro de tentativas de encaixe (auditavel).

Criterios de aceite:
- Ao cancelar um horario, o sistema gera sugestao de proxima cliente elegivel.
- A sugestao aparece no app e pode ser aceita/ignorada.

Arquivos alvo (estimados):
- `backend/src/models/` (novo modelo `WaitlistEntry`)
- `backend/src/controllers/appointmentController.js`
- `backend/src/controllers/clientController.js`
- `frontend/src/screens/AppointmentsScreen.js`
- `frontend/src/screens/ClientsScreen.js`

## Sprint 2 (Semanas 3 e 4)

### Item 3 - Pacotes e fidelidade (MVP)
Status: Planejado

Escopo MVP:
- Pacote de sessoes por cliente.
- Saldo de sessoes e uso por atendimento.
- Cupom simples de retorno.

Criterios de aceite:
- Cliente com pacote ativo consome sessao ao concluir atendimento.
- Saldo e historico de consumo visiveis.

### Item 4 - Comissoes e metas (MVP)
Status: Planejado

Escopo MVP:
- Percentual de comissao por profissional/servico.
- Meta mensal por profissional.
- Relatorio simples de atingimento.

Criterios de aceite:
- Fechamento mensal mostra valor de comissao por profissional.
- Painel mostra progresso de meta mensal.

### Item 5 - Perfil avancado (hardening)
Status: Planejado

Escopo MVP:
- Sessao ativa por dispositivo.
- Revogacao remota de sessoes.
- Log de eventos de seguranca no perfil.

Criterios de aceite:
- Usuario consegue listar sessoes ativas.
- Usuario consegue encerrar sessao especifica.

## Dependencias tecnicas
- Canal de envio:
  - Inicial: `internal`
  - Opcional: `sms` com Twilio (ja parcialmente preparado no recovery)
  - Futuro: WhatsApp API
- Job scheduler:
  - Pode reutilizar `node-schedule` ja usado no backup.

## Riscos e mitigacao
- Risco: canal externo (SMS/WhatsApp) indisponivel.
  - Mitigacao: fallback para notificacao interna.
- Risco: overfetch e latencia no dashboard.
  - Mitigacao: agregacoes simples no backend e limite por periodo.

## Medidas de sucesso
- Reducao de no-show (meta inicial: -20%).
- Aumento de taxa de confirmacao previa.
- Reducao de horarios vagos apos cancelamento.

## Ordem de implementacao recomendada (proxima acao)
1. Implementar Item 1 (MVP) end-to-end.
2. Validar em ambiente local com dados reais de agenda.
3. Implementar Item 2 (MVP) com sugestao manual assistida.
