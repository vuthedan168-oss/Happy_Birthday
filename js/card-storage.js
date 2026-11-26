/**
 * =========================================================
 * CARD-STORAGE.JS - BỘ NÉN & GIẢI MÃ DỮ LIỆU THIỆP QUA URL
 * =========================================================
 * Giúp chia sẻ thiệp 100% tĩnh qua GitHub Pages mà không cần Backend Database!
 */

const JSONBIN_KEY = '$2a$10$9UrD.pyl/tW.yznI0vX3ge5.u7USfVKfz/iy/RCFCQMboP1lHtj52';

const CardStorage = {
  // Mã hóa JSON Object sang URL-Safe Base64 (đồng bộ 100% với decode)
  encode(cardData) {
    try {
      const jsonStr = JSON.stringify(cardData);
      const bytes = new TextEncoder().encode(jsonStr);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      console.error("Lỗi mã hóa card data:", e);
      return null;
    }
  },

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

  // Nén gzip chuỗi JSON bằng CompressionStream gốc của trình duyệt
  async _gzipString(str) {
    try {
      if (typeof CompressionStream === "undefined") return null;
      const stream = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip"));
      return await new Response(stream).blob();
    } catch (e) {
      return null;
    }
  },

  // Tải file nhị phân (âm thanh / ảnh) lên Cloud (api.pastes.dev - CORS đầy đủ, không bị WAF chặn)
  async uploadBinaryToCloud(fileOrBlob, defaultMime = 'application/octet-stream') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000);
    try {
      const mime = fileOrBlob.type || defaultMime;
      const response = await fetch('https://api.pastes.dev/post', {
        method: 'POST',
        headers: {
          'Content-Type': mime
        },
        body: fileOrBlob,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Máy chủ đám mây từ chối file (Mã lỗi: ' + response.status + ').');
      }
      const data = await response.json();
      return `https://api.pastes.dev/${data.key}`;
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Lỗi khi tải file nhị phân lên Cloud:", e);
      throw e;
    }
  },

  // Tải file âm thanh nhị phân lên Cloud (hỗ trợ file nhạc lớn tới 10MB mà không làm phình JSON thiệp)
  async uploadAudioToCloud(fileOrBlob) {
    return await this.uploadBinaryToCloud(fileOrBlob, 'audio/mpeg');
  },

  // Lưu dữ liệu lên Cloud Database (Ưu tiên api.pastes.dev, tự động dự phòng sang pastefy.app)
  async saveToCloud(cardData) {
    const payload = JSON.stringify(cardData);
    const sizeInKB = Math.round(payload.length / 1024);
    if (sizeInKB > 9500) {
      throw new Error(`Dữ liệu thiệp quá nặng (${sizeInKB}KB > 9500KB giới hạn đám mây). Hãy tối ưu bớt ảnh chụp!`);
    }

    let primaryError = null;

    // 1. Primary: api.pastes.dev (Open CORS, tốc độ cao, hỗ trợ payload lớn)
    const controller1 = new AbortController();
    const timeout1 = setTimeout(() => controller1.abort(), 20000);
    try {
      const response = await fetch('https://api.pastes.dev/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload,
        signal: controller1.signal
      });
      clearTimeout(timeout1);
      if (response.ok) {
        const data = await response.json();
        if (data && data.key) {
          return data.key;
        }
      }
      throw new Error('Máy chủ pastes.dev từ chối kết nối (Mã lỗi: ' + response.status + ').');
    } catch (e1) {
      clearTimeout(timeout1);
      primaryError = e1;
      console.warn("Primary Cloud (pastes.dev) lỗi, chuyển sang Backup Cloud:", e1);
    }

    // 2. Fallback: pastefy.app (Open CORS *)
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 20000);
    try {
      const pfRes = await fetch('https://pastefy.app/api/v2/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Happy Birthday Card',
          content: payload,
          type: 'PASTE',
          visibility: 'UNLISTED'
        }),
        signal: controller2.signal
      });
      clearTimeout(timeout2);
      if (pfRes.ok) {
        const pfData = await pfRes.json();
        const pfId = pfData?.id || pfData?.paste?.id;
        if (pfId) {
          return 'pf_' + pfId;
        }
      }
      throw new Error('Backup Cloud không trả về ID hợp lệ.');
    } catch (e2) {
      clearTimeout(timeout2);
      console.error("Cả hai máy chủ Cloud đều thất bại:", primaryError, e2);
      if (primaryError && primaryError.name === 'AbortError') {
        throw new Error('Quá thời gian kết nối (20s). Do mạng chậm hoặc ảnh quá nặng!');
      }
      throw new Error((primaryError && primaryError.message) || e2.message || 'Lỗi mạng (Failed to fetch). Vui lòng thử lại sau.');
    }
  },

  // Tải dữ liệu từ Cloud Database dựa trên ID (hỗ trợ pastes.dev, pastefy.app, bytebin cũ & JSONBin cũ)
  async loadFromCloud(id) {
    try {
      if (!id) return null;

      // 1. Bản ghi Pastefy (pf_...)
      if (id.startsWith('pf_')) {
        const pfId = id.slice(3);
        const pfRes = await fetch(`https://pastefy.app/api/v2/paste/${pfId}`);
        if (!pfRes.ok) return null;
        const pfData = await pfRes.json();
        const rawContent = pfData?.content ?? pfData?.paste?.content;
        return typeof rawContent === 'string' ? JSON.parse(rawContent) : (rawContent || null);
      }

      // 2. Tương thích ngược JSONBin cũ (ID dài > 20 ký tự)
      if (id.length > 20) {
        const jbRes = await fetch(`https://api.jsonbin.io/v3/b/${id}`, {
          method: 'GET',
          headers: { 'X-Master-Key': '$2a$10$9UrD.pyl/tW.yznI0vX3ge5.u7USfVKfz/iy/RCFCQMboP1lHtj52' }
        });
        if (!jbRes.ok) return null;
        const jbData = await jbRes.json();
        return jbData.record;
      }

      // 3. Mặc định: thử api.pastes.dev trước, nếu 404 thì thử legacy bytebin.lucko.me
      try {
        const pRes = await fetch(`https://api.pastes.dev/${id}`);
        if (pRes.ok) {
          return await pRes.json();
        }
      } catch (ePastes) {
        console.warn("Lỗi tải từ pastes.dev, thử legacy bytebin:", ePastes);
      }

      try {
        const bRes = await fetch(`https://bytebin.lucko.me/${id}`);
        if (bRes.ok) {
          return await bRes.json();
        }
      } catch (eLegacy) {}

      return null;
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu thiệp từ cloud:", e);
      return null;
    }
  },

  // Lấy dữ liệu thiệp hiện tại từ URL (ID Cloud hoặc Hash Fallback)
  async getFromUrl() {
    try {
      // 1. Ưu tiên kiểm tra ID từ tham số URL (?id=...) (bỏ qua 'preview' để không tốn request mạng lỗi)
      const params = new URLSearchParams(window.location.search);
      const binId = params.get("id");
      if (binId && binId !== "preview") {
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

      // 4. Fallback cuối cùng: localStorage custom_birthday_card và đồng bộ bản nháp Studio mới nhất
      let resultData = null;
      const localData = localStorage.getItem("custom_birthday_card");
      if (localData) {
        try {
          resultData = JSON.parse(localData);
        } catch (e) {
          console.error("Lỗi parse backup local card:", e);
        }
      }

      // Đọc mốc ngày giờ độc lập siêu nhẹ từ localStorage nếu có
      try {
        const dateStr = localStorage.getItem("custom_birthday_card_dates");
        if (dateStr) {
          const dates = JSON.parse(dateStr);
          if (dates) {
            if (!resultData) resultData = {};
            if (dates.startDate !== undefined && dates.startDate !== "") {
              resultData.startDate = dates.startDate;
              resultData.unlockDateTime = dates.startDate;
            }
            if (dates.endDate !== undefined) {
              resultData.endDate = dates.endDate;
            }
          }
        }
      } catch (eDates) {}

      // Luôn đồng bộ mốc ngày giờ và thông tin từ bản nháp Studio nếu đang ở chế độ xem trước (preview)
      const isPreviewMode = binId === "preview" || params.get("countdown") === "preview" || !binId;
      if (isPreviewMode) {
        const draftStr = localStorage.getItem("birthday_card_draft_v2");
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            if (draft && draft.fields) {
              if (!resultData) resultData = {};
              if (draft.fields["input-start-date"] !== undefined) {
                resultData.startDate = draft.fields["input-start-date"];
                resultData.unlockDateTime = draft.fields["input-start-date"];
              }
              if (draft.fields["input-end-date"] !== undefined) {
                resultData.endDate = draft.fields["input-end-date"];
              }
              if (draft.fields["input-recipient"]) {
                resultData.recipientName = draft.fields["input-recipient"];
              }
              if (draft.fields["input-sender"]) {
                resultData.senderName = draft.fields["input-sender"];
              }
              if (draft.fields["input-title"]) {
                resultData.title = draft.fields["input-title"];
              }
              if (draft.fields["input-countdown-url"] && draft.musicStageCountdown === "custom-url") {
                const cdUrl = draft.fields["input-countdown-url"].trim();
                resultData.countdownMusicUrl = cdUrl;
                if (!resultData.sceneMusic) resultData.sceneMusic = {};
                if (!resultData.sceneMusic.countdown) resultData.sceneMusic.countdown = {};
                resultData.sceneMusic.countdown.src = cdUrl;
              }
            }
          } catch (draftErr) {
            console.warn("Lỗi đọc draft đồng bộ preview:", draftErr);
          }
        }
      }

      // Ưu tiên cao nhất: Tham số start & end trực tiếp từ URL query nếu có
      const paramStart = params.get("start");
      const paramEnd = params.get("end");
      if (paramStart) {
        if (!resultData) resultData = {};
        resultData.startDate = paramStart;
        resultData.unlockDateTime = paramStart;
      }
      if (paramEnd) {
        if (!resultData) resultData = {};
        resultData.endDate = paramEnd;
      }

      if (resultData) {
        return resultData;
      }
    } catch (e) {
      console.warn("Không tìm thấy dữ liệu thiệp hợp lệ:", e);
    }
    return null;
  },

  // Tạo URL chia sẻ thông qua ID trên Cloud kèm tên gợi nhớ (Custom Slug)
  createShareUrl(recordId, customSlug = "") {
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
    
    // Nếu recordId là Object dữ liệu dự phòng (khi Cloud hoàn toàn ngoại tuyến)
    let idStr = recordId;
    let hashCardSuffix = "";
    if (typeof recordId === "object" && recordId !== null) {
      try {
        localStorage.setItem("custom_birthday_card", JSON.stringify(recordId));
      } catch(e) {}
      const encoded = this.encode(recordId);
      if (encoded && encoded.length <= 14000) {
        idStr = "";
        hashCardSuffix = "#card=" + encoded;
      } else {
        idStr = "preview";
      }
    }

    // Gắn tham số ?id=... và ?to=... để hiển thị tên gợi nhớ đẹp mắt
    const queryParts = [];
    if (customSlug && typeof customSlug === "string" && customSlug.trim()) {
      // Chuẩn hóa tiếng Việt bỏ dấu và chuyển ký tự đặc biệt thành dấu gạch ngang
      const cleanSlug = customSlug.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (cleanSlug) {
        queryParts.push('to=' + encodeURIComponent(cleanSlug));
      }
    }
    if (idStr) {
      queryParts.push('id=' + idStr);
    }

    const queryStr = queryParts.length ? ('?' + queryParts.join('&')) : '';
    return urlObj.origin + path + 'gift.html' + queryStr + hashCardSuffix;
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

