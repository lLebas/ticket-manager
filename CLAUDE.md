# Instrucoes de contexto para agentes de IA (Claude Code)

Este arquivo e lido por agentes de codigo (Claude Code, ou equivalente) ao trabalhar
neste repositorio. Ele define o fluxo SDD (Spec-Driven Development) adotado pelo grupo
e as convencoes de projeto.

## Fluxo obrigatorio (SDD)

1. **Especificacao primeiro**: qualquer funcionalidade nova ou alterada deve ser
   refletida em `docs/SPEC.md` (requisitos funcionais/nao-funcionais, regras de
   negocio, contrato de entrada/saida) antes ou junto da implementacao.
2. **Implementar em camadas**: seguir a arquitetura de `docs/adr/0001-arquitetura-em-camadas.md`
   — `controllers` -> `services` -> `repository` -> `domain`, com `validation` como
   camada transversal chamada pelos controllers.
3. **Testes derivados da spec**: todo requisito funcional e regra de negocio em
   `docs/SPEC.md` deve ter pelo menos um teste correspondente em `tests/unit` e/ou
   `tests/integration`. Cenarios de borda citados na spec (recurso inexistente,
   payload invalido, transicao de estado proibida, listas vazias) sao obrigatorios.
4. **Registrar divergencias**: se um teste revelar uma decisao nao prevista na spec
   (ou um comportamento da spec que nao faz sentido), atualizar `docs/SPEC.md` secao 7
   ("Refinamento por feedback") explicando o que mudou e por que — nao apenas corrigir
   o codigo silenciosamente.
5. **Antes de considerar uma tarefa concluida**: rodar `npm run typecheck`, `npm run
   lint` e `npm run test:coverage` — os tres devem passar sem erros.

## Convencoes do projeto

- TypeScript em modo `strict`; nao usar `any` sem justificativa em comentario.
- Erros de dominio devem estender `AppError` (`src/errors/AppError.ts`) e ser tratados
  pelo middleware central (`src/middlewares/errorHandler.ts`) — nunca `try/catch`
  silencioso em controllers.
- Nomes de arquivos e pastas em ingles; mensagens de erro e comentarios de negocio em
  portugues (publico-alvo: equipe e avaliadores da disciplina).
- Cobertura minima de testes: 80% statements/lines (ver `jest.config.js`,
  `coverageThreshold`). Uma mudanca que derrube a cobertura abaixo do limiar deve vir
  acompanhada de testes novos na mesma alteracao.

## Fluxo de Git esperado (ver README secao "Governanca")

- `main`: sempre implantavel; commits diretos sao proibidos.
- `develop`: integracao entre features antes de ir para `main`.
- `feature/<nome-curto>`: uma branch por item do backlog (`docs/BACKLOG.md`); PR para
  `develop` com pelo menos uma revisao aprovada antes do merge.

## O que NAO fazer sem atualizar a spec primeiro

- Adicionar/remover campos do modelo `Ticket`.
- Mudar a maquina de estados de `status` (RN02 em `docs/SPEC.md`).
- Adicionar autenticacao, banco de dados real ou endpoints novos sem antes registrar o
  requisito correspondente em `docs/SPEC.md`.
