/**
 * SoundWave - Gerenciador de Playlists (playlists.js)
 * Implementa criação com validação RN02, adição/remoção de faixas e persistência.
 */

const SoundWavePlaylists = (() => {
  const CHAVE_PLAYLISTS = "soundwave_playlists";

  /**
   * Inicializa com as playlists padrão caso nenhuma tenha sido salva
   */
  function inicializar() {
    if (!localStorage.getItem(CHAVE_PLAYLISTS)) {
      const padroes = window.DADOS_INICIAIS?.playlistsPadrao || [];
      localStorage.setItem(CHAVE_PLAYLISTS, JSON.stringify(padroes));
    }
  }

  /**
   * Retorna todas as playlists salvas
   * @returns {Array}
   */
  function obterTodas() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_PLAYLISTS)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Obtém playlist por ID
   */
  function obterPorId(id) {
    const playlists = obterTodas();
    return playlists.find(p => p.id === id || p.id === Number(id)) || null;
  }

  /**
   * RN02 — Somente usuários cadastrados podem criar playlists.
   */
  function criarPlaylist(nome, descricao = "", imagem = "") {
    const usuarioAtual = window.SoundWaveAuth?.obterUsuarioAtual();
    if (!usuarioAtual) {
      return {
        sucesso: false,
        mensagem: "Você precisa estar logado para realizar esta ação."
      };
    }

    const nomeLimpo = (nome || "").trim();
    if (!nomeLimpo) {
      return {
        sucesso: false,
        mensagem: "Por favor, defina um nome para a playlist."
      };
    }

    const playlists = obterTodas();
    const novaPlaylist = {
      id: "pl_user_" + Date.now(),
      nome: nomeLimpo,
      descricao: descricao.trim() || "Criada por " + usuarioAtual.nome,
      imagem: imagem.trim() || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      criador: usuarioAtual.nome,
      criadorId: usuarioAtual.id,
      musicasIds: []
    };

    playlists.push(novaPlaylist);
    localStorage.setItem(CHAVE_PLAYLISTS, JSON.stringify(playlists));

    // Atualiza contagem de playlists do usuário
    if (usuarioAtual.playlistsCriadas !== undefined) {
      window.SoundWaveAuth.atualizarUsuario({
        playlistsCriadas: (usuarioAtual.playlistsCriadas || 0) + 1
      });
    }

    return {
      sucesso: true,
      playlist: novaPlaylist,
      mensagem: "Playlist criada com sucesso!"
    };
  }

  /**
   * Adiciona uma música a uma playlist específica
   */
  function adicionarMusica(playlistId, musicaId) {
    const playlists = obterTodas();
    const playlist = playlists.find(p => p.id === playlistId || p.id === Number(playlistId));

    if (!playlist) {
      return { sucesso: false, mensagem: "Playlist não encontrada." };
    }

    if (!playlist.musicasIds) playlist.musicasIds = [];

    const numId = Number(musicaId);
    if (playlist.musicasIds.includes(numId)) {
      return { sucesso: false, mensagem: "Esta música já está na playlist." };
    }

    playlist.musicasIds.push(numId);
    localStorage.setItem(CHAVE_PLAYLISTS, JSON.stringify(playlists));

    return { sucesso: true, mensagem: `Música adicionada a "${playlist.nome}"!` };
  }

  /**
   * Remove uma música de uma playlist
   */
  function removerMusica(playlistId, musicaId) {
    const playlists = obterTodas();
    const playlist = playlists.find(p => p.id === playlistId || p.id === Number(playlistId));

    if (!playlist) return { sucesso: false, mensagem: "Playlist não encontrada." };

    playlist.musicasIds = (playlist.musicasIds || []).filter(id => id !== Number(musicaId));
    localStorage.setItem(CHAVE_PLAYLISTS, JSON.stringify(playlists));

    return { sucesso: true, mensagem: "Música removida da playlist." };
  }

  /**
   * Exclui uma playlist criada
   */
  function excluirPlaylist(playlistId) {
    let playlists = obterTodas();
    playlists = playlists.filter(p => p.id !== playlistId);
    localStorage.setItem(CHAVE_PLAYLISTS, JSON.stringify(playlists));
    return { sucesso: true, mensagem: "Playlist removida com sucesso." };
  }

  inicializar();

  return {
    obterTodas,
    obterPorId,
    criarPlaylist,
    adicionarMusica,
    removerMusica,
    excluirPlaylist
  };
})();

window.SoundWavePlaylists = SoundWavePlaylists;
