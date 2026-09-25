/**
 * =========================================================
 * CARD-STORAGE.JS - BỘ NÉN & GIẢI MÃ DỮ LIỆU THIỆP QUA URL
 * =========================================================
 * Giúp chia sẻ thiệp 100% tĩnh qua GitHub Pages mà không cần Backend Database!
 */

const JSONBIN_KEY = '$2a$10$9UrD.pyl/tW.yznI0vX3ge5.u7USfVKfz/iy/RCFCQMboP1lHtj52';

const CardStorage = {
  // Giải mã chuỗi URL-Safe Base64 thành JSON Object (Giữ lại để tương thích ngược các link cũ)
  decode(safeBase64) {
    try {
      if (!safeBase64) return null;
      let base64 = safeBase64.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Lỗi giải mã card data cũ:", e);
      return null;
    }
  },

  // Tải file âm thanh nhị phân lên Cloud (hỗ trợ file nhạc lớn tới 10MB mà không làm phình JSON thiệp)
  async uploadAudioToCloud(fileOrBlob) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout cho file âm thanh lớn
    try {
      const mime = fileOrBlob.type || 'audio/mpeg';
      const response = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: {
          'Content-Type': mime
        },
        body: fileOrBlob,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Máy chủ đám mây từ chối file âm thanh (Mã lỗi: ' + response.status + ').');
      }
      const data = await response.json();
      return `https://bytebin.lucko.me/${data.key}`;
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Lỗi khi tải file nhạc lên ByteBin:", e);
      throw e;
    }
  },

  // Lưu dữ liệu lên Cloud Database
  async saveToCloud(cardData) {
    const payload = JSON.stringify(cardData);
    const sizeInKB = Math.round(payload.length / 1024);
    if (sizeInKB > 9500) {
      throw new Error(`Dữ liệu thiệp quá nặng (${sizeInKB}KB > 9500KB giới hạn đám mây). Hãy tối ưu bớt ảnh chụp!`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
      // Đổi sang ByteBin (Miễn phí, Không cần Key, Tốc độ cao)
      const response = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Máy chủ Cloud từ chối kết nối (Mã lỗi: ' + response.status + ').');
      }
      const data = await response.json();
      return data.key; // Trả về ID của bản ghi trên ByteBin
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new Error('Quá thời gian kết nối (25s). Do mạng chậm hoặc ảnh quá nặng!');
      }
      console.error("Lỗi khi lưu dữ liệu thiệp lên cloud:", e);
      throw new Error(e.message || 'Lỗi mạng (Failed to fetch). Vui lòng thử lại sau.');
    }
  },

  // Tải dữ liệu từ Cloud Database dựa trên ID
  async loadFromCloud(id) {
    try {
      // Hỗ trợ cả link bytebin và tương thích ngược với JSONBin nếu ID có định dạng dài (JSONBin ID dài 24 ký tự)
      const isLegacyJsonBin = id.length > 20; 
      const fetchUrl = isLegacyJsonBin 
          ? `https://api.jsonbin.io/v3/b/${id}` 
          : `https://bytebin.lucko.me/${id}`;
          
      const headers = isLegacyJsonBin 
          ? { 'X-Master-Key': '$2a$10$9UrD.pyl/tW.yznI0vX3ge5.u7USfVKfz/iy/RCFCQMboP1lHtj52' } 
          : {};

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      return isLegacyJsonBin ? data.record : data;
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu thiệp từ cloud:", e);
      return null;
    }
  },

  // Lấy dữ liệu thiệp hiện tại từ URL (ID Cloud hoặc Hash Fallback)
  async getFromUrl() {
    try {
      // 1. Ưu tiên kiểm tra ID từ tham số URL (?id=...)
      const params = new URLSearchParams(window.location.search);
      const binId = params.get("id");
      if (binId) {
        const cloudData = await this.loadFromCloud(binId);
        if (cloudData) return cloudData;
      }

      // 2. Fallback: Kiểm tra hash #card=... (Dành cho thiệp cũ chưa dùng cloud)
      const hash = window.location.hash;
      if (hash && hash.includes("card=")) {
        const token = hash.split("card=")[1]?.split("&")[0];
        const data = this.decode(token);
        if (data) return data;
      }

      // 3. Fallback: Kiểm tra query ?card=...
      const cardParam = params.get("card");
      if (cardParam) {
        const data = this.decode(cardParam);
        if (data) return data;
      }

      // 4. Fallback cuối cùng: localStorage backup
      const localData = localStorage.getItem("custom_birthday_card");
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.warn("Không tìm thấy dữ liệu thiệp hợp lệ:", e);
    }
    return null;
  },

  // Tạo URL chia sẻ thông qua ID trên Cloud
  createShareUrl(recordId) {
    const urlObj = new URL(window.location.href);
    let path = urlObj.pathname;
    // Đảm bảo lấy đúng thư mục gốc
    if (!path.endsWith('/')) {
        if (path.includes('.html')) {
            path = path.substring(0, path.lastIndexOf('/') + 1);
        } else {
            path = path + '/';
        }
    }
    // Gắn tham số ?id=... để tải thiệp từ Cloud
    const targetUrl = urlObj.origin + path + 'gift.html?id=' + recordId;
    return targetUrl;
  }
};

/**
 * Quản lý lưu trữ âm thanh dung lượng lớn qua IndexedDB (không bị giới hạn 5MB như localStorage)
 */
const CardAudioStorage = {
  dbPromise: null,
  getDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        try {
          const req = indexedDB.open("BirthdayCardAudioDB", 1);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("audios")) {
              db.createObjectStore("audios");
            }
          };
          req.onsuccess = (e) => resolve(e.target.result);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }
    return this.dbPromise;
  },
  async set(key, val) {
    const db = await this.getDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction("audios", "readwrite");
        tx.objectStore("audios").put(val, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  },
  async get(key) {
    const db = await this.getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction("audios", "readonly");
        const req = tx.objectStore("audios").get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }
};

window.CardStorage = CardStorage;
window.CardAudioStorage = CardAudioStorage;

