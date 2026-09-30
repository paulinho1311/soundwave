<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

function responder(int $status, array $dados): void {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    responder(401, ['sucesso' => false, 'mensagem' => 'Sessão expirada. Entre novamente.']);
}

require_once __DIR__ . '/../conexao.php';

try {
    // A chave única é a regra definitiva contra favoritos duplicados no MySQL.
    $pdo->exec('CREATE TABLE IF NOT EXISTS favoritos (
        usuario_id INT UNSIGNED NOT NULL,
        musica_id VARCHAR(64) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, musica_id),
        INDEX idx_favoritos_usuario (usuario_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

    $usuarioId = (int) $_SESSION['usuario_id'];
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare('SELECT musica_id FROM favoritos WHERE usuario_id = ? ORDER BY criado_em DESC');
        $stmt->execute([$usuarioId]);
        responder(200, ['sucesso' => true, 'favoritos' => array_column($stmt->fetchAll(), 'musica_id')]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(405, ['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    }

    $entrada = json_decode(file_get_contents('php://input'), true);
    $musicaId = trim((string) ($entrada['musica_id'] ?? ''));
    $favoritar = filter_var($entrada['favoritar'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($musicaId === '' || strlen($musicaId) > 64 || $favoritar === null) {
        responder(422, ['sucesso' => false, 'mensagem' => 'Dados de favorito inválidos.']);
    }

    if ($favoritar) {
        // INSERT IGNORE torna a operação idempotente mesmo com cliques concorrentes.
        $stmt = $pdo->prepare('INSERT IGNORE INTO favoritos (usuario_id, musica_id) VALUES (?, ?)');
        $stmt->execute([$usuarioId, $musicaId]);
        responder(200, ['sucesso' => true, 'favoritado' => true, 'mensagem' => 'Música adicionada aos favoritos!']);
    }

    $stmt = $pdo->prepare('DELETE FROM favoritos WHERE usuario_id = ? AND musica_id = ?');
    $stmt->execute([$usuarioId, $musicaId]);
    responder(200, ['sucesso' => true, 'favoritado' => false, 'mensagem' => 'Música removida dos favoritos.']);
} catch (PDOException $e) {
    error_log('SoundWave favoritos: ' . $e->getMessage());
    responder(500, ['sucesso' => false, 'mensagem' => 'Não foi possível salvar os favoritos agora.']);
}
