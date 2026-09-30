-- SoundWave: estrutura necessária para login, Premium e favoritos.
-- Execute no phpMyAdmin do InfinityFree, dentro do banco if0_37368242_soundwave.

-- INSTALAÇÃO NOVA: execute este bloco apenas se a tabela usuarios ainda não existir.
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    premium TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSTALAÇÃO EXISTENTE: execute esta linha SOMENTE se usuarios ainda não tiver a coluna premium.
-- ALTER TABLE usuarios ADD COLUMN premium TINYINT(1) NOT NULL DEFAULT 0 AFTER senha;

-- Favoritos por usuário. A chave única impede favoritar a mesma faixa duas vezes.
CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id INT UNSIGNED NOT NULL,
    musica_id VARCHAR(64) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, musica_id),
    KEY idx_favoritos_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consultas úteis para conferência:
-- SELECT id, nome, email, premium FROM usuarios;
-- SELECT usuario_id, musica_id, criado_em FROM favoritos ORDER BY criado_em DESC;

-- Para testar Premium manualmente, substitua 1 pelo ID do usuário:
-- UPDATE usuarios SET premium = 1 WHERE id = 1;
