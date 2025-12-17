<?php
include '../connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ====== CORS ======
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ====== Đọc file pass.env ======
$envFile = __DIR__ . '/pass.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (!str_contains($line, '=')) continue;
        list($name, $value) = array_map('trim', explode('=', $line, 2));
        $_ENV[$name] = $value;
        putenv("$name=$value");
    }
}

// 🔹 Lấy OpenAI API Key
$openai_api_key = $_ENV['OPENAI_API_KEY'] ?? null;
if (!$openai_api_key) {
    http_response_code(500);
    echo json_encode(["error" => "Không tìm thấy OPENAI_API_KEY trong pass.env"]);
    exit;
}

// ====== LỚP GỌI CHATGPT API ======
class ChatAIService {
    private $apiKey;

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function sendToChatGPT($question, $imageBase64 = null) {

        $url = "https://api.openai.com/v1/chat/completions";

        // 🔹 Thêm ảnh vào message nếu có
        $content = [
            ["type" => "text", "text" => $question]
        ];

        if ($imageBase64) {
            $content[] = [
                "type" => "image_url",
                "image_url" => [
                    "url" => "data:image/jpeg;base64," . $imageBase64
                ]
            ];
        }

        // Payload theo chuẩn OpenAI
        $payload = [
            "model" => "gpt-4.1-mini",   // Bạn có thể đổi: gpt-4.1, gpt-5
            "messages" => [
                [
                    "role" => "user",
                    "content" => $content
                ]
            ]
        ];

        // Gửi request
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "Authorization: Bearer {$this->apiKey}"
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ["error" => "Lỗi CURL: $error"];
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200 || empty($result['choices'][0]['message']['content'])) {
            $err = $result['error']['message'] ?? "Không rõ lỗi ChatGPT API";
            return ["error" => $err, "raw" => $result];
        }

        return [
            "answer" => $result['choices'][0]['message']['content']
        ];
    }
}

// ====== KHỞI TẠO DỊCH VỤ CHAT ======
$chatAI = new ChatAIService($openai_api_key);

// ====== LẤY DỮ LIỆU TỪ FRONTEND ======
$question = $_POST['message'] ?? '';
$imageBase64 = null;

// File ảnh
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imagePath = $_FILES['image']['tmp_name'];
    $imageData = file_get_contents($imagePath);
    $imageBase64 = base64_encode($imageData);
}

if (!$question && !$imageBase64) {
    echo json_encode(["error" => "Không nhận được dữ liệu (message hoặc ảnh)"]);
    exit;
}

// ====== GỌI CHATGPT ======
$result = $chatAI->sendToChatGPT($question, $imageBase64);

// ====== TRẢ VỀ JSON ======
echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>