/* ============================================================================
 * ASSOCIAÇÃO 641 — CONTEÚDO DO SITE
 * ----------------------------------------------------------------------------
 * Este ficheiro é a fonte única de conteúdo do site.
 * Para atualizar textos, notícias, eventos, banda residente, parceiros ou
 * contactos, edita apenas este ficheiro e faz commit para o GitHub.
 *
 * Estrutura: cada bloco tem versão em português (pt) e inglês (en).
 * ============================================================================ */

export type Locale = "pt" | "en";

export type NewsItem = {
  date: string; // formato livre, ex: "24 MAR 2026"
  tag: { pt: string; en: string };
  title: { pt: string; en: string };
  excerpt: { pt: string; en: string };
  image?: string; // URL opcional
};

export type Partner = {
  name: string;
  logo?: string; // URL da imagem do logo (opcional)
  note?: { pt: string; en: string };
};

export const site = {
  // ---------- NAVEGAÇÃO ----------
  nav: {
    sobre: { pt: "sobre", en: "about" },
    ajudar: { pt: "quero ajudar", en: "support us" },
    banda: { pt: "BANDAS RESIDENTES", en: "resident bands" },
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
    est: { pt: "FUNDADA EM 2025", en: "EST. 2025" },
    /**
     * Link para o regulamento interno (PDF, Drive, Google Doc, etc).
     * Substitui "#" pelo URL final.
     */
    regulamentoUrl: "#",
    regulamentoLabel: {
      pt: "REGULAMENTO INTERNO",
      en: "INTERNAL RULES",
    },
  },

  // ---------- O QUE FAZEMOS ----------
  services: [
    {
      badge: { pt: "essencial", en: "core" },
      title: { pt: "SALAS DE ENSAIO", en: "REHEARSAL ROOMS" },
      body: {
        pt: "Equipadas e acessíveis. O teu som, as tuas regras, o nosso suporte técnico.",
        en: "Equipped and affordable. Your sound, your rules, our tech support.",
      },
    },
    {
      title: { pt: "APOIO À GRAVAÇÃO", en: "RECORDING SUPPORT" },
      body: {
        pt: "Do primeiro demo ao primeiro álbum. Suporte técnico e artístico para o teu lançamento.",
        en: "From first demo to first album. Technical and artistic support for your release.",
      },
    },
    {
      title: { pt: "COMUNIDADE", en: "COMMUNITY" },
      body: {
        pt: "Fomento da criação artística feminina e inclusiva. Workshops abertos à comunidade de Oeiras.",
        en: "Fostering inclusive and female-led artistic creation. Workshops open to the Oeiras community.",
      },
    },
  ],

  // ---------- NOTÍCIAS / EVENTOS ----------
  // Adiciona novas entradas no topo do array.
  news: [
    {
      date: "02 ABR 2026",
      tag: { pt: "CONCERTO", en: "CONCERT" },
      title: {
        pt: "Showcase 641: Madame G + convidados",
        en: "641 Showcase: Madame G + guests",
      },
      excerpt: {
        pt: "Uma noite de estreias com a banda residente e projetos convidados da cena de Oeiras.",
        en: "A premiere night with our resident band and guest projects from the Oeiras scene.",
      },
    },
    {
      date: "24 MAR 2025",
      tag: { pt: "WORKSHOP", en: "WORKSHOP" },
      title: {
        pt: "DIY de um microfone de contacto",
        en: "DIY Contact Microphone",
      },
      excerpt: {
        pt: "Inserido na Hackathon (...), workshop.....",
        en: "Part of the Hackathon (...), workshop.....",
      },
    },
    {
      date: "15 MAR 2026",
      tag: { pt: "RIFAS", en: "RAFFLE" },
      title: {
        pt: "Rifas encerradas — 166€ arrecadados",
        en: "Raffle closed — €166 raised",
      },
      excerpt: {
        pt: "Parabéns à vencedora Paula Alves! Obrigado a toda a gente que participou.",
        en: "Congrats to winner Paula Alves! Thanks to everyone who took part.",
      },
    },
  ] satisfies NewsItem[],

  // ---------- QUERO AJUDAR ----------
  ajudar: {
    kicker: { pt: "quero ajudar", en: "support us" },
    intro: {
      pt: "Estamos a aceitar doações via **MB Way** para o número **910 075 383**. Qualquer valor é bem-vindo.",
      en: "We accept donations via **MB Way** to the number **910 075 383**. Any amount is welcome.",
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
      pt: "A 641 deu-nos o espaço e a comunidade que precisávamos para gravar o nosso primeiro EP.",
      en: "641 gave us the space and community we needed to record our first EP.",
    },
    photoCredits: "fotos @grainy_john · @catarinasantosdiary · @whotfisrafa",
    links: {
      instagram: "https://instagram.com/",
      spotify: "https://open.spotify.com/",
      youtube: "https://youtube.com/",
      discord: "https://discord.com/",
    },
  },

  // ---------- CONCURSO BANDAS RESIDENTES ----------
  // Aparece como popup ao clicar em "FAZ BARULHO!" na secção das bandas.
  concurso: {
    // Botão que abre o popup
    ctaLabel: { pt: "FAZ BARULHO!", en: "MAKE NOISE!" },
    // Título do popup
    title: {
      pt: "CONCURSO BANDAS RESIDENTES",
      en: "RESIDENT BANDS CONTEST",
    },
    // Kicker acima do título
    kicker: {
      pt: "candidaturas abertas",
      en: "applications open",
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
      pt: "prazo: 31 mai 2025",
      en: "deadline: 31 may 2025",
    },
    // Botão dentro do popup — substitui "#" pelo Google Form / página do concurso
    formUrl: "#",
    formLabel: { pt: "CANDIDATAR AGORA", en: "APPLY NOW" },
    // Link secundário (opcional) para regulamento do concurso
    rulesUrl: "#",
    rulesLabel: { pt: "ver regulamento", en: "see rules" },
  },

  // ---------- PARCEIROS ----------
  parceiros: {
    kicker: { pt: "parceiros", en: "partners" },
    list: [
      {
        name: "Fundação EDP",
        note: {
          pt: "Financiamento de 2.500€ para o desenvolvimento do projeto “Onda Verde”.",
          en: "€2,500 grant for the development of the “Onda Verde” project.",
        },
      },
    ] as Partner[],
  },

  // ---------- CONTACTOS ----------
  contactos: {
    kicker: { pt: "contactos", en: "contact" },
    email: "associacao641@gmail.com",
    phone: "+351 910 075 383",
    city: "Fábrica da Pólvora de Barcarena",
    socials: {
      instagram: "https://www.instagram.com/seisquatroum/",
      whatsapp: "https://wa.me/351910075383",
      discord: "https://discord.gg/Ug5SPB8xD",
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
        href: "https://discord.gg/Ug5SPB8xD",
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