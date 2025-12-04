<?php
include '../connect.php';  
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ====== CORS ======
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// ====== Đọc file pass.env ======
$envFile = __DIR__ . '/pass.env';

if (file_exists($envFile)) {
  $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (str_starts_with(trim($line), '#')) continue; // Bỏ comment
    if (!str_contains($line, '=')) continue;
    list($name, $value) = array_map('trim', explode('=', $line, 2));
    $_ENV[$name] = $value;
    putenv("$name=$value");
  }
}

// 🔹 Lấy biến từ file .env
$gemini_api_key = $_ENV['GEMINI_API_KEY'] ?? null;

if (!$gemini_api_key) {
  http_response_code(500);
  echo json_encode(["error" => "Không tìm thấy GEMINI_API_KEY trong pass.env"]);
  exit;
}

// ===== LỚP GỌI GEMINI API =====
class ChatAIService {
  private $gemini_api_key;

  public function __construct($gemini_api_key) {
    $this->gemini_api_key = $gemini_api_key;
  }

  // 🔸 Hàm gửi text hoặc ảnh
  public function sendToGemini($question, $imageBase64 = null) {
    // 🔹 Chọn model phù hợp
    // $model = $imageBase64 ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
    // Nếu bạn muốn thử bản 2.0 thì thay dòng trên bằng: 
    $model = $imageBase64 ? 'gemini-2.0-flash-exp' : 'gemini-2.0-flash-exp';

    // 🔹 Chọn version API phù hợp
    $apiVersion = str_contains($model, '2.0') ? 'v1beta' : 'v1';

    // 🔹 Endpoint chính xác
    $url = "https://generativelanguage.googleapis.com/{$apiVersion}/models/$model:generateContent?key={$this->gemini_api_key}";

    // 🔹 Dữ liệu gửi đi
    $parts = [['text' => $question]];
    if ($imageBase64) {
      $parts[] = [
        'inline_data' => [
          'mime_type' => 'image/jpeg',
          'data' => $imageBase64
        ]
      ];
    }

    $data = ['contents' => [['parts' => $parts]]];

    // 🔹 Gửi request
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => json_encode($data),
      CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
      return ["error" => "Lỗi CURL: $error"];
    }

    $result = json_decode($response, true);

    if ($httpcode !== 200 || !isset($result['candidates'][0]['content']['parts'][0]['text'])) {
      $error = $result['error']['message'] ?? 'Không rõ lỗi từ Gemini API';
      return ["error" => $error, "raw" => $result];
    }

    return ["answer" => $result['candidates'][0]['content']['parts'][0]['text']];
  }
}

// ===== KHỞI TẠO DỊCH VỤ CHAT =====
$chatAI = new ChatAIService($gemini_api_key);

// ===== NHẬN DỮ LIỆU TỪ FRONTEND =====
$question = $_POST['message'] ?? '';
$imageBase64 = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
  $imagePath = $_FILES['image']['tmp_name'];
  $imageData = file_get_contents($imagePath);
  $imageBase64 = base64_encode($imageData);
}

if (!$question && !$imageBase64) {
  echo json_encode(["error" => "Không nhận được dữ liệu (message hoặc ảnh)"]);
  exit;
}

// ===== GỌI GEMINI =====
$result = $chatAI->sendToGemini($question, $imageBase64);

// ===== TRẢ DỮ LIỆU VỀ FRONTEND =====
echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>