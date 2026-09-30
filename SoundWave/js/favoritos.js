/**
 * Favoritos do usuário autenticado. O cache local é apenas um espelho para a
 * interface responder imediatamente; a fonte de verdade é a API PHP/MySQL.
 */
const SoundWaveFavoritos = (() => {
  let ids = new Set();
  let carregado = false;
  let sincronizando = false;

  function chaveCache() {
    return `soundwave_favoritos_${window.USUARIO_LOGADO?.id || "anonimo"}`;
  }
  function chaveMusicasCache() {
    return `soundwave_favoritos_musicas_${window.USUARIO_LOGADO?.id || "anonimo"}`;
  }
  function lerCache() {
    try { ids = new Set((JSON.parse(localStorage.getItem(chaveCache())) || []).map(String)); }
    catch { ids = new Set(); }
  }
  function salvarCache() { localStorage.setItem(chaveCache(), JSON.stringify([...ids])); }
  function lerMusicasCache() {
    try { return JSON.parse(localStorage.getItem(chaveMusicasCache())) || []; }
    catch { return []; }
  }
  function salvarMusicasCache(musicas) { localStorage.setItem(chaveMusicasCache(), JSON.stringify(musicas)); }
  function obterMusicaConhecida(id) {
    return window.SoundWaveAPI?.obterMusicaPorIdSync(id)
      || window.SoundWavePlayer?.obterMusicaAtual?.()
      || (window.DADOS_INICIAIS?.musicas || []).find(m => String(m.id) === String(id));
  }
  function salvarMetadadosMusica(id) {
    const musica = obterMusicaConhecida(id);
    if (!musica || String(musica.id) !== String(id)) return;
    const musicas = lerMusicasCache().filter(item => String(item.id) !== String(id));
    musicas.push(musica);
    salvarMusicasCache(musicas);
  }
  function removerMetadadosMusica(id) {
    salvarMusicasCache(lerMusicasCache().filter(item => String(item.id) !== String(id)));
  }
  function normalizarId(id) { return id === null || id === undefined || id === "" ? null : String(id); }

  function obterFavoritosIds() {
    if (!carregado) lerCache();
    return [...ids].map(id => Number.isNaN(Number(id)) ? id : Number(id));
  }
  function obterMusicasFavoritas() {
    const favoritos = new Set(obterFavoritosIds().map(String));
    const fontes = [
      ...(window.DADOS_INICIAIS?.musicas || []),
      ...(window.SoundWaveAPI?.obterMusicasEmCache?.() || []),
      ...lerMusicasCache()
    ];
    const porId = new Map();
    fontes.forEach(musica => porId.set(String(musica.id), musica));
    return [...favoritos].map(id => porId.get(id)).filter(Boolean);
  }
  function isFavorito(musicaId) {
    if (!carregado) lerCache();
    const id = normalizarId(musicaId);
    return id !== null && ids.has(id);
  }
  function atualizarBotoesCoracao(musicaId, favoritado) {
    const id = normalizarId(musicaId);
    if (id === null) return;
    document.querySelectorAll(`[data-fav-song-id="${id}"]`).forEach(btn => {
      btn.classList.toggle("favorited", favoritado);
      btn.setAttribute("aria-label", favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos");
      btn.innerHTML = favoritado ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
    });
  }
  function notificarAlteracao() {
    document.dispatchEvent(new CustomEvent("soundwave:favoritos-alterados", { detail: { ids: obterFavoritosIds() } }));
  }
  function atualizarTodosBotoes() {
    document.querySelectorAll("[data-fav-song-id]").forEach(btn => {
      if (btn.dataset.favSongId) atualizarBotoesCoracao(btn.dataset.favSongId, isFavorito(btn.dataset.favSongId));
    });
  }

  async function inicializar() {
    lerCache();
    atualizarTodosBotoes();
    if (!window.USUARIO_LOGADO?.id || sincronizando) return;
    sincronizando = true;
    try {
      const response = await fetch("api/favoritos.php", { credentials: "same-origin" });
      const resultado = await response.json();
      if (!response.ok || !resultado.sucesso) throw new Error(resultado?.mensagem || "Falha ao carregar favoritos");
      ids = new Set((resultado.favoritos || []).map(String));
      salvarCache();
      atualizarTodosBotoes();
      notificarAlteracao();
    } catch (erro) {
      console.warn("Não foi possível sincronizar os favoritos:", erro);
    } finally {
      carregado = true;
      sincronizando = false;
    }
  }

  async function toggleFavorito(musicaId) {
    const id = normalizarId(musicaId);
    if (id === null) return { favoritado: false, mensagem: "Música inválida." };
    const eraFavorito = ids.has(id);
    eraFavorito ? ids.delete(id) : ids.add(id);
    if (eraFavorito) removerMetadadosMusica(id); else salvarMetadadosMusica(id);
    salvarCache();
    atualizarBotoesCoracao(id, !eraFavorito);
    notificarAlteracao();

    if (!window.USUARIO_LOGADO?.id) return { favoritado: !eraFavorito, mensagem: "Favorito salvo neste dispositivo." };
    try {
      const response = await fetch("api/favoritos.php", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ musica_id: id, favoritar: !eraFavorito })
      });
      const resultado = await response.json().catch(() => null);
      if (!response.ok || !resultado?.sucesso) throw new Error(resultado?.mensagem || "Falha ao salvar favorito");
      resultado.favoritado ? ids.add(id) : ids.delete(id);
      if (resultado.favoritado) salvarMetadadosMusica(id); else removerMetadadosMusica(id);
      salvarCache(); atualizarBotoesCoracao(id, resultado.favoritado); notificarAlteracao();
      window.SoundWaveApp?.showToast(resultado.mensagem);
      return resultado;
    } catch (erro) {
      eraFavorito ? ids.add(id) : ids.delete(id);
      if (eraFavorito) salvarMetadadosMusica(id); else removerMetadadosMusica(id);
      salvarCache(); atualizarBotoesCoracao(id, eraFavorito); notificarAlteracao();
      const mensagem = "Não foi possível salvar o favorito. Tente novamente.";
      window.SoundWaveApp?.showToast(mensagem, "error");
      return { favoritado: eraFavorito, mensagem };
    }
  }
  return { inicializar, obterFavoritosIds, obterMusicasFavoritas, isFavorito, toggleFavorito, atualizarBotoesCoracao, atualizarTodosBotoes };
})();
window.SoundWaveFavoritos = SoundWaveFavoritos;
