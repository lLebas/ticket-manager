# ADR-0003: Uso do Claude Code como agente no fluxo SDD

- **Status**: Aceito
- **Data**: 2026-09-14

## Contexto

A disciplina exige a configuracao e uso documentado de ao menos uma ferramenta de
geracao/auxilio de codigo dentro de um fluxo de Spec-Driven Development (SDD): a
especificacao (`docs/SPEC.md`) e escrita e refinada antes/junto da implementacao, e a
implementacao e validada por um harness de testes derivado da especificacao.

## Decisao

Usar o Claude Code como agente de geracao de codigo, com as regras de contexto do
projeto registradas em `CLAUDE.md` (na raiz do repositorio). O fluxo adotado foi:

1. Escrever/discutir a especificacao (`docs/SPEC.md`) com os requisitos, regras de
   negocio e contratos de entrada/saida.
2. Gerar a implementacao (`src/`) a partir da especificacao.
3. Gerar o harness de testes (`tests/`) cobrindo cenarios principais e casos de borda
   descritos na especificacao.
4. Rodar o harness; qualquer divergencia entre teste, especificacao e implementacao e
   registrada como refinamento na propria especificacao (ver `docs/SPEC.md`, secao 7).

## Consequencias

- Toda regra de negocio implementada tem rastreabilidade ate um item da especificacao
  (RF/RNF/RN).
- Divergencias encontradas durante a execucao dos testes viram entradas no log de
  refinamento da especificacao, nao apenas correcoes silenciosas de codigo.
- O arquivo `CLAUDE.md` deve ser mantido atualizado conforme o projeto evolui, para que
  qualquer membro da equipe (ou outro agente) opere com o mesmo contexto.
