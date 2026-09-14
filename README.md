# Ticket Manager API

API HTTP para gestao de tarefas/tickets (criacao, consulta, atualizacao, transicao de
status e remocao), desenvolvida como **Entrega 1** da disciplina — Ambiente,
Especificacao Tecnica e Test Harness, seguindo um fluxo de **Spec-Driven Development
(SDD)** com apoio de um agente de IA de codigo.

## Sumario

- [Visao geral](#visao-geral)
- [Agentes de IA utilizados](#agentes-de-ia-utilizados)
- [Guia de instalacao e execucao](#guia-de-instalacao-e-execucao)
- [Executando com Docker](#executando-com-docker)
- [Executando o test harness](#executando-o-test-harness)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Decisoes arquiteturais (ADRs)](#decisoes-arquiteturais-adrs)
- [Governanca do repositorio](#governanca-do-repositorio)
- [Documentacao complementar](#documentacao-complementar)

## Visao geral

- **Problema**: coordenar tarefas/tickets de uma equipe (status, prioridade,
  responsavel) atraves de uma API, com regras de negocio explicitas sobre o ciclo de
  vida de um ticket.
- **Stack**: Node.js 20+, TypeScript (modo `strict`), Express, armazenamento em
  memoria (ver [ADR-0002](docs/adr/0002-persistencia-em-memoria.md)).
- **Testes**: Jest + ts-jest (unitarios) e supertest (integracao HTTP), com meta de
  cobertura >= 80% (ver `jest.config.js` e [docs/EXECUTION_REPORT.md](docs/EXECUTION_REPORT.md)).
- **Especificacao completa**: [docs/SPEC.md](docs/SPEC.md).

## Agentes de IA utilizados

- **Claude Code**, configurado via [`CLAUDE.md`](CLAUDE.md) na raiz do repositorio, que
  define o fluxo SDD adotado (spec -> implementacao -> testes -> refinamento da spec)
  e as convencoes de codigo do projeto. Ver [ADR-0003](docs/adr/0003-agente-claude-code-no-fluxo-sdd.md)
  para o racional completo.

## Guia de instalacao e execucao

Pre-requisitos: Node.js >= 20 e npm.

```bash
npm install
npm run build      # compila TypeScript -> dist/
npm start           # roda dist/server.js (porta 3000 por padrao, ver .env.example)
```

Para desenvolvimento com recarregamento automatico:

```bash
npm run dev
```

Verificacao rapida com o servidor rodando:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/tickets -H 'Content-Type: application/json' \
  -d '{"title":"Minha primeira tarefa","priority":"high"}'
curl http://localhost:3000/api/tickets
```

## Executando com Docker

```bash
docker compose up --build
```

O servico sobe em `http://localhost:3000` com healthcheck configurado em
`docker-compose.yml`.

## Executando o test harness

```bash
npm install
npm run typecheck      # tipagem estatica
npm run lint            # eslint
npm run test:coverage   # jest --runInBand --coverage
```

Evidencia da ultima execucao bem-sucedida (51 testes, 3 suites, cobertura >= 80% nas
metricas configuradas): [docs/EXECUTION_REPORT.md](docs/EXECUTION_REPORT.md) e log
bruto em [docs/logs/test-run.log](docs/logs/test-run.log).

## Estrutura do projeto

```
src/
  domain/         tipos e regras de dominio (enums, maquina de estados)
  validation/      validacao de entrada (camada transversal)
  repository/      acesso a dados (em memoria nesta entrega)
  services/        regras de negocio
  controllers/     adaptacao HTTP
  middlewares/      tratamento padronizado de erros
  app.ts / server.ts
tests/
  unit/            testes de service e validacao (sem HTTP)
  integration/     testes de rota HTTP (supertest)
docs/
  SPEC.md          especificacao tecnica (SDD)
  BACKLOG.md       decomposicao em tarefas / espelho de Issues do GitHub Projects
  EXECUTION_REPORT.md  relatorio de execucao do harness de testes
  logs/test-run.log    log bruto da execucao dos testes
  adr/             registros de decisao arquitetural
.github/
  workflows/ci.yml         pipeline de CI (lint, typecheck, testes, build)
  PULL_REQUEST_TEMPLATE.md
  ISSUE_TEMPLATE/
CLAUDE.md          contexto/regras para o agente de IA no fluxo SDD
```

## Decisoes arquiteturais (ADRs)

Registro sintetico das decisoes tecnicas do projeto (documentos completos em
`docs/adr/`):

| ADR | Decisao |
|---|---|
| [0001](docs/adr/0001-arquitetura-em-camadas.md) | Arquitetura em camadas (controller -> service -> repository -> domain), permitindo testar regras de negocio sem HTTP e trocar a persistencia sem reescrever a logica de negocio. |
| [0002](docs/adr/0002-persistencia-em-memoria.md) | Persistencia em memoria nesta entrega (foco em spec e harness de testes); banco de dados real fica para a proxima entrega. |
| [0003](docs/adr/0003-agente-claude-code-no-fluxo-sdd.md) | Uso do Claude Code como agente de codigo, com contexto em `CLAUDE.md` e fluxo SDD (spec antes/junto do codigo, testes derivados da spec, divergencias registradas como refinamento da spec). |

## Governanca do repositorio

- **Branches**: `main` (sempre implantavel, commits diretos proibidos), `develop`
  (integracao), `feature/<nome-curto>` (uma por item do backlog).
- **Fluxo de PR**: toda `feature/*` abre PR para `develop` com pelo menos uma revisao
  aprovada antes do merge (ver [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md));
  `develop` e mesclada em `main` ao fim da sprint.
- **Issues/Projects**: a decomposicao de tarefas da sprint esta em
  [docs/BACKLOG.md](docs/BACKLOG.md), pronta para ser cadastrada como Issues no GitHub
  e organizada em um quadro no GitHub Projects.
- **CI**: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda typecheck, lint,
  testes com cobertura e build em cada push/PR para `main`/`develop`.

### Publicando este repositorio no GitHub

Este projeto foi montado localmente. Para publicar:

```bash
git init -b main            # caso ainda nao esteja inicializado
git add .
git commit -m "chore: estrutura inicial do projeto (Entrega 1)"
git branch develop
gh repo create <nome-do-repo> --public --source=. --remote=origin
git push -u origin main
git push -u origin develop
```

Depois, cadastre as issues de `docs/BACKLOG.md` (manualmente ou via `gh issue create`,
comandos sugeridos no proprio arquivo) e crie o quadro no GitHub Projects.

## Documentacao complementar

- [Especificacao tecnica completa (SDD)](docs/SPEC.md)
- [Backlog / decomposicao em tarefas](docs/BACKLOG.md)
- [Relatorio de execucao dos testes](docs/EXECUTION_REPORT.md)
- [Checklist de submissao (Moodle)](docs/SUBMISSION_CHECKLIST.md)
