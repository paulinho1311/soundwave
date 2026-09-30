/**
 * SoundWave - Catálogo de Dados de Demonstração
 * Contém dados mockados de músicas, artistas, álbuns, playlists e notificações.
 */

const DADOS_INICIAIS = {
  artistas: [
    {
      id: 1,
      nome: "The Weeknd",
      foto: "https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/1000x1000-000000-80-0-0.jpg",
      seguidores: "89.4M",
      ouvintesMensais: "112.540.890",
      verificado: true,
      genero: "R&B / Pop / Synthwave",
      bio: "Abel Makkonen Tesfaye, conhecido profissionalmente como The Weeknd, é um cantor, compositor e produtor musical canadense conhecido por sua versatilidade sonora e estética sombria contemporânea."
    },
    {
      id: 2,
      nome: "SZA",
      foto: "https://cdn-images.dzcdn.net/images/artist/8ced041da2bed70d5715f0860956169b/1000x1000-000000-80-0-0.jpg",
      seguidores: "54.1M",
      ouvintesMensais: "78.210.450",
      verificado: true,
      genero: "Neo-Soul / R&B",
      bio: "Solána Imani Rowe, conhecida como SZA, é uma das vozes mais aclamadas da música mundial moderna, unindo elementos de soul, indie e R&B contemporâneo."
    },
    {
      id: 3,
      nome: "Bad Bunny",
      foto: "https://cdn-images.dzcdn.net/images/artist/044a3f315b041864887a8dd8709e6926/1000x1000-000000-80-0-0.jpg",
      seguidores: "76.8M",
      ouvintesMensais: "94.830.120",
      verificado: true,
      genero: "Reggaeton / Trap Latino",
      bio: "Benito Antonio Martínez Ocasio é um fenômeno global que revolucionou o cenário da música urbana em espanhol, quebrando recordes mundiais de streaming."
    },
    {
      id: 4,
      nome: "Dua Lipa",
      foto: "https://cdn-images.dzcdn.net/images/artist/877872aaf75694f11d53c318700ab2b5/1000x1000-000000-80-0-0.jpg",
      seguidores: "68.2M",
      ouvintesMensais: "82.190.300",
      verificado: true,
      genero: "Nu-Disco / Pop",
      bio: "Cantora e compositora britânica com múltiplos Grammy Awards, aclamada por sua estética sonora retrô-futurista e produções dançantes vibrantes."
    },
    {
      id: 5,
      nome: "Daft Punk",
      foto: "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/1000x1000-000000-80-0-0.jpg",
      seguidores: "32.6M",
      ouvintesMensais: "38.740.000",
      verificado: true,
      genero: "Electronic / French House",
      bio: "Lendária dupla francesa de música eletrônica que redefiniu o house, disco e synth-pop global com trajes icônicos de robôs e melodias atemporais."
    },
    {
      id: 6,
      nome: "Billie Eilish",
      foto: "https://cdn-images.dzcdn.net/images/artist/8eab1a9a644889aabaca1e193e05f984/1000x1000-000000-80-0-0.jpg",
      seguidores: "72.4M",
      ouvintesMensais: "86.400.210",
      verificado: true,
      genero: "Dark Pop / Indie Pop",
      bio: "Conhecida por seus vocais sussurrados característicos, composições profundas e inovação sonora ao lado de seu irmão Finneas."
    }
  ],

  musicas: [
    {
      id: 1,
      titulo: "Blinding Lights",
      artista: "The Weeknd",
      artistaId: 1,
      album: "After Hours",
      albumId: 1,
      ano: 2020,
      duracao: 200,
      duracaoFormatada: "3:20",
      imagem: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=retro-lounge-113110.mp3",
      genero: "Synthwave",
      tamanhoMb: 8.4,
      reproducoes: "3.8B"
    },
    {
      id: 2,
      titulo: "Save Your Tears",
      artista: "The Weeknd",
      artistaId: 1,
      album: "After Hours",
      albumId: 1,
      ano: 2020,
      duracao: 215,
      duracaoFormatada: "3:35",
      imagem: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3",
      genero: "Synthpop",
      tamanhoMb: 9.1,
      reproducoes: "2.4B"
    },
    {
      id: 3,
      titulo: "Kill Bill",
      artista: "SZA",
      artistaId: 2,
      album: "SOS",
      albumId: 2,
      ano: 2022,
      duracao: 153,
      duracaoFormatada: "2:33",
      imagem: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3",
      genero: "R&B",
      tamanhoMb: 6.8,
      reproducoes: "1.9B"
    },
    {
      id: 4,
      titulo: "Snooze",
      artista: "SZA",
      artistaId: 2,
      album: "SOS",
      albumId: 2,
      ano: 2022,
      duracao: 201,
      duracaoFormatada: "3:21",
      imagem: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=chill-abstract-intention-12099.mp3",
      genero: "Neo-Soul",
      tamanhoMb: 7.9,
      reproducoes: "1.1B"
    },
    {
      id: 5,
      titulo: "Tití Me Preguntó",
      artista: "Bad Bunny",
      artistaId: 3,
      album: "Un Verano Sin Ti",
      albumId: 3,
      ano: 2022,
      duracao: 243,
      duracaoFormatada: "4:03",
      imagem: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_7314569d12.mp3?filename=tropic-10493.mp3",
      genero: "Urbano Latino",
      tamanhoMb: 10.2,
      reproducoes: "2.1B"
    },
    {
      id: 6,
      titulo: "Ojitos Lindos",
      artista: "Bad Bunny",
      artistaId: 3,
      album: "Un Verano Sin Ti",
      albumId: 3,
      ano: 2022,
      duracao: 258,
      duracaoFormatada: "4:18",
      imagem: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8621453b.mp3?filename=summer-chill-hop-10705.mp3",
      genero: "Indie Pop Latino",
      tamanhoMb: 11.5,
      reproducoes: "1.8B"
    },
    {
      id: 7,
      titulo: "Levitating",
      artista: "Dua Lipa",
      artistaId: 4,
      album: "Future Nostalgia",
      albumId: 4,
      ano: 2020,
      duracao: 203,
      duracaoFormatada: "3:23",
      imagem: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3c3a73467.mp3?filename=future-bass-hot-ride-118836.mp3",
      genero: "Nu-Disco",
      tamanhoMb: 8.7,
      reproducoes: "2.3B"
    },
    {
      id: 8,
      titulo: "Don't Start Now",
      artista: "Dua Lipa",
      artistaId: 4,
      album: "Future Nostalgia",
      albumId: 4,
      ano: 2019,
      duracao: 183,
      duracaoFormatada: "3:03",
      imagem: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=glossy-168156.mp3",
      genero: "Nu-Disco",
      tamanhoMb: 7.5,
      reproducoes: "2.6B"
    },
    {
      id: 9,
      titulo: "Get Lucky",
      artista: "Daft Punk",
      artistaId: 5,
      album: "Random Access Memories",
      albumId: 5,
      ano: 2013,
      duracao: 248,
      duracaoFormatada: "4:08",
      imagem: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=funky-disco-104992.mp3",
      genero: "Disco Funk",
      tamanhoMb: 11.2,
      reproducoes: "1.7B"
    },
    {
      id: 10,
      titulo: "Starboy",
      artista: "The Weeknd ft. Daft Punk",
      artistaId: 1,
      album: "Starboy",
      albumId: 6,
      ano: 2016,
      duracao: 230,
      duracaoFormatada: "3:50",
      imagem: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d6110a12.mp3?filename=action-cyberpunk-12345.mp3",
      genero: "Electro R&B",
      tamanhoMb: 9.8,
      reproducoes: "3.2B"
    },
    {
      id: 11,
      titulo: "bad guy",
      artista: "Billie Eilish",
      artistaId: 6,
      album: "WHEN WE ALL FALL ASLEEP",
      albumId: 7,
      ano: 2019,
      duracao: 194,
      duracaoFormatada: "3:14",
      imagem: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_c1e202395d.mp3?filename=dark-beat-urban-112211.mp3",
      genero: "Dark Pop",
      tamanhoMb: 7.8,
      reproducoes: "2.5B"
    },
    {
      id: 12,
      titulo: "Birds of a Feather",
      artista: "Billie Eilish",
      artistaId: 6,
      album: "HIT ME HARD AND SOFT",
      albumId: 8,
      ano: 2024,
      duracao: 196,
      duracaoFormatada: "3:16",
      imagem: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3",
      genero: "Indie Pop",
      tamanhoMb: 8.2,
      reproducoes: "1.4B"
    }
  ],

  albuns: [
    {
      id: 1,
      titulo: "After Hours",
      artista: "The Weeknd",
      artistaId: 1,
      ano: 2020,
      capa: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      musicasIds: [1, 2]
    },
    {
      id: 2,
      titulo: "SOS",
      artista: "SZA",
      artistaId: 2,
      ano: 2022,
      capa: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
      musicasIds: [3, 4]
    },
    {
      id: 3,
      titulo: "Un Verano Sin Ti",
      artista: "Bad Bunny",
      artistaId: 3,
      ano: 2022,
      capa: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
      musicasIds: [5, 6]
    },
    {
      id: 4,
      titulo: "Future Nostalgia",
      artista: "Dua Lipa",
      artistaId: 4,
      ano: 2020,
      capa: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80",
      musicasIds: [7, 8]
    },
    {
      id: 5,
      titulo: "Random Access Memories",
      artista: "Daft Punk",
      artistaId: 5,
      ano: 2013,
      capa: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80",
      musicasIds: [9]
    },
    {
      id: 6,
      titulo: "Starboy",
      artista: "The Weeknd",
      artistaId: 1,
      ano: 2016,
      capa: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      musicasIds: [10]
    },
    {
      id: 7,
      titulo: "WHEN WE ALL FALL ASLEEP",
      artista: "Billie Eilish",
      artistaId: 6,
      ano: 2019,
      capa: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      musicasIds: [11]
    },
    {
      id: 8,
      titulo: "HIT ME HARD AND SOFT",
      artista: "Billie Eilish",
      artistaId: 6,
      ano: 2024,
      capa: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
      musicasIds: [12]
    }
  ],

  playlistsPadrao: [
    {
      id: "pl_1",
      nome: "Meus Favoritos",
      descricao: "As melhores faixas salvas com muito carinho.",
      imagem: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      criador: "SoundWave",
      musicasIds: [1, 3, 7, 10]
    },
    {
      id: "pl_2",
      nome: "Viagem & Estrada",
      descricao: "Músicas perfeitas para colocar o pé na estrada sem destino.",
      imagem: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80",
      criador: "SoundWave Editorial",
      musicasIds: [1, 5, 9, 12]
    },
    {
      id: "pl_3",
      nome: "Workout Beast Mode",
      descricao: "Energia máxima e batidas eletrizantes para seu treino.",
      imagem: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
      criador: "SoundWave Fitness",
      musicasIds: [7, 8, 10, 11]
    },
    {
      id: "pl_4",
      nome: "Rock Clássico & Alternativo",
      descricao: "Guitarras marcantes e lendas imortais da música.",
      imagem: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80",
      criador: "SoundWave",
      musicasIds: [9, 10, 1]
    },
    {
      id: "pl_5",
      nome: "Boas Vibes & Relax",
      descricao: "Chillout suave para descontrair no fim do dia.",
      imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
      criador: "SoundWave",
      musicasIds: [3, 4, 6, 12]
    }
  ],

  notificacoes: [
    {
      id: 1,
      titulo: "The Weeknd — Novo álbum disponível",
      mensagem: "O aguardado lançamento de The Weeknd já está no SoundWave.",
      tempo: "Há 2h",
      lida: false,
      artistaId: 1
    },
    {
      id: 2,
      titulo: "SZA — Novo single disponível",
      mensagem: "Escute em primeira mão a nova colaboração de SZA.",
      tempo: "Há 5h",
      lida: false,
      artistaId: 2
    },
    {
      id: 3,
      titulo: "Billie Eilish — Novo lançamento",
      mensagem: "A faixa Birds of a Feather acabou de entrar para as mais tocadas.",
      tempo: "Há 1d",
      lida: true,
      artistaId: 6
    },
    {
      id: 4,
      titulo: "Bad Bunny — Tour anunciada",
      mensagem: "Confira as músicas da turnê exclusiva no SoundWave.",
      tempo: "Há 2d",
      lida: true,
      artistaId: 3
    }
  ],

  usuarioDemo: {
    id: "usr_demo",
    nome: "Paulo Bertoldi",
    email: "demo@soundwave.com",
    senha: "123456",
    username: "@paulobertoldi",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    premium: false,
    seguidores: 142,
    seguindo: 18,
    playlistsCriadas: 3,
    notificacoesAtivas: true,
    altoContraste: false,
    idioma: "pt-BR"
  }
};

// Exporta para escopo global do browser
window.DADOS_INICIAIS = DADOS_INICIAIS;
