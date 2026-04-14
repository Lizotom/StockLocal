<?php
require_once "cors.php";
require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $_GET['endpoint'] ?? '';
$id = $_GET['id'] ?? null;

if ($endpoint !== 'products') {
    http_response_code(404);
    echo json_encode(["error" => true, "message" => "Endpoint no encontrado"]);
    exit;
}

switch ($method) {
    case 'GET':
        getProducts($pdo);
        break;
    case 'POST':
        createProduct($pdo);
        break;
    case 'PUT':
        updateProduct($pdo, $id);
        break;
    case 'DELETE':
        deleteProduct($pdo, $id);
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => true, "message" => "Método no permitido"]);
        break;
}

function getProducts($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => true, "message" => $e->getMessage()]);
    }
}

function createProduct($pdo) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        empty($data['name']) ||
        empty($data['category']) ||
        !isset($data['quantity']) ||
        !isset($data['price']) ||
        empty($data['provider'])
    ) {
        http_response_code(400);
        echo json_encode(["error" => true, "message" => "Datos incompletos"]);
        return;
    }

    try {
        $sql = "INSERT INTO products (name, category, quantity, price, provider, updated_at)
                VALUES (:name, :category, :quantity, :price, :provider, NOW())";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => trim($data['name']),
            ':category' => trim($data['category']),
            ':quantity' => (int)$data['quantity'],
            ':price' => (float)$data['price'],
            ':provider' => trim($data['provider'])
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Producto creado",
            "id" => $pdo->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => true, "message" => $e->getMessage()]);
    }
}

function updateProduct($pdo, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => true, "message" => "ID requerido"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $sql = "UPDATE products
                SET name = :name,
                    category = :category,
                    quantity = :quantity,
                    price = :price,
                    provider = :provider,
                    updated_at = NOW()
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => trim($data['name']),
            ':category' => trim($data['category']),
            ':quantity' => (int)$data['quantity'],
            ':price' => (float)$data['price'],
            ':provider' => trim($data['provider']),
            ':id' => (int)$id
        ]);

        echo json_encode(["success" => true, "message" => "Producto actualizado"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => true, "message" => $e->getMessage()]);
    }
}

function deleteProduct($pdo, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => true, "message" => "ID requerido"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);

        echo json_encode(["success" => true, "message" => "Producto eliminado"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => true, "message" => $e->getMessage()]);
    }
}
