/**
 * SoundWave - Mecanismo do Reprodutor de Música (player.js)
 * Gerencia HTML5 Audio, sintetizador Web Audio API de fallback,
 * fila de reprodução, shuffle, repeat, timeline, mini player e registro no histórico (RN05).
 */

const SoundWavePlayer = (() => {
  const CHAVE_HISTORICO = "soundwave_historico";
  const CHAVE_FILA = "soundwave_fila";
  const CHAVE_ULTIMA_MUSICA = "soundwave_ultima_musica";

  // Estado interno do player
  let audio = new Audio();
  let musicaAtual = null;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false; // false, 'all', 'one'
  let fila = [];
  let volume = 0.8;
  let synthInterval = null;
  let audioContext = null;
  const LIMITE_PREVIA_GRATIS = 30;
  let avisoPremiumExibido = false;

  function usuarioEhPremium() {
    return Boolean(window.SoundWaveAuth?.obterUsuarioAtual()?.premium);
  }

  function limiteAtual() {
    return usuarioEhPremium() ? Infinity : LIMITE_PREVIA_GRATIS;
  }

  function exibirAvisoPremium() {
    if (avisoPremiumExibido) return;
    avisoPremiumExibido = true;
    const modal = document.getElementById("generic-modal");
    const titulo = document.getElementById("generic-modal-title");
    const corpo = document.getElementById("generic-modal-body");
    if (modal && titulo && corpo) {
      titulo.textContent = "Prévia encerrada";
      corpo.innerHTML = `<div style="text-align:center; padding: 8px 0;"><i class="fa-solid fa-crown" style="font-size:2.5rem;color:#f59e0b;margin-bottom:14px;"></i><p class="text-muted">A prévia gratuita tem 30 segundos. Assine o SoundWave Premium para ouvir músicas completas, sem cortes.</p><button class="btn btn-primary" style="margin-top:20px;" onclick="SoundWaveApp.fecharModal(); SoundWaveApp.navegarPara('premium')"><i class="fa-solid fa-crown"></i> Assinar Premium</button></div>`;
      modal.classList.add("active");
    } else {
      window.SoundWaveApp?.showToast("A prévia terminou. Assine o Premium para ouvir a faixa completa.", "warning");
    }
  }

  function encerrarPrevia() {
    if (usuarioEhPremium()) return;
    audio.pause();
    pararSintetizador();
    isPlaying = false;
    atualizarInterfacePlayer();
    exibirAvisoPremium();
  }

  /**
   * Inicializa o player e listeners
   */
  function inicializar() {
    audio.volume = volume;

    // Listeners do elemento Audio nativo
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onTrackEnded);
    audio.addEventListener("error", onAudioError);
    audio.addEventListener("play", () => {
      isPlaying = true;
      atualizarInterfacePlayer();
    });
    audio.addEventListener("pause", () => {
      isPlaying = false;
      atualizarInterfacePlayer();
    });

    // Carrega fila e última música salva
    carregarFilaSalva();
  }

  /**
   * Carrega a fila do localStorage ou inicia com catálogo padrão
   */
  function carregarFilaSalva() {
    try {
      const filaSalva = JSON.parse(localStorage.getItem(CHAVE_FILA));
      if (Array.isArray(filaSalva) && filaSalva.length > 0) {
        fila = filaSalva;
      } else {
        fila = [...(window.DADOS_INICIAIS?.musicas || [])];
      }
    } catch {
      fila = [...(window.DADOS_INICIAIS?.musicas || [])];
    }

    try {
      const ultima = JSON.parse(localStorage.getItem(CHAVE_ULTIMA_MUSICA));
      if (ultima) {
        musicaAtual = ultima;
        configurarMusica(ultima, false);
      } else if (fila.length > 0) {
        musicaAtual = fila[0];
        configurarMusica(fila[0], false);
      }
    } catch {
      if (fila.length > 0) {
        musicaAtual = fila[0];
        configurarMusica(fila[0], false);
      }
    }
  }

  /**
   * Salva a fila atual no localStorage
   */
  function salvarFila() {
    try {
      localStorage.setItem(CHAVE_FILA, JSON.stringify(fila));
    } catch (e) {
      console.warn("Erro ao salvar fila", e);
    }
  }

  /**
   * Configura os dados da música sem necessariamente iniciar o play
   */
  function configurarMusica(musica, autoPlay = true) {
    if (!musica) return;
    musicaAtual = musica;
    localStorage.setItem(CHAVE_ULTIMA_MUSICA, JSON.stringify(musica));

    // Para qualquer sintetizador anterior
    pararSintetizador();
    avisoPremiumExibido = false;

    if (musica.previewUrl || musica.audioUrl) {
      // Premium usa a faixa completa quando disponível; Free sempre é limitado a 30s.
      audio.src = usuarioEhPremium()
        ? (musica.audioUrl || musica.previewUrl)
        : (musica.previewUrl || musica.audioUrl);
      audio.currentTime = 0;
    }

    atualizarInterfacePlayer();

    if (autoPlay) {
      tocar();
    }
  }

  /**
   * Inicia a reprodução
   */
  function tocar() {
    if (!musicaAtual) {
      if (fila.length > 0) {
        musicaAtual = fila[0];
        configurarMusica(fila[0], true);
      }
      return;
    }

    pararSintetizador();

    // RN05: Registra no histórico imediatamente ao iniciar reprodução
    adicionarAoHistorico(musicaAtual);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          atualizarInterfacePlayer();
        })
        .catch(err => {
          console.log("Audio HTML5 bloqueado ou inacessível. Ativando sintetizador nativo de demonstração:", err);
          iniciarSintetizadorFallback();
          isPlaying = true;
          atualizarInterfacePlayer();
        });
    }
  }

  /**
   * Pausa a reprodução
   */
  function pausar() {
    audio.pause();
    pararSintetizador();
    isPlaying = false;
    atualizarInterfacePlayer();
  }

  /**
   * Alterna entre play e pause
   */
  function togglePlayPause() {
    if (isPlaying) {
      pausar();
    } else {
      tocar();
    }
  }

  /**
   * Toca uma música específica pelo ID ou objeto
   */
  function tocarMusica(idOuObjeto) {
    let musica = typeof idOuObjeto === "object" 
      ? idOuObjeto 
      : null;
      
    if (!musica) {
      musica = fila.find(m => m.id == idOuObjeto) || 
               (window.SoundWaveAPI?.obterMusicaPorIdSync ? window.SoundWaveAPI.obterMusicaPorIdSync(idOuObjeto) : null) ||
               (window.DADOS_INICIAIS?.musicas || []).find(m => m.id == idOuObjeto);
    }

    if (!musica) return;

    // Se a música não estiver na fila, adiciona
    const indexFila = fila.findIndex(m => m.id === musica.id);
    if (indexFila === -1) {
      fila.unshift(musica);
      salvarFila();
    }

    configurarMusica(musica, true);
  }

  /**
   * Avança para a próxima música da fila
   */
  function proximaMusica() {
    if (fila.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * fila.length);
      configurarMusica(fila[randomIndex], true);
      return;
    }

    const indexAtual = fila.findIndex(m => m.id === musicaAtual?.id);
    if (indexAtual !== -1 && indexAtual < fila.length - 1) {
      configurarMusica(fila[indexAtual + 1], true);
    } else if (isRepeat) {
      configurarMusica(fila[0], true);
    } else {
      pausar();
    }
  }

  /**
   * Retorna para a música anterior
   */
  function musicaAnterior() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const indexAtual = fila.findIndex(m => m.id === musicaAtual?.id);
    if (indexAtual > 0) {
      configurarMusica(fila[indexAtual - 1], true);
    } else {
      audio.currentTime = 0;
    }
  }

  /**
   * Alterna modo shuffle (aleatório)
   */
  function toggleShuffle() {
    isShuffle = !isShuffle;
    atualizarInterfacePlayer();
    if (window.SoundWaveApp?.showToast) {
      window.SoundWaveApp.showToast(isShuffle ? "Modo aleatório ativado" : "Modo aleatório desativado");
    }
    return isShuffle;
  }

  /**
   * Alterna modo repeat (repetição)
   */
  function toggleRepeat() {
    isRepeat = !isRepeat;
    atualizarInterfacePlayer();
    if (window.SoundWaveApp?.showToast) {
      window.SoundWaveApp.showToast(isRepeat ? "Repetir ativado" : "Repetir desativado");
    }
    return isRepeat;
  }

  /**
   * Salto na barra de progresso (Seek)
   */
  function seekPara(porcentagem) {
    const isDurationValid = audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity;
    const duracaoTotal = isDurationValid ? audio.duration : (musicaAtual?.duracao || 200);
    const novoTempo = Math.min((porcentagem / 100) * duracaoTotal, limiteAtual());
    audio.currentTime = novoTempo;
    onTimeUpdate();
  }

  /**
   * Ajusta o volume (0 a 1)
   */
  function definirVolume(novoVolume) {
    volume = Math.max(0, Math.min(1, novoVolume));
    audio.volume = volume;
    const volumeSlider = document.getElementById("player-volume-slider");
    if (volumeSlider) volumeSlider.value = volume * 100;
  }

  /**
   * Gerenciamento da Fila de Reprodução (Seção 18)
   */
  function obterFila() {
    return fila;
  }

  function adicionarAFila(musica) {
    if (!fila.some(m => m.id === musica.id)) {
      fila.push(musica);
      salvarFila();
      if (window.SoundWaveApp?.showToast) {
        window.SoundWaveApp.showToast(`"${musica.titulo}" adicionada à fila.`);
      }
    }
  }

  function removerDaFila(musicaId) {
    fila = fila.filter(m => m.id !== Number(musicaId));
    salvarFila();
    atualizarViewFila();
  }

  function moverNaFila(indexOrigem, indexDestino) {
    if (indexDestino < 0 || indexDestino >= fila.length) return;
    const item = fila.splice(indexOrigem, 1)[0];
    fila.splice(indexDestino, 0, item);
    salvarFila();
    atualizarViewFila();
  }

  /**
   * RN05 — Todas as reproduções devem ser registradas no histórico.
   */
  function adicionarAoHistorico(musica) {
    if (!musica) return;
    try {
      let historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];
      const agora = new Date();
      const horaFormatada = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const dataFormatada = agora.toLocaleDateString("pt-BR");

      const itemHistorico = {
        ...musica,
        timestamp: Date.now(),
        horario: `${dataFormatada} às ${horaFormatada}`
      };

      // Adiciona no topo do histórico
      historico = [itemHistorico, ...historico.filter(h => h.id !== musica.id)].slice(0, 50);
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    } catch (e) {
      console.warn("Erro ao registrar histórico", e);
    }
  }

  function obterHistorico() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];
    } catch {
      return [];
    }
  }

  function limparHistorico() {
    localStorage.removeItem(CHAVE_HISTORICO);
    if (window.SoundWaveApp?.showToast) {
      window.SoundWaveApp.showToast("Histórico limpo com sucesso!");
    }
  }

  /**
   * Formata segundos para MM:SS
   */
  function formatarTempo(segundos) {
    if (isNaN(segundos) || segundos < 0) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  }

  /**
   * Callback quando a posição do áudio é atualizada
   */
  function onTimeUpdate() {
    const atual = audio.currentTime || 0;
    if (!usuarioEhPremium() && atual >= LIMITE_PREVIA_GRATIS) {
      encerrarPrevia();
      return;
    }
    const isDurationValid = audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity;
    const totalOriginal = isDurationValid ? audio.duration : (musicaAtual?.duracao || 200);
    const total = Math.min(totalOriginal, limiteAtual());
    const porcentagem = total > 0 ? (atual / total) * 100 : 0;

    // Atualiza barra de progresso do mini-player
    const miniProg = document.getElementById("mini-player-progress");
    if (miniProg) miniProg.style.width = `${porcentagem}%`;

    // Atualiza full player
    const fullProgFill = document.getElementById("full-player-progress-fill");
    if (fullProgFill) fullProgFill.style.width = `${porcentagem}%`;

    const timeCurrent = document.getElementById("player-time-current");
    if (timeCurrent) timeCurrent.textContent = formatarTempo(atual);

    const timeTotal = document.getElementById("player-time-total");
    if (timeTotal) timeTotal.textContent = formatarTempo(total);
  }

  /**
   * Callback quando a música termina
   */
  function onTrackEnded() {
    if (!usuarioEhPremium()) {
      encerrarPrevia();
      return;
    }
    if (isRepeat) {
      audio.currentTime = 0;
      tocar();
    } else {
      proximaMusica();
    }
  }

  /**
   * Callback de erro no áudio nativo
   */
  function onAudioError() {
    console.warn("Falha no carregamento do áudio URL. Acionando gerador de áudio sintético.");
    iniciarSintetizadorFallback();
  }

  /**
   * Sintetizador Web Audio API de Fallback
   * Garante som musical dinâmico mesmo em ambientes estritamente offline sem arquivos locais
   */
  function iniciarSintetizadorFallback() {
    pararSintetizador();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();

      let step = 0;
      const notas = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // Acorde C Major

      synthInterval = setInterval(() => {
        if (!isPlaying || !audioContext) return;

        // Toca uma nota suave
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(notas[step % notas.length], audioContext.currentTime);

        gain.gain.setValueAtTime(0.06 * volume, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 0.4);

        // Avança tempo simulado
        audio.currentTime = (audio.currentTime || 0) + 0.4;
        if (!usuarioEhPremium() && audio.currentTime >= LIMITE_PREVIA_GRATIS) {
          encerrarPrevia();
        } else if (audio.currentTime >= (musicaAtual?.duracao || 200)) {
          onTrackEnded();
        } else {
          onTimeUpdate();
        }

        step++;
      }, 400);
    } catch (e) {
      console.warn("Web Audio indisponível:", e);
    }
  }

  function pararSintetizador() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (audioContext && audioContext.state !== "closed") {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
  }

  /**
   * Sincroniza todos os elementos de UI com o estado do Player
   */
  function atualizarInterfacePlayer() {
    if (!musicaAtual) return;

    // 1. Mini Player
    const miniPlayer = document.getElementById("mini-player");
    if (miniPlayer) {
      miniPlayer.classList.remove("hidden");
      const thumb = document.getElementById("mini-player-thumb");
      const title = document.getElementById("mini-player-title");
      const artist = document.getElementById("mini-player-artist");
      const playBtn = document.getElementById("mini-player-play-btn");

      if (thumb) thumb.src = musicaAtual.imagem;
      if (title) title.textContent = musicaAtual.titulo;
      if (artist) artist.textContent = musicaAtual.artista;
      if (playBtn) {
        playBtn.innerHTML = isPlaying 
          ? '<i class="fa-solid fa-pause"></i>' 
          : '<i class="fa-solid fa-play"></i>';
      }
    }

    // 2. Full Player Modal
    const fullCover = document.getElementById("full-player-cover");
    const fullTitle = document.getElementById("full-player-song-title");
    const fullArtist = document.getElementById("full-player-artist-name");
    const fullPlayBtn = document.getElementById("full-player-play-btn");
    const btnShuffle = document.getElementById("player-btn-shuffle");
    const btnRepeat = document.getElementById("player-btn-repeat");
    const fullBody = typeof document !== "undefined" && document.querySelector ? document.querySelector(".full-player-body") : null;

    if (fullCover) fullCover.src = musicaAtual.imagem;
    if (fullTitle) fullTitle.textContent = musicaAtual.titulo;
    if (fullArtist) fullArtist.textContent = musicaAtual.artista;
    const fullFavBtn = document.getElementById("full-player-fav-btn");
    if (fullFavBtn) fullFavBtn.dataset.favSongId = musicaAtual.id;
    if (fullPlayBtn) {
      fullPlayBtn.innerHTML = isPlaying 
        ? '<i class="fa-solid fa-pause"></i>' 
        : '<i class="fa-solid fa-play"></i>';
    }

    if (btnShuffle) btnShuffle.classList.toggle("active", isShuffle);
    if (btnRepeat) btnRepeat.classList.toggle("active", isRepeat);

    if (fullBody && fullBody.classList) {
      fullBody.classList.toggle("is-playing", isPlaying);
    }

    // 3. Botões de favorito sincronizados
    if (window.SoundWaveFavoritos) {
      const isFav = window.SoundWaveFavoritos.isFavorito(musicaAtual.id);
      const favBtns = document.querySelectorAll(`[data-fav-song-id="${musicaAtual.id}"]`);
      favBtns.forEach(btn => {
        btn.classList.toggle("favorited", isFav);
        btn.innerHTML = isFav 
          ? '<i class="fa-solid fa-heart"></i>' 
          : '<i class="fa-regular fa-heart"></i>';
      });
    }

    // 4. Se a view da Fila estiver aberta, atualiza
    atualizarViewFila();
  }

  function atualizarViewFila() {
    const queueListContainer = document.getElementById("queue-items-container");
    if (!queueListContainer) return;

    if (fila.length === 0) {
      queueListContainer.innerHTML = `<p class="text-muted" style="text-align:center; padding: 24px;">A fila está vazia.</p>`;
      return;
    }

    let html = "";
    fila.forEach((item, index) => {
      const isCurrent = musicaAtual && musicaAtual.id === item.id;
      html += `
        <div class="music-row ${isCurrent ? 'active' : ''}">
          <span class="music-row-index">${index + 1}</span>
          <img class="music-row-thumb" src="${item.imagem}" alt="${item.titulo}">
          <div class="music-row-info" onclick="SoundWavePlayer.tocarMusica(${item.id})">
            <div class="music-row-title">${item.titulo}</div>
            <div class="music-row-artist">${item.artista}</div>
          </div>
          <span class="music-row-duration">${item.duracaoFormatada}</span>
          <div class="music-row-actions">
            ${index > 0 ? `<button class="btn-icon btn-sm" title="Mover para cima" onclick="SoundWavePlayer.moverNaFila(${index}, ${index - 1})"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
            ${index < fila.length - 1 ? `<button class="btn-icon btn-sm" title="Mover para baixo" onclick="SoundWavePlayer.moverNaFila(${index}, ${index + 1})"><i class="fa-solid fa-arrow-down"></i></button>` : ''}
            <button class="btn-icon btn-sm" title="Remover da fila" onclick="SoundWavePlayer.removerDaFila(${item.id})"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      `;
    });

    queueListContainer.innerHTML = html;
  }

  return {
    inicializar,
    tocar,
    pausar,
    togglePlayPause,
    tocarMusica,
    configurarMusica,
    proximaMusica,
    musicaAnterior,
    toggleShuffle,
    toggleRepeat,
    seekPara,
    definirVolume,
    obterMusicaAtual: () => musicaAtual,
    isPlaying: () => isPlaying,
    obterFila,
    adicionarAFila,
    removerDaFila,
    moverNaFila,
    obterHistorico,
    limparHistorico,
    atualizarInterfacePlayer
  };
})();

window.SoundWavePlayer = SoundWavePlayer;
