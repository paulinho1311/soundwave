<?php
session_start();
require_once '../conexao.php';

// Redirecionar se já logado
if (isset($_SESSION['usuario_id'])) {
    header("Location: ../home.php");
    exit;
}

$erro = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        $erro = "Por favor, preencha o e-mail e a senha.";
    } else {
        try {
            $stmt = $pdo->prepare("SELECT id, nome, email, senha, premium FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            $usuario = $stmt->fetch();

            if ($usuario && password_verify($senha, $usuario['senha'])) {
                // Iniciar sessão
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['usuario_nome'] = $usuario['nome'];
                $_SESSION['usuario_email'] = $usuario['email'];
                $_SESSION['usuario_premium'] = $usuario['premium'];
                header("Location: ../home.php");
                exit;
            } else {
                $erro = "E-mail ou senha incorretos.";
            }
        } catch (PDOException $e) {
            $erro = "Erro no banco de dados. Tente novamente mais tarde.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrar - SoundWave</title>
    <link rel="icon" type="image/svg+xml" href="../assets/logo-icon.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --bg-color: #080b12;
            --surface: rgba(20, 24, 36, 0.7);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #6d28d9;
            --primary-hover: #7c3aed;
            --neon-glow: 0 0 15px rgba(109, 40, 217, 0.5);
            --gradient-accent: linear-gradient(135deg, #6d28d9, #a855f7);
            --input-bg: rgba(255, 255, 255, 0.03);
            --input-border: rgba(255, 255, 255, 0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
        }

        body::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80vw;
            height: 80vw;
            background: radial-gradient(circle, rgba(109, 40, 217, 0.08) 0%, transparent 60%);
            z-index: -1;
            border-radius: 50%;
        }

        .auth-container {
            background: var(--surface);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .auth-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .auth-logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 1.8rem;
            font-weight: 800;
            text-decoration: none;
            color: var(--text-main);
            margin-bottom: 8px;
        }

        .auth-logo i {
            color: var(--primary);
            font-size: 2rem;
            filter: drop-shadow(var(--neon-glow));
        }

        .auth-subtitle {
            color: var(--text-muted);
            font-size: 0.95rem;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-muted);
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-wrapper i {
            position: absolute;
            left: 16px;
            color: var(--text-muted);
            font-size: 1.1rem;
            transition: color 0.3s ease;
        }

        .input-wrapper input {
            width: 100%;
            padding: 14px 14px 14px 44px;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 12px;
            color: var(--text-main);
            font-size: 1rem;
            transition: all 0.3s ease;
            outline: none;
        }

        .input-wrapper input::placeholder {
            color: rgba(255,255,255,0.2);
        }

        .input-wrapper input:focus {
            border-color: var(--primary);
            box-shadow: var(--neon-glow);
            background: rgba(255,255,255,0.06);
        }

        .input-wrapper input:focus + i,
        .input-wrapper input:not(:placeholder-shown) + i {
            color: #a855f7;
        }

        .btn-submit {
            width: 100%;
            padding: 14px;
            background: var(--gradient-accent);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3);
            margin-top: 10px;
        }

        .btn-submit:hover {
            box-shadow: var(--neon-glow);
            transform: translateY(-2px);
        }

        .auth-footer {
            text-align: center;
            margin-top: 24px;
            font-size: 0.95rem;
            color: var(--text-muted);
        }

        .auth-footer a {
            color: #a855f7;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .auth-footer a:hover {
            color: #d8b4fe;
            text-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
        }

        .alert {
            padding: 14px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-danger {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-header">
            <a href="../index.php" class="auth-logo">
                <i class="fa-solid fa-water"></i> SoundWave
            </a>
            <p class="auth-subtitle">Acesse sua conta para continuar</p>
        </div>
        
        <form method="POST" action="login.php">
            <?php if ($erro): ?>
                <div class="alert alert-danger">
                    <i class="fa-solid fa-circle-exclamation"></i> <?= htmlspecialchars($erro) ?>
                </div>
            <?php endif; ?>

            <div class="form-group">
                <label for="email">E-mail</label>
                <div class="input-wrapper">
                    <input type="email" id="email" name="email" placeholder="Digite seu e-mail" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
                    <i class="fa-solid fa-envelope"></i>
                </div>
            </div>

            <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label for="senha" style="margin-bottom: 0;">Senha</label>
                    <a href="#" style="font-size: 0.85rem; color: #a855f7; text-decoration: none; transition: 0.3s;">Esqueceu a senha?</a>
                </div>
                <div class="input-wrapper">
                    <input type="password" id="senha" name="senha" placeholder="Digite sua senha" required>
                    <i class="fa-solid fa-lock"></i>
                </div>
            </div>

            <button type="submit" class="btn-submit">Entrar na conta</button>
            
            <div class="auth-footer">
                Não tem uma conta? <a href="cadastro.php">Cadastre-se</a>
            </div>
        </form>
    </div>
</body>
</html>
