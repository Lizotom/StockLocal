<?php
$host = "localhost";
$dbname = "stocklocal";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => "Error de conexión a la base de datos: " . $e->getMessage()
    ]);
    exit;
}
