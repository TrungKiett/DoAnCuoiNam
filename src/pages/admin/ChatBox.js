import { useState } from "react";
import { MessageCircle, X, Copy, ImagePlus, Trash2 } from "lucide-react";

export default function ChatGemini() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return;

    const userMsg = { sender: "user", text: message, image: selectedImage };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setSelectedImage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("message", message);
    if (selectedImage) formData.append("image", selectedImage);

    try {
      const res = await fetch(
        "http://localhost/doancuoinam/src/be_management/controller/components/auth/chatbox.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      const aiMsg = {
        sender: "ai",
        text: data.answer || "❌ Lỗi: " + (data.error || "Không rõ"),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "🚨 Lỗi kết nối: " + err.message },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  const removeImage = () => setSelectedImage(null);

  return (
    <>
      {/* Nút bật/tắt chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Hộp chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-white shadow-xl border border-gray-200 rounded-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-blue-600 text-white py-3 px-4 font-semibold text-lg flex justify-between items-center">
            💬 YenSon Farm
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Khung chat */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {messages.length === 0 && (
              <div className="text-gray-400 text-center italic mt-10">
                Hỏi bất kỳ điều gì bạn muốn 👇
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.image && (
                  <img
                    src={URL.createObjectURL(msg.image)}
                    alt="Ảnh đã gửi"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                )}
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-base ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Nút Copy */}
                {msg.sender === "ai" && (
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs shadow-sm active:scale-95 transition-transform"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                    {copiedIndex === i && (
                      <span className="text-green-600 text-sm font-medium">
                        ✓ Đã sao chép
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl text-gray-500 italic">
                  Đang trả lời...
                </div>
              </div>
            )}
          </div>

          {/* Ô nhập + ảnh */}
          <div className="border-t p-3 bg-gray-50 flex flex-col gap-2">
            {selectedImage && (
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Ảnh đã chọn"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            <div className="flex gap-2 items-center">
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg flex items-center gap-1">
                <ImagePlus size={16} />
                <span className="text-sm">Ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <textarea
                rows="1"
                className="flex-1 resize-none p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                placeholder="Nhập câu hỏi và nhấn Enter..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
