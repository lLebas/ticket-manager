# Checklist de Submissao — Moodle (Entrega 1)

O Moodle exige **um unico PDF por integrante**, contendo os itens abaixo. Este arquivo
e um roteiro para montar esse PDF; ele mesmo nao deve ser o PDF enviado.

## Conteudo obrigatorio do PDF

1. **Link do repositorio GitHub** (publico, ou com acesso liberado aos professores).
   `> TODO: colar aqui apos publicar o repositorio (ver README, secao "Publicando este
   repositorio no GitHub").`

2. **Nomes completos e RAs de todos os integrantes da equipe.**
   `> TODO: preencher com os dados da equipe. Nao inclua esses dados em arquivos do
   repositorio publico — apenas no PDF de submissao.`

3. **Resumo do ambiente, agentes utilizados e comandos do harness** — pode ser
   copiado/adaptado do README:
   - Ambiente: Node.js 20+, TypeScript, Express, Jest/ts-jest/supertest, Docker.
   - Agente de IA: Claude Code, configurado via `CLAUDE.md` (fluxo SDD: spec ->
     implementacao -> testes -> refinamento da spec).
   - Comandos do harness:
     ```
     npm install
     npm run typecheck
     npm run lint
     npm run test:coverage
     ```

4. **Prints/logs do pipeline de testes rodando.**
   - Log completo ja disponivel em `docs/evidencias/test-report.txt` (pode ser colado como
     texto no PDF ou anexado como print de terminal).
   - Sugestao: apos publicar no GitHub, tambem incluir um print da execucao do
     workflow de CI (`.github/workflows/ci.yml`) na aba **Actions** do repositorio,
     mostrando o pipeline verde.

## Itens do enunciado e onde encontra-los neste repositorio

| Item do enunciado | Local |
|---|---|
| Estrutura de branches (main/develop/feature) | README, secao "Governanca do repositorio" |
| Divisao de tarefas (Issues/Projects) | `docs/BACKLOG.md` |
| PRs com revisao | `.github/PULL_REQUEST_TEMPLATE.md` + fluxo descrito no README |
| README com visao geral, instalacao e ADRs | `README.md` |
| Especificacao tecnica (SDD) | `docs/SPEC.md` |
| Decomposicao em unidades/componentes | `docs/SPEC.md`, secao 6 |
| Refinamento por feedback | `docs/SPEC.md`, secao 7 |
| Agente de IA configurado (contexto/regras) | `CLAUDE.md`, `docs/adr/0003-*.md` |
| Empacotamento do ambiente (Docker) | `Dockerfile`, `docker-compose.yml` |
| Harness de testes + suite inicial | `tests/unit/`, `tests/integration/` |
| Relatorio/logs de execucao dos testes | `docs/EXECUTION_REPORT.md`, `docs/evidencias/test-report.txt` |

## Passos restantes (fora do escopo do que pode ser gerado automaticamente)

- [ ] Publicar o repositorio no GitHub (comandos no README).
- [ ] Cadastrar as Issues de `docs/BACKLOG.md` e montar o quadro no GitHub Projects.
- [ ] Abrir ao menos um Pull Request real entre `feature/*` e `develop` com revisao de
      outro integrante, para evidenciar o processo de code review exigido.
- [ ] Preencher nomes e RAs da equipe no PDF final (nao neste arquivo).
- [ ] Gerar o PDF final e submeter no Moodle (um por integrante).
