# 0005. Uma tela por vez, com troca aprovada, imposta pela API

- Status: Aceito
- Data: 2026-10-26

## Contexto

Só uma pessoa compartilha por vez. Para passar a vez, quem está compartilhando precisa aprovar. Se não responder, nada muda.

## Decisão

- Tokens do LiveKit saem sem permissão de publicar. A API concede a permissão (só `screen_share` e `screen_share_audio`) pelo `updateParticipant` do LiveKit.
- A API guarda quem está compartilhando. Um pedido de troca vale 45 segundos; aprovado, a API tira a permissão de quem estava e dá para quem pediu.
- Quem criou a sala pode remover participantes; o IP removido fica bloqueado naquela sala.

## Alternativas

- **Várias telas simultâneas:** descartado pelo produto.
- **Controle só na interface:** um cliente modificado poderia publicar mesmo assim.

## Consequências

- Câmera e microfone ficam bloqueados no servidor, não só na interface.
- A API precisa autenticar cada pedido com o token do LiveKit da pessoa.
