const rawBase = process.env.REACT_APP_URL_API_BACKEND || "http://localhost/doancuoinam/src/khoi_api/";

// Đảm bảo chỉ có một dấu / ở cuối để ghép URL gọn gàng
const normalizedBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export const API_BASE = normalizedBase;

export const apiUrl = (path = "") =>
  `${normalizedBase}${String(path).replace(/^\/+/, "")}`;


