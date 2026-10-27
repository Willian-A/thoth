# 0007. Monorepo pnpm e Biome

- Status: Aceito
- Data: 2026-10-26

## Contexto

Front e API compartilham tipos, schemas e constantes da sala. Queremos que estilo seja resolvido por ferramenta, não em revisão.

## Decisão

- Monorepo com pnpm workspaces: `apps/web`, `apps/api`, `packages/shared`.
- Biome para lint e formatação; dependency-cruiser para a regra de camadas da API.
- TypeScript 6 em modo estrito (o TypeScript 7 ainda não tem a API que o dependency-cruiser usa).

## Alternativas

- **Repositórios separados:** exigiriam publicar o pacote compartilhado.
- **ESLint + Prettier:** mais plugins, mas duas ferramentas e mais lentas.
- **Turborepo:** só se os builds ficarem lentos.

## Consequências

- Um `pnpm install` prepara tudo, inclusive o hook de pre-commit.
- Uma mudança em `packages/shared` é checada pelos dois lados no mesmo PR.
