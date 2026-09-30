/**
 * SoundWave - Módulo de Autenticação e Usuários (auth.js)
 * Gerencia login, cadastro, validação de regras de negócio (RN01) e persistência em localStorage.
 */

const SoundWaveAuth = (() => {
  const CHAVE_USUARIOS = "soundwave_usuarios";
  const CHAVE_SESSAO = "soundwave_sessao_usuario";

  /**
   * Inicializa o banco de usuários com o usuário demonstrativo caso não existam
   */
  function inicializar() {
    const usuariosSalvos = localStorage.getItem(CHAVE_USUARIOS);
    if (!usuariosSalvos) {
      const demo = window.DADOS_INICIAIS?.usuarioDemo || {
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
      };
      localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([demo]));
      // Define a sessão inicial como o usuário demo para conveniência
      if (!localStorage.getItem(CHAVE_SESSAO)) {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(demo));
      }
    }
  }

  /**
   * Obtém todos os usuários cadastrados
   * @returns {Array}
   */
  function obterTodosUsuarios() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Obtém o usuário atualmente autenticado
   * @returns {Object|null}
   */
  function obterUsuarioAtual() {
    // Integração com PHP Session (novo fluxo)
    if (window.USUARIO_LOGADO && window.USUARIO_LOGADO.id) {
      return {
        ...window.USUARIO_LOGADO,
        // Mantendo dados mockados secundários pro SPA não quebrar (avatar, premium, etc)
        username: "@" + (window.USUARIO_LOGADO.nome || "").toLowerCase().replace(/\s+/g, "_"),
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
        premium: Boolean(window.USUARIO_LOGADO.premium),
        seguidores: 0,
        seguindo: 0,
        playlistsCriadas: 0,
        notificacoesAtivas: true
      };
    }

    try {
      return JSON.parse(localStorage.getItem(CHAVE_SESSAO)) || null;
    } catch {
      return null;
    }
  }

  /**
   * RN01 - Cada e-mail pode ser usado apenas uma vez.
   * Cadastra um novo usuário no sistema.
   */
  function cadastrar(nome, email, senha, confirmaSenha) {
    const emailLimpo = (email || "").trim().toLowerCase();
    const nomeLimpo = (nome || "").trim();

    if (!nomeLimpo) {
      return { sucesso: false, mensagem: "Por favor, informe seu nome completo." };
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(emailLimpo)) {
      return { sucesso: false, mensagem: "Formato de e-mail inválido." };
    }

    if (!senha || senha.length < 6) {
      return { sucesso: false, mensagem: "A senha deve conter no mínimo 6 caracteres." };
    }

    if (senha !== confirmaSenha) {
      return { sucesso: false, mensagem: "As senhas não coincidem. Verifique a confirmação." };
    }

    const usuarios = obterTodosUsuarios();
    // Verificação de unicidade do e-mail (RN01)
    const emailJaExiste = usuarios.some(u => u.email.toLowerCase() === emailLimpo);
    if (emailJaExiste) {
      return { sucesso: false, mensagem: "Este e-mail já está cadastrado no SoundWave." };
    }

    const novoUsuario = {
      id: "usr_" + Date.now(),
      nome: nomeLimpo,
      email: emailLimpo,
      senha: senha,
      username: "@" + nomeLimpo.toLowerCase().replace(/\s+/g, "_"),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      premium: false,
      seguidores: 0,
      seguindo: 0,
      playlistsCriadas: 0,
      notificacoesAtivas: true,
      altoContraste: false,
      idioma: "pt-BR"
    };

    usuarios.push(novoUsuario);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(novoUsuario));

    return { sucesso: true, usuario: novoUsuario, mensagem: "Conta criada com sucesso! Bem-vindo ao SoundWave." };
  }

  /**
   * Realiza login no sistema
   */
  function login(email, senha) {
    const emailLimpo = (email || "").trim().toLowerCase();

    if (!emailLimpo || !senha) {
      return { sucesso: false, mensagem: "Preencha todos os campos para entrar." };
    }

    const usuarios = obterTodosUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === emailLimpo && u.senha === senha);

    if (!usuarioEncontrado) {
      return { sucesso: false, mensagem: "E-mail ou senha incorretos." };
    }

    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuarioEncontrado));
    return { sucesso: true, usuario: usuarioEncontrado, mensagem: "Login realizado com sucesso!" };
  }

  /**
   * Simula login social com Google
   */
  function loginGoogle() {
    const usuarioGoogle = {
      id: "usr_google_" + Date.now(),
      nome: "Usuário Google",
      email: "google.user@gmail.com",
      username: "@google_user",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      premium: false,
      seguidores: 10,
      seguindo: 5,
      playlistsCriadas: 1,
      notificacoesAtivas: true,
      altoContraste: false,
      idioma: "pt-BR"
    };
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuarioGoogle));
    return { sucesso: true, usuario: usuarioGoogle, mensagem: "Conectado via conta Google!" };
  }

  /**
   * Atualiza dados cadastrais do usuário logado
   */
  function atualizarUsuario(dados) {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) return { sucesso: false, mensagem: "Nenhum usuário conectado." };

    const usuarios = obterTodosUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioAtual.id);

    // Validação de email duplicado se o usuário alterar o email
    if (dados.email && dados.email.toLowerCase() !== usuarioAtual.email.toLowerCase()) {
      const emailEmUso = usuarios.some(u => u.id !== usuarioAtual.id && u.email.toLowerCase() === dados.email.toLowerCase());
      if (emailEmUso) {
        return { sucesso: false, mensagem: "Este e-mail já pertence a outro usuário." };
      }
    }

    const usuarioAtualizado = { ...usuarioAtual, ...dados };

    if (index !== -1) {
      usuarios[index] = usuarioAtualizado;
      localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    }
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuarioAtualizado));

    return { sucesso: true, usuario: usuarioAtualizado, mensagem: "Perfil atualizado com sucesso!" };
  }

  /**
   * Ativa assinatura Premium (RN04)
   */
  async function assinarPremium() {
    if (window.USUARIO_LOGADO?.id) {
      const response = await fetch("api/assinar-premium.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        credentials: "same-origin"
      });
      const resultado = await response.json().catch(() => null);
      if (!response.ok || !resultado?.sucesso) {
        return { sucesso: false, mensagem: resultado?.mensagem || "Não foi possível ativar o Premium. Tente novamente." };
      }
      window.USUARIO_LOGADO.premium = true;
      return { sucesso: true, usuario: obterUsuarioAtual(), mensagem: resultado.mensagem };
    }
    return atualizarUsuario({ premium: true });
  }

  /**
   * Encerra a sessão
   */
  function logout() {
    localStorage.removeItem(CHAVE_SESSAO);
    return { sucesso: true, mensagem: "Sessão encerrada com sucesso." };
  }

  // Auto inicialização
  inicializar();

  return {
    inicializar,
    obterTodosUsuarios,
    obterUsuarioAtual,
    cadastrar,
    login,
    loginGoogle,
    atualizarUsuario,
    assinarPremium,
    logout
  };
})();

window.SoundWaveAuth = SoundWaveAuth;
