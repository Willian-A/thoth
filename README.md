# Thoth

Compartilhamento de tela por link. Quem cria a sala recebe um link; quem entra informa um nome e pode assistir ou compartilhar a tela (uma pessoa por vez). Cada sala dura 20 minutos a partir da primeira entrada. Sem câmera, sem microfone, sem cadastro.

Documentos e tarefas ficam no projeto **Thoth** do Linear. Decisões de arquitetura ficam em [`docs/adr`](docs/adr).

## Estrutura

```text
apps/web         Vite + React + TypeScript + HeroUI + Tailwind
apps/api         Fastify + TypeScript
packages/shared  Schemas Zod, tipos, códigos de erro e constantes da sala
infra            docker-compose com Redis e LiveKit para desenvolvimento
docs/adr         Registro de decisões de arquitetura
```

## Requisitos

- Node.js 22 (veja `.nvmrc`)
- pnpm 10 (`corepack enable`)
- Docker, para Redis e LiveKit locais

## Como rodar

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose -f infra/docker-compose.yml up -d   # Redis e LiveKit
pnpm dev                                            # web em :5173, API em :3000
```

Em desenvolvimento, o front chama a API por `/api`, que o Vite repassa para `localhost:3000`.

Para testar uma sala: abra `http://localhost:5173`, clique em "Criar sala", entre com um nome e abra o mesmo link em outra janela anônima. As duas pessoas aparecem na lista de participantes.

## Scripts

| Comando          | O que faz                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm dev`       | Sobe web e API com recarga automática                                                             |
| `pnpm typecheck` | Checa os tipos de todos os pacotes                                                                |
| `pnpm lint`      | Biome (lint e formatação) e dependency-cruiser (regra de camadas)                                 |
| `pnpm format`    | Corrige formatação e imports                                                                      |
| `pnpm test`      | Testes unitários, de integração e de componentes (Vitest)                                         |
| `pnpm test:e2e`  | Testes ponta a ponta (Playwright); sobe API e web sozinho, mas precisa de Redis e LiveKit rodando |
| `pnpm build`     | Build de produção de web e API                                                                    |

Os testes de integração da API usam um Redis de verdade: suba o do docker compose antes de `pnpm test` (ou aponte `REDIS_URL` para outro).

Para usar um Chromium já instalado nos testes ponta a ponta, defina `PW_CHROMIUM_PATH`.

## Arquitetura da API

Camadas em `apps/api/src`, checadas pelo dependency-cruiser:

- `routes/`: HTTP; valida a entrada e chama um serviço.
- `services/`: regra de negócio; depende só de `ports/` e de `@thoth/shared`.
- `ports/`: interfaces (`Clock`, `RoomStore`, `MediaGateway`, `RandomSource`).
- `adapters/`: implementações das portas (Redis, LiveKit, relógio do sistema).
- `jobs/`: workers que chamam serviços.
- `app.ts`: monta a aplicação e injeta as dependências.
- `testing/`: versões em memória das portas, usadas só nos testes.

## Contribuindo

- Um PR por tarefa do Linear, com o identificador no título (ex.: `feat: criar sala (TOW-70)`).
- Títulos em Conventional Commits; merge por squash.
- O hook de pre-commit roda o Biome nos arquivos alterados (ativado pelo `pnpm install`).
