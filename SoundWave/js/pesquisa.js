/**
 * SoundWave - Motor de Busca Dinâmico (pesquisa.js)
 * Realiza busca instantânea em músicas, artistas e álbuns, além de filtros da seção Em Alta.
 */

const SoundWavePesquisa = (() => {
  let termoAtual = "";
  let filtroAtual = "todos"; // 'todos', 'musicas', 'artistas', 'albuns'

  /**
   * Executa a busca através da SoundWaveAPI
   */
  async function executarBusca(termo, filtro = "todos") {
    termoAtual = termo.trim();
    filtroAtual = filtro;

    if (!termoAtual) {
      renderizarSecaoEmAlta();
      return;
    }

    const containerResultados = document.getElementById("search-results-content");
    if (!containerResultados) return;

    containerResultados.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted);"><i class="fa-solid fa-circle-notch fa-spin"></i> Buscando...</div>`;

    const [musicas, artistas, albuns] = await Promise.all([
      window.SoundWaveAPI.buscarMusicas(termoAtual),
      window.SoundWaveAPI.buscarArtistas(termoAtual),
      window.SoundWaveAPI.buscarAlbuns(termoAtual)
    ]);

    const totalEncontrado = musicas.length + artistas.length + albuns.length;

    if (totalEncontrado === 0) {
      containerResultados.innerHTML = `
        <div style="text-align: center; padding: 48px 20px;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--text-subtle); margin-bottom: 16px;"></i>
          <h3>Nenhum resultado encontrado</h3>
          <p class="text-muted" style="margin-top: 6px;">Não encontramos nada para "${termoAtual}". Verifique a ortografia ou tente outro termo.</p>
        </div>
      `;
      return;
    }

    let html = "";

    // 1. Músicas
    if ((filtroAtual === "todos" || filtroAtual === "musicas") && musicas.length > 0) {
      html += `
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">Músicas</h3>
            <span class="text-subtle">${musicas.length} encontradas</span>
          </div>
          <div class="music-table">
            ${musicas.map((m, idx) => `
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
                  <button class="btn-icon btn-sm" title="Mais opções" onclick="SoundWaveApp.abrirMenuMusica(event, ${m.id})">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Artistas
    if ((filtroAtual === "todos" || filtroAtual === "artistas") && artistas.length > 0) {
      html += `
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">Artistas</h3>
          </div>
          <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
            ${artistas.map(a => `
              <div class="artist-card" onclick="SoundWaveApp.navegarPara('artista', { id: ${a.id} })">
                <img class="artist-avatar" src="${a.foto}" alt="${a.nome}">
                <div class="artist-name">${a.nome}</div>
                <div class="artist-role">${a.seguidores} seguidores</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Álbuns
    if ((filtroAtual === "todos" || filtroAtual === "albuns") && albuns.length > 0) {
      html += `
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">Álbuns</h3>
          </div>
          <div class="cards-grid">
            ${albuns.map(al => `
              <div class="music-card" onclick="SoundWaveApp.navegarPara('artista', { id: ${al.artistaId} })">
                <div class="music-card-cover-wrapper">
                  <img class="music-card-cover" src="${al.capa}" alt="${al.titulo}">
                </div>
                <div class="music-card-title">${al.titulo}</div>
                <div class="music-card-artist">${al.artista} • ${al.ano}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    containerResultados.innerHTML = html;
  }

  /**
   * Renderiza a seção "Em Alta" quando a busca está vazia
   */
  async function renderizarSecaoEmAlta() {
    const container = document.getElementById("search-results-content");
    if (!container) return;

    const [emAlta, playlists] = await Promise.all([
      window.SoundWaveAPI.buscarEmAlta(),
      window.SoundWaveAPI.obterPlaylistsDestaque()
    ]);

    container.innerHTML = `
      <div class="section-container">
        <div class="section-header">
          <h3 class="section-title">Em alta</h3>
          <span class="text-subtle">Mais ouvidas agora</span>
        </div>
        <div class="cards-grid">
          ${emAlta.map(m => `
            <div class="music-card" onclick="SoundWavePlayer.tocarMusica(${m.id})">
              <div class="music-card-cover-wrapper">
                <img class="music-card-cover" src="${m.imagem}" alt="${m.titulo}">
                <button class="music-card-play-btn" aria-label="Tocar"><i class="fa-solid fa-play"></i></button>
              </div>
              <div class="music-card-title">${m.titulo}</div>
              <div class="music-card-artist">${m.artista}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section-container">
        <div class="section-header">
          <h3 class="section-title">Playlists populares</h3>
        </div>
        <div class="cards-scroll-row">
          ${playlists.map(pl => `
            <div class="playlist-horizontal-card" onclick="SoundWaveApp.abrirPlaylist('${pl.id}')">
              <img class="playlist-thumb" src="${pl.imagem}" alt="${pl.nome}">
              <div class="playlist-info">
                <div class="playlist-name">${pl.nome}</div>
                <div class="playlist-tracks-count">${pl.musicasIds ? pl.musicasIds.length : 0} músicas</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return {
    executarBusca,
    renderizarSecaoEmAlta
  };
})();

window.SoundWavePesquisa = SoundWavePesquisa;
