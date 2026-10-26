# 0001. Vite + React SPA no frontend

- Status: Aceito
- Data: 2026-10-26

## Contexto

A aplicação é quase toda tempo real no navegador: conexão WebRTC, compartilhamento de tela, contador. Não há conteúdo que precise de SEO nem de renderização no servidor. A interface usa React, TypeScript, HeroUI e Tailwind.

## Decisão

Usar Vite + React + TypeScript + React Router como SPA, com TanStack Query para dados da API. Deploy como site estático em CDN.

## Alternativas

- **Next.js:** API routes junto do front e bom SEO, mas WebRTC só roda no cliente e o servidor não segura conexões longas em serverless.
- **React Router com SSR (antigo Remix):** mesmo problema; o ganho do SSR não se aplica à sala.

## Consequências

- Precisamos de uma API separada (que existiria de qualquer forma).
- Se surgir uma landing page com SEO, ela será um site separado.
