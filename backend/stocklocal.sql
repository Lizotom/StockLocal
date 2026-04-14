CREATE DATABASE IF NOT EXISTS stocklocal;
USE stocklocal;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    provider VARCHAR(150) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin'
);

INSERT INTO products (name, category, quantity, price, provider)
VALUES
('Arroz 1kg', 'Abarrotes', 20, 28.50, 'Proveedor Central'),
('Refresco Cola 600ml', 'Bebidas', 8, 18.00, 'Distribuidora Norte'),
('Jabón en polvo', 'Limpieza', 4, 42.00, 'Limpieza Total');
