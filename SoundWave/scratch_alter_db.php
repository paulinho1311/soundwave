<?php
require_once 'conexao.php';
try {
    $pdo->exec("ALTER TABLE usuarios ADD COLUMN premium TINYINT(1) DEFAULT 0;");
    echo "Column 'premium' added successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
