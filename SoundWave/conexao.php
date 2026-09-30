<?php
// conexao.php - Configuração do Banco de Dados SoundWave

$host = 'sql102.infinityfree.com';
$dbname = 'if0_37368242_soundwave';
$user = 'if0_37368242';
$pass = 'yGlAh4413h';
// Configure este valor no ambiente de produção (painel/variáveis do host).
// O client_id do Jamendo é necessário somente para a busca Premium.
$jamendoClientId = getenv('JAMENDO_CLIENT_ID') ?: '';

try {
    // Configurando DSN com charset utf8mb4
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    
    // Opções do PDO
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Tratar erros com exceptions
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Arrays associativos
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Desativar emulação de prepared statements
    ];
    
    // Instanciando a conexão
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Em produção, evite exibir o erro exato ao usuário.
    // die("Erro de conexão: " . $e->getMessage());
    die("Desculpe, ocorreu um problema de conexão com nosso banco de dados. Tente novamente mais tarde.");
}
?>
