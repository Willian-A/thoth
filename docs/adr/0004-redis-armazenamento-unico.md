# 0004. Redis como único armazenamento no MVP

- Status: Aceito
- Data: 2026-10-26

## Contexto

Salas são efêmeras: valem 2 horas antes da primeira entrada e 20 minutos depois dela. Não há contas de usuário nem histórico no MVP.

## Decisão

Guardar salas, pedidos de troca e bloqueios no Redis, com TTL. O BullMQ (sobre o mesmo Redis) agenda o encerramento das salas.

## Alternativas

- **Postgres:** útil para histórico e métricas, mas o MVP não precisa disso.

## Consequências

- Nada a migrar no começo; os dados expiram sozinhos.
- Se surgirem métricas ou contas, um banco relacional entra com um novo ADR.
