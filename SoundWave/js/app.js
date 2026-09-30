/**
 * SoundWave - Orquestrador Principal e Gerenciador de Estado Global (app.js)
 * Conecta todas as funcionalidades, rotas, modals, toasts e ciclo de vida da aplicação.
 */

const SoundWaveApp = (() => {
  const CHAVE_ARTISTAS_SEGUIDOS = "soundwave_artistas_seguidos";
  const CHAVE_DOWNLOADS = "soundwave_downloads_offline";

  // Estado global reativo da aplicação (Seção 26)
  const appState = {
    usuario: null,
    musicaAtual: null,
    isPlaying: false,
    fila: [],
    favoritos: [],
    playlists: [],
    historico: [],
    artistasSeguidos: [1, 2], // IDs de The Weeknd e SZA por padrão
    downloadsOffline: [],
    premium: false,
    rotaAtual: "home"
  };

  /**
   * Inicialização da aplicação
   */
  async function inicializar() {
    carregarEstado();
    configurarEventosGlobais();
    configurarRoteador();
    gerenciarSplashScreen();
    if (window.SoundWaveFavoritos) {
      window.SoundWaveFavoritos.inicializar();
    }
  }

  /**
   * Carrega estado do localStorage
   */
  function carregarEstado() {
    appState.usuario = window.SoundWaveAuth ? window.SoundWaveAuth.obterUsuarioAtual() : null;
    appState.favoritos = window.SoundWaveFavoritos ? window.SoundWaveFavoritos.obterFavoritosIds() : [];
    appState.playlists = window.SoundWavePlaylists ? window.SoundWavePlaylists.obterTodas() : [];
    appState.historico = window.SoundWavePlayer ? window.SoundWavePlayer.obterHistorico() : [];

    try {
      const seguidos = JSON.parse(localStorage.getItem(CHAVE_ARTISTAS_SEGUIDOS));
      if (Array.isArray(seguidos)) appState.artistasSeguidos = seguidos;
    } catch {
      appState.artistasSeguidos = [1, 2];
    }

    try {
      const downs = JSON.parse(localStorage.getItem(CHAVE_DOWNLOADS));
      if (Array.isArray(downs)) appState.downloadsOffline = downs;
    } catch {
      appState.downloadsOffline = [];
    }

    if (appState.usuario) {
      appState.premium = !!appState.usuario.premium;
      if (appState.usuario.altoContraste) {
        document.body.classList.add("high-contrast");
      }
    }
  }

  /**
   * Salva estado consolidado
   */
  function salvarEstado() {
    try {
      localStorage.setItem(CHAVE_ARTISTAS_SEGUIDOS, JSON.stringify(appState.artistasSeguidos));
      localStorage.setItem(CHAVE_DOWNLOADS, JSON.stringify(appState.downloadsOffline));
    } catch (e) {
      console.warn("Erro ao salvar estado", e);
    }
  }

  /**
   * Gerenciamento da Splash Screen (Seção 6)
   */
  function gerenciarSplashScreen() {
    const splash = document.getElementById("splash-screen");
    if (!splash) return;

    setTimeout(() => {
      splash.classList.add("hidden");
    }, 1800);

    splash.addEventListener("click", () => {
      splash.classList.add("hidden");
    });
  }

  /**
   * Roteamento Dinâmico SPA por Hash (Seção 29)
   */
  function configurarRoteador() {
    window.addEventListener("hashchange", lidarMudancaDeRota);
    // Dispara a rota inicial com base na URL atual
    lidarMudancaDeRota();
  }

  function lidarMudancaDeRota() {
    const hash = window.location.hash.slice(1) || "/home";
    const [caminho, queryStr] = hash.split("?");
    const rotaLimpa = caminho.replace("/", "") || "home";

    const params = new URLSearchParams(queryStr || "");
    const paramObj = Object.fromEntries(params.entries());

    renderizarRota(rotaLimpa, paramObj);
  }

  function navegarPara(rota, params = {}) {
    let query = "";
    const chaves = Object.keys(params);
    if (chaves.length > 0) {
      query = "?" + new URLSearchParams(params).toString();
    }
    window.location.hash = `/${rota}${query}`;
  }

  /**
   * Renderiza a visualização correspondente à rota
   */
  async function renderizarRota(rota, params = {}) {
    appState.rotaAtual = rota;
    atualizarNavegacaoAtiva(rota);

    const mainContainer = document.getElementById("main-view-container");
    if (!mainContainer) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

    switch (rota) {
      case "home":
        await renderizarViewHome(mainContainer);
        break;
      case "pesquisa":
        renderizarViewPesquisa(mainContainer);
        break;
      case "playlists":
        renderizarViewPlaylists(mainContainer);
        break;
      case "playlist-detalhe":
        renderizarViewPlaylistDetalhe(mainContainer, params.id);
        break;
      case "favoritos":
        renderizarViewFavoritos(mainContainer);
        break;
      case "perfil":
        renderizarViewPerfil(mainContainer);
        break;
      case "editar-perfil":
        renderizarViewEditarPerfil(mainContainer);
        break;
      case "historico":
        renderizarViewHistorico(mainContainer);
        break;
      case "fila":
        renderizarViewFila(mainContainer);
        break;
      case "artista":
        await renderizarViewArtista(mainContainer, params.id);
        break;
      case "notificacoes":
        await renderizarViewNotificacoes(mainContainer);
        break;
      case "premium":
        renderizarViewPremium(mainContainer);
        break;
      case "downloads":
        renderizarViewDownloads(mainContainer);
        break;
      case "configuracoes":
        renderizarViewConfiguracoes(mainContainer);
        break;
      case "login":
        renderizarViewLogin(mainContainer);
        break;
      case "cadastro":
        renderizarViewCadastro(mainContainer);
        break;
      default:
        await renderizarViewHome(mainContainer);
        break;
    }
  }

  /**
   * Atualiza estilos ativos na Sidebar Desktop e na Bottom Nav Mobile
   */
  function atualizarNavegacaoAtiva(rota) {
    // Mobile items
    document.querySelectorAll(".mobile-nav-item").forEach(el => {
      const target = el.getAttribute("data-nav");
      el.classList.toggle("active", target === rota);
    });

    // Sidebar items
    document.querySelectorAll(".sidebar-nav-link").forEach(el => {
      const target = el.getAttribute("data-nav");
      el.classList.toggle("active", target === rota);
    });
  }

  /* ==========================================================================
     RENDERIZAÇÃO DAS TELAS DA APLICAÇÃO
     ========================================================================== */

  /**
   * 1. Tela Inicial (Home) - Seção 9
   */
  async function renderizarViewHome(container) {
    const usuario = window.SoundWaveAuth?.obterUsuarioAtual() || { nome: "Visitante", avatar: "assets/capas/default.jpg" };
    const [recomendacoes, playlists, lancamentos] = await Promise.all([
      window.SoundWaveAPI.buscarRecomendacoes(),
      window.SoundWaveAPI.obterPlaylistsDestaque(),
      window.SoundWaveAPI.buscarLancamentos()
    ]);
    const historicoRecente = (window.SoundWavePlayer?.obterHistorico() || []).slice(0, 4);

    container.innerHTML = `
      <div class="fade-in">
        <!-- Saudação do Topo -->
        <div class="home-welcome-section">
          <div>
            <h1 class="home-greeting-title">Olá, ${usuario.nome.split(" ")[0]}!</h1>
            <p class="home-greeting-sub">Que bom te ver por aqui.</p>
          </div>
          <div class="header-profile-link" onclick="SoundWaveApp.navegarPara('perfil')">
            <img class="header-avatar" src="${usuario.avatar}" alt="${usuario.nome}">
            <span class="header-profile-name">${usuario.nome.split(" ")[0]}</span>
          </div>
        </div>

        <!-- Barra de Busca Rápida -->
        <div class="quick-search-box" onclick="SoundWaveApp.navegarPara('pesquisa')">
          <i class="fa-solid fa-magnifying-glass quick-search-icon"></i>
          <input type="text" class="quick-search-input" placeholder="Buscar músicas, artistas e playlists..." readonly>
        </div>

        <!-- Banner de Destaque -->
        <div class="home-hero-banner">
          <div class="hero-content">
            <span class="hero-tag">Destaque Exclusivo</span>
            <h2 class="hero-title">Descubra novos artistas</h2>
            <p class="hero-desc">Explore novas atmosferas sonoras, charts mundiais e sons selecionados para seu gosto.</p>
            <button class="btn btn-primary" onclick="SoundWaveApp.navegarPara('pesquisa')">
              <i class="fa-solid fa-compass"></i> Explorar
            </button>
          </div>
        </div>

        <!-- Seção: Recomendado para você -->
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">Recomendado para você</h3>
            <a href="#/pesquisa" class="section-link">Ver tudo</a>
          </div>
          <div class="cards-grid">
            ${recomendacoes.map(m => renderizarCardMusica(m)).join('')}
          </div>
        </div>

        <!-- Seção: Playlists em destaque -->
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">Playlists em destaque</h3>
            <a href="#/playlists" class="section-link">Ver playlists</a>
          </div>
          <div class="cards-scroll-row">
            ${playlists.map(p => `
              <div class="playlist-horizontal-card" onclick="SoundWaveApp.abrirPlaylist('${p.id}')">
                <img class="playlist-thumb" src="${p.imagem}" alt="${p.nome}">
                <div class="playlist-info">
                  <div class="playlist-name">${p.nome}</div>
                  <div class="playlist-tracks-count">${p.musicasIds ? p.musicasIds.length : 0} músicas</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Seção: Tocadas recentemente (Se houver) -->
        ${historicoRecente.length > 0 ? `
          <div class="section-container">
            <div class="section-header">
              <h3 class="section-title">Tocadas recentemente</h3>
              <a href="#/historico" class="section-link">Ver histórico</a>
            </div>
            <div class="cards-grid">
              ${historicoRecente.map(m => renderizarCardMusica(m)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Seção: Artistas em Destaque -->
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">Artistas populares</h3>
          </div>
          <div class="cards-scroll-row">
            ${(window.DADOS_INICIAIS?.artistas || []).map(a => `
              <div class="artist-card" style="min-width: 140px;" onclick="SoundWaveApp.navegarPara('artista', { id: ${a.id} })">
                <img class="artist-avatar" src="${a.foto}" alt="${a.nome}">
                <div class="artist-name">${a.nome}</div>
                <div class="artist-role">${a.genero.split('/')[0]}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 2. Tela de Pesquisa - Seção 10
   */
  function renderizarViewPesquisa(container) {
    container.innerHTML = `
      <div class="fade-in">
        <h1 style="font-size: 1.8rem; margin-bottom: 20px;">Pesquisar</h1>

        <div class="quick-search-box" style="margin-bottom: 16px;">
          <i class="fa-solid fa-magnifying-glass quick-search-icon"></i>
          <input type="text" id="main-search-input" class="quick-search-input" placeholder="Buscar músicas, artistas..." autocomplete="off">
        </div>

        <div class="nav-tabs" id="search-filter-tabs">
          <button class="nav-tab-btn active" data-filter="todos">Todos</button>
          <button class="nav-tab-btn" data-filter="musicas">Músicas</button>
          <button class="nav-tab-btn" data-filter="artistas">Artistas</button>
          <button class="nav-tab-btn" data-filter="albuns">Álbuns</button>
        </div>

        <div id="search-results-content">
          <!-- Conteúdo gerado dinamicamente -->
        </div>
      </div>
    `;

    const searchInput = document.getElementById("main-search-input");
    let debounceTimer;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const activeTab = document.querySelector("#search-filter-tabs .active")?.getAttribute("data-filter") || "todos";
        window.SoundWavePesquisa.executarBusca(e.target.value, activeTab);
      }, 250);
    });

    // Abas de filtro
    document.querySelectorAll("#search-filter-tabs .nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#search-filter-tabs .nav-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filtro = btn.getAttribute("data-filter");
        window.SoundWavePesquisa.executarBusca(searchInput.value, filtro);
      });
    });

    // Inicializa com "Em alta"
    window.SoundWavePesquisa.renderizarSecaoEmAlta();
  }

  /**
   * 3. Tela de Playlists - Seção 13
   */
  function renderizarViewPlaylists(container) {
    const playlists = window.SoundWavePlaylists.obterTodas();

    container.innerHTML = `
      <div class="fade-in">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 1.8rem;">Playlists</h1>
            <p class="text-muted">Minhas playlists e coleções personalizadas</p>
          </div>
          <button class="btn btn-primary" onclick="SoundWaveApp.abrirModalCriarPlaylist()">
            <i class="fa-solid fa-plus"></i> Criar playlist
          </button>
        </div>

        <div class="cards-grid">
          ${playlists.map(p => `
            <div class="music-card" onclick="SoundWaveApp.abrirPlaylist('${p.id}')">
              <div class="music-card-cover-wrapper">
                <img class="music-card-cover" src="${p.imagem}" alt="${p.nome}">
                <button class="music-card-play-btn" aria-label="Tocar"><i class="fa-solid fa-play"></i></button>
              </div>
              <div class="music-card-title">${p.nome}</div>
              <div class="music-card-artist">${p.musicasIds ? p.musicasIds.length : 0} músicas • ${p.criador}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 4. Detalhes de uma Playlist
   */
  function renderizarViewPlaylistDetalhe(container, playlistId) {
    const playlist = window.SoundWavePlaylists.obterPorId(playlistId);
    if (!playlist) {
      container.innerHTML = `<p>Playlist não encontrada.</p>`;
      return;
    }

    const catalogo = window.DADOS_INICIAIS?.musicas || [];
    const musicasDaPlaylist = (playlist.musicasIds || [])
      .map(id => catalogo.find(m => m.id === id))
      .filter(Boolean);

    container.innerHTML = `
      <div class="fade-in">
        <button class="btn btn-secondary btn-sm" style="margin-bottom: 20px;" onclick="SoundWaveApp.navegarPara('playlists')">
          <i class="fa-solid fa-arrow-left"></i> Voltar para Playlists
        </button>

        <div class="home-hero-banner" style="background: linear-gradient(135deg, rgba(14, 19, 34, 0.9), rgba(109, 40, 217, 0.6)), url('${playlist.imagem}') center/cover;">
          <div style="display: flex; gap: 24px; align-items: center; position: relative; z-index: 2; flex-wrap: wrap;">
            <img src="${playlist.imagem}" style="width: 140px; height: 140px; border-radius: var(--radius-md); box-shadow: var(--shadow-md);" alt="${playlist.nome}">
            <div>
              <span class="badge badge-purple" style="margin-bottom: 8px;">Playlist</span>
              <h1 style="font-size: 2.2rem; margin-bottom: 6px;">${playlist.nome}</h1>
              <p class="text-muted" style="margin-bottom: 14px;">${playlist.descricao}</p>
              <div style="display: flex; gap: 12px; align-items: center;">
                <button class="btn btn-primary" onclick="SoundWaveApp.tocarTodasEmSequencia([${musicasDaPlaylist.map(m => m.id).join(',')}])">
                  <i class="fa-solid fa-play"></i> Tocar todas
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="music-table" style="margin-top: 24px;">
          ${musicasDaPlaylist.length > 0 ? musicasDaPlaylist.map((m, idx) => `
            <div class="music-row">
              <span class="music-row-index">${idx + 1}</span>
              <span class="music-row-play-icon" onclick="SoundWavePlayer.tocarMusica(${m.id})"><i class="fa-solid fa-play"></i></span>
              <img class="music-row-thumb" src="${m.imagem}" alt="${m.titulo}">
              <div class="music-row-info" onclick="SoundWavePlayer.tocarMusica(${m.id})">
                <div class="music-row-title">${m.titulo}</div>
                <div class="music-row-artist">${m.artista}</div>
              </div>
              <div class="music-row-album">${m.album}</div>
              <span class="music-row-duration">${m.duracaoFormatada}</span>
              <div class="music-row-actions">
                <button class="btn-icon btn-sm btn-heart ${window.SoundWaveFavoritos.isFavorito(m.id) ? 'favorited' : ''}" data-fav-song-id="${m.id}" onclick="SoundWaveFavoritos.toggleFavorito(${m.id})">
                  <i class="${window.SoundWaveFavoritos.isFavorito(m.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
                <button class="btn-icon btn-sm" title="Remover da playlist" onclick="SoundWaveApp.removerMusicaDePlaylist('${playlist.id}', ${m.id})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('') : `
            <p class="text-muted" style="text-align: center; padding: 40px;">Esta playlist ainda não possui músicas. Adicione faixas através da busca!</p>
          `}
        </div>
      </div>
    `;
  }

  /**
   * 5. Tela de Favoritos - Seção 14
   */
  function renderizarViewFavoritos(container) {
    const musicas = window.SoundWaveFavoritos.obterMusicasFavoritas();

    container.innerHTML = `
      <div class="fade-in">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 1.8rem;"><i class="fa-solid fa-heart" style="color: #ec4899; margin-right: 8px;"></i> Músicas Favoritas</h1>
            <p class="text-muted">${musicas.length} faixas salvas na sua coleção</p>
          </div>
          ${musicas.length > 0 ? `
            <button class="btn btn-primary" onclick="SoundWaveApp.tocarTodasEmSequencia([${musicas.map(m => m.id).join(',')}])">
              <i class="fa-solid fa-play"></i> Tocar tudo
            </button>
          ` : ''}
        </div>

        <div class="music-table">
          ${musicas.length > 0 ? musicas.map((m, idx) => `
            <div class="music-row">
              <span class="music-row-index">${idx + 1}</span>
              <span class="music-row-play-icon" onclick="SoundWavePlayer.tocarMusica(${m.id})"><i class="fa-solid fa-play"></i></span>
              <img class="music-row-thumb" src="${m.imagem}" alt="${m.titulo}">
              <div class="music-row-info" onclick="SoundWavePlayer.tocarMusica(${m.id})">
                <div class="music-row-title">${m.titulo}</div>
                <div class="music-row-artist">${m.artista}</div>
              </div>
              <div class="music-row-album">${m.album}</div>
              <span class="music-row-duration">${m.duracaoFormatada}</span>
              <div class="music-row-actions">
                <button class="btn-icon btn-sm btn-heart favorited" data-fav-song-id="${m.id}" onclick="SoundWaveFavoritos.toggleFavorito(${m.id}); SoundWaveApp.renderizarRota('favoritos');">
                  <i class="fa-solid fa-heart"></i>
                </button>
                <button class="btn-icon btn-sm" onclick="SoundWaveApp.abrirMenuMusica(event, ${m.id})">
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 60px 20px;">
              <i class="fa-regular fa-heart" style="font-size: 3.5rem; color: var(--text-subtle); margin-bottom: 16px;"></i>
              <h3>Você ainda não tem músicas favoritas</h3>
              <p class="text-muted" style="margin-top: 6px;">Clique no ícone de coração em qualquer música para adicioná-la aqui.</p>
              <button class="btn btn-secondary" style="margin-top: 20px;" onclick="SoundWaveApp.navegarPara('home')">Explorar músicas</button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * 6. Tela de Perfil - Seção 15
   */
  function renderizarViewPerfil(container) {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    if (!usuario) {
      navegarPara("login");
      return;
    }

    container.innerHTML = `
      <div class="fade-in" style="max-width: 600px; margin: 0 auto;">
        <div class="profile-card-header">
          <img class="profile-avatar-lg" id="profile-avatar-img" src="${usuario.avatar}" alt="${usuario.nome}">
          <h2 id="profile-name-text">${usuario.nome}</h2>
          <span class="text-muted" id="profile-username-text">${usuario.username || '@usuario'}</span>
          <span class="badge badge-premium" id="profile-badge-premium" style="margin-top: 10px; display: ${usuario.premium ? 'inline-flex' : 'none'};">
            <i class="fa-solid fa-crown"></i> Assinante Premium
          </span>

          <div class="profile-stats-grid">
            <div class="profile-stat-box">
              <div class="profile-stat-number" id="profile-count-playlists">${usuario.playlistsCriadas || 3}</div>
              <div class="profile-stat-label">Playlists</div>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-number" id="profile-count-seguindo">${appState.artistasSeguidos.length}</div>
              <div class="profile-stat-label">Seguindo</div>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-number" id="profile-count-seguidores">${usuario.seguidores || 142}</div>
              <div class="profile-stat-label">Seguidores</div>
            </div>
          </div>

          <button class="btn btn-primary btn-sm" onclick="SoundWaveApp.navegarPara('editar-perfil')">
            <i class="fa-solid fa-pen"></i> Editar perfil
          </button>
        </div>

        <div class="profile-menu-list">
          <div class="profile-menu-item" onclick="SoundWaveApp.navegarPara('configuracoes')">
            <span><i class="fa-solid fa-user-gear" style="margin-right: 12px; color: var(--primary-light);"></i> Conta e Preferências</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>
          <div class="profile-menu-item" onclick="SoundWaveApp.navegarPara('premium')">
            <span><i class="fa-solid fa-crown" style="margin-right: 12px; color: #f59e0b;"></i> Assinatura Premium</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>
          <div class="profile-menu-item" onclick="SoundWaveApp.navegarPara('notificacoes')">
            <span><i class="fa-solid fa-bell" style="margin-right: 12px; color: var(--primary-neon);"></i> Notificações de Artistas</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>
          <div class="profile-menu-item" onclick="SoundWaveApp.navegarPara('downloads')">
            <span><i class="fa-solid fa-arrow-down-to-line" style="margin-right: 12px; color: var(--success);"></i> Músicas Offline</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>
          <div class="profile-menu-item" onclick="SoundWaveApp.abrirModalAjuda()">
            <span><i class="fa-solid fa-circle-question" style="margin-right: 12px; color: var(--text-muted);"></i> Central de Ajuda</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>
        </div>
      </div>
    `;

    if (window.SoundWavePerfil) {
      window.SoundWavePerfil.renderizarPerfil();
    }
  }

  /**
   * 7. Tela de Editar Perfil - Seção 16
   */
  function renderizarViewEditarPerfil(container) {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    if (!usuario) {
      navegarPara("login");
      return;
    }

    container.innerHTML = `
      <div class="fade-in" style="max-width: 520px; margin: 0 auto;">
        <button class="btn btn-secondary btn-sm" style="margin-bottom: 20px;" onclick="SoundWaveApp.navegarPara('perfil')">
          <i class="fa-solid fa-arrow-left"></i> Voltar ao Perfil
        </button>

        <div class="card-glass" style="padding: 32px;">
          <h2 style="font-size: 1.6rem; margin-bottom: 6px;">Editar Perfil</h2>
          <p class="text-muted" style="margin-bottom: 24px;">Atualize suas informações pessoais de conta.</p>

          <form id="form-edit-profile" onsubmit="SoundWavePerfil.salvarEdicao(event)">
            <div style="text-align: center; margin-bottom: 20px;">
              <img id="edit-profile-avatar-preview" src="${usuario.avatar}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-light); margin-bottom: 10px;">
            </div>

            <div class="form-group">
              <label for="edit-profile-avatar">URL da Foto de Perfil</label>
              <input type="url" id="edit-profile-avatar" class="form-control" value="${usuario.avatar || ''}" oninput="document.getElementById('edit-profile-avatar-preview').src = this.value">
            </div>

            <div class="form-group">
              <label for="edit-profile-name">Nome Completo</label>
              <input type="text" id="edit-profile-name" class="form-control" value="${usuario.nome}" required>
            </div>

            <div class="form-group">
              <label for="edit-profile-email">E-mail</label>
              <input type="email" id="edit-profile-email" class="form-control" value="${usuario.email}" required>
            </div>

            <div class="form-group">
              <label for="edit-profile-password">Senha de Acesso</label>
              <input type="password" id="edit-profile-password" class="form-control" value="${usuario.senha || ''}">
            </div>

            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button type="submit" class="btn btn-primary" style="flex: 1;">
                <i class="fa-solid fa-floppy-disk"></i> Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * 8. Tela de Histórico - Seção 17 & RN05
   */
  function renderizarViewHistorico(container) {
    const historico = window.SoundWavePlayer.obterHistorico();

    container.innerHTML = `
      <div class="fade-in">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 1.8rem;"><i class="fa-solid fa-clock-rotate-left" style="color: var(--primary-neon); margin-right: 8px;"></i> Histórico de Reprodução</h1>
            <p class="text-muted">Registro de todas as faixas que você ouviu</p>
          </div>
          ${historico.length > 0 ? `
            <button class="btn btn-danger btn-sm" onclick="SoundWavePlayer.limparHistorico(); SoundWaveApp.renderizarRota('historico');">
              <i class="fa-solid fa-trash"></i> Limpar histórico
            </button>
          ` : ''}
        </div>

        <div class="music-table">
          ${historico.length > 0 ? historico.map((m, idx) => `
            <div class="music-row">
              <span class="music-row-index">${idx + 1}</span>
              <span class="music-row-play-icon" onclick="SoundWavePlayer.tocarMusica(${m.id})"><i class="fa-solid fa-play"></i></span>
              <img class="music-row-thumb" src="${m.imagem}" alt="${m.titulo}">
              <div class="music-row-info" onclick="SoundWavePlayer.tocarMusica(${m.id})">
                <div class="music-row-title">${m.titulo}</div>
                <div class="music-row-artist">${m.artista} • ${m.horario || 'Hoje'}</div>
              </div>
              <div class="music-row-album">${m.album}</div>
              <span class="music-row-duration">${m.duracaoFormatada}</span>
              <div class="music-row-actions">
                <button class="btn-icon btn-sm btn-heart ${window.SoundWaveFavoritos.isFavorito(m.id) ? 'favorited' : ''}" data-fav-song-id="${m.id}" onclick="SoundWaveFavoritos.toggleFavorito(${m.id})">
                  <i class="${window.SoundWaveFavoritos.isFavorito(m.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 60px 20px;">
              <i class="fa-solid fa-headphones" style="font-size: 3.5rem; color: var(--text-subtle); margin-bottom: 16px;"></i>
              <h3>Nenhuma música reproduzida ainda</h3>
              <p class="text-muted" style="margin-top: 6px;">Ouça suas músicas preferidas para construir seu histórico musical.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * 9. Tela de Fila de Reprodução - Seção 18
   */
  function renderizarViewFila(container) {
    const musicaAtual = window.SoundWavePlayer.obterMusicaAtual();

    container.innerHTML = `
      <div class="fade-in" style="max-width: 800px; margin: 0 auto;">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 1.8rem;"><i class="fa-solid fa-list-ol" style="color: var(--primary-light); margin-right: 8px;"></i> Fila de Reprodução</h1>
            <p class="text-muted">Gerencie a ordem das músicas e próximas faixas</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="SoundWaveApp.navegarPara('pesquisa')">
            <i class="fa-solid fa-plus"></i> Adicionar músicas
          </button>
        </div>

        <!-- Agora tocando -->
        ${musicaAtual ? `
          <div style="margin-bottom: 28px;">
            <span class="sidebar-nav-title" style="display: block; margin-bottom: 10px;">Agora Tocando</span>
            <div class="music-row active" style="background: rgba(168, 85, 247, 0.15); border: 1px solid var(--border-active);">
              <i class="fa-solid fa-volume-high" style="color: var(--primary-neon);"></i>
              <img class="music-row-thumb" src="${musicaAtual.imagem}" alt="${musicaAtual.titulo}">
              <div class="music-row-info">
                <div class="music-row-title">${musicaAtual.titulo}</div>
                <div class="music-row-artist">${musicaAtual.artista}</div>
              </div>
              <span class="music-row-duration">${musicaAtual.duracaoFormatada}</span>
            </div>
          </div>
        ` : ''}

        <!-- Próximas faixas -->
        <div>
          <span class="sidebar-nav-title" style="display: block; margin-bottom: 10px;">Próximas Músicas</span>
          <div class="music-table" id="queue-items-container">
            <!-- Renderizado dinamicamente pelo player -->
          </div>
        </div>
      </div>
    `;

    if (window.SoundWavePlayer) {
      window.SoundWavePlayer.atualizarInterfacePlayer();
    }
  }

  /**
   * 10. Tela de Artista - Seção 19
   */
  async function renderizarViewArtista(container, artistaId) {
    const idNum = Number(artistaId) || 1;
    const artista = await window.SoundWaveAPI.obterArtistaPorId(idNum);
    if (!artista) {
      container.innerHTML = `<p>Artista não encontrado.</p>`;
      return;
    }

    const musicasDoArtista = (await window.SoundWaveAPI.buscarMusicas()).filter(m => m.artistaId === idNum);
    const albunsDoArtista = (await window.SoundWaveAPI.buscarAlbuns()).filter(al => al.artistaId === idNum);
    const isSeguindo = appState.artistasSeguidos.includes(idNum);

    container.innerHTML = `
      <div class="fade-in">
        <div class="artist-hero-header" style="background-image: url('${artista.foto}');">
          <div class="artist-hero-content">
            <img class="artist-hero-avatar" src="${artista.foto}" alt="${artista.nome}">
            <div class="artist-hero-details">
              <span class="badge badge-purple" style="margin-bottom: 8px;">Artista Verificado</span>
              <h1>${artista.nome}</h1>
              <div class="artist-stats-row">
                <span>${artista.ouvintesMensais} ouvintes mensais</span>
                <span>•</span>
                <span id="artist-followers-count">${artista.seguidores} seguidores</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="SoundWaveApp.tocarTodasEmSequencia([${musicasDoArtista.map(m => m.id).join(',')}])">
                  <i class="fa-solid fa-play"></i> Tocar
                </button>
                <button class="btn ${isSeguindo ? 'btn-secondary' : 'btn-outline'}" id="btn-follow-artist" onclick="SoundWaveApp.toggleSeguirArtista(${artista.id})">
                  ${isSeguindo ? '<i class="fa-solid fa-check"></i> Seguindo' : '<i class="fa-solid fa-plus"></i> Seguir'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-tabs" id="artist-tabs">
          <button class="nav-tab-btn active" onclick="SoundWaveApp.trocarAbaArtista('musicas')">Músicas</button>
          <button class="nav-tab-btn" onclick="SoundWaveApp.trocarAbaArtista('albuns')">Álbuns</button>
          <button class="nav-tab-btn" onclick="SoundWaveApp.trocarAbaArtista('sobre')">Sobre</button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="artist-tab-content-musicas">
          <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Populares</h3>
          <div class="music-table">
            ${musicasDoArtista.map((m, idx) => `
              <div class="music-row">
                <span class="music-row-index">${idx + 1}</span>
                <span class="music-row-play-icon" onclick="SoundWavePlayer.tocarMusica(${m.id})"><i class="fa-solid fa-play"></i></span>
                <img class="music-row-thumb" src="${m.imagem}" alt="${m.titulo}">
                <div class="music-row-info" onclick="SoundWavePlayer.tocarMusica(${m.id})">
                  <div class="music-row-title">${m.titulo}</div>
                  <div class="music-row-artist">${m.reproducoes || '1.2B'} reproduções</div>
                </div>
                <div class="music-row-album">${m.album}</div>
                <span class="music-row-duration">${m.duracaoFormatada}</span>
                <div class="music-row-actions">
                  <button class="btn-icon btn-sm btn-heart ${window.SoundWaveFavoritos.isFavorito(m.id) ? 'favorited' : ''}" data-fav-song-id="${m.id}" onclick="SoundWaveFavoritos.toggleFavorito(${m.id})">
                    <i class="${window.SoundWaveFavoritos.isFavorito(m.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                  </button>
                  <button class="btn-icon btn-sm" onclick="SoundWaveApp.abrirMenuMusica(event, ${m.id})">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="artist-tab-content-albuns" style="display: none;">
          <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Discografia</h3>
          <div class="cards-grid">
            ${albunsDoArtista.map(al => `
              <div class="music-card">
                <div class="music-card-cover-wrapper">
                  <img class="music-card-cover" src="${al.capa}" alt="${al.titulo}">
                </div>
                <div class="music-card-title">${al.titulo}</div>
                <div class="music-card-artist">${al.ano} • Álbum</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="artist-tab-content-sobre" style="display: none;">
          <div class="card-glass" style="padding: 28px; max-width: 720px;">
            <h3 style="font-size: 1.4rem; margin-bottom: 14px;">Biografia</h3>
            <p style="color: #cbd5e1; line-height: 1.7; margin-bottom: 20px;">${artista.bio}</p>
            <div style="display: flex; gap: 24px;">
              <div>
                <span class="text-subtle">Gênero Principal</span>
                <div style="font-weight: 600; margin-top: 4px;">${artista.genero}</div>
              </div>
              <div>
                <span class="text-subtle">Ouvintes Mensais</span>
                <div style="font-weight: 600; margin-top: 4px;">${artista.ouvintesMensais}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function trocarAbaArtista(aba) {
    document.querySelectorAll("#artist-tabs .nav-tab-btn").forEach((b, idx) => {
      const isTarget = (aba === "musicas" && idx === 0) || (aba === "albuns" && idx === 1) || (aba === "sobre" && idx === 2);
      b.classList.toggle("active", isTarget);
    });

    document.getElementById("artist-tab-content-musicas").style.display = aba === "musicas" ? "block" : "none";
    document.getElementById("artist-tab-content-albuns").style.display = aba === "albuns" ? "block" : "none";
    document.getElementById("artist-tab-content-sobre").style.display = aba === "sobre" ? "block" : "none";
  }

  function toggleSeguirArtista(artistaId) {
    const id = Number(artistaId);
    const index = appState.artistasSeguidos.indexOf(id);

    if (index !== -1) {
      appState.artistasSeguidos.splice(index, 1);
      showToast("Você deixou de seguir este artista.");
    } else {
      appState.artistasSeguidos.push(id);
      showToast("Você agora está seguindo este artista!", "success");
    }

    salvarEstado();
    // Atualiza botão na página
    const btn = document.getElementById("btn-follow-artist");
    if (btn) {
      const isSeguindo = appState.artistasSeguidos.includes(id);
      btn.className = `btn ${isSeguindo ? 'btn-secondary' : 'btn-outline'}`;
      btn.innerHTML = isSeguindo ? '<i class="fa-solid fa-check"></i> Seguindo' : '<i class="fa-solid fa-plus"></i> Seguir';
    }
  }

  /**
   * 11. Tela de Notificações - Seção 20
   */
  async function renderizarViewNotificacoes(container) {
    const notificacoes = await window.SoundWaveAPI.obterNotificacoes();
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();

    container.innerHTML = `
      <div class="fade-in" style="max-width: 680px; margin: 0 auto;">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 1.8rem;"><i class="fa-solid fa-bell" style="color: var(--primary-light); margin-right: 8px;"></i> Notificações</h1>
            <p class="text-muted">Novos lançamentos dos seus artistas favoritos</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85rem; color: var(--text-muted);">Ativar</span>
            <input type="checkbox" id="toggle-notif-switch" ${usuario?.notificacoesAtivas ? 'checked' : ''} onchange="SoundWaveApp.alternarNotificacoes(this.checked)" style="accent-color: var(--primary-light); width: 18px; height: 18px;">
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${notificacoes.map(n => `
            <div class="card-glass" style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-left: 3px solid ${n.lida ? 'transparent' : 'var(--primary-light)'};">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary-neon); font-size: 1.1rem;">
                  <i class="fa-solid fa-music"></i>
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 0.95rem;">${n.titulo}</div>
                  <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">${n.mensagem}</div>
                </div>
              </div>
              <span class="badge" style="background: rgba(255, 255, 255, 0.06); color: var(--text-muted); font-size: 0.75rem;">${n.tempo}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function alternarNotificacoes(ativo) {
    window.SoundWaveAuth.atualizarUsuario({ notificacoesAtivas: ativo });
    showToast(ativo ? "Notificações ativadas!" : "Notificações silenciadas.");
  }

  /**
   * 12. Tela Premium - Seção 21
   */
  function renderizarViewPremium(container) {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    const jaPremium = !!usuario?.premium;

    container.innerHTML = `
      <div class="fade-in" style="max-width: 640px; margin: 0 auto; text-align: center;">
        <div class="premium-card-hero">
          <div style="width: 60px; height: 60px; margin: 0 auto 16px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #f59e0b;">
            <i class="fa-solid fa-crown"></i>
          </div>
          <h1 style="font-size: 2.2rem; margin-bottom: 8px;">SoundWave Premium</h1>
          <p class="text-muted" style="font-size: 1.05rem;">Mais músicas. Mais liberdade.</p>

          <div class="premium-benefits-list">
            <div class="premium-benefit-item">
              <i class="fa-solid fa-circle-check"></i>
              <span>Download ilimitado de músicas</span>
            </div>
            <div class="premium-benefit-item">
              <i class="fa-solid fa-circle-check"></i>
              <span>Reprodução offline em qualquer lugar</span>
            </div>
            <div class="premium-benefit-item">
              <i class="fa-solid fa-circle-check"></i>
              <span>Experiência 100% livre de anúncios</span>
            </div>
            <div class="premium-benefit-item">
              <i class="fa-solid fa-circle-check"></i>
              <span>Qualidade de áudio Ultra HD (320kbps)</span>
            </div>
          </div>

          ${jaPremium ? `
            <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 14px; border-radius: var(--radius-md); color: #10b981; font-weight: 600; margin-top: 24px;">
              <i class="fa-solid fa-circle-check"></i> Você já é um assinante Premium ativo!
            </div>
          ` : `
            <button class="btn btn-primary" style="font-size: 1.05rem; padding: 16px 36px; margin-top: 20px;" onclick="SoundWaveApp.ativarPlanoPremium()">
              <i class="fa-solid fa-bolt"></i> Assinar Premium
            </button>
          `}
        </div>
      </div>
    `;
  }

  async function ativarPlanoPremium() {
    const resultado = await window.SoundWaveAuth.assinarPremium();
    if (!resultado.sucesso) {
      showToast(resultado.mensagem, "error");
      return;
    }
    appState.usuario = resultado.usuario;
    appState.premium = true;
    const musicaAtual = window.SoundWavePlayer?.obterMusicaAtual();
    if (musicaAtual) window.SoundWavePlayer.configurarMusica(musicaAtual, false);
    showToast("Parabéns! Sua assinatura Premium foi ativada com sucesso!", "success");
    renderizarRota("premium");
  }

  /**
   * 13. Tela de Downloads Offline - Seção 22 & RN04
   */
  function renderizarViewDownloads(container) {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    const isPremium = !!usuario?.premium;
    const catalogo = window.DADOS_INICIAIS?.musicas || [];
    const baixadas = catalogo.filter(m => appState.downloadsOffline.includes(m.id));

    container.innerHTML = `
      <div class="fade-in">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 1.8rem;"><i class="fa-solid fa-download" style="color: var(--success); margin-right: 8px;"></i> Músicas Baixadas</h1>
            <p class="text-muted">Disponível para reprodução offline sem internet</p>
          </div>
          ${isPremium && baixadas.length > 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="SoundWaveApp.limparDownloads()">Limpar downloads</button>
          ` : ''}
        </div>

        ${!isPremium ? `
          <!-- RN04: Mensagem para usuário não premium -->
          <div class="card-glass" style="padding: 40px; text-align: center; max-width: 580px; margin: 0 auto;">
            <i class="fa-solid fa-lock" style="font-size: 3rem; color: #f59e0b; margin-bottom: 16px;"></i>
            <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Recurso exclusivo para assinantes</h3>
            <p class="text-muted" style="margin-bottom: 24px;">Assine o SoundWave Premium para baixar músicas e ouvir offline em qualquer lugar.</p>
            <button class="btn btn-primary" onclick="SoundWaveApp.navegarPara('premium')">
              <i class="fa-solid fa-crown"></i> Conhecer o Premium
            </button>
          </div>
        ` : `
          <!-- Usuário Premium: Lista de músicas baixadas -->
          <div class="music-table">
            ${baixadas.length > 0 ? baixadas.map((m, idx) => `
              <div class="music-row">
                <span class="music-row-index"><i class="fa-solid fa-circle-check" style="color: var(--success);"></i></span>
                <span class="music-row-play-icon" onclick="SoundWavePlayer.tocarMusica(${m.id})"><i class="fa-solid fa-play"></i></span>
                <img class="music-row-thumb" src="${m.imagem}" alt="${m.titulo}">
                <div class="music-row-info" onclick="SoundWavePlayer.tocarMusica(${m.id})">
                  <div class="music-row-title">${m.titulo}</div>
                  <div class="music-row-artist">${m.artista} • <span style="color: var(--success); font-weight: 500;">Baixado (${m.tamanhoMb} MB)</span></div>
                </div>
                <div class="music-row-album">${m.album}</div>
                <span class="music-row-duration">${m.duracaoFormatada}</span>
                <div class="music-row-actions">
                  <button class="btn-icon btn-sm" title="Remover download" onclick="SoundWaveApp.removerDownload(${m.id})">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 60px 20px;">
                <i class="fa-solid fa-cloud-arrow-down" style="font-size: 3.5rem; color: var(--text-subtle); margin-bottom: 16px;"></i>
                <h3>Nenhuma música baixada ainda</h3>
                <p class="text-muted" style="margin-top: 6px;">Como usuário Premium, você pode baixar qualquer música clicando no menu da faixa.</p>
                <button class="btn btn-secondary" style="margin-top: 20px;" onclick="SoundWaveApp.navegarPara('home')">Escolher músicas para baixar</button>
              </div>
            `}
          </div>
        `}
      </div>
    `;
  }

  function simularDownloadMusica(musicaId) {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    // RN04: Somente usuários Premium podem baixar músicas
    if (!usuario || !usuario.premium) {
      showToast("Recurso disponível apenas para usuários Premium.", "warning");
      navegarPara("premium");
      return;
    }

    const id = Number(musicaId);
    if (appState.downloadsOffline.includes(id)) {
      showToast("Esta música já foi baixada.", "info");
      return;
    }

    showToast("Baixando música para reprodução offline...");
    setTimeout(() => {
      appState.downloadsOffline.push(id);
      salvarEstado();
      showToast("Download concluído com sucesso!", "success");
      if (appState.rotaAtual === "downloads") {
        renderizarRota("downloads");
      }
    }, 800);
  }

  function removerDownload(musicaId) {
    appState.downloadsOffline = appState.downloadsOffline.filter(id => id !== Number(musicaId));
    salvarEstado();
    showToast("Download removido.");
    renderizarRota("downloads");
  }

  function limparDownloads() {
    appState.downloadsOffline = [];
    salvarEstado();
    showToast("Downloads limpos com sucesso.");
    renderizarRota("downloads");
  }

  /**
   * 14. Tela de Configurações - Seção 24 & 34 (Acessibilidade)
   */
  function renderizarViewConfiguracoes(container) {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    const altoContraste = document.body.classList.contains("high-contrast");

    container.innerHTML = `
      <div class="fade-in" style="max-width: 640px; margin: 0 auto;">
        <h1 style="font-size: 1.8rem; margin-bottom: 24px;"><i class="fa-solid fa-gear" style="color: var(--primary-light); margin-right: 8px;"></i> Configurações</h1>

        <div class="profile-menu-list">
          <div class="profile-menu-item" onclick="SoundWaveApp.navegarPara('editar-perfil')">
            <span><i class="fa-solid fa-user" style="margin-right: 12px; color: var(--text-muted);"></i> Dados da Conta</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>

          <div class="profile-menu-item" style="cursor: default;">
            <span><i class="fa-solid fa-circle-half-stroke" style="margin-right: 12px; color: var(--primary-neon);"></i> Modo de Alto Contraste (Acessibilidade)</span>
            <input type="checkbox" id="toggle-contrast" ${altoContraste ? 'checked' : ''} onchange="SoundWaveApp.alternarAltoContraste(this.checked)" style="accent-color: var(--primary-neon); width: 20px; height: 20px; cursor: pointer;">
          </div>

          <div class="profile-menu-item" onclick="SoundWaveApp.navegarPara('notificacoes')">
            <span><i class="fa-solid fa-bell" style="margin-right: 12px; color: var(--text-muted);"></i> Notificações</span>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>

          <div class="profile-menu-item" onclick="SoundWaveApp.abrirModalSobre()">
            <span><i class="fa-solid fa-circle-info" style="margin-right: 12px; color: var(--info);"></i> Sobre o SoundWave</span>
            <span class="text-subtle">v1.0.0</span>
          </div>

          <!-- Botão Sair Vermelho (Seção 24) -->
          <div style="margin-top: 24px;">
            <button class="btn btn-danger" style="width: 100%; padding: 14px;" onclick="SoundWaveApp.realizarLogout()">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function alternarAltoContraste(ativo) {
    document.body.classList.toggle("high-contrast", ativo);
    window.SoundWaveAuth.atualizarUsuario({ altoContraste: ativo });
    showToast(ativo ? "Modo Alto Contraste ativado" : "Modo Padrão restaurado");
  }

  function realizarLogout() {
    window.location.href = "logout.php";
  }

  /**
   * 15. Telas de Login e Cadastro (Seções 7 e 8)
   */
  function renderizarViewLogin(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-logo">
            <img src="assets/logo.svg" alt="SoundWave Logo">
          </div>
          <div class="auth-header">
            <h2 class="auth-title">Bem-vindo de volta!</h2>
            <p class="auth-subtitle">Entre para continuar ouvindo suas músicas.</p>
          </div>

          <form class="auth-form" onsubmit="SoundWaveApp.processarLogin(event)">
            <div class="form-group">
              <label for="login-email">E-mail</label>
              <input type="email" id="login-email" class="form-control" placeholder="seu@email.com" value="demo@soundwave.com" required>
            </div>
            <div class="form-group">
              <label for="login-password">Senha</label>
              <input type="password" id="login-password" class="form-control" placeholder="••••••" value="123456" required>
            </div>

            <div class="auth-options">
              <a href="javascript:void(0)" class="auth-forgot" onclick="SoundWaveApp.showToast('Link de recuperação enviado para o seu e-mail!')">Esqueceu sua senha?</a>
            </div>

            <button type="submit" class="btn btn-primary auth-submit-btn">Entrar</button>

            <div class="auth-divider"><span>ou</span></div>

            <button type="button" class="btn-google" onclick="SoundWaveApp.processarLoginGoogle()">
              <i class="fa-brands fa-google"></i> Entrar com Google
            </button>

            <div class="auth-footer">
              Não tem uma conta? <a href="#/cadastro">Cadastre-se</a>
            </div>

            <div class="auth-demo-hint">
              <strong>Conta de Demonstração para Testes:</strong><br>
              E-mail: <code>demo@soundwave.com</code> | Senha: <code>123456</code>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function renderizarViewCadastro(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-logo">
            <img src="assets/logo.svg" alt="SoundWave Logo">
          </div>
          <div class="auth-header">
            <h2 class="auth-title">Criar conta</h2>
            <p class="auth-subtitle">É rápido e fácil. Vamos começar!</p>
          </div>

          <form class="auth-form" onsubmit="SoundWaveApp.processarCadastro(event)">
            <div class="form-group">
              <label for="reg-name">Nome completo</label>
              <input type="text" id="reg-name" class="form-control" placeholder="Ex: Maria Silva" required>
            </div>
            <div class="form-group">
              <label for="reg-email">E-mail</label>
              <input type="email" id="reg-email" class="form-control" placeholder="maria@email.com" required>
            </div>
            <div class="form-group">
              <label for="reg-pass">Senha</label>
              <input type="password" id="reg-pass" class="form-control" placeholder="Mínimo 6 caracteres" required>
            </div>
            <div class="form-group">
              <label for="reg-confirm-pass">Confirmar senha</label>
              <input type="password" id="reg-confirm-pass" class="form-control" placeholder="Confirme sua senha" required>
            </div>

            <button type="submit" class="btn btn-primary auth-submit-btn">Cadastre-se</button>

            <div class="auth-footer">
              Já tem uma conta? <a href="#/login">Entrar</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function processarLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;

    const res = window.SoundWaveAuth.login(email, pass);
    if (res.sucesso) {
      showToast(res.mensagem, "success");
      appState.usuario = res.usuario;
      navegarPara("home");
    } else {
      showToast(res.mensagem, "error");
    }
  }

  function processarLoginGoogle() {
    const res = window.SoundWaveAuth.loginGoogle();
    showToast(res.mensagem, "success");
    appState.usuario = res.usuario;
    navegarPara("home");
  }

  function processarCadastro(event) {
    event.preventDefault();
    const nome = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const pass = document.getElementById("reg-pass").value;
    const passConf = document.getElementById("reg-confirm-pass").value;

    const res = window.SoundWaveAuth.cadastrar(nome, email, pass, passConf);
    if (res.sucesso) {
      showToast(res.mensagem, "success");
      appState.usuario = res.usuario;
      navegarPara("home");
    } else {
      showToast(res.mensagem, "error");
    }
  }

  /* ==========================================================================
     COMPONENTES REUTILIZÁVEIS E HELPERS
     ========================================================================== */

  function renderizarCardMusica(musica) {
    const isFav = window.SoundWaveFavoritos.isFavorito(musica.id);
    return `
      <div class="music-card" onclick="SoundWavePlayer.tocarMusica(${musica.id})">
        <div class="music-card-cover-wrapper">
          <img class="music-card-cover" src="${musica.imagem}" alt="${musica.titulo}">
          <button class="music-card-play-btn" aria-label="Tocar"><i class="fa-solid fa-play"></i></button>
        </div>
        <div class="music-card-title">${musica.titulo}</div>
        <div class="music-card-artist">${musica.artista}</div>
        <div class="music-card-actions" onclick="event.stopPropagation()">
          <button class="btn-icon btn-sm btn-heart ${isFav ? 'favorited' : ''}" data-fav-song-id="${musica.id}" onclick="SoundWaveFavoritos.toggleFavorito(${musica.id})">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
          <button class="btn-icon btn-sm" onclick="SoundWaveApp.abrirMenuMusica(event, ${musica.id})">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    `;
  }

  function abrirPlaylist(playlistId) {
    navegarPara("playlist-detalhe", { id: playlistId });
  }

  function tocarTodasEmSequencia(ids) {
    if (!ids || ids.length === 0) return;
    const catalogo = window.DADOS_INICIAIS?.musicas || [];
    const musicas = ids.map(id => catalogo.find(m => m.id === id)).filter(Boolean);

    if (musicas.length > 0) {
      // Configura a fila
      ids.forEach(id => {
        const m = catalogo.find(item => item.id === id);
        if (m) window.SoundWavePlayer.adicionarAFila(m);
      });
      window.SoundWavePlayer.tocarMusica(musicas[0]);
      showToast(`Iniciando reprodução de ${musicas.length} faixas!`);
    }
  }

  /**
   * Sistema de Toasts (Seção 33)
   */
  function showToast(mensagem, tipo = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;

    let icon = "fa-info-circle";
    if (tipo === "success") icon = "fa-circle-check";
    if (tipo === "error") icon = "fa-triangle-exclamation";
    if (tipo === "warning") icon = "fa-circle-exclamation";

    toast.innerHTML = `
      <i class="fa-solid ${icon} toast-icon"></i>
      <span class="toast-message">${mensagem}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /**
   * Menu de opções da música (3 pontos)
   */
  function abrirMenuMusica(event, musicaId) {
    event.stopPropagation();
    const musica = (window.DADOS_INICIAIS?.musicas || []).find(m => m.id === Number(musicaId));
    if (!musica) return;

    const modal = document.getElementById("generic-modal");
    const title = document.getElementById("generic-modal-title");
    const body = document.getElementById("generic-modal-body");

    title.textContent = musica.titulo;
    body.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <img src="${musica.imagem}" style="width: 52px; height: 52px; border-radius: var(--radius-xs);">
        <div>
          <div style="font-weight: 700;">${musica.titulo}</div>
          <div class="text-muted" style="font-size: 0.85rem;">${musica.artista}</div>
        </div>
      </div>
      <div class="profile-menu-list">
        <div class="profile-menu-item" onclick="SoundWavePlayer.adicionarAFila(window.DADOS_INICIAIS.musicas.find(m => m.id === ${musica.id})); SoundWaveApp.fecharModal();">
          <span><i class="fa-solid fa-list" style="margin-right: 12px;"></i> Adicionar à Fila</span>
        </div>
        <div class="profile-menu-item" onclick="SoundWaveApp.abrirModalEscolherPlaylist(${musica.id})">
          <span><i class="fa-solid fa-folder-plus" style="margin-right: 12px;"></i> Adicionar à Playlist</span>
        </div>
        <div class="profile-menu-item" onclick="SoundWaveApp.abrirModalCompartilhar(${musica.id})">
          <span><i class="fa-solid fa-share-nodes" style="margin-right: 12px;"></i> Compartilhar</span>
        </div>
        <div class="profile-menu-item" onclick="SoundWaveApp.simularDownloadMusica(${musica.id}); SoundWaveApp.fecharModal();">
          <span><i class="fa-solid fa-download" style="margin-right: 12px; color: var(--success);"></i> Baixar para ouvir offline</span>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  /**
   * Modal de Compartilhamento (Seção 23)
   */
  function abrirModalCompartilhar(musicaId) {
    const musica = (window.DADOS_INICIAIS?.musicas || []).find(m => m.id === Number(musicaId)) || window.SoundWavePlayer.obterMusicaAtual();
    if (!musica) return;

    const modal = document.getElementById("generic-modal");
    const title = document.getElementById("generic-modal-title");
    const body = document.getElementById("generic-modal-body");

    const linkCompartilhamento = `${window.location.origin}/#/home?play=${musica.id}`;

    title.textContent = "Compartilhar Música";
    body.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${musica.imagem}" style="width: 100px; height: 100px; border-radius: var(--radius-md); margin: 0 auto 12px; box-shadow: var(--shadow-md);">
        <h3>${musica.titulo}</h3>
        <p class="text-muted">${musica.artista}</p>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <input type="text" class="form-control" value="${linkCompartilhamento}" readonly id="share-link-input">
        <button class="btn btn-primary" onclick="SoundWaveApp.copiarLink()">
          <i class="fa-solid fa-copy"></i> Copiar
        </button>
      </div>

      <div style="display: flex; justify-content: space-around; gap: 12px;">
        <button class="btn-icon" style="width: 50px; height: 50px; color: #25d366; font-size: 1.4rem;" title="WhatsApp" onclick="window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('Ouça agora: ${musica.titulo} no SoundWave! ' + window.location.href))">
          <i class="fa-brands fa-whatsapp"></i>
        </button>
        <button class="btn-icon" style="width: 50px; height: 50px; color: #e1306c; font-size: 1.4rem;" title="Instagram" onclick="SoundWaveApp.copiarLink(); SoundWaveApp.showToast('Link copiado para compartilhar nos Stories!')">
          <i class="fa-brands fa-instagram"></i>
        </button>
        <button class="btn-icon" style="width: 50px; height: 50px; color: #1da1f2; font-size: 1.4rem;" title="Twitter / X" onclick="window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Ouvindo ${musica.titulo} no SoundWave 🎧'))">
          <i class="fa-brands fa-x-twitter"></i>
        </button>
      </div>
    `;

    modal.classList.add("active");
  }

  function copiarLink() {
    const input = document.getElementById("share-link-input");
    if (input) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value)
          .then(() => showToast("Link copiado para a área de transferência!", "success"))
          .catch(() => showToast("Erro ao copiar link automaticamente.", "error"));
      } else {
        input.select();
        document.execCommand("copy");
        showToast("Link copiado!", "success");
      }
    }
  }

  /**
   * Modal para Criar Playlist (Seção 13)
   */
  function abrirModalCriarPlaylist() {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    // RN02: Somente usuários cadastrados podem criar playlists
    if (!usuario) {
      showToast("Você precisa estar logado para realizar esta ação.", "warning");
      navegarPara("login");
      return;
    }

    const modal = document.getElementById("generic-modal");
    const title = document.getElementById("generic-modal-title");
    const body = document.getElementById("generic-modal-body");

    title.textContent = "Criar nova playlist";
    body.innerHTML = `
      <form onsubmit="SoundWaveApp.salvarNovaPlaylist(event)">
        <div class="form-group">
          <label for="new-pl-name">Nome da Playlist *</label>
          <input type="text" id="new-pl-name" class="form-control" placeholder="Minha playlist incrível" required>
        </div>
        <div class="form-group">
          <label for="new-pl-desc">Descrição (opcional)</label>
          <input type="text" id="new-pl-desc" class="form-control" placeholder="Uma breve descrição...">
        </div>
        <div class="form-group">
          <label for="new-pl-img">URL da Capa (opcional)</label>
          <input type="url" id="new-pl-img" class="form-control" placeholder="https://...">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="SoundWaveApp.fecharModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Criar</button>
        </div>
      </form>
    `;

    modal.classList.add("active");
  }

  function salvarNovaPlaylist(event) {
    event.preventDefault();
    const nome = document.getElementById("new-pl-name").value;
    const desc = document.getElementById("new-pl-desc").value;
    const img = document.getElementById("new-pl-img").value;

    const res = window.SoundWavePlaylists.criarPlaylist(nome, desc, img);
    if (res.sucesso) {
      showToast(res.mensagem, "success");
      fecharModal();
      if (appState.rotaAtual === "playlists") {
        renderizarRota("playlists");
      }
    } else {
      showToast(res.mensagem, "error");
    }
  }

  /**
   * Modal para Adicionar Música a uma Playlist
   */
  function abrirModalEscolherPlaylist(musicaId) {
    const playlists = window.SoundWavePlaylists.obterTodas();
    const modal = document.getElementById("generic-modal");
    const title = document.getElementById("generic-modal-title");
    const body = document.getElementById("generic-modal-body");

    title.textContent = "Adicionar à playlist";
    body.innerHTML = `
      <div class="profile-menu-list">
        ${playlists.map(p => `
          <div class="profile-menu-item" onclick="SoundWaveApp.confirmarAdicaoMusicaPlaylist('${p.id}', ${musicaId})">
            <span><i class="fa-solid fa-music" style="margin-right: 12px; color: var(--primary-light);"></i> ${p.nome}</span>
            <span class="text-subtle">${p.musicasIds ? p.musicasIds.length : 0} músicas</span>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add("active");
  }

  function confirmarAdicaoMusicaPlaylist(playlistId, musicaId) {
    const res = window.SoundWavePlaylists.adicionarMusica(playlistId, musicaId);
    showToast(res.mensagem, res.sucesso ? "success" : "info");
    fecharModal();
  }

  function removerMusicaDePlaylist(playlistId, musicaId) {
    const res = window.SoundWavePlaylists.removerMusica(playlistId, musicaId);
    showToast(res.mensagem);
    renderizarViewPlaylistDetalhe(document.getElementById("main-view-container"), playlistId);
  }

  function abrirModalSobre() {
    const modal = document.getElementById("generic-modal");
    const title = document.getElementById("generic-modal-title");
    const body = document.getElementById("generic-modal-body");

    title.textContent = "Sobre o SoundWave";
    body.innerHTML = `
      <div style="text-align: center;">
        <img src="assets/logo.svg" style="height: 48px; margin: 0 auto 16px;">
        <p style="margin-bottom: 12px; font-weight: 600;">SoundWave Music Streaming Platform</p>
        <p class="text-muted" style="font-size: 0.9rem; line-height: 1.6; margin-bottom: 20px;">
          Projeto acadêmico de Desenvolvimento Mobile e Web. Desenvolvido com HTML5 semântico, CSS3 moderno com variáveis e design responsivo, e JavaScript Vanilla modular.
        </p>
        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-muted);">
          Versão 1.0.0 • Autor: Paulo Bertoldi
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  function abrirModalAjuda() {
    const modal = document.getElementById("generic-modal");
    const title = document.getElementById("generic-modal-title");
    const body = document.getElementById("generic-modal-body");

    title.textContent = "Central de Ajuda";
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <strong style="color: var(--primary-neon);">Como ouvir offline?</strong>
          <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">Assine o SoundWave Premium e clique no menu de 3 pontos de qualquer música para baixar.</p>
        </div>
        <div>
          <strong style="color: var(--primary-neon);">Como criar uma playlist?</strong>
          <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">Vá até a aba "Playlists" ou "Sua Biblioteca" e clique no botão "+ Criar playlist".</p>
        </div>
        <div>
          <strong style="color: var(--primary-neon);">Posso usar atalhos do teclado?</strong>
          <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">Pressione a tecla Espaço para pausar/retomar a música a qualquer momento.</p>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  function fecharModal() {
    const modal = document.getElementById("generic-modal");
    if (modal) modal.classList.remove("active");
  }

  /**
   * Listeners globais
   */
  function configurarEventosGlobais() {
    document.addEventListener("soundwave:favoritos-alterados", (event) => {
      appState.favoritos = event.detail.ids;
      if (appState.rotaAtual === "favoritos") renderizarRota("favoritos");
    });
    // Tecla Espaço para Play/Pause
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        window.SoundWavePlayer.togglePlayPause();
      }
    });

    // Abrir/Fechar Full Player Modal
    const miniPlayer = document.getElementById("mini-player");
    const fullPlayerModal = document.getElementById("full-player-modal");
    const btnCloseFullPlayer = document.getElementById("btn-close-full-player");

    if (miniPlayer) {
      miniPlayer.addEventListener("click", (e) => {
        // Se não clicou nos botões de controle dentro do mini player
        if (!e.target.closest(".btn-mini-control")) {
          if (fullPlayerModal) fullPlayerModal.classList.add("active");
        }
      });
    }

    if (btnCloseFullPlayer) {
      btnCloseFullPlayer.addEventListener("click", () => {
        if (fullPlayerModal) fullPlayerModal.classList.remove("active");
      });
    }

    // Modal genérico fechar ao clicar no overlay
    const modal = document.getElementById("generic-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) fecharModal();
      });
    }
  }

  return {
    inicializar,
    navegarPara,
    renderizarRota,
    showToast,
    abrirMenuMusica,
    abrirModalCompartilhar,
    copiarLink,
    abrirModalCriarPlaylist,
    salvarNovaPlaylist,
    abrirModalEscolherPlaylist,
    confirmarAdicaoMusicaPlaylist,
    removerMusicaDePlaylist,
    abrirModalSobre,
    abrirModalAjuda,
    fecharModal,
    abrirPlaylist,
    tocarTodasEmSequencia,
    trocarAbaArtista,
    toggleSeguirArtista,
    obterArtistasSeguidos: () => appState.artistasSeguidos,
    alternarNotificacoes,
    ativarPlanoPremium,
    simularDownloadMusica,
    removerDownload,
    limparDownloads,
    alternarAltoContraste,
    realizarLogout,
    processarLogin,
    processarLoginGoogle,
    processarCadastro
  };
})();

// Inicializa a aplicação ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  window.SoundWaveApp = SoundWaveApp;
  SoundWavePlayer.inicializar();
  SoundWaveApp.inicializar();
});
