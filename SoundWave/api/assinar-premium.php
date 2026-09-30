<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

function responderPremium(int $status, array $dados): void {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderPremium(405, ['sucesso' => false, 'mensagem' => 'Método não permitido.']);
}
if (!isset($_SESSION['usuario_id'])) {
    responderPremium(401, ['sucesso' => false, 'mensagem' => 'Sessão expirada. Entre novamente.']);
}

require_once __DIR__ . '/../conexao.php';
try {
    $stmt = $pdo->prepare('UPDATE usuarios SET premium = 1 WHERE id = ?');
    $stmt->execute([(int) $_SESSION['usuario_id']]);
    if ($stmt->rowCount() === 0) {
        $verificar = $pdo->prepare('SELECT id FROM usuarios WHERE id = ?');
        $verificar->execute([(int) $_SESSION['usuario_id']]);
        if (!$verificar->fetch()) responderPremium(404, ['sucesso' => false, 'mensagem' => 'Usuário não encontrado.']);
    }
    $_SESSION['usuario_premium'] = 1;
    responderPremium(200, ['sucesso' => true, 'premium' => true, 'mensagem' => 'SoundWave Premium ativado com sucesso!']);
} catch (PDOException $e) {
    error_log('SoundWave premium: ' . $e->getMessage());
    responderPremium(500, ['sucesso' => false, 'mensagem' => 'Não foi possível ativar o Premium agora.']);
}
