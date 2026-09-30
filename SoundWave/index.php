<?php
session_start();
// Redireciona para home.php se já estiver logado
if (isset($_SESSION['usuario_id'])) {
    header('Location: home.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SoundWave — Sinta a Música</title>
    <link rel="icon" type="image/svg+xml" href="assets/logo-icon.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --bg-color: #080b12;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #6d28d9;
            --primary-hover: #7c3aed;
            --neon-glow: 0 0 20px rgba(109, 40, 217, 0.6);
            --gradient-accent: linear-gradient(135deg, #6d28d9, #ec4899);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        /* Navbar */
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 48px;
            z-index: 10;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .logo i {
            color: var(--primary);
            font-size: 1.8rem;
        }

        .nav-buttons a {
            text-decoration: none;
            margin-left: 20px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s;
        }

        .btn-login {
            color: var(--text-main);
        }

        .btn-login:hover {
            color: var(--primary-hover);
        }

        .btn-register {
            background: var(--gradient-accent);
            color: #fff;
            padding: 10px 24px;
            border-radius: 30px;
            box-shadow: var(--neon-glow);
        }

        .btn-register:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }

        /* Hero Section */
        .hero {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
            position: relative;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60vw;
            height: 60vw;
            background: radial-gradient(circle, rgba(109, 40, 217, 0.15) 0%, transparent 60%);
            z-index: -1;
            border-radius: 50%;
        }

        .hero h1 {
            font-size: 4.5rem;
            line-height: 1.1;
            margin-bottom: 24px;
            font-weight: 800;
            letter-spacing: -1px;
        }

        .text-gradient {
            background: var(--gradient-accent);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin-bottom: 40px;
        }

        .cta-buttons {
            display: flex;
            gap: 16px;
        }

        .btn-lg {
            padding: 16px 36px;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 40px;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: var(--gradient-accent);
            color: #fff;
            box-shadow: 0 4px 15px rgba(109, 40, 217, 0.4);
        }

        .btn-primary:hover {
            box-shadow: var(--neon-glow);
            transform: scale(1.05);
        }

        .btn-outline {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-main);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 { font-size: 3rem; }
            nav { padding: 20px; }
            .cta-buttons { flex-direction: column; width: 100%; max-width: 300px; }
            .btn-lg { width: 100%; text-align: center; }
        }
    </style>
</head>
<body>

    <nav>
        <div class="logo">
            <i class="fa-solid fa-water"></i> SoundWave
        </div>
        <div class="nav-buttons">
            <a href="pages/login.php" class="btn-login">Entrar</a>
            <a href="pages/cadastro.php" class="btn-register">Criar Conta</a>
        </div>
    </nav>

    <main class="hero">
        <h1>Sua vida,<br>sua <span class="text-gradient">Trilha Sonora</span>.</h1>
        <p>Descubra novas músicas, crie playlists perfeitas e mergulhe em uma experiência sonora inesquecível de forma totalmente gratuita.</p>
        
        <div class="cta-buttons">
            <a href="pages/cadastro.php" class="btn-lg btn-primary">Começar a ouvir</a>
            <a href="pages/login.php" class="btn-lg btn-outline">Já tenho uma conta</a>
        </div>
    </main>

</body>
</html>
