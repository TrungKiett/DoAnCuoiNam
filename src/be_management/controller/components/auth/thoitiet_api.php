<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

class WeatherAPI
{
  private $apiKey = "7bddc919f7f20ecc16108f3f36741b49"; // 🔑 API key thật
  private $baseUrl = "https://api.openweathermap.org/data/2.5/";

  private function makeRequest($endpoint, $params = [])
  {
    $url = $this->baseUrl . $endpoint . "?appid=" . $this->apiKey . "&units=metric&lang=vi";
    foreach ($params as $key => $value) {
      $url .= "&" . urlencode($key) . "=" . urlencode($value);
    }

    $ch = curl_init();
    curl_setopt_array($ch, [
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 10
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
      return ["success" => false, "error" => "Lỗi API (HTTP $httpCode)", "url" => $url];
    }

    $data = json_decode($response, true);
    if (isset($data["cod"]) && $data["cod"] == 401) {
      return ["success" => false, "error" => "API key không hợp lệ hoặc chưa kích hoạt."];
    }

    return ["success" => true, "data" => $data];
  }

  // ✅ Lấy thời tiết hiện tại theo thành phố hoặc tọa độ
  public function getCurrentWeather($city = null, $lat = null, $lon = null)
  {
    $params = [];
    if ($lat && $lon) {
      $params = ["lat" => $lat, "lon" => $lon];
    } else {
      $params = ["q" => $city ?? "Ho Chi Minh City"];
    }

    $res = $this->makeRequest("weather", $params);
    if (!$res["success"]) return $res;

    $data = $res["data"];
    return [
      "success" => true,
      "data" => [
        "city" => $data["name"] ?? $city,
        "country" => $data["sys"]["country"] ?? "",
        "temperature" => $data["main"]["temp"] ?? null,
        "feels_like" => $data["main"]["feels_like"] ?? null,
        "humidity" => $data["main"]["humidity"] ?? null,
        "pressure" => $data["main"]["pressure"] ?? null,
        "wind_speed" => $data["wind"]["speed"] ?? null,
        "description" => $data["weather"][0]["description"] ?? "",
        "icon_url" => "https://openweathermap.org/img/wn/" . ($data["weather"][0]["icon"] ?? "01d") . "@2x.png",
        "sunrise" => $data["sys"]["sunrise"] ?? null,
        "sunset" => $data["sys"]["sunset"] ?? null
      ]
    ];
  }

  // ✅ Lấy dự báo 5 ngày
  public function getForecast($city = null, $lat = null, $lon = null)
  {
    $params = [];
    if ($lat && $lon) {
      $params = ["lat" => $lat, "lon" => $lon];
    } else {
      $params = ["q" => $city ?? "Ho Chi Minh City"];
    }

    $res = $this->makeRequest("forecast", $params);
    if (!$res["success"]) return $res;

    $data = $res["data"];
    if (!isset($data["list"])) {
      return ["success" => false, "error" => "Không có dữ liệu thời tiết"];
    }

    $forecast = [];
    foreach ($data["list"] as $item) {
      $forecast[] = [
        "date" => $item["dt_txt"],
        "temperature" => $item["main"]["temp"],
        "humidity" => $item["main"]["humidity"],
        "wind_speed" => $item["wind"]["speed"],
        "description" => $item["weather"][0]["description"],
        "icon_url" => "https://openweathermap.org/img/wn/" . $item["weather"][0]["icon"] . "@2x.png"
      ];
    }

    return ["success" => true, "data" => $forecast];
  }
}

// ===== Router =====
$weather = new WeatherAPI();
$action = $_GET["action"] ?? "forecast";
$city = $_GET["city"] ?? null;
$lat = $_GET["lat"] ?? null;
$lon = $_GET["lon"] ?? null;

switch ($action) {
  case "current":
    echo json_encode($weather->getCurrentWeather($city, $lat, $lon), JSON_UNESCAPED_UNICODE);
    break;
  case "forecast":
  default:
    echo json_encode($weather->getForecast($city, $lat, $lon), JSON_UNESCAPED_UNICODE);
    break;
}