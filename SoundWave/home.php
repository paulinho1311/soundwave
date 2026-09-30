<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header('Location: pages/login.php');
    exit;
}
// A tela não pode depender de uma nova conexão ao banco para renderizar.
// O status da assinatura já é atualizado no login e em api/assinar-premium.php.
$jamendoClientId = getenv('JAMENDO_CLIENT_ID') ?: '';
?>
<!DOCTYPE html>
<script>
    // Injetando dados da sessão PHP para o frontend JS
    window.USUARIO_LOGADO = {
        id: <?php echo json_encode($_SESSION['usuario_id']); ?>,
        nome: <?php echo json_encode($_SESSION['usuario_nome']); ?>,
        email: <?php echo json_encode($_SESSION['usuario_email']); ?>,
        premium: <?php echo json_encode(!empty($_SESSION['usuario_premium'])); ?>
    };
    window.SOUNDWAVE_CONFIG = {
        jamendoClientId: <?php echo json_encode($jamendoClientId); ?>
    };
</script>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SoundWave — Sua música, do seu jeito.</title>
  
  <!-- SEO & Metatags -->
  <meta name="description" content="SoundWave é uma plataforma moderna de streaming de músicas, playlists personalizadas, reprodução offline e novas descobertas sonoras.">
  <meta name="theme-color" content="#080b12">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="assets/logo-icon.svg">

  <!-- Font Awesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <!-- Estilos da Aplicação -->
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/login.css">
  <link rel="stylesheet" href="css/home.css">
  <link rel="stylesheet" href="css/player.css">
  <link rel="stylesheet" href="css/responsive.css">
