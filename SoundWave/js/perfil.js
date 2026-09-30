/**
 * SoundWave - Módulo de Perfil e Edição (perfil.js)
 * Renderiza informações do usuário, estatísticas de biblioteca e formulário de edição com feedback.
 */

const SoundWavePerfil = (() => {

  /**
   * Renderiza a visualização do perfil com contadores em tempo real
   */
  function renderizarPerfil() {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    if (!usuario) return;

    // Atualiza contadores dinâmicos
    const playlists = window.SoundWavePlaylists ? window.SoundWavePlaylists.obterTodas() : [];
    const playlistsDoUsuario = playlists.filter(p => p.criadorId === usuario.id || p.criador === usuario.nome).length;

    const seguidos = window.SoundWaveApp ? window.SoundWaveApp.obterArtistasSeguidos().length : 0;

    const avatarEl = document.getElementById("profile-avatar-img");
    const nomeEl = document.getElementById("profile-name-text");
    const userEl = document.getElementById("profile-username-text");
    const countPlaylists = document.getElementById("profile-count-playlists");
    const countSeguindo = document.getElementById("profile-count-seguindo");
    const countSeguidores = document.getElementById("profile-count-seguidores");
    const badgePremium = document.getElementById("profile-badge-premium");

    if (avatarEl) avatarEl.src = usuario.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
    if (nomeEl) nomeEl.textContent = usuario.nome;
    if (userEl) userEl.textContent = usuario.username || "@usuario";
    if (countPlaylists) countPlaylists.textContent = playlistsDoUsuario || 3;
    if (countSeguindo) countSeguindo.textContent = seguidos || 18;
    if (countSeguidores) countSeguidores.textContent = usuario.seguidores || 142;

    if (badgePremium) {
      badgePremium.style.display = usuario.premium ? "inline-flex" : "none";
    }
  }

  /**
   * Preenche o formulário de edição com os dados atuais
   */
  function carregarFormularioEdicao() {
    const usuario = window.SoundWaveAuth.obterUsuarioAtual();
    if (!usuario) return;

    const inputNome = document.getElementById("edit-profile-name");
    const inputEmail = document.getElementById("edit-profile-email");
    const inputAvatar = document.getElementById("edit-profile-avatar");
    const inputSenha = document.getElementById("edit-profile-password");
    const previewAvatar = document.getElementById("edit-profile-avatar-preview");

    if (inputNome) inputNome.value = usuario.nome;
    if (inputEmail) inputEmail.value = usuario.email;
    if (inputAvatar) inputAvatar.value = usuario.avatar || "";
    if (inputSenha) inputSenha.value = usuario.senha || "";
    if (previewAvatar) previewAvatar.src = usuario.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
  }

  /**
   * Salva alterações do formulário de perfil
   */
  function salvarEdicao(event) {
    if (event) event.preventDefault();

    const inputNome = document.getElementById("edit-profile-name");
    const inputEmail = document.getElementById("edit-profile-email");
    const inputAvatar = document.getElementById("edit-profile-avatar");
    const inputSenha = document.getElementById("edit-profile-password");

    const dados = {
      nome: inputNome ? inputNome.value.trim() : "",
      email: inputEmail ? inputEmail.value.trim() : "",
      avatar: inputAvatar ? inputAvatar.value.trim() : "",
      senha: inputSenha ? inputSenha.value : ""
    };

    if (!dados.nome || !dados.email) {
      if (window.SoundWaveApp?.showToast) {
        window.SoundWaveApp.showToast("Nome e E-mail são obrigatórios.", "error");
      }
      return;
    }

    const resultado = window.SoundWaveAuth.atualizarUsuario(dados);

    if (resultado.sucesso) {
      if (window.SoundWaveApp?.showToast) {
        window.SoundWaveApp.showToast("Perfil atualizado com sucesso!", "success");
      }
      // Redireciona de volta para visualização do perfil
      setTimeout(() => {
        window.SoundWaveApp.navegarPara("perfil");
      }, 500);
    } else {
      if (window.SoundWaveApp?.showToast) {
        window.SoundWaveApp.showToast(resultado.mensagem, "error");
      }
    }
  }

  return {
    renderizarPerfil,
    carregarFormularioEdicao,
    salvarEdicao
  };
})();

window.SoundWavePerfil = SoundWavePerfil;
