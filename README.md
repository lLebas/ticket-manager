# Ticket Manager API

[![CI](https://github.com/lLebas/ticket-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/lLebas/ticket-manager/actions/workflows/ci.yml)

API HTTP para gestao de tarefas/tickets (criacao, consulta, atualizacao, transicao de
status e remocao), desenvolvida seguindo um fluxo de **Spec-Driven Development (SDD)**
com apoio de um agente de IA de codigo. Versao atual: **v1.0.0** (entrega final).

## Sumario

- [Problema e solucao](#problema-e-solucao)
- [Stack](#stack)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao de variaveis de ambiente](#configuracao-de-variaveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Como rodar com Docker](#como-rodar-com-docker)
- [Testes e cobertura](#testes-e-cobertura)
- [Endpoints](#endpoints)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisoes arquiteturais (ADRs)](#decisoes-arquiteturais-adrs)
- [Governanca do repositorio](#governanca-do-repositorio)
- [Agentes de IA utilizados](#agentes-de-ia-utilizados)
- [Documentacao complementar](#documentacao-complementar)
- [Integrantes](#integrantes)

## Problema e solucao

**Problema**: equipes pequenas de desenvolvimento e suporte costumam coordenar trabalho
por planilhas ou chats, o que dificulta rastrear responsavel, prioridade e status de
cada item, e permite que tarefas "pulem" etapas (ex: ir direto de "a fazer" para
"concluido" sem revisao).

**Solucao**: uma API REST (`ticket-manager-api`) que centraliza os tickets da equipe e
aplica regras de negocio explicitas:

- validacao de todos os campos de entrada, com erros detalhados por campo (HTTP 400);
- **maquina de estados** de status (`todo -> in_progress -> in_review -> done`, com
  retornos permitidos e reabertura), rejeitando transicoes invalidas com HTTP 409;
- listagem com filtros (`status`, `priority`, `assignee`) e paginacao;
- formato de erro padronizado `{ error, message, details? }` em todas as respostas.

Especificacao completa: [docs/SPEC.md](docs/SPEC.md). Arquitetura como implementada:
[docs/SDD-as-built.md](docs/SDD-as-built.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript 5 (modo `strict`) |
| HTTP | Express 4 |
| Persistencia | Repositorio em memoria (`Map`) — ver [ADR-0002](docs/adr/0002-persistencia-em-memoria.md) |
| Testes | Jest 29 + ts-jest (unitarios) e Supertest (integracao HTTP) |
| Qualidade | ESLint + `@typescript-eslint`, `tsc --noEmit` |
| Conteinerizacao | Docker (multi-stage) + Docker Compose |
| CI | GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) |

## Pre-requisitos

- **Execucao local**: Node.js >= 20 e npm >= 10.
- **Execucao em container**: Docker Engine 24+ com o plugin Docker Compose v2.24+
  (necessario para `env_file` opcional).
- Git (para clonar o repositorio).

## Configuracao de variaveis de ambiente

Copie o arquivo de exemplo e ajuste se necessario:

```bash
cp .env.example .env
```

| Variavel | Padrao | Descricao |
|---|---|---|
| `PORT` | `3000` | Porta HTTP em que a API escuta. |
| `NODE_ENV` | `development` | Ambiente de execucao (`development`, `production`, `test`). |

O `.env` e ignorado pelo Git; apenas o `.env.example` (sem valores sensiveis) e
versionado. A aplicacao nao exige segredos/credenciais.

## Como rodar localmente

```bash
npm ci
npm run build      # compila TypeScript -> dist/
npm start          # roda dist/server.js (porta 3000 por padrao)
```

Desenvolvimento com recarregamento automatico:

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

## Como rodar com Docker

Subir a aplicacao (build da imagem de producao + container com healthcheck):

```bash
docker compose up --build
```

A API fica disponivel em `http://localhost:3000` (ou na porta definida em `PORT` no `.env`).
Para parar: `docker compose down`.

Rodar typecheck, lint e a suite de testes com cobertura dentro de um container, com um
unico comando:

```bash
docker compose run --rm test
```

O relatorio de cobertura gerado no container e gravado em `./coverage/` no host
(volume montado).

> **Validacao**: os dois comandos acima sao validados automaticamente pelo job `docker`
> do GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), que executa
> `docker compose build`, `docker compose run --rm test` e um smoke test com
> `docker compose up` + `curl` nos endpoints. A validacao da release v1.0.0 foi feita via
> GitHub Actions (nao em maquina local).

## Testes e cobertura

```bash
npm run typecheck       # tipagem estatica (tsc --noEmit)
npm run lint            # eslint
npm test                # jest (unitarios + integracao)
npm run test:coverage   # jest com cobertura: resumo no terminal + HTML em coverage/index.html
```

- **Suites**: `tests/unit` (service e validacao, sem HTTP) e `tests/integration`
  (rotas HTTP com Supertest).
- **Limiar de cobertura** (`jest.config.js`): statements 80%, branches 70%,
  functions 80%, lines 80% — o comando falha se algum ficar abaixo.
- **Relatorio HTML**: abra `coverage/index.html` no navegador apos `npm run test:coverage`.

Resultado da release v1.0.0 (52 testes, 3 suites, 100% aprovados):

| Modulo | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| `services/ticketService.ts` | 100 | 100 | 100 | 100 |
| `domain/ticket.ts` | 100 | 100 | 100 | 100 |
| `errors/AppError.ts` | 100 | 100 | 100 | 100 |
| `controllers/ticketController.ts` | 100 | 50 | 100 | 100 |
| `repository/ticketRepository.ts` | 89.74 | 76.19 | 90.9 | 100 |
| `validation/ticketValidation.ts` | 85.04 | 77.96 | 100 | 85.41 |
| `middlewares/errorHandler.ts` | 81.81 | 100 | 100 | 81.81 |
| **Total** | **91.2** | **79.2** | **97.72** | **93.04** |

Evidencias completas: [docs/evidencias/test-report.txt](docs/evidencias/test-report.txt)
e [docs/evidencias/coverage-summary.txt](docs/evidencias/coverage-summary.txt).

## Endpoints

Base path `/api`, `Content-Type: application/json`. Contratos completos (request/response
e erros) em [docs/SDD-as-built.md](docs/SDD-as-built.md#4-apis--endpoints).

| Metodo | Rota | Descricao | Sucesso |
|---|---|---|---|
| `GET` | `/health` | Health-check | 200 |
| `POST` | `/api/tickets` | Cria ticket | 201 |
| `GET` | `/api/tickets` | Lista com filtros e paginacao | 200 |
| `GET` | `/api/tickets/:id` | Consulta por id | 200 |
| `PATCH` | `/api/tickets/:id` | Atualizacao parcial (exceto status) | 200 |
| `PATCH` | `/api/tickets/:id/status` | Transicao de status (maquina de estados) | 200 |
| `DELETE` | `/api/tickets/:id` | Remove ticket | 204 |

## Estrutura de pastas

```
src/
  domain/          tipos e regras de dominio (enums, maquina de estados)
  validation/      validacao de entrada (camada transversal)
  repository/      acesso a dados (em memoria)
  services/        regras de negocio
  controllers/     adaptacao HTTP <-> service
  errors/          hierarquia de erros de dominio (AppError)
  middlewares/     tratamento padronizado de erros e 404
  app.ts           composicao da aplicacao Express (injecao do repositorio)
  server.ts        bootstrap do processo HTTP
tests/
  unit/            testes de service e validacao (sem HTTP)
  integration/     testes de rota HTTP (supertest)
docs/
  SPEC.md              especificacao tecnica (SDD) + registro de refinamentos
  SDD-as-built.md      arquitetura e contratos como implementados na v1.0.0
  BACKLOG.md           decomposicao em tarefas
  EXECUTION_REPORT.md  relatorio de execucao do harness de testes
  RELEASE_NOTES_v1.0.0.md  notas da release
  evidencias/          saida dos testes e resumo de cobertura
  adr/                 registros de decisao arquitetural
.github/
  workflows/ci.yml     CI: typecheck, lint, testes, build e job docker
  PULL_REQUEST_TEMPLATE.md
  ISSUE_TEMPLATE/
Dockerfile             multi-stage: deps, test, build, runtime
docker-compose.yml     servicos api (up) e test (run --rm test)
.env.example           variaveis de ambiente documentadas
CLAUDE.md              contexto/regras para o agente de IA no fluxo SDD
```

## Decisoes arquiteturais (ADRs)

| ADR | Decisao |
|---|---|
| [0001](docs/adr/0001-arquitetura-em-camadas.md) | Arquitetura em camadas (controller -> service -> repository -> domain), permitindo testar regras de negocio sem HTTP e trocar a persistencia sem reescrever a logica de negocio. |
| [0002](docs/adr/0002-persistencia-em-memoria.md) | Persistencia em memoria; banco de dados real registrado como trabalho futuro. |
| [0003](docs/adr/0003-agente-claude-code-no-fluxo-sdd.md) | Uso do Claude Code como agente de codigo, com contexto em `CLAUDE.md` e fluxo SDD (spec antes/junto do codigo, testes derivados da spec, divergencias registradas como refinamento da spec). |

## Governanca do repositorio

- **Branches**: `main` (sempre implantavel, protegida: exige PR e CI verde),
  `develop` (integracao), `feature/<nome-curto>` (uma por item do backlog).
- **Fluxo de PR**: `feature/*` -> PR para `develop` -> PR `develop` -> `main`
  (ver [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)).
- **CI**: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda typecheck, lint,
  testes com cobertura, build e o job `docker` em cada push/PR para `main`/`develop`.
- **Releases**: tags anotadas semanticas (`v1.0.0`) com notas em `docs/RELEASE_NOTES_*.md`.

## Agentes de IA utilizados

- **Claude Code**, configurado via [`CLAUDE.md`](CLAUDE.md) na raiz do repositorio, que
  define o fluxo SDD adotado (spec -> implementacao -> testes -> refinamento da spec)
  e as convencoes de codigo do projeto. Ver [ADR-0003](docs/adr/0003-agente-claude-code-no-fluxo-sdd.md).

## Documentacao complementar

- [Especificacao tecnica (SDD)](docs/SPEC.md)
- [SDD As-Built (arquitetura real)](docs/SDD-as-built.md)
- [Backlog / decomposicao em tarefas](docs/BACKLOG.md)
- [Relatorio de execucao dos testes](docs/EXECUTION_REPORT.md)
- [Notas da release v1.0.0](docs/RELEASE_NOTES_v1.0.0.md)
- [Checklist de submissao](docs/SUBMISSION_CHECKLIST.md)

## Integrantes

| Nome | RA |
|---|---|
| <NOME COMPLETO 1> | <RA1> |
| <NOME COMPLETO 2> | <RA2> |

## Licenca

[MIT](LICENSE)
