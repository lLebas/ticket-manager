# Relatorio de Execucao do Test Harness

## Ambiente

- Node.js: v22.22.2
- npm: 10.9.7
- Framework de teste: Jest 29 + ts-jest + supertest (testes de integracao HTTP)
- Comando de execucao: `npm run test:coverage` (equivalente a `jest --runInBand --coverage`)

## Como reproduzir

```bash
npm install
npm run typecheck   # tipagem estatica, sem erros
npm run lint        # eslint, sem erros
npm run test:coverage
```

## Resultado da ultima execucao (evidencia completa em `docs/evidencias/test-report.txt`)

```
Test Suites: 3 passed, 3 total
Tests:       51 passed, 51 total
Snapshots:   0 total
Time:        2.7 s
```

### Cobertura de codigo

| Arquivo/pasta | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Total | 90.8% | 79% | 95.55% | 92.6% |
| `src/domain` | 100% | 100% | 100% | 100% |
| `src/errors` | 100% | 100% | 100% | 100% |
| `src/services` | 100% | 100% | 100% | 100% |
| `src/controllers` | 100% | 50%* | 100% | 100% |
| `src/repository` | 87.8% | 76.19% | 83.33% | 96.87% |
| `src/validation` | 85.04% | 77.96% | 100% | 85.41% |
| `src/middlewares` | 77.77% | 100% | 100% | 77.77% |

\* Ramo nao coberto: log de erro nao tratado (HTTP 500) no `errorHandler` — cenario de
falha interna inesperada, fora dos casos de borda definidos na especificacao (RF/RNF),
intencionalmente nao simulado neste harness.

Limiar configurado em `jest.config.js` (`coverageThreshold.global`): 80% statements/lines/
functions, 70% branches — **atingido** em todas as metricas globais.

## Cobertura de cenarios (rastreabilidade com `docs/SPEC.md`)

| Cenario | Requisito/Regra | Teste |
|---|---|---|
| Criacao com sucesso, defaults de status/priority | RF01, RF02 | `ticketService.test.ts`, `ticketRoutes.test.ts` |
| Validacao de `title` ausente/curto/longo | RN01 | `ticketValidation.test.ts`, `ticketRoutes.test.ts` |
| Validacao de `priority` invalida | RN01 | `ticketValidation.test.ts`, `ticketRoutes.test.ts` |
| Listagem com filtros (`priority`, `assignee`) e paginacao | RF03 | `ticketService.test.ts`, `ticketRoutes.test.ts` |
| Listagem vazia (edge case) | RF03 | `ticketService.test.ts`, `ticketRoutes.test.ts` |
| Consulta/atualizacao/remocao de id inexistente | RN03 | todos os arquivos de teste |
| Atualizacao parcial com corpo vazio (edge case) | RN04 | `ticketValidation.test.ts`, `ticketRoutes.test.ts` |
| Transicao de status valida (fluxo completo todo->done) | RF06, RN02 | `ticketService.test.ts` |
| Transicao invalida (pular etapa, ex: todo->done) | RN02 | `ticketService.test.ts`, `ticketRoutes.test.ts` |
| Reabertura de ticket `done` -> `todo` | RN02 | `ticketService.test.ts` |
| Transicao idempotente (mesmo status) | RN02 | `ticketService.test.ts` |
| Rota desconhecida (404 padronizado) | RNF01 | `ticketRoutes.test.ts` |
| Health check | RF08 | `ticketRoutes.test.ts` |

## Smoke test manual (build de producao)

Apos `npm run build`, o binario `dist/server.js` foi executado diretamente e validado
com `curl` contra `/health`, `POST /api/tickets` (sucesso e falha de validacao) e
`GET /api/tickets` — evidencia completa em `docs/evidencias/test-report.txt` (secao final).

## Divergencia encontrada durante a execucao

Um teste de integracao inicial (`PATCH /api/tickets/:id` com id inexistente) usava um
`title` de 1 caractere no corpo da requisicao, o que violava a regra RN01 (minimo de 3
caracteres) e fazia a API responder `400` antes mesmo de checar a existencia do
recurso — quebrando a expectativa do teste (`404`). A causa raiz foi isolada, o teste
foi corrigido para usar um `title` valido, e o ocorrido foi registrado em
`docs/SPEC.md` (secao 7, "Refinamento por feedback") como exemplo do ciclo
implementacao -> teste -> ajuste de especificacao/teste exigido pelo fluxo SDD.
