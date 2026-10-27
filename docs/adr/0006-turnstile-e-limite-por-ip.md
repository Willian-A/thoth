# 0006. Cloudflare Turnstile e limite por IP contra abuso

- Status: Aceito
- Data: 2026-10-26

## Contexto

Salas são anônimas e abertas por link. Riscos: criação em massa, adivinhação de links, bots ocupando vagas. No Brasil muita gente divide o mesmo IP (CGNAT), então bloquear só por IP afeta usuários legítimos.

## Decisão

Proteção em camadas: limite por IP em todas as rotas (`@fastify/rate-limit` com Redis, IPv6 por `/64`), Turnstile em toda criação de sala e na entrada quando o IP passa do limite, teto global de salas ativas e uma chave de emergência para endurecer as regras sem deploy.

## Alternativas

- **hCaptcha:** alternativa se não quisermos depender da Cloudflare.
- **Só limite por IP:** barraria usuários atrás de CGNAT.

## Consequências

- O IP real vem do cabeçalho `CF-Connecting-IP`, então a API só deve aceitar tráfego vindo da Cloudflare.
- Registros de acesso precisam seguir o Marco Civil e a LGPD (a confirmar com um advogado).
