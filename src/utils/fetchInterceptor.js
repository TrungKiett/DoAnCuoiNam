/**
 * Global fetch interceptor để tự động chuyển các request bị CORS sang proxy
 * Import file này trong index.js để kích hoạt
 */

const API_BASE = process.env.REACT_APP_URL_API_BACKEND || "http://yensonfarm.io.vn/khoi_api";

// List các domain cần proxy (domain bị CORS)
const PROXY_DOMAINS = [
    'gstatics.sgp1.digitaloceanspaces.com',
    'sgp1.digitaloceanspaces.com'
];

/**
 * Kiểm tra xem URL có cần proxy không
 */
function needsProxy(url) {
    try {
        const urlObj = new URL(url);
        return PROXY_DOMAINS.some(domain => urlObj.hostname.includes(domain));
    } catch (e) {
        return false;
    }
}

/**
 * Intercept fetch requests
 */
const originalFetch = window.fetch;

window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    
    // Nếu URL cần proxy và không phải đã là proxy endpoint
    if (needsProxy(url) && !url.includes('proxy_json.php')) {
        console.log('[Fetch Interceptor] Redirecting to proxy:', url);
        const proxyUrl = `${API_BASE}/api/proxy_json.php?url=${encodeURIComponent(url)}`;
        // Thay thế URL đầu tiên trong args
        args[0] = proxyUrl;
    }
    
    return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest nếu có
if (window.XMLHttpRequest) {
    const originalOpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._method = method;
        this._originalUrl = url;
        
        // Nếu URL cần proxy, thay thế bằng proxy URL
        if (needsProxy(url) && !url.includes('proxy_json.php')) {
            console.log('[XHR Interceptor] Redirecting to proxy:', url);
            const proxyUrl = `${API_BASE}/api/proxy_json.php?url=${encodeURIComponent(url)}`;
            return originalOpen.apply(this, [method, proxyUrl, ...rest]);
        }
        
        return originalOpen.apply(this, [method, url, ...rest]);
    };
}

export default {
    needsProxy,
    PROXY_DOMAINS
};
