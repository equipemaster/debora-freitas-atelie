/**
 * Strings da interface — PT-BR.
 * Nenhuma string de UI deve ficar solta em componente: tudo passa por aqui.
 * Organizado por área. Chaves em inglês, valores em português.
 */
export const ptBR = {
  brand: {
    name: "Débora Freitas Ateliê",
    tagline: "Editor de vídeo do ateliê",
  },

  nav: {
    dashboard: "Painel",
    projects: "Projetos",
    clients: "Clientes",
    collections: "Coleções",
    templates: "Modelos",
    brandKit: "Marca",
    help: "Ajuda",
    signOut: "Sair",
  },

  common: {
    new: "Novo",
    open: "Abrir",
    save: "Salvar",
    saved: "Salvo",
    saving: "Salvando…",
    cancel: "Cancelar",
    delete: "Excluir",
    confirm: "Confirmar",
    back: "Voltar",
    next: "Avançar",
    finish: "Concluir",
    loading: "Carregando…",
    empty: "Nada por aqui ainda",
    search: "Buscar",
  },

  projectKind: {
    social: "Vídeo para redes sociais",
    client_presentation: "Apresentação para cliente",
    lookbook: "Catálogo / lookbook",
    making_of: "Portfólio / making-of",
  },

  projectStatus: {
    draft: "Rascunho",
    in_review: "Em revisão",
    approved: "Aprovado",
    exported: "Exportado",
  },

  dashboard: {
    title: "Painel",
    subtitle: "Seus projetos de vídeo, clientes e coleções em um só lugar.",
    recentProjects: "Projetos recentes",
    newProject: "Novo projeto",
    emptyProjects:
      "Você ainda não criou nenhum projeto. Comece um agora — o assistente conduz cada etapa.",
  },

  // Modo Assistido — edição semi-automática por perguntas
  guided: {
    modeLabel: "Modo assistido",
    advancedModeLabel: "Modo avançado",
    steps: {
      project: "Projeto",
      media: "Mídia",
      chooseTake: "Qual take?",
      chooseMusic: "Qual música?",
      brandAndText: "Marca e texto",
      autoAssembly: "Montagem",
      fineTune: "Ajuste fino",
      export: "Exportar",
    },
    hints: {
      project:
        "Escolha para que serve este vídeo. O formato (vertical, quadrado ou horizontal) já vem sugerido pelo tipo escolhido.",
      media:
        "Envie de uma vez todos os clipes e fotos da gravação. Agrupamos por cena automaticamente e identificamos quando há mais de um take da mesma cena.",
      chooseTake:
        "Para cada cena com mais de uma gravação, mostramos as opções lado a lado. Escolha o take que você quer usar — ou marque “usar os dois” quando se complementam.",
      chooseMusic:
        "Escolha uma trilha da biblioteca ou envie a sua, e diga o clima desejado. A fala tem prioridade de volume sobre a música.",
      brandAndText:
        "Cartelas de título, legendas e a ficha técnica da peça. A abertura e o encerramento da marca entram sozinhos.",
      autoAssembly:
        "Com as suas respostas, montamos o vídeo inteiro: ordem das cenas, cortes no tempo da música e a assinatura da marca. Veja o resultado pronto.",
      fineTune:
        "Quer mexer em algo? O vídeo abre no Modo Avançado, onde você troca qualquer corte, ordem ou take sem refazer o assistente.",
      export:
        "Defina a resolução e o formato. Você pode baixar o vídeo e/ou gerar um link de revisão para a cliente.",
    },
    take: {
      sceneLabel: "Cena",
      takeLabel: "Take",
      useThis: "Usar este",
      useBoth: "Usar os dois",
      preview: "Pré-visualizar",
      regroup: "Reagrupar cenas",
    },
  },

  editor: {
    timeline: "Linha do tempo",
    preview: "Prévia",
    inspector: "Ajustes",
    mediaBin: "Mídia",
    actions: {
      trim: "Aparar",
      split: "Dividir",
      reorder: "Reordenar",
      remove: "Remover",
      addText: "Adicionar texto",
      addMusic: "Adicionar música",
      applyBrandIntro: "Abertura da marca",
      applyBrandOutro: "Encerramento da marca",
      undo: "Desfazer",
      redo: "Refazer",
    },
  },

  review: {
    approve: "Aprovar",
    requestChanges: "Pedir ajustes",
    addComment: "Comentar",
    commentAtTime: "Comentar neste ponto do vídeo",
    loading: "Carregando revisão…",
    notFound: "Não encontramos esse link de revisão.",
    expired: "Este link de revisão expirou. Peça um novo link ao ateliê.",
    videoNotReady:
      "O vídeo ainda está sendo preparado pelo ateliê. Volte em alguns instantes.",
    yourName: "Seu nome",
    commentPlaceholder: "Escreva seu comentário…",
    commentsTitle: "Comentários",
    noComments: "Ainda não há comentários. Seja a primeira a comentar.",
    commentsDisabled: "Comentários desativados neste link.",
    send: "Enviar",
    sending: "Enviando…",
    noteOptional: "Observação (opcional)",
    decisionRecorded: "Recebemos sua resposta. Obrigado!",
    tryAgain: "Tentar novamente",
  },

  errors: {
    generic: "Algo deu errado. Tente novamente.",
    uploadFailed: "Não foi possível enviar o arquivo.",
    renderFailed: "A exportação falhou. Veja os detalhes e tente de novo.",
  },

  // Login sem senha (magic link) e bootstrap do primeiro acesso.
  auth: {
    title: "Entrar",
    subtitle: "Digite seu e-mail. Enviamos um link de acesso — sem senha para lembrar.",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@seuemail.com",
    sendLink: "Enviar link de acesso",
    sending: "Enviando…",
    checkEmailTitle: "Verifique seu e-mail",
    checkEmailBody: "Enviamos um link de acesso. Abra-o neste mesmo navegador para entrar.",
    invalidEmail: "Digite um e-mail válido.",
    linkInvalid:
      "Esse link não funcionou. Ele só é válido no mesmo navegador que pediu o acesso, uma única vez, e expira depois de um tempo. Peça um novo abaixo.",
    signOut: "Sair",
  },

  onboarding: {
    title: "Bem-vinda!",
    subtitle: "Só mais um passo antes de começar: como devemos te chamar?",
    nameLabel: "Seu nome",
    namePlaceholder: "Nome completo",
    continue: "Continuar",
    nudge: "Complete seu perfil",
    nudgeAction: "Adicionar meu nome",
  },
} as const;

export type Dictionary = typeof ptBR;
