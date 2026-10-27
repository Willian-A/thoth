# 0002. LiveKit auto-hospedado como SFU

- Status: Aceito
- Data: 2026-10-26

## Contexto

Salas têm até 8 pessoas e uma tela compartilhada por vez. Em malha P2P, quem compartilha envia uma cópia para cada espectador: com 7 espectadores a cerca de 2 Mbps, seriam uns 14 Mbps de upload. Estimativa de custo para 1.000 salas de 20 min por mês: LiveKit Cloud perto de US$ 165; VM própria na Hetzner € 20 a 45.

## Decisão

Usar um SFU, o LiveKit (código aberto), rodando numa VM própria. O LiveKit cuida da sinalização (WebSocket), do TURN embutido (inclusive TLS na porta 443) e do simulcast.

## Alternativas

- **Malha P2P:** mais barata, mas não aguenta 8 pessoas e exige sinalização própria.
- **LiveKit Cloud:** sem operação, mas custa várias vezes mais com o mesmo código.
- **mediasoup:** mesmo custo de infraestrutura, mas 3 a 5 semanas a mais de desenvolvimento (salas, sinalização, TURN, reconexão).

## Consequências

- Precisamos operar uma VM com portas UDP abertas, domínio e certificado.
- Em desenvolvimento, o LiveKit roda em modo local via Docker.
- Migrar para o LiveKit Cloud continua possível sem mudar o código.
