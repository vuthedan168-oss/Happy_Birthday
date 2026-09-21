/**
 * =========================================================
 * CREATOR.JS - XỬ LÝ TOÀN BỘ FORM TẠO THIỆP SINH NHẬT
 * =========================================================
 */

async function uploadImageToCloud(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 0. Auto-save nháp
  initAutoSaveDraft();

  // 1. Quản lý danh sách ảnh kỷ niệm Polaroid
  initPhotoManager();

  // 2. Quản lý câu hỏi trắc nghiệm động (số lượng tùy ý)
  initQuizManager();

  // 3. Quản lý nhạc nền theo từng phân đoạn & thử phát nhạc
  initMusicManager();

  // 4. Quản lý bộ Icon / Sticker
  initIconThemeManager();

  // 5. Xử lý tạo link & sao chép
  initFormSubmit();
});

// State danh sách ảnh kỷ niệm
let galleryPhotos = [
  {
    url: "assets/images/girl/girl2.jpeg",
    caption: "Nụ cười rạng rỡ nhất ☀️"
  },
  {
    url: "assets/images/girl/girl3.jpeg",
    caption: "Những khoảnh khắc ngập tràn niềm vui 🌸"
  },
  {
    url: "assets/images/photo1.jpg",
    caption: "Kỷ niệm ngọt ngào 💖"
  },
  {
    url: "assets/images/photo2.jpg",
    caption: "Mỗi ngày đều là món quà ✨"
  },
  {
    url: "assets/images/photo3.jpg",
    caption: "Bình yên và hạnh phúc 🍀"
  },
  {
    url: "assets/images/photo4.jpg",
    caption: "Tuổi mới thật rực rỡ! 🎂"
  }
];

// Danh sách nhạc preset
const MUSIC_PRESETS = {
  "preset-romantic-candle": {
    title: "Món Quà Sinh Nhật Lãng Mạn (birthday.mp3)",
    src: "assets/audio/birthday.mp3"
  },
  "preset-piano": {
    title: "Happy Birthday Piano Melody",
    src: "assets/audio/happy-birthday.mp3"
  },
  "preset-lofi": {
    title: "Sweet Lofi Memories",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
  },
  "preset-romantic": {
    title: "Romantic Sweet Harp & Strings",
    src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=romantic-piano-10738.mp3"
  },
  "preset-party": {
    title: "Upbeat Birthday Celebration",
    src: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=happy-birthday-party-124632.mp3"
  },
  "preset-synth": {
    title: "Web Audio Chimes & Synth",
    src: "" // Tự động dùng Web Audio API tích hợp
  }
};

let currentAudioSrc = "assets/audio/birthday.mp3";
let currentAudioTitle = "Món Quà Sinh Nhật Lãng Mạn";

/**
 * Quản lý danh sách ảnh kỷ niệm
 */
