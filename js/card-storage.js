/**
 * =========================================================
 * CARD-STORAGE.JS - BỘ NÉN & GIẢI MÃ DỮ LIỆU THIỆP QUA URL
 * =========================================================
 * Giúp chia sẻ thiệp 100% tĩnh qua GitHub Pages mà không cần Backend Database!
 */

const CardStorage = {
  // Nén JSON thành chuỗi URL-Safe Base64
  encode(data) {
    try {
      const jsonStr = JSON.stringify(data);
      // Mã hóa UTF-8 an toàn sang base64
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, utf8Bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      console.error("Lỗi mã hóa card data:", e);
      return "";
    }
  },

  // Giải mã chuỗi URL-Safe Base64 thành JSON Object
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
      console.error("Lỗi giải mã card data:", e);
      return null;
    }
  },

  // Lấy dữ liệu thiệp hiện tại từ URL (Hash hoặc Query Param)
  getFromUrl() {
    try {
      // 1. Kiểm tra hash: #card=...
      const hash = window.location.hash;
      if (hash && hash.includes("card=")) {
        const token = hash.split("card=")[1]?.split("&")[0];
        const data = this.decode(token);
        if (data) return data;
      }

      // 2. Kiểm tra query: ?card=...
      const params = new URLSearchParams(window.location.search);
      const cardParam = params.get("card");
      if (cardParam) {
        const data = this.decode(cardParam);
        if (data) return data;
      }

      // 3. Kiểm tra localStorage backup
      const localData = localStorage.getItem("custom_birthday_card");
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.warn("Không tìm thấy dữ liệu thiệp trên URL:", e);
    }
    return null;
  },

  // Tạo URL chia sẻ hoàn chỉnh
  createShareUrl(data) {
    const encodedData = this.encode(data);
    const viewUrl = `${window.location.origin}/gift.html#card=${encodedData}`;
    return viewUrl;
  }
};

window.CardStorage = CardStorage;
