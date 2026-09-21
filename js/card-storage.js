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

  // Lưu dữ liệu lên Cloud Database
  async saveToCloud(cardData) {
    const payload = JSON.stringify(cardData);
    const sizeInKB = Math.round(payload.length / 1024);
    if (sizeInKB > 5000) {
      throw new Error(`Dữ liệu quá nặng (${sizeInKB}KB > 5000KB giới hạn). Hãy xóa bớt ảnh hoặc dùng "Thêm ảnh bằng Link URL"!`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      // Đổi sang ByteBin (Miễn phí, Không cần Key, Tốc độ cao)
      const response = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BirthdayCardCreator/1.0'
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
        throw new Error('Quá thời gian kết nối (20s). Do mạng chậm hoặc ảnh quá nặng!');
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

window.CardStorage = CardStorage;
