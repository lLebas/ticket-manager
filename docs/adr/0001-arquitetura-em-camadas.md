# ADR-0001: Arquitetura em camadas (controller/service/repository)

- **Status**: Aceito
- **Data**: 2026-09-14

## Contexto

Precisamos de uma estrutura que permita (a) testar regras de negocio sem subir um
servidor HTTP, (b) testar o contrato HTTP isoladamente, e (c) trocar a forma de
persistencia no futuro sem reescrever a logica de negocio.

## Decisao

Adotar separacao em quatro camadas dentro de `src/`:
`controllers` (adaptacao HTTP) -> `services` (regras de negocio) -> `repository`
(acesso a dados) -> `domain` (tipos e constantes compartilhadas), com `validation`
como camada transversal usada pelos controllers antes de chamar os services.

## Consequencias

- Testes unitarios de `TicketService` nao dependem de Express nem HTTP.
- Testes de integracao (`supertest`) validam o contrato HTTP fim a fim.
- Trocar `TicketRepository` por uma implementacao com banco de dados exige apenas
  implementar a mesma interface publica, sem tocar `services` ou `controllers`.