function initPhotoManager() {
  const container = document.getElementById("polaroid-items-list");
  const btnAddUrl = document.getElementById("btn-add-photo-url");
  const inputUpload = document.getElementById("input-photo-upload");

  const renderList = () => {
    if (!container) return;
    container.innerHTML = "";

    galleryPhotos.forEach((photo, index) => {
      const item = document.createElement("div");
      item.className = "polaroid-edit-item";
      item.innerHTML = `
        <img src="${photo.url}" alt="Preview" class="polaroid-thumb" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
        <div class="polaroid-inputs">
          <input type="text" class="form-control form-control-sm photo-url-input" value="${photo.url}" placeholder="Đường dẫn ảnh URL...">
          <input type="text" class="form-control form-control-sm photo-caption-input" value="${photo.caption}" placeholder="Chú thích cho ảnh...">
        </div>
        <button type="button" class="btn-remove-photo" title="Xóa ảnh này" data-index="${index}">&times;</button>
      `;

      // Cập nhật caption
      const captionInput = item.querySelector(".photo-caption-input");
      captionInput.addEventListener("input", (e) => {
        galleryPhotos[index].caption = e.target.value;
      });

      // Cập nhật url
      const urlInput = item.querySelector(".photo-url-input");
      urlInput.addEventListener("change", (e) => {
        galleryPhotos[index].url = e.target.value.trim();
        renderList();
      });

      // Xóa ảnh
      const btnRemove = item.querySelector(".btn-remove-photo");
      btnRemove.addEventListener("click", () => {
        galleryPhotos.splice(index, 1);
        renderList();
      });

      container.appendChild(item);
    });
  };

  renderList();

  // Nút thêm ảnh từ URL
  if (btnAddUrl) {
    btnAddUrl.addEventListener("click", () => {
      const url = prompt("Nhập đường dẫn ảnh (URL):");
      if (url && url.trim()) {
        galleryPhotos.push({
          url: url.trim(),
          caption: "Kỷ niệm mới ✨"
        });
        renderList();
      }
    });
  }

  // Tải ảnh từ thiết bị (Upload lên mây)
  if (inputUpload) {
    inputUpload.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const uploadStatus = document.getElementById("upload-text-status");
      const oldText = uploadStatus ? uploadStatus.textContent : "📁 Tải ảnh từ thiết bị";
      if (uploadStatus) {
        uploadStatus.textContent = "⏳ Đang tải ảnh lên máy chủ mây, vui lòng đợi...";
      }
      inputUpload.disabled = true;

      try {
        for (const file of files) {
          const url = await uploadImageToCloud(file);
          const caption = file.name.replace(/\\.[^/.]+$/, "") || "Kỷ niệm đẹp ✨";

          galleryPhotos.push({
            url: url,
            caption: caption
          });
        }
        renderList();
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        alert("Đã có lỗi khi tải ảnh lên máy chủ. Vui lòng thử lại!");
      } finally {
        if (uploadStatus) {
          uploadStatus.textContent = oldText;
        }
        inputUpload.disabled = false;
        inputUpload.value = "";
      }
    });
  }
}

// State danh sách câu hỏi Quiz động
let dynamicQuizList = [
  {
    question: "Hôm nay là ngày sinh nhật đặc biệt của thiên thần nào nhỉ? 🧚‍♀️",
    hint: "Tất cả các câu trả lời đều hướng về cậu đó!",
    correctIndex: 0,
    options: [
      "✨ Hương Giang xinh đẹp & rạng ngời ✨",
      "🌸 Một nàng tiên nữ vừa giáng trần 🌸",
      "👑 Công chúa đáng yêu nhất vũ trụ 👑"
    ]
  },
  {
    question: "Vũ khí bí mật khiến ai gặp cũng phải đổ gục trước thiên thần là gì? 💫",
    hint: "Vì nụ cười của cậu có siêu năng lượng tích cực đó!",
    correctIndex: 0,
    options: [
      "Nụ cười tỏa nắng xua tan mọi mệt mỏi ☀️",
      "Trái tim ấm áp và sự quan tâm chân thành 🍓",
      "Đôi mắt biết cười lấp lánh như ngàn vì sao 🌟"
    ]
  },
  {
    question: "Hôm nay thiên thần xứng đáng nhận được điều gì nhất? 🎁",
    hint: "Cậu xứng đáng với tất cả những điều ngọt ngào nhất vũ trụ!",
    correctIndex: 0,
    options: [
      "Tất cả tình yêu thương & hạnh phúc trên đời 💌",
      "Mọi ước mơ tuổi mới đều thành hiện thực rực rỡ 🌈",
      "Một năm mới luôn may mắn, bình an và rộn rã tiếng cười 🍀"
    ]
  }
];

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Quản lý câu hỏi trắc nghiệm số lượng tùy ý
 */
