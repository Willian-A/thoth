/** Textos da interface, centralizados para revisar o tom e, no futuro, traduzir. */
export const messages = {
  appName: "Thoth",
  home: {
    title: "Compartilhe sua tela em segundos",
    subtitle: "Crie uma sala, envie o link e mostre sua tela. Sem cadastro, sem câmera, sem microfone.",
    createRoom: "Criar sala",
    createRoomFailed: "Não foi possível criar a sala. Tente de novo em instantes.",
  },
  room: {
    loading: "Carregando sala…",
    loadFailed: "Não foi possível carregar a sala. Tente de novo em instantes.",
    notFoundTitle: "Sala não encontrada ou encerrada",
    notFoundDescription: "Confira o link ou peça um novo para quem criou a sala.",
    createNew: "Criar uma sala nova",
    joinTitle: "Entrar na sala",
    nameLabel: "Seu nome",
    namePlaceholder: "Como os outros vão te ver",
    nameInvalid: "Use de 1 a 30 caracteres, sem < nem >.",
    join: "Entrar",
    full: "A sala está cheia: o limite é de 8 pessoas.",
    joinFailed: "Não foi possível entrar. Tente de novo em instantes.",
    connecting: "Conectando…",
    participants: "Participantes",
    you: "você",
    host: "criador",
    leave: "Sair",
    disconnected: "A conexão com a sala caiu. Entre de novo para voltar.",
  },
  apiStatus: {
    checking: "Verificando servidor…",
    online: "Servidor online",
    offline: "Servidor indisponível",
  },
  notFound: {
    title: "Página não encontrada",
    backHome: "Voltar ao início",
  },
} as const;
