-- Tabla para usuarios administradores
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Insertar usuario admin por defecto
-- Usuario: admin
-- Contraseña: Admin123! (deberás cambiarla después del primer login)
INSERT INTO admin_users (username, email, password_hash) 
VALUES (
    'admin', 
    'admin@portfolio.com', 
    '$2b$10$w7yMtiAX/M822C6fq5sFbe.pBxVZu7zEsWoCs27AFrY1XNcMKnxEG'
);

-- El hash de arriba corresponde a la contraseña: Admin123!
-- Te recomiendo cambiarla después del primer uso