function initQuizManager() {
  const container = document.getElementById("quiz-questions-container");
  const btnAdd = document.getElementById("btn-add-quiz-q");

  const renderQuizList = () => {
    if (!container) return;
    container.innerHTML = "";

    if (dynamicQuizList.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 25px; color: #94a3b8; background: #f8fafc; border-radius: 12px; border: 1.5px dashed #cbd5e1;">
          <em>Chưa có câu hỏi nào. Bấm nút "Thêm Câu Hỏi Mới" bên dưới để tạo thử thách!</em>
        </div>
      `;
      return;
    }

    dynamicQuizList.forEach((qItem, qIdx) => {
      const card = document.createElement("div");
      card.className = "quiz-item-card";
      card.innerHTML = `
        <div class="quiz-card-header">
          <span class="quiz-q-num-badge">🌟 Câu hỏi ${qIdx + 1}</span>
          <button type="button" class="btn-delete-q" data-qidx="${qIdx}">🗑️ Xóa câu này</button>
        </div>
        <div class="form-group mb-2">
          <label>Nội dung câu hỏi:</label>
          <input type="text" class="form-control q-text-input" value="${escapeHtml(qItem.question)}" placeholder="Ví dụ: Hôm nay là ngày gì nhỉ?">
        </div>
        <div class="form-group mb-2">
          <label>Gợi ý (hiển thị khi trả lời):</label>
          <input type="text" class="form-control q-hint-input" value="${escapeHtml(qItem.hint || '')}" placeholder="Ví dụ: Cậu luôn là người tuyệt vời nhất!">
        </div>
        <div class="quiz-options-wrapper">
          <label style="font-size: 0.88rem; font-weight: 600; color: #475569;">
            Các đáp án (Tích chọn tròn để xác định đáp án đúng):
          </label>
          ${qItem.options.map((opt, optIdx) => `
            <div class="quiz-opt-row">
              <input type="radio" name="q_correct_${qIdx}" value="${optIdx}" ${qItem.correctIndex === optIdx ? "checked" : ""}>
              <input type="text" class="form-control form-control-sm q-opt-input" data-optidx="${optIdx}" value="${escapeHtml(opt)}" placeholder="Đáp án ${optIdx + 1}">
            </div>
          `).join("")}
        </div>
      `;

      // Listeners
      const qTextInput = card.querySelector(".q-text-input");
      qTextInput.addEventListener("input", (e) => {
        dynamicQuizList[qIdx].question = e.target.value;
      });

      const qHintInput = card.querySelector(".q-hint-input");
      qHintInput.addEventListener("input", (e) => {
        dynamicQuizList[qIdx].hint = e.target.value;
      });

      const optInputs = card.querySelectorAll(".q-opt-input");
      optInputs.forEach((optIn) => {
        optIn.addEventListener("input", (e) => {
          const optIdx = parseInt(e.target.dataset.optidx, 10);
          dynamicQuizList[qIdx].options[optIdx] = e.target.value;
        });
      });

      const radios = card.querySelectorAll(`input[name="q_correct_${qIdx}"]`);
      radios.forEach((r) => {
        r.addEventListener("change", (e) => {
          dynamicQuizList[qIdx].correctIndex = parseInt(e.target.value, 10);
        });
      });

      const btnDel = card.querySelector(".btn-delete-q");
      btnDel.addEventListener("click", () => {
        dynamicQuizList.splice(qIdx, 1);
        renderQuizList();
      });

      container.appendChild(card);
    });
  };

  renderQuizList();

  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      dynamicQuizList.push({
        question: `Thử thách đặc biệt số ${dynamicQuizList.length + 1} 💖`,
        hint: "Gợi ý ngọt ngào dành riêng cho bạn ✨",
        correctIndex: 0,
        options: ["Đáp án A siêu dễ thương", "Đáp án B tuyệt vời", "Đáp án C xuất sắc"]
      });
      renderQuizList();
    });
  }
}

// Cấu hình âm nhạc theo từng giai đoạn
let currentPlayingStage = null;

/**
 * Quản lý chọn nhạc & test nhạc theo từng giai đoạn
 */
function initMusicManager() {
  const audioPlayer = document.getElementById("creator-audio-player");
  const previewBtns = document.querySelectorAll(".audio-preview-btn");

  previewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const selectEl = document.getElementById(targetId);
      if (!selectEl) return;
      
      const trackUrl = selectEl.value;

      if (btn.classList.contains("playing")) {
        audioPlayer.pause();
        btn.textContent = "▶️ Nghe thử";
        btn.classList.remove("playing");
      } else {
        previewBtns.forEach(b => {
          b.textContent = "▶️ Nghe thử";
          b.classList.remove("playing");
        });

        if (!trackUrl || trackUrl.startsWith("custom")) {
          alert("Vui lòng chọn nhạc hợp lệ (chọn file tải lên hoặc điền URL)!");
          return;
        }

        audioPlayer.src = trackUrl;
        audioPlayer.play().then(() => {
          btn.textContent = "⏸️ Dừng lại";
          btn.classList.add("playing");
        }).catch(e => {
          console.error("Play error", e);
          alert("Không thể phát nhạc: " + e.message);
        });
      }
    });
  });

  const stages = ["bg"];
  stages.forEach(stage => {
    const select = document.getElementById(`music-${stage}`);
    const fileInput = document.querySelector(`.stage-file-input[data-stage="${stage}"]`);
    const urlInput = document.querySelector(`.stage-url-input[data-stage="${stage}"]`);
    const uploadBox = document.querySelector(`.stage-upload-box[data-stage="${stage}"]`);
    const urlBox = document.querySelector(`.stage-url-box[data-stage="${stage}"]`);
    const statusBadge = document.querySelector(`.audio-status-badge[data-stage="${stage}"]`);

    if (select) {
      select.addEventListener("change", () => {
        const val = select.value;
        if (val === "custom-upload") {
          uploadBox.style.display = "block";
          urlBox.style.display = "none";
        } else if (val === "custom-url") {
          uploadBox.style.display = "none";
          urlBox.style.display = "block";
        } else {
          uploadBox.style.display = "none";
          urlBox.style.display = "none";
          if (statusBadge) statusBadge.textContent = "Đã chọn nhạc có sẵn";
        }
      });
    }

    if (fileInput && select) {
      fileInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => {
            const opt = select.options[select.selectedIndex];
            opt.value = ev.target.result;
            if (statusBadge) statusBadge.textContent = file.name;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (urlInput && select) {
      urlInput.addEventListener("input", () => {
        const opt = select.options[select.selectedIndex];
        opt.value = urlInput.value.trim();
        if (statusBadge) statusBadge.textContent = "Link MP3 đã nhập";
      });
    }
  });

  if (audioPlayer) {
    audioPlayer.addEventListener("ended", () => {
      previewBtns.forEach(b => {
        b.textContent = "▶️ Nghe thử";
        b.classList.remove("playing");
      });
    });
  }
}

/**
 * Quản lý bộ Icon & Sticker
 */
function initIconThemeManager() {
  const presetCards = document.querySelectorAll(".icon-preset-card");
  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      presetCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

/**
 * Thu thập toàn bộ dữ liệu từ Form để xuất ra Cấu hình Card
 */
function collectFormData() {
  const title = document.getElementById("input-title")?.value.trim() || "Chúc Mừng Sinh Nhật! 🎉";
  const recipient = document.getElementById("input-recipient")?.value.trim() || "Hương Giang";
  const sender = document.getElementById("input-sender")?.value.trim() || "Tớ";
  const birthDay = parseInt(document.getElementById("input-birth-day")?.value, 10) || 17;
  const birthMonth = parseInt(document.getElementById("input-birth-month")?.value, 10) || 7;
  const nickname = document.getElementById("input-nickname")?.value.trim() || "";
  const wishesText = document.getElementById("input-wishes")?.value.trim() || "";
  const birthdayDate = document.getElementById("input-birthday-date")?.value.trim() || `${birthDay} Tháng ${birthMonth}`;
  const signature = document.getElementById("input-signature")?.value.trim() || `— ${sender}`;
  const customSlug = document.getElementById("input-custom-slug")?.value.trim() || "";
  const startDate = document.getElementById("input-start-date")?.value || "";
  const endDate = document.getElementById("input-end-date")?.value || "";

  // 4 điều ước may mắn
  const wish1 = document.getElementById("input-wish-1")?.value.trim() || "Hạnh phúc hơn";
  const wish2 = document.getElementById("input-wish-2")?.value.trim() || "Trúng Vietlott";
  const wish3 = document.getElementById("input-wish-3")?.value.trim() || "Khỏe mạnh hơn";
  const wish4 = document.getElementById("input-wish-4")?.value.trim() || "Bình yên hơn";
  const wishList = [wish1, wish2, wish3, wish4];

  // Thu thập danh sách câu hỏi trắc nghiệm động
  const quizQuestions = dynamicQuizList.map((qItem, idx) => {
    return {
      id: idx + 1,
      question: qItem.question,
      options: qItem.options.map((opt, oIdx) => ({
        text: opt,
        isCorrect: oIdx === qItem.correctIndex,
        emoji: "✨"
      })),
      hint: qItem.hint || ""
    };
  }).filter((q) => q.question && q.question.trim());

  // Vòng quay may mắn (6 món quà)
  const spinLimit = parseInt(document.getElementById("input-spin-limit")?.value, 10) || 1;
  const spinMode = document.getElementById("select-spin-mode")?.value || "weighted";

  const giftCards = document.querySelectorAll(".gift-item-card");
  const gifts = [];
  giftCards.forEach((card, idx) => {
    const name = card.querySelector(".gift-name")?.value.trim() || `Quà ${idx + 1}`;
    const msg = card.querySelector(".gift-msg")?.value.trim() || `Chúc mừng bạn đã trúng ${name}!`;
    const rate = parseFloat(card.querySelector(".gift-rate")?.value) || 0;
    gifts.push({
      id: idx + 1,
      name,
      message: msg,
      rate
    });
  });

  // Icon Theme
  const activeRadio = document.querySelector('input[name="icon-theme"]:checked');
  const customIconsInput = document.getElementById("input-custom-icons")?.value.trim();
  let iconsList = ["💖", "🎂", "✨", "🌸", "🎉", "🎁"];

  if (customIconsInput) {
    iconsList = customIconsInput.split(/\s+/).filter(Boolean);
  } else if (activeRadio) {
    const val = activeRadio.value;
    if (val === "birthday") iconsList = ["🎂", "🎉", "🎈", "🎁", "🍰", "🕯️"];
    if (val === "love") iconsList = ["💖", "💕", "💌", "💘", "🥰", "🌸"];
    if (val === "cute") iconsList = ["🐱", "🐶", "🐰", "🐻", "🦄", "🐾"];
    if (val === "magic") iconsList = ["✨", "⭐", "🌟", "🌙", "🪄", "💫"];
  }

  // LỖI 5 FIX: Thêm color mặc định cho từng gift item (dùng palette hài hòa)
  // và đổi tên từ "gifts" sang "prizes" để viewer (main.js drawLuckyWheel) đọc đúng priority
  const DEFAULT_WHEEL_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#FF8E72', '#6C5CE7', '#FFAAA6', '#A29BFE', '#FD79A8', '#55EFC4', '#FDCB6E'];
  const prizes = gifts.map((g, idx) => ({
    ...g,
    color: g.color || DEFAULT_WHEEL_COLORS[idx % DEFAULT_WHEEL_COLORS.length]
  }));

  // Cấu trúc Data đầy đủ
  const cardData = {
    title,
    recipientName: recipient,
    senderName: sender,
    birthDay,
    birthMonth,
    nickname,
    birthdayDate,
    wishes: wishList,
    letterBody: wishesText,
    letterSignature: signature,
    musicUrl: document.getElementById('music-intro')?.value || "assets/audio/birthday.mp3",
    slug: customSlug,
    unlockDateTime: startDate,
    startDate,
    endDate,
    backgroundMusic: document.getElementById('music-bg')?.value || "assets/audio/birthday.mp3",
    luckyWheel: {
      enabled: true,
      spinLimit,
      spinMode,
      prizes,   // ưu tiên prizes để main.js đọc đúng
      gifts: prizes // giữ lại gifts để tương thích ngược
    },
    icons: iconsList,
    gallery: galleryPhotos.length ? galleryPhotos : []
  };

  return cardData;
}

/**
 * Lưu backup vào storage
 */
function saveToStorage(key, data) {
  try {
    const textOnlyData = { ...data };

    // Loại bỏ Base64 Audio
    if (textOnlyData.backgroundMusic && textOnlyData.backgroundMusic.startsWith('data:')) {
      textOnlyData.backgroundMusic = '';
    }

    localStorage.setItem(key, JSON.stringify(textOnlyData));
  } catch (finalErr) {
    console.error("Lưu backup cấu hình text thất bại:", finalErr);
  }
}

/**
 * Xử lý Tạo Link, Xem trước & Tải Config
 */
function initFormSubmit() {
  const form = document.getElementById("creator-form");
  const modal = document.getElementById("share-modal");
  const modalClose = document.getElementById("modal-close-btn");
  const shareInput = document.getElementById("share-url-input");
  const btnCopy = document.getElementById("btn-copy-url");
  const copyMsg = document.getElementById("copy-success-msg");
  const btnOpenLive = document.getElementById("btn-open-live-link");
  const btnDownload = document.getElementById("btn-download-config");
  const btnPreview = document.getElementById("btn-preview-card");
  const btnQuick = document.getElementById("btn-quick-generate");

  const openShareModal = async (triggerBtn = null) => {
    try {
      const data = collectFormData();
      // Lưu vào Storage làm bản sao lưu với fallback
      saveToStorage("custom_birthday_card", data);

      if (triggerBtn) {
        triggerBtn.dataset.originalHtml = triggerBtn.innerHTML;
        triggerBtn.disabled = true;
        triggerBtn.innerHTML = "⏳ Đang khởi tạo dữ liệu đám mây...";
      }

      // Lưu lên Cloud Database
      const recordId = await window.CardStorage.saveToCloud(data);

      // Sinh Link chia sẻ 100% Client-side qua ID
      const targetShareUrl = window.CardStorage.createShareUrl(recordId);

      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = triggerBtn.dataset.originalHtml || "Tạo & Lấy Link";
      }

      if (shareInput) shareInput.value = targetShareUrl;
      if (btnOpenLive) btnOpenLive.href = targetShareUrl;
      if (copyMsg) copyMsg.style.display = "none";

      // Generate Fancy QR Code
      const qrCanvas = document.getElementById('qrcode');
      const qrFrameSelect = document.getElementById('qr-frame-select');

      const drawQR = () => {
        if (!qrCanvas) return;

        // Đảm bảo Canvas luôn được hiển thị với kích thước chuẩn
        qrCanvas.style.setProperty('display', 'block', 'important');
        qrCanvas.style.setProperty('margin', '15px auto', 'important');
        qrCanvas.style.setProperty('width', '180px', 'important');
        qrCanvas.style.setProperty('height', '180px', 'important');
        qrCanvas.style.setProperty('background', '#ffffff', 'important');
        qrCanvas.style.setProperty('border-radius', '12px', 'important');
        qrCanvas.style.setProperty('padding', '8px', 'important');
        qrCanvas.style.setProperty('box-shadow', '0 4px 15px rgba(0,0,0,0.1)', 'important');

        if (!window.QRCode) {
          console.warn("Thư viện QRCode chưa được tải.");
          return;
        }

        const frameType = qrFrameSelect ? qrFrameSelect.value : 'none';

        // Xác định link render QR: nếu URL quá dài hoặc dính file:///, fallback về URL hợp lệ ngắn gọn
        let qrRenderUrl = targetShareUrl;
        const isFileProtocol = !qrRenderUrl || qrRenderUrl.startsWith('file:') || window.location.protocol === 'file:';
        const isUrlTooLong = qrRenderUrl && qrRenderUrl.length > 1200;

        // LỖI 3 FIX: Dùng window.location.origin thực tế thay vì hardcode localhost
        // Điều này đảm bảo QR Code luôn chứa IP mạng LAN đúng khi test qua Wi-Fi
        const buildFallbackBase = () => {
          if (window.location.protocol.startsWith('http')) {
            return `${window.location.origin}/gift.html`;
          }
          return 'http://localhost:3000/gift.html';
        };

        if (isFileProtocol || isUrlTooLong) {
          qrRenderUrl = buildFallbackBase();
        }

        const safeRenderCanvas = (targetUrl) => {
          try {
            QRCode.toCanvas(qrCanvas, targetUrl, {
              width: 220,
              margin: 2,
              errorCorrectionLevel: frameType !== 'none' ? 'H' : 'M',
              color: { dark: '#000000', light: '#ffffff' }
            }, function (error) {
              if (error) {
                console.warn("Lỗi tạo QR Canvas với URL hiện tại, thử fallback ngắn gọn:", error);
                // LỖI 3 FIX: fallback cũng dùng window.location.origin chính xác, không hardcode localhost
                const shortFallback = buildFallbackBase();
                if (targetUrl !== shortFallback) {
                  safeRenderCanvas(shortFallback);
                }
                return;
              }

              // Vẽ tiếp icon/khung (Trái Tim 💖, Gấu 🧸, Hộp Quà 🎁) vào tâm Canvas
              if (frameType !== 'none') {
                try {
                  const ctx = qrCanvas.getContext('2d');
                  const center = qrCanvas.width / 2;
                  const iconSize = 46;

                  // Vẽ nền tròn trắng ở giữa
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.arc(center, center, iconSize / 2 + 2, 0, Math.PI * 2);
                  ctx.fill();

                  // Chèn icon Cute
                  ctx.font = '32px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  let emoji = '';
                  if (frameType === 'heart') emoji = '💖';
                  else if (frameType === 'teddy') emoji = '🧸';
                  else if (frameType === 'gift') emoji = '🎁';

                  ctx.fillText(emoji, center, center + 3);
                } catch (iconErr) {
                  console.error("Lỗi vẽ icon QR:", iconErr);
                }
              }

              // Ép Canvas hiển thị ngay lập tức, không để bị ẩn CSS display: none hay chiều cao 0px
              qrCanvas.style.setProperty('display', 'block', 'important');
              qrCanvas.style.setProperty('margin', '15px auto', 'important');
              qrCanvas.style.setProperty('width', '180px', 'important');
              qrCanvas.style.setProperty('height', '180px', 'important');
              qrCanvas.style.setProperty('background', '#ffffff', 'important');
              qrCanvas.style.setProperty('border-radius', '12px', 'important');
              qrCanvas.style.setProperty('padding', '8px', 'important');
              qrCanvas.style.setProperty('box-shadow', '0 4px 15px rgba(0,0,0,0.1)', 'important');
            });
          } catch (renderError) {
            console.error("Lỗi try...catch an toàn khi gọi QRCode.toCanvas:", renderError);
          }
        };

        safeRenderCanvas(qrRenderUrl);
      };

      drawQR();
      if (qrFrameSelect) {
        qrFrameSelect.onchange = drawQR;
      }

      if (modal) modal.classList.add("active");
    } catch (error) {
      console.error("Lỗi khi mở modal chia sẻ:", error);
      alert("Đã xảy ra lỗi khi tạo thiệp: " + error.message);
    }
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        openShareModal(e.submitter || form.querySelector('button[type="submit"]'));
      } catch (err) {
        console.error("Lỗi submit form:", err);
      }
    });
  }

  if (btnQuick) {
    btnQuick.addEventListener("click", () => {
      try {
        openShareModal(btnQuick);
      } catch (err) {
        console.error("Lỗi tạo nhanh:", err);
      }
    });
  }

  // Xem thiệp mẫu
  const btnViewDemo = document.getElementById("btn-view-demo");
  if (btnViewDemo) {
    btnViewDemo.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        const viewUrl = `${window.location.origin}/gift.html`;
        window.location.href = viewUrl;
      } catch (err) {
        console.error("Lỗi xem thiệp mẫu:", err);
        window.location.href = "gift.html"; // fallback
      }
    });
  }

  // Xem trước thiệp ngay
  if (btnPreview) {
    btnPreview.addEventListener("click", () => {
      try {
        const data = collectFormData();
        saveToStorage("custom_birthday_card", data);
        // Khi xem trước, ta dùng localStorage fallback để nhanh, không cần gọi Cloud
        const viewUrl = new URL('gift.html', window.location.href).href;
        window.open(viewUrl, "_blank");
      } catch (err) {
        console.error("Lỗi xem trước thiệp:", err);
        alert("Có lỗi khi xem trước: " + err.message);
      }
    });
  }

  // Xem trước Giai đoạn 0: Countdown Lock
  const btnPreviewCd = document.getElementById("btn-preview-countdown-lock");
  if (btnPreviewCd) {
    btnPreviewCd.addEventListener("click", () => {
      try {
        const data = collectFormData();
        if (!data.startDate) {
          const demoDate = new Date(Date.now() + 2 * 86400000);
          data.startDate = demoDate.toISOString().slice(0, 16);
          data.unlockDateTime = data.startDate;
        }
        saveToStorage("custom_birthday_card", data);
        // Khi xem trước, ta dùng localStorage fallback để nhanh, không cần gọi Cloud
        const viewUrl = new URL('gift.html', window.location.href).href;

        const previewCdUrl = viewUrl.includes("?")
          ? `${viewUrl}&countdown=preview`
          : `${viewUrl}?countdown=preview`;
        window.open(previewCdUrl, "_blank");
      } catch (err) {
        console.error("Lỗi xem thử màn hình khóa:", err);
        alert("Có lỗi khi xem thử màn hình khóa: " + err.message);
      }
    });
  }

  // Tự động hẹn giờ đúng 00:00 ngày sinh nhật
  const btnQuickSetBday = document.getElementById("btn-quick-set-bday-time");
  if (btnQuickSetBday) {
    btnQuickSetBday.addEventListener("click", () => {
      const day = parseInt(document.getElementById("input-birth-day")?.value, 10) || 17;
      const month = parseInt(document.getElementById("input-birth-month")?.value, 10) || 7;

      const now = new Date();
      let targetYear = now.getFullYear();
      let targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
      if (targetDate.getTime() < now.getTime()) {
        targetYear++;
        targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
      }

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dd = String(targetDate.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}T00:00`;

      const startInput = document.getElementById("input-start-date");
      if (startInput) {
        startInput.value = formatted;
        startInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  // Đóng Modal
  const closeModal = () => {
    if (modal) modal.classList.remove("active");
  };
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Nút Copy URL
  if (btnCopy && shareInput) {
    btnCopy.addEventListener("click", () => {
      shareInput.select();
      shareInput.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(shareInput.value)
        .then(() => {
          if (copyMsg) copyMsg.style.display = "block";
          btnCopy.textContent = "✅ Đã chép!";
          setTimeout(() => {
            btnCopy.textContent = "📋 Sao chép";
          }, 2500);
        })
        .catch(() => {
          document.execCommand("copy");
          if (copyMsg) copyMsg.style.display = "block";
        });
    });
  }

  // Tải file config.js để commit trực tiếp vào GitHub Repo
  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      const data = collectFormData();
      const jsCode = `/**
 * BẢNG ĐIỀU KHIỂN & CẤU HÌNH THIỆP SINH NHẬT
 * Được tạo tự động từ Birthday & Love Studio
 */
const BIRTHDAY_CONFIG = ${JSON.stringify(data, null, 2)};
`;
      const blob = new Blob([jsCode], { type: "application/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "config.js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

/**
 * Tính năng tự động lưu nháp form (Auto-save Draft)
 */
function initAutoSaveDraft() {
  try {
    const form = document.getElementById("creator-form");
    if (!form) return;

    // Chọn tất cả các input text, number, textarea, date
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"], input[type="datetime-local"], textarea');

    // 1. Khôi phục từ draft (nếu có)
    const draftStr = localStorage.getItem("birthday_card_draft");
    if (draftStr) {
      const draftData = JSON.parse(draftStr);
      inputs.forEach(input => {
        if (input.id && draftData[input.id] !== undefined && draftData[input.id] !== '') {
          input.value = draftData[input.id];
        }
      });
    }

    // 2. Lắng nghe thay đổi và lưu nhẹ (chỉ văn bản)
    const saveDraft = () => {
      try {
        const draftData = {};
        inputs.forEach(input => {
          if (input.id) {
            draftData[input.id] = input.value;
          }
        });
        localStorage.setItem("birthday_card_draft", JSON.stringify(draftData));
      } catch (e) {
        console.error("Lỗi auto-save draft:", e);
      }
    };

    inputs.forEach(input => {
      input.addEventListener("input", saveDraft);
      input.addEventListener("change", saveDraft);
    });
  } catch (globalErr) {
    console.error("Lỗi khởi tạo auto-save draft:", globalErr);
  }
}
