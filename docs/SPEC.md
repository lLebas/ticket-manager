# Especificacao Tecnica (SDD) — Ticket Manager API

## 1. Problema selecionado

Equipes pequenas de desenvolvimento e suporte frequentemente coordenam trabalho por
planilhas ou chats, o que dificulta rastrear responsavel, prioridade e status de cada
item. Este projeto entrega uma **API de gestao de tarefas/tickets** (`ticket-manager-api`):
um servico HTTP que permite criar, consultar, atualizar, transicionar de status e remover
tickets de trabalho, com regras de negocio explicitas sobre o ciclo de vida de um ticket.

O escopo desta Entrega 1 e a fundacao do projeto: ambiente reproduzivel, especificacao
formal, agente de IA configurado no fluxo SDD e um harness de testes automatizados
validando o comportamento descrito abaixo. Persistencia real, autenticacao e interface
grafica ficam fora do escopo desta entrega (ver `docs/adr/0002-persistencia-em-memoria.md`).

## 2. Requisitos funcionais (RF)

| ID | Requisito |
|----|-----------|
| RF01 | O sistema deve permitir criar um ticket com `title` obrigatorio e `description`, `priority`, `assignee`, `tags` opcionais. |
| RF02 | Todo ticket criado inicia com `status = todo` e `priority = medium` quando nao informada. |
| RF03 | O sistema deve permitir listar tickets com filtros por `status`, `priority` e `assignee`, com paginacao (`page`, `pageSize`). |
| RF04 | O sistema deve permitir consultar um ticket especifico por `id`. |
| RF05 | O sistema deve permitir atualizar campos parciais de um ticket (`title`, `description`, `priority`, `assignee`, `tags`) sem alterar o `status`. |
| RF06 | O sistema deve permitir transicionar o `status` de um ticket atraves de um endpoint dedicado, respeitando a maquina de estados definida em RN02. |
| RF07 | O sistema deve permitir remover um ticket. |
| RF08 | O sistema deve expor um endpoint de health-check (`GET /health`). |

## 3. Requisitos nao-funcionais (RNF)

| ID | Requisito |
|----|-----------|
| RNF01 | Respostas de erro devem seguir um formato padronizado: `{ error, message, details? }`. |
| RNF02 | Toda entrada deve ser validada antes de tocar a camada de dominio; erros de validacao retornam HTTP 400 com detalhes por campo. |
| RNF03 | O ambiente de desenvolvimento e execucao deve ser reproduzivel via Docker (`Dockerfile` + `docker-compose.yml`). |
| RNF04 | O projeto deve manter cobertura de testes automatizados >= 80% em statements/lines (verificado via `jest --coverage`, ver `jest.config.js`). |
| RNF05 | O codigo deve ser tipado estaticamente (TypeScript em modo `strict`) e passar em lint (`eslint`) sem erros. |
| RNF06 | A API nao deve manter estado entre processos nesta entrega (armazenamento em memoria) — ver ADR-0002. |

## 4. Regras de negocio (RN)

- **RN01 — Validacao de campos**: `title` deve ter entre 3 e 120 caracteres; `description` no maximo 2000 caracteres; `assignee` no maximo 80 caracteres; `tags` no maximo 10 itens de ate 30 caracteres cada; `priority` deve ser um de `low|medium|high|critical`.
- **RN02 — Maquina de estados de status**: transicoes permitidas sao
  `todo -> in_progress`, `in_progress -> in_review`, `in_progress -> todo`,
  `in_review -> done`, `in_review -> in_progress`, `done -> todo` (reabertura).
  Qualquer transicao fora dessa tabela (ex: `todo -> done` direto) e rejeitada com
  HTTP 409 e o corpo indicando `from`, `to` e as transicoes `allowed`. Uma transicao
  para o mesmo status atual e idempotente (HTTP 200, sem alteracao).
- **RN03 — Recurso inexistente**: qualquer operacao (`GET`, `PATCH`, `DELETE`) sobre um
  `id` que nao existe retorna HTTP 404 com `error = NotFoundError`.
- **RN04 — Atualizacao parcial nao pode ser vazia**: `PATCH /api/tickets/:id` com corpo
  `{}` retorna HTTP 400 (nada para atualizar).

## 5. Contrato de entrada/saida (API)

Base path: `/api`. Content-Type: `application/json`.

