/* ============================================================================
 * ASSOCIAÇÃO 641 — CONTEÚDO DO SITE
 * ----------------------------------------------------------------------------
 * Este ficheiro é a fonte única de conteúdo do site.
 * Para atualizar textos, eventos, banda residente, parceiros ou
 * contactos, edita este ficheiro e faz commit para o GitHub.
 * Notícias: pastas em src/content/news/<slug>/ (pt.md, en.md, cover.*).
 *
 * Estrutura: cada bloco tem versão em português (pt) e inglês (en).
 * ============================================================================ */

export type Locale = "pt" | "en";

export type Partner = {
  name: string;
  logo?: string; // chave do logo em partners-logos (opcional)
  href?: string;
  note?: { pt: string; en: string };
};

export const site = {
  // ---------- NAVEGAÇÃO ----------
  nav: {
    sobre: { pt: "sobre", en: "about" },
    ajudar: { pt: "quero ajudar", en: "support us" },
    banda: { pt: "Bandas", en: "Bands" },
    parceiros: { pt: "parceiros", en: "partners" },
    contactos: { pt: "contactos", en: "contact" },
    noticias: { pt: "notícias", en: "news" },
  },

  // ---------- HERO ----------
  hero: {
    tagline: {
      pt: "OEIRAS · PORTUGAL · DESDE 2025",
      en: "OEIRAS · PORTUGAL · SINCE 2025",
    },
    title: {
      pt: "ASSOCIAÇÃO",
      en: "ASSOCIATION",
    },
    subtitle: {
      pt: "Um ecossistema musical em Oeiras. Salas de ensaio colaborativas, apoio a novas bandas e o barulho que vem a seguir.",
      en: "A music ecosystem in Oeiras. Collaborative rehearsal rooms, support for new bands, and the noise that comes next.",
    },
    ctaPrimary: { pt: "RESERVAR SALA", en: "BOOK A ROOM" },
    ctaSecondary: { pt: "QUERO AJUDAR", en: "SUPPORT US" },
  },

  // ---------- SOBRE ----------
  sobre: {
    kicker: { pt: "sobre", en: "about" },
    body: {
      pt: [
        "Ensaiar na rua é divertido. Excepto claro, quando nos mandam calar.",
        "Foi assim que começámos. Tínhamos tudo para o sucesso: sonhos, um nome, instrumentos. Só que depois percebemos que nos faltava o mais importante: **um espaço para ensaiar**.",
        "Não faltam lugares para bandas ensaiarem em **Oeiras**, um dos municípios mais desenvolvidos de Portugal. O problema? Custam dinheiro, e não é propriamente pouco. Para miúdos a experimentar sons pela primeira vez, isso não era viável. E ninguém tinha garagens, um luxo em ambientes urbanos como este. Assim, a rua teve de servir: mixer DIY, um baixo ligado à JBL, vizinhos a espreitar às janelas.",
        "Agora mais graúdos, com mãos amigas a ajudar, criámos a **641**, para que nunca se chegue a perder música em Oeiras só porque não há um cantinho para a explorar.",
      ],
      en: [
        "Rehearsing on the street is fun. Except, of course, when people tell you to shut up.",
        "That's how we started. We had everything we needed for success: dreams, a name, instruments. Then we realised we were missing the most important thing: **a place to rehearse**.",
        "There is no shortage of rehearsal spaces in **Oeiras**, one of Portugal's most developed municipalities. The problem? They cost money, and not exactly a little. For kids trying out sounds for the first time, that wasn't viable. And nobody had a garage — a luxury in an urban setting like this. So the street had to do: a DIY mixer, a bass plugged into a JBL, neighbours peeking out of windows.",
        "Now a bit older, and with friendly hands helping out, we created **641**, so that music in Oeiras is never lost just because there's no little corner to explore it in.",
      ],
    },
    highlight: {
      pt: "Queres saber mais? Fala connosco, vem visitar-nos ou torna-te sócio.",
      en: "Want to know more? Get in touch, come visit us or become a member.",
    },
    origem: {
      p1: {
        pt: "Não faltam lugares para bandas ensaiarem em Oeiras, um dos municípios mais desenvolvidos de Portugal.",
        en: "There's no shortage of places for bands to rehearse in Oeiras, one of Portugal's most developed municipalities.",
      },
      p2: {
        pt: "O problema? Custam dinheiro, e não é propriamente pouco. Para miúdos a experimentar sons pela primeira vez, isso não era viável. E ninguém tinha garagens, um luxo em ambientes urbanos como este. Assim, a rua teve de servir:",
        en: "The problem? They cost money, and not exactly a little. For kids trying out sounds for the first time, that wasn't viable. And nobody had a garage — a luxury in an urban setting like this. So the street had to do:",
      },
      lineMixer: { pt: "mixer DIY,", en: "DIY mixer," },
      lineSetup: { pt: "um baixo ligado à JBL,", en: "a bass plugged into a JBL," },
      lineVizinhos: {
        pt: "vizinhos a espreitar às janelas.",
        en: "neighbours peeking out of windows.",
      },
      p3: {
        pt: "Agora mais graúdos, com mãos amigas a ajudar, criámos a 641, para que nunca se chegue a perder música em Oeiras só porque não há um cantinho para a explorar.",
        en: "Now a bit older, and with friendly hands helping out, we created 641, so that music in Oeiras is never lost just because there's no little corner to explore it in.",
      },
      more: { pt: "Queres saber mais?", en: "Want to know more?" },
      continue: { pt: "continuar a ler", en: "keep reading" },
      visit: { pt: "vem visitar-nos", en: "come visit us" },
      join: { pt: "Faz-te sócix", en: "Become a member" },
    },
    est: { pt: "FUNDADA EM 2025", en: "EST. 2025" },
    /**
     * Link para o regulamento interno (PDF, Drive, Google Doc, etc).
     * Substitui "#" pelo URL final.
     */
    regulamentoUrl:
      "https://drive.google.com/drive/folders/10yfI08c7mFxI_TyOwl-N3wMLpevA6XnH?usp=sharing",
    regulamentoLabel: {
      pt: "REGULAMENTO INTERNO",
      en: "INTERNAL RULES",
    },
  },

  // ---------- O QUÊ? ----------
  oQue: {
    title: { pt: "O quê?", en: "What?" },
    items: [
      {
        key: "studio",
        title: { pt: "SALAS DE ENSAIO", en: "REHEARSAL ROOMS" },
        hover: {
          pt: "equipadas e a preços acessíveis",
          en: "equipped and affordable",
        },
      },
      {
        key: "starting",
        title: { pt: "APOIAR", en: "SUPPORT" },
        hover: { pt: "novos talentos", en: "new talent" },
      },
      {
        key: "recording",
        title: { pt: "SUPORTE", en: "GUIDANCE" },
        hover: {
          pt: "técnico e artístico até à 1ª demo lançada",
          en: "technical and artistic support through the first demo",
        },
      },
      {
        key: "community",
        title: { pt: "COMUNIDADE", en: "COMMUNITY" },
        hover: {
          pt: "capacitação, workshops, fomento criação artística feminina e inclusiva",
          en: "training, workshops, fostering inclusive and female-led artistic creation",
        },
      },
    ],
  },

  // ---------- QUERO AJUDAR ----------
  ajudar: {
    kicker: { pt: "quero ajudar", en: "support us" },
    intro: {
      pt: "Também estamos a aceitar doações via **MBWay**. Qualquer ajuda conta.",
      en: "We're also accepting donations via **MBWay**. Any help counts.",
    },
    mbwayNumber: "910 075 383",
    reasons: [
      {
        title: { pt: "Apoiar novos talentos", en: "Support new talent" },
        body: {
          pt: "Damos palco a quem está a começar.",
          en: "We give a stage to those just starting out.",
        },
      },
      {
        title: { pt: "Acessibilidade", en: "Accessibility" },
        body: {
          pt: "Tornamos os ensaios acessíveis, quebrando barreiras de custos.",
          en: "We keep rehearsals affordable, breaking down cost barriers.",
        },
      },
      {
        title: { pt: "Comunidade", en: "Community" },
        body: {
          pt: "Criamos um centro de partilha e colaboração entre músicos.",
          en: "We build a hub for sharing and collaboration between musicians.",
        },
      },
    ],
    outro: {
      pt: "…há muitas outras formas de poderes ajudar. Fala connosco.",
      en: "…there are many other ways you can help. Talk to us.",
    },
  },

  // ---------- BANDA RESIDENTE ----------
  banda: {
    kicker: { pt: "bandas residentes", en: "resident bands" },
    name: "Madame G",
    quote: {
      pt: "A 641 deu-nos a zona de conforto que há tanto ansiávamos enquanto banda.",
      en: "641 gave us the comfort zone we had longed for as a band.",
    },
    photoBy: { pt: "foto @grainy_john", en: "photo @grainy_john" },
    photoCredits: "@catarinasantosdiary · @whotfisrafa",
    comingSoon: {
      pt: "MAIS BANDAS EM BREVE...",
      en: "MORE BANDS COMING SOON...",
    },
    links: {
      instagram: "https://www.instagram.com/madame.gg/",
      spotify: "https://open.spotify.com/playlist/1BHM7yVGoyUJIwAr7p67ax",
      youtube: "https://www.youtube.com/channel/UCmFRT_bpKRa3zQ1vCs4TxrA",
      discord: "https://discord.gg/gsTs5CJUHE",
    },
  },

  // ---------- CONCURSO BANDAS RESIDENTES ----------
  // Aparece como popup ao clicar em "FAZ BARULHO!" na secção das bandas.
  concurso: {
    // Botão que abre o popup
    ctaLabel: { pt: "FAZ BARULHO!", en: "MAKE NOISE!" },
    // Título do popup
    title: {
      pt: "OPEN CALL BANDAS RESIDENTES",
      en: "RESIDENT BANDS OPEN CALL",
    },
    // Kicker acima do título
    kicker: {
      pt: "em breve...",
      en: "coming soon...",
    },
    // Corpo (parágrafos, um por linha do array)
    body: {
      pt: [
        "Estamos à procura das próximas bandas residentes da 641. Se és uma banda emergente e queres ensaiar, gravar e apresentar-te ao vivo com o nosso apoio — candidata-te.",
        "Envia a tua candidatura através do formulário. As vagas são limitadas.",
      ],
      en: [
        "We're looking for the next 641 resident bands. If you're an emerging band and want to rehearse, record and play live with our support — apply now.",
        "Send your application through the form below. Spots are limited.",
      ],
    },
    // Prazo de candidatura
    deadline: {
      pt: "prazo: 17 set 2026",
      en: "deadline: 17 sep 2026",
    },
    // Botão dentro do popup — substitui "#" pelo Google Form / página do concurso
    formUrl: "#",
    formLabel: { pt: "CANDIDATAR AGORA", en: "APPLY NOW" },
    // Link secundário — página com o markdown em src/content/opencall/
    rulesUrl: "/opencall/regulamento",
    rulesLabel: { pt: "ver regulamento", en: "see rules" },
    comingSoonNotice: {
      pt: "Abriremos as candidaturas muito em breve!",
      en: "Applications will open very soon!",
    },
  },

  // ---------- PARCEIROS ----------
  parceiros: {
    kicker: { pt: "parceiros", en: "partners" },
    outro: {
      pt: "um agradecimento especial aos nossos parceiros!",
      en: "a special thanks to our partners!",
    },
    list: [
      {
        name: "Município de Oeiras",
        logo: "oeiras",
        href: "https://www.oeiras.pt/",
      },
      {
        name: "Fundação EDP",
        logo: "fundacao-edp",
        href: "https://www.fundacaoedp.pt/pt",
      },
      {
        name: "Câmara Municipal de Lisboa",
        logo: "cml",
        href: "https://www.lisboa.pt/",
      },
      {
        name: "Hacker School",
        logo: "hacker-school",
        href: "https://hackerschool.tecnico.ulisboa.pt/pt/",
      },
    ] as Partner[],
  },

  // ---------- DESENHO (página em branco) ----------
  drawPage: {
    hint: {
      pt: "desenha-nos algo",
      en: "draw us something",
    },
  },

  // ---------- CONTACTOS ----------
  contactos: {
    kicker: { pt: "contactos", en: "contact" },
    hint: { pt: "dá-nos um olá!", en: "say hello!" },
    email: "associacao641@gmail.com",
    phone: "+351 910 075 383",
    city: "Fábrica da Pólvora de Barcarena",
    socials: {
      instagram: "https://www.instagram.com/seisquatroum/",
      whatsapp: "https://wa.me/351910075383",
      discord: "https://discord.gg/cbrvUGB8GV",
    },
    channels: [
      {
        id: "email",
        icon: "email",
        label: { pt: "email", en: "email" },
        value: "associacao641@gmail.com",
        href: "mailto:associacao641@gmail.com",
        cta: { pt: "enviar email", en: "send email" },
      },
      {
        id: "phone",
        icon: "phone",
        label: { pt: "telefone", en: "phone" },
        value: "+351 910 075 383",
        href: "tel:+351910075383",
        cta: { pt: "ligar", en: "call" },
      },
      {
        id: "instagram",
        icon: "instagram",
        label: { pt: "instagram", en: "instagram" },
        value: "@seisquatroum",
        href: "https://www.instagram.com/seisquatroum/",
        cta: { pt: "seguir", en: "follow" },
      },
      {
        id: "whatsapp",
        icon: "whatsapp",
        label: { pt: "whatsapp", en: "whatsapp" },
        value: "+351 910 075 383",
        href: "https://wa.me/351910075383",
        cta: { pt: "abrir", en: "open" },
      },
      {
        id: "discord",
        icon: "discord",
        label: { pt: "discord", en: "discord" },
        value: "servidor associação 641",
        href: "https://discord.gg/cbrvUGB8GV",
        cta: { pt: "entrar", en: "join" },
      },
      {
        id: "location",
        icon: "location",
        label: { pt: "onde", en: "where" },
        value: "Fábrica da Pólvora de Barcarena",
        href: "https://maps.app.goo.gl/KAx4y2XbimG12zV19",
        cta: { pt: "abrir mapa", en: "open map" },
      },
    ],
  },

  // ---------- FOOTER ----------
  footer: {
    tagline: {
      pt: "Feito com barulho em Oeiras.",
      en: "Made with noise in Oeiras.",
    },
  },
} as const;

// Helper para escolher a string certa dado o locale ativo
export function t<T extends { pt: string; en: string }>(node: T, locale: Locale): string {
  return node[locale];
}