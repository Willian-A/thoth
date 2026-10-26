# 0003. Node.js + Fastify + TypeScript na API

- Status: Aceito
- Data: 2026-10-26

## Contexto

A API é pequena: cria salas, emite tokens do LiveKit, controla a vez de compartilhar e encerra salas no prazo. O frontend já é TypeScript.

## Decisão

Node.js 22 com Fastify e TypeScript, validação com Zod (via `fastify-type-provider-zod`), logs com Pino. Tipos e schemas ficam em `packages/shared` e são usados pelos dois lados. A API é organizada em camadas (rotas, serviços, portas, adaptadores) com regra de importação checada no CI.

## Alternativas

- **Python + FastAPI:** igualmente capaz e com SDK do LiveKit, mas sem compartilhar tipos com o front.
- **Go:** ótimo desempenho, mas a carga da API é baixa e o ganho não compensa uma segunda linguagem.

## Consequências

- Um único idioma no monorepo.
- O build empacota a API com esbuild, incluindo o código-fonte de `@thoth/shared`.