### `POST /api/tickets`
- **Entrada**: `{ title: string, description?: string|null, priority?: Priority, assignee?: string|null, tags?: string[] }`
- **Saida (201)**: `Ticket` completo (ver modelo abaixo).
- **Erros**: `400 ValidationError` (campos invalidos).

### `GET /api/tickets?status=&priority=&assignee=&page=&pageSize=`
- **Saida (200)**: `{ items: Ticket[], total: number, page: number, pageSize: number }`.

### `GET /api/tickets/:id`
- **Saida (200)**: `Ticket`. **Erros**: `404 NotFoundError`.

### `PATCH /api/tickets/:id`
- **Entrada**: subconjunto de `{ title, description, priority, assignee, tags }`, nao pode ser vazio.
- **Saida (200)**: `Ticket` atualizado. **Erros**: `400 ValidationError`, `404 NotFoundError`.

### `PATCH /api/tickets/:id/status`
- **Entrada**: `{ status: TicketStatus }`.
- **Saida (200)**: `Ticket` com novo status. **Erros**: `400 ValidationError` (status desconhecido), `404 NotFoundError`, `409 ConflictError` (transicao invalida).

### `DELETE /api/tickets/:id`
- **Saida (204)**: sem corpo. **Erros**: `404 NotFoundError`.

### `GET /health`
- **Saida (200)**: `{ status: "ok", timestamp: string }`.

### Modelo `Ticket`
```json
{
  "id": "uuid",
  "title": "string (3-120)",
  "description": "string | null (<=2000)",
  "status": "todo | in_progress | in_review | done",
  "priority": "low | medium | high | critical",
  "assignee": "string | null (<=80)",
  "tags": ["string (<=30 cada, ate 10 itens)"],
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### Formato de erro padrao
```json
{ "error": "ValidationError", "message": "falha de validacao", "details": { "title": "title e obrigatorio" } }
```

## 6. Decomposicao em unidades / componentes

| Componente | Responsabilidade | Testabilidade |
|---|---|---|
| `domain/ticket.ts` | Tipos, enums e tabela de transicoes de status | Testado indiretamente via service/validation |
| `validation/ticketValidation.ts` | Validacao de payloads de entrada (RN01, RNF02) | Testes unitarios dedicados |
| `repository/ticketRepository.ts` | Armazenamento em memoria, filtragem, paginacao | Testado via service e integracao |
| `services/ticketService.ts` | Regras de negocio (RN02, RN03) orquestrando o repositorio | Testes unitarios dedicados, sem HTTP |
| `controllers/ticketController.ts` | Adaptacao HTTP <-> service | Testado via testes de integracao (supertest) |
| `middlewares/errorHandler.ts` | Padronizacao de respostas de erro (RNF01) | Testado via integracao (respostas 400/404/409) |
| `app.ts` / `server.ts` | Composicao da aplicacao Express e bootstrap do processo | `app.ts` testado via integracao; `server.ts` excluido da cobertura (bootstrap puro) |

Essa separacao em camadas permite substituir o repositorio em memoria por um adaptador
de banco de dados real sem alterar `services` ou `controllers` (ver ADR-0002).

## 7. Refinamento por feedback (registro de alteracoes)

| Data | Alteracao | Motivo |
|---|---|---|
| 2026-09-14 | `PATCH /api/tickets/:id` retornava 400 em um teste que usava `title` invalido (`"X"`, 1 caractere) ao testar 404 em ticket inexistente. Corrigido o **teste** (nao a API) para usar um `title` valido, isolando o cenario de "recurso nao encontrado" do cenario de "validacao de entrada". | Execucao do harness de testes revelou ambiguidade entre RN01 (validacao) e RN03 (recurso inexistente); a ordem de validacao (payload antes de existencia) foi mantida por ser a pratica REST recomendada, e o teste foi ajustado para exercitar exclusivamente o cenario pretendido. |
| 2026-09-14 | Adicionada regra de idempotencia em RN02 (transicionar para o mesmo status atual retorna 200 sem erro) | Evita que clientes tenham que tratar um caso de erro para uma chamada logicamente no-op. |

## 8. Fora de escopo (Entrega 1)

- Persistencia em banco de dados real (ver ADR-0002).
- Autenticacao/autorizacao de usuarios.
- Interface grafica (frontend).
- Notificacoes/eventos assincronos.