</head>
<body>

  <!-- ========================================================================
       TELA SPLASH (Seção 6)
       ======================================================================== -->
  <div id="splash-screen">
    <div class="splash-content">
      <div class="splash-soundwaves">
        <span class="splash-bar"></span>
        <span class="splash-bar"></span>
        <span class="splash-bar"></span>
        <span class="splash-bar"></span>
        <span class="splash-bar"></span>
        <span class="splash-bar"></span>
      </div>
      <h1 class="splash-title">Sound<span class="text-gradient">Wave</span></h1>
      <p class="splash-subtitle">"sua música, do seu jeito."</p>
    </div>
  </div>

  <!-- ========================================================================
       LAYOUT PRINCIPAL DA APLICAÇÃO
       ======================================================================== -->
  <div class="app-layout">

    <!-- SIDEBAR DESKTOP (Seção 25 & 30) -->
    <aside id="desktop-sidebar">
      <div class="sidebar-logo">
        <a href="#/home">
          <img src="assets/logo.svg" alt="SoundWave">
        </a>
      </div>

      <nav class="sidebar-nav-group">
        <span class="sidebar-nav-title">Menu</span>
        <a href="#/home" class="sidebar-nav-link active" data-nav="home">
          <i class="fa-solid fa-house"></i> Início
        </a>
        <a href="#/pesquisa" class="sidebar-nav-link" data-nav="pesquisa">
          <i class="fa-solid fa-magnifying-glass"></i> Buscar
        </a>
        <a href="#/notificacoes" class="sidebar-nav-link" data-nav="notificacoes">
          <i class="fa-solid fa-bell"></i> Notificações
        </a>
        <a href="#/premium" class="sidebar-nav-link" data-nav="premium">
          <i class="fa-solid fa-crown" style="color: #f59e0b;"></i> SoundWave Premium
        </a>
      </nav>

      <div class="sidebar-divider"></div>

      <nav class="sidebar-nav-group">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-right: 12px;">
          <span class="sidebar-nav-title">Sua Biblioteca</span>
          <button class="btn-icon btn-sm" title="Criar Playlist" onclick="SoundWaveApp.abrirModalCriarPlaylist()">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <a href="#/playlists" class="sidebar-nav-link" data-nav="playlists">
          <i class="fa-solid fa-lines-leaning"></i> Playlists
        </a>
        <a href="#/favoritos" class="sidebar-nav-link" data-nav="favoritos">
          <i class="fa-solid fa-heart" style="color: #ec4899;"></i> Músicas Curtidas
        </a>
        <a href="#/downloads" class="sidebar-nav-link" data-nav="downloads">
          <i class="fa-solid fa-arrow-down-to-line" style="color: var(--success);"></i> Baixadas / Offline
        </a>
        <a href="#/historico" class="sidebar-nav-link" data-nav="historico">
          <i class="fa-solid fa-clock-rotate-left"></i> Histórico
        </a>
        <a href="#/fila" class="sidebar-nav-link" data-nav="fila">
          <i class="fa-solid fa-list-ol"></i> Fila de Reprodução
        </a>
      </nav>

      <div class="sidebar-divider" style="margin-top: auto;"></div>

      <nav class="sidebar-nav-group">
        <a href="#/perfil" class="sidebar-nav-link" data-nav="perfil">
          <i class="fa-solid fa-user"></i> Meu Perfil
        </a>
        <a href="#/configuracoes" class="sidebar-nav-link" data-nav="configuracoes">
          <i class="fa-solid fa-gear"></i> Configurações
        </a>
      </nav>
    </aside>

    <!-- WRAPPER DO CONTEÚDO PRINCIPAL -->
    <main class="main-content-wrapper">
      <div class="main-view-container" id="main-view-container">
        <!-- Telas carregadas dinamicamente via Hash Router -->
      </div>
    </main>

  </div>

  <!-- ========================================================================
       BARRA DE NAVEGAÇÃO MOBILE INFERIOR (Seção 25 & 30)
       ======================================================================== -->
  <nav id="mobile-bottom-nav">
    <a href="#/home" class="mobile-nav-item active" data-nav="home">
      <i class="fa-solid fa-house"></i>
      <span>Início</span>
    </a>
    <a href="#/pesquisa" class="mobile-nav-item" data-nav="pesquisa">
      <i class="fa-solid fa-magnifying-glass"></i>
      <span>Buscar</span>
    </a>
    <a href="#/playlists" class="mobile-nav-item" data-nav="playlists">
      <i class="fa-solid fa-lines-leaning"></i>
      <span>Biblioteca</span>
    </a>
    <a href="#/perfil" class="mobile-nav-item" data-nav="perfil">
      <i class="fa-solid fa-user"></i>
      <span>Perfil</span>
    </a>
  </nav>

  <!-- ========================================================================
       MINI PLAYER PERSISTENTE (Seção 12 & Layout Desktop)
       ======================================================================== -->
  <div id="mini-player" class="hidden">
    <div class="mini-player-progress-bar" id="mini-player-progress"></div>

    <div class="mini-player-left">
      <img id="mini-player-thumb" class="mini-player-thumb" src="" alt="Capa da Música">
      <div class="mini-player-info">
        <div id="mini-player-title" class="mini-player-title">Carregando...</div>
        <div id="mini-player-artist" class="mini-player-artist">SoundWave</div>
      </div>
    </div>

    <!-- Controles expandidos para Desktop -->
    <div class="desktop-player-controls" style="display: none;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <button class="btn-ctrl" id="desk-btn-shuffle" title="Aleatório" onclick="SoundWavePlayer.toggleShuffle()"><i class="fa-solid fa-shuffle"></i></button>
        <button class="btn-ctrl" title="Anterior" onclick="SoundWavePlayer.musicaAnterior()"><i class="fa-solid fa-backward-step"></i></button>
        <button class="btn-mini-control btn-mini-play" onclick="SoundWavePlayer.togglePlayPause()"><i class="fa-solid fa-play"></i></button>
        <button class="btn-ctrl" title="Próxima" onclick="SoundWavePlayer.proximaMusica()"><i class="fa-solid fa-forward-step"></i></button>
        <button class="btn-ctrl" id="desk-btn-repeat" title="Repetir" onclick="SoundWavePlayer.toggleRepeat()"><i class="fa-solid fa-repeat"></i></button>
      </div>
    </div>

    <div class="mini-player-right">
      <button class="btn-mini-control btn-mini-play" id="mini-player-play-btn" onclick="event.stopPropagation(); SoundWavePlayer.togglePlayPause()">
        <i class="fa-solid fa-play"></i>
      </button>
      <button class="btn-mini-control" title="Próxima" onclick="event.stopPropagation(); SoundWavePlayer.proximaMusica()">
        <i class="fa-solid fa-forward-step"></i>
      </button>
      <button class="btn-mini-control" title="Fila" onclick="event.stopPropagation(); SoundWaveApp.navegarPara('fila')">
        <i class="fa-solid fa-list-ol"></i>
      </button>
    </div>
  </div>

  <!-- ========================================================================
       FULL PLAYER MODAL / TELA DE REPRODUÇÃO (Seção 11)
       ======================================================================== -->
  <div id="full-player-modal">
    <div class="full-player-header">
      <button class="btn-icon" id="btn-close-full-player" title="Recolher player">
        <i class="fa-solid fa-chevron-down"></i>
      </button>
      <div class="full-player-header-title">Agora Tocando</div>
      <button class="btn-icon" title="Opções" onclick="SoundWaveApp.abrirMenuMusica(event, SoundWavePlayer.obterMusicaAtual()?.id)">
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>
    </div>

    <div class="full-player-body">
      <div class="full-player-cover-container">
        <div class="full-player-cover-glow"></div>
        <img id="full-player-cover" class="full-player-cover" src="" alt="Capa grande da música">
      </div>

      <div class="full-player-meta-row">
        <div class="full-player-meta-info">
          <div id="full-player-song-title" class="full-player-song-title">Nome da Música</div>
          <div id="full-player-artist-name" class="full-player-artist-name">Nome do Artista</div>
        </div>
        <button class="btn-icon btn-heart" id="full-player-fav-btn" data-fav-song-id="" aria-label="Adicionar aos favoritos" onclick="SoundWaveFavoritos.toggleFavorito(SoundWavePlayer.obterMusicaAtual()?.id)">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>

      <!-- Barra de Progresso com Seek -->
      <div class="progress-container">
        <div class="progress-bar-wrapper" onclick="SoundWavePlayer.seekPara((event.offsetX / this.offsetWidth) * 100)">
          <div class="progress-bar-fill" id="full-player-progress-fill">
            <div class="progress-bar-handle"></div>
          </div>
        </div>
        <div class="progress-time-row">
          <span id="player-time-current">0:00</span>
          <span id="player-time-total">3:30</span>
        </div>
      </div>

      <!-- Controles de Reprodução -->
      <div class="full-player-controls">
        <button class="btn-ctrl" id="player-btn-shuffle" title="Aleatório" onclick="SoundWavePlayer.toggleShuffle()">
          <i class="fa-solid fa-shuffle"></i>
        </button>
        <button class="btn-ctrl" title="Anterior" onclick="SoundWavePlayer.musicaAnterior()">
          <i class="fa-solid fa-backward-step"></i>
        </button>
        <button class="btn-ctrl-play-lg" id="full-player-play-btn" onclick="SoundWavePlayer.togglePlayPause()">
          <i class="fa-solid fa-play"></i>
        </button>
        <button class="btn-ctrl" title="Próxima" onclick="SoundWavePlayer.proximaMusica()">
          <i class="fa-solid fa-forward-step"></i>
        </button>
        <button class="btn-ctrl" id="player-btn-repeat" title="Repetir" onclick="SoundWavePlayer.toggleRepeat()">
          <i class="fa-solid fa-repeat"></i>
        </button>
      </div>

      <!-- Controle de Volume -->
      <div class="volume-control-row">
        <i class="fa-solid fa-volume-low"></i>
        <input type="range" class="volume-slider" id="player-volume-slider" min="0" max="100" value="80" oninput="SoundWavePlayer.definirVolume(this.value / 100)">
        <i class="fa-solid fa-volume-high"></i>
      </div>

      <!-- Ações Inferiores -->
      <div class="full-player-bottom-actions">
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('full-player-modal').classList.remove('active'); SoundWaveApp.navegarPara('fila');">
          <i class="fa-solid fa-list-ol"></i> Fila de reprodução
        </button>
        <button class="btn btn-secondary btn-sm" onclick="SoundWaveApp.abrirModalCompartilhar(SoundWavePlayer.obterMusicaAtual()?.id)">
          <i class="fa-solid fa-share-nodes"></i> Compartilhar
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================
       MODAL GENÉRICO (Compartilhar, Playlists, Sobre, etc.)
       ======================================================================== -->
  <div id="generic-modal" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="generic-modal-title">Título do Modal</h3>
        <button class="btn-icon btn-sm" onclick="SoundWaveApp.fecharModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body" id="generic-modal-body">
        <!-- Conteúdo dinâmico -->
      </div>
    </div>
  </div>

  <!-- CONTAINER DE TOASTS -->
  <div id="toast-container"></div>

  <!-- ========================================================================
       SCRIPTS JAVASCRIPT MODULARES (Ordem de dependência)
       ======================================================================== -->
  <script src="js/dados.js"></script>
  <script src="js/api.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/player.js"></script>
  <script src="js/playlists.js"></script>
  <script src="js/favoritos.js"></script>
  <script src="js/pesquisa.js"></script>
  <script src="js/perfil.js"></script>
  <script src="js/app.js"></script>

</body>
</html>
