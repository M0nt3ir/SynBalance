-- Se o schema "public" não existir, ela será criado
CREATE SCHEMA IF NOT EXISTS public;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para acelerar buscas por login
CREATE INDEX idx_usuarios_login ON usuarios(login);

-- Inserir usuários de teste
-- Senha para ambos: "senha123" (hash bcrypt com salt de 10 rounds)
INSERT INTO usuarios (login, senha_hash, nome) VALUES
    ('mariana', '$2b$10$rBV2KM0pYJXqBXZhVZ0Cn.L5YVL1J0TXqXqJ7xJ8H9XqBKJ8HJXZ6', 'Mariana'),
    ('giovanna', '$2b$10$rBV2KM0pYJXqBXZhVZ0Cn.L5YVL1J0TXqXqJ7xJ8H9XqBKJ8HJXZ6', 'Giovanna')	
ON CONFLICT (login) DO NOTHING;

-- Criar tabela de log de acessos (opcional, para auditoria)
CREATE TABLE IF NOT EXISTS log_acessos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    ip_cliente VARCHAR(45),
    servidor VARCHAR(100),
    login_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_em TIMESTAMP
);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER update_usuarios_modtime
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ADicionando mais usuários

INSERT INTO public.usuarios (login, senha_hash, nome) VALUES
	('gustavo', '$2b$10$rBV2KM0pYJXqBXZhVZ0Cn.L5YVL1J0TXqXqJ7xJ8H9XqBKJ8HJXZ6', 'Gustavo'),
	('pedro',  '$2b$10$rBV2KM0pYJXqBXZhVZ0Cn.L5YVL1J0TXqXqJ7xJ8H9XqBKJ8HJXZ6', 'pedro')
ON CONFLICT (login) DO NOTHING;
-- Exibir usuários criados
SELECT id, login, nome, criado_em, atualizado_em FROM public.usuarios;