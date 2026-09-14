# ADR-0002: Persistencia em memoria nesta entrega

- **Status**: Aceito (temporario — revisitar na proxima entrega)
- **Data**: 2026-09-14

## Contexto

O foco da Entrega 1 e ambiente, especificacao e harness de testes — nao a camada de
dados. Introduzir um banco de dados real agora aumentaria a complexidade de setup
(migrations, container de banco, seed de dados de teste) sem agregar valor a esta
entrega especifica.

## Decisao

Implementar `TicketRepository` com um `Map` em memoria, encapsulado atras da mesma
interface que uma implementacao futura com banco de dados (ex: Postgres + Prisma/Knex)
deveria expor: `create`, `findById`, `list`, `update`, `updateStatus`, `delete`.

## Consequencias

- Estado nao sobrevive a reinicio do processo — aceitavel para esta entrega, mas deve
  ser resolvido antes de uso em producao.
- Testes de integracao usam uma instancia nova de `TicketRepository` por teste
  (`beforeEach`), evitando vazamento de estado entre casos de teste.
- Trabalho futuro (proxima entrega): substituir por um adaptador Postgres, mantendo os
  testes de service/integracao praticamente inalterados (troca de dependencia, nao de
  contrato).
