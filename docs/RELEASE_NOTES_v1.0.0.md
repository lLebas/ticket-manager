# Ticket Manager API — v1.0.0

Primeira versao estavel (entrega final). API REST de gestao de tickets em Node.js 20 +
TypeScript + Express, desenvolvida com fluxo Spec-Driven Development (SDD).

## Funcionalidades

- CRUD de tickets: `POST/GET/PATCH/DELETE /api/tickets` e `GET /api/tickets/:id`.
- Maquina de estados de status (`PATCH /api/tickets/:id/status`):
  `todo -> in_progress -> in_review -> done`, com retornos e reabertura; transicoes
  invalidas retornam 409 com `from`, `to` e `allowed`; mesmo status e idempotente.
- Listagem com filtros (`status`, `priority`, `assignee`) e paginacao (`page`, `pageSize`).
- Validacao de entrada com erros por campo (400) e formato de erro padronizado.
- Health-check em `GET /health`.

## Mudancas desde a Entrega 1

### Correcoes
- JSON malformado no corpo agora retorna `400 ValidationError` em vez de `500` (RNF02).

### Infraestrutura
- Dockerfile multi-stage (`deps`, `test`, `build`, `runtime`) com usuario nao-root e `HEALTHCHECK`.
- `docker compose up` sobe a API; `docker compose run --rm test` roda typecheck, lint e testes com cobertura em container.
- Novo job `docker` no GitHub Actions (build das imagens, testes em container e smoke test).
- Cobertura com relatorio HTML (`coverage/index.html`) e resumo no terminal.
- Protecao da branch `main` (PR + CI obrigatorios).

### Higienizacao
- Removido codigo morto (`TicketRepository.clear()` e singleton nao usado).
- `.gitignore` e `.dockerignore` ampliados; `.env.example` documentado.
- Nenhuma credencial encontrada no codigo ou no historico.

### Documentacao
- README reescrito (problema/solucao, stack, configuracao, Docker, testes, estrutura, integrantes).
- Novo `docs/SDD-as-built.md` com arquitetura (Mermaid), contratos de API, modelo de dados, decisoes e divergencias.
- Evidencias de teste em `docs/evidencias/`.

## Qualidade

- 52 testes (unitarios + integracao), 100% aprovados.
- Cobertura: 91.2% statements | 79.2% branches | 97.72% functions | 93.04% lines.

## Limitacoes conhecidas

- Persistencia em memoria (estado perdido ao reiniciar) — ver ADR-0002.
- Sem autenticacao.
- Filtros invalidos na query de listagem nao sao validados (retornam lista vazia).

## Historico de commits

- chore: estrutura inicial do projeto (Entrega 1 - ambiente, especificacao e test harness) (`4247ead`)
- chore: higienizacao para release (codigo morto, gitignore, env.example, versao 1.0.0) (`0af25b3`)
- fix: JSON malformado retorna 400 ValidationError em vez de 500 (RNF02) (`b0dc1ca`)
- test: relatorio de cobertura HTML + resumo e evidencias em docs/evidencias (`9ec6094`)
- build: Dockerfile multi-stage, servico de testes no compose e job docker no CI (`6c8dd25`)
- docs: README da entrega final e SDD as-built (`b6be19c`)
- docs: notas da release v1.0.0
