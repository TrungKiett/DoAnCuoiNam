import { useState } from "react";

export default function ChatGemini() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(
        "http://yensonfarm.io.vn/khoi_api/ind4x.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );

      const data = await res.json();

      if (data.error) {
        setResponse("❌ Lỗi: " + data.error);
      } else {
        setResponse(data.answer);
      }
    } catch (err) {
      setResponse("🚨 Lỗi kết nối: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ width: 500, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>💬 Chat với Gemini AI</h2>
      <textarea
        rows="4"
        style={{ width: "100%", padding: 10 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Nhập câu hỏi..."
      />
      <button
        onClick={sendMessage}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Đang gửi..." : "Gửi câu hỏi"}
      </button>

      {response && (
        <div
          style={{
            marginTop: 20,
            padding: 10,
            background: "#eef",
            borderRadius: 6,
          }}
        >
          <b>Trả lời AI:</b>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
