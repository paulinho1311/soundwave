/**
 * Camada de músicas. A fonte é definida pelo plano da sessão:
 * Free = iTunes (somente preview); Premium = Jamendo (áudio completo).
 */
const SoundWaveAPI = (() => {
  const ITUNES_URL = "https://itunes.apple.com/search";
  const JAMENDO_URL = "https://api.jamendo.com/v3.0/tracks/";
  let cacheMusicas = [];

  const simularDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
  const usuarioEhPremium = () => Boolean(window.SoundWaveAuth?.obterUsuarioAtual()?.premium);
  const clientIdJamendo = () => window.SOUNDWAVE_CONFIG?.jamendoClientId || "";

  function adicionarAoCache(musicas) {
    musicas.forEach(musica => {
      const indice = cacheMusicas.findIndex(item => String(item.id) === String(musica.id));
      if (indice === -1) cacheMusicas.push(musica); else cacheMusicas[indice] = musica;
    });
    return musicas;
  }

  function formatarDuracao(segundos) {
    const total = Math.max(0, Number(segundos) || 0);
    return `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, "0")}`;
  }

  function mapearTrackDoITunes(track) {
    return {
      id: track.trackId,
      titulo: track.trackName || "Desconhecido",
      artista: track.artistName || "Desconhecido",
      album: track.collectionName || "Desconhecido",
      imagem: track.artworkUrl100?.replace("100x100", "400x400") || "https://via.placeholder.com/400",
      // Nunca trate a prévia como áudio completo: isso impede liberação indevida.
      previewUrl: track.previewUrl,
      audioUrl: null,
      duracao: 30,
      duracaoFormatada: "0:30",
      genero: track.primaryGenreName || "Pop",
      ano: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
      fonte: "itunes",
      possuiAudioCompleto: false
    };
  }

  function mapearTrackDoJamendo(track) {
    const duracao = Number(track.duration) || 0;
    return {
      id: track.id,
      titulo: track.name || "Faixa sem título",
      artista: track.artist_name || "Artista desconhecido",
      album: track.album_name || "Single",
      imagem: track.image || track.album_image || "https://via.placeholder.com/400",
      previewUrl: null,
      audioUrl: track.audio,
      duracao,
      duracaoFormatada: formatarDuracao(duracao),
      genero: track.musicinfo?.tags?.genres?.[0] || "Independente",
      ano: track.releasedate ? new Date(track.releasedate).getFullYear() : null,
      fonte: "jamendo",
      possuiAudioCompleto: true
    };
  }

  async function buscarNoITunes(termo, limite = 25) {
    const url = `${ITUNES_URL}?term=${encodeURIComponent(termo)}&media=music&entity=song&country=BR&limit=${limite}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("A busca no iTunes não respondeu.");
    const dados = await response.json();
    return adicionarAoCache((dados.results || []).filter(track => track.previewUrl).map(mapearTrackDoITunes));
  }

  async function buscarNoJamendo(termo, limite = 25) {
    const clientId = clientIdJamendo();
    if (!clientId) throw new Error("Jamendo não configurado. Informe JAMENDO_CLIENT_ID no servidor.");
    const parametros = new URLSearchParams({
      client_id: clientId,
      format: "json",
      audioformat: "mp31",
      limit: String(limite),
      search: termo,
      include: "musicinfo"
    });
    const response = await fetch(`${JAMENDO_URL}?${parametros.toString()}`);
    if (!response.ok) throw new Error("A busca no Jamendo não respondeu.");
    const dados = await response.json();
    if (dados.headers?.status !== "success") throw new Error("O Jamendo recusou a solicitação.");
    return adicionarAoCache((dados.results || []).filter(track => track.audio).map(mapearTrackDoJamendo));
  }

  function filtrarCatalogoLocal(termo) {
    const catalogo = window.DADOS_INICIAIS?.musicas || [];
    if (!termo.trim()) return catalogo;
    const termos = termo.toLowerCase().trim().split(/\s+/);
    const encontrados = catalogo.filter(m => {
      const texto = [m.titulo, m.artista, m.album, m.genero].filter(Boolean).join(" ").toLowerCase();
      return termos.some(item => texto.includes(item));
    });
    // Termos internos como "pop hits" ou "new release" não devem esvaziar a Home offline.
    return encontrados.length ? encontrados : catalogo;
  }

  async function buscarMusicas(termo = "", limite = 25) {
    await simularDelay();
    const busca = termo.trim() || "pop";
    try {
      const usarJamendo = usuarioEhPremium() && Boolean(clientIdJamendo());
      // Sem client_id do Jamendo, mantém o catálogo visível via iTunes.
      // Assim que a chave for configurada, Premium passa automaticamente ao Jamendo.
      const musicas = usarJamendo
        ? await buscarNoJamendo(busca, limite)
        : await buscarNoITunes(busca, limite);
      if (musicas.length) return musicas;
    } catch (erro) {
      console.warn("Falha na fonte de músicas selecionada:", erro.message);
    }
    // Fallback offline mantém o app funcional; o player continua aplicando a regra Free.
    return filtrarCatalogoLocal(termo);
  }

  async function obterMusicaPorId(id) { await simularDelay(); return obterMusicaPorIdSync(id); }
  function obterMusicaPorIdSync(id) {
    return cacheMusicas.find(m => String(m.id) === String(id))
      || (window.DADOS_INICIAIS?.musicas || []).find(m => String(m.id) === String(id)) || null;
  }
  function obterMusicasEmCache() { return [...cacheMusicas]; }

  async function buscarArtistas(termo = "") {
    await simularDelay();
    const artistas = window.DADOS_INICIAIS?.artistas || [];
    if (!termo.trim()) return artistas;
    const busca = termo.toLowerCase().trim();
    return artistas.filter(a => a.nome.toLowerCase().includes(busca) || a.genero.toLowerCase().includes(busca));
  }
  async function obterArtistaPorId(id) { return (window.DADOS_INICIAIS?.artistas || []).find(a => a.id === Number(id)) || null; }
  async function buscarAlbuns(termo = "") {
    const albuns = window.DADOS_INICIAIS?.albuns || [];
    if (!termo.trim()) return albuns;
    const busca = termo.toLowerCase().trim();
    return albuns.filter(a => a.titulo.toLowerCase().includes(busca) || a.artista.toLowerCase().includes(busca));
  }
  async function obterAlbumPorId(id) { return (window.DADOS_INICIAIS?.albuns || []).find(a => a.id === Number(id)) || null; }
  async function buscarRecomendacoes() { return buscarMusicas("pop", 6); }
  async function buscarLancamentos() { return buscarMusicas("music", 6); }
  async function buscarEmAlta() { return buscarMusicas("top", 6); }
  async function obterPlaylistsDestaque() { return window.DADOS_INICIAIS?.playlistsPadrao || []; }
  async function obterNotificacoes() { return window.DADOS_INICIAIS?.notificacoes || []; }

  return { buscarMusicas, obterMusicaPorId, obterMusicaPorIdSync, obterMusicasEmCache, buscarArtistas, obterArtistaPorId, buscarAlbuns, obterAlbumPorId, buscarRecomendacoes, buscarLancamentos, buscarEmAlta, obterPlaylistsDestaque, obterNotificacoes, usuarioEhPremium };
})();
window.SoundWaveAPI = SoundWaveAPI;
