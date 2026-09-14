# Backlog / Decomposicao em tarefas (Sprint 1 — Entrega 1)

Este documento espelha o que deve ser cadastrado em **GitHub Issues** e organizado no
**GitHub Projects** (quadro Kanban: `Todo` / `In Progress` / `In Review` / `Done`). Cada
linha abaixo vira uma Issue independente, com o titulo sugerido e a label.

| # | Titulo da Issue | Label | Descricao resumida |
|---|---|---|---|
| 1 | `chore: estrutura inicial do repositorio e governanca de branches` | `chore` | Configurar `main`/`develop`, `.gitignore`, LICENSE, estrutura de pastas |
| 2 | `docs: especificacao tecnica (SDD) do dominio de tickets` | `docs` | Escrever `docs/SPEC.md` com RF/RNF/RN e contratos de entrada/saida |
| 3 | `docs: ADRs de arquitetura, persistencia e uso de agente de IA` | `docs` | `docs/adr/0001`, `0002`, `0003` |
| 4 | `feat: dominio e validacao de Ticket` | `feat` | `src/domain/ticket.ts`, `src/validation/ticketValidation.ts` + testes unitarios |
| 5 | `feat: repositorio em memoria de tickets` | `feat` | `src/repository/ticketRepository.ts` (create/list/update/delete/filter/paginacao) |
| 6 | `feat: regras de negocio e maquina de estados (TicketService)` | `feat` | `src/services/ticketService.ts`, transicoes de status, erros de dominio |
| 7 | `feat: API HTTP (controllers, rotas, error handler)` | `feat` | `src/controllers`, `src/middlewares/errorHandler.ts`, `src/app.ts`, `src/server.ts` |
| 8 | `test: harness de testes unitarios e de integracao` | `test` | `tests/unit/*`, `tests/integration/*`, meta de cobertura >= 80% |
| 9 | `chore: containerizacao (Dockerfile, docker-compose)` | `chore` | Build multi-stage, healthcheck, `.dockerignore` |
| 10 | `ci: pipeline de integracao continua` | `ci` | `.github/workflows/ci.yml` (lint + typecheck + testes + coverage) |
| 11 | `docs: README com visao geral, guia de instalacao e ADRs` | `docs` | `README.md` |
| 12 | `chore: contexto de agente de IA (CLAUDE.md) para fluxo SDD` | `chore` | `CLAUDE.md` |

## Sugestao de distribuicao entre a equipe

Dividir as issues acima entre os integrantes de forma que cada pessoa tenha ao menos
uma issue de implementacao (`feat`/`test`) e participe da revisao de PR de pelo menos
uma issue que nao seja sua. Registrar no GitHub Projects o responsavel (`assignee`) e o
status de cada issue, e vincular cada Pull Request a sua issue correspondente
(`Closes #<numero>`).

## Como transformar esta tabela em Issues reais

Com o repositorio ja criado no GitHub e o `gh` CLI autenticado, cada linha pode virar
uma issue com:

```bash
gh issue create --title "feat: dominio e validacao de Ticket" --label feat \
  --body "Ver docs/BACKLOG.md item 4 e docs/SPEC.md secoes 2-4."
```

Repita para cada linha da tabela (ajustando titulo, label e numero referenciado).
