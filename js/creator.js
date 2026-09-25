/**
 * =========================================================
 * CREATOR.JS - XỬ LÝ TOÀN BỘ FORM TẠO THIỆP SINH NHẬT
 * =========================================================
 */

async function uploadImageToCloud(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Chuẩn hóa kích thước sắc nét (800px đủ độ nét Retina 2x cho khung ảnh Polaroid)
        const maxWidth = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((maxWidth * height) / width);
            width = maxWidth;
          } else {
            width = Math.round((maxWidth * width) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Quality 0.78 sắc nét tuyệt đối mà dung lượng chỉ ~80-120KB
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target.result;
    };
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Nén lại chuỗi Base64 hình ảnh nếu quá nặng
 */
async function compressImageBase64(base64Url, maxDim = 720, quality = 0.72) {
  if (!base64Url || typeof base64Url !== "string" || !base64Url.startsWith("data:image")) {
    return base64Url;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64Url);
    img.src = base64Url;
  });
}

/**
 * Tự động tối ưu dữ liệu thiệp để luôn nhỏ hơn giới hạn 4.5MB của Cloud
 */
async function autoCompressDataPayload(cardData, onProgress = null) {
  const cloned = JSON.parse(JSON.stringify(cardData));
  let jsonStr = JSON.stringify(cloned);
  let sizeKb = Math.round(jsonStr.length / 1024);

  // Nếu tổng dung lượng vượt quá 3500KB, tự động nén toàn bộ ảnh Polaroid
  if (sizeKb > 3500 && Array.isArray(cloned.gallery) && cloned.gallery.length > 0) {
    if (onProgress) onProgress("⏳ Đang tối ưu dung lượng ảnh mây...");
    for (let i = 0; i < cloned.gallery.length; i++) {
      if (cloned.gallery[i].url && cloned.gallery[i].url.startsWith("data:image")) {
        cloned.gallery[i].url = await compressImageBase64(cloned.gallery[i].url, 700, 0.7);
      }
    }
    jsonStr = JSON.stringify(cloned);
    sizeKb = Math.round(jsonStr.length / 1024);
  }

  // Nếu vẫn còn quá 4200KB, nén sâu hơn nữa
  if (sizeKb > 4200 && Array.isArray(cloned.gallery) && cloned.gallery.length > 0) {
    for (let i = 0; i < cloned.gallery.length; i++) {
      if (cloned.gallery[i].url && cloned.gallery[i].url.startsWith("data:image")) {
        cloned.gallery[i].url = await compressImageBase64(cloned.gallery[i].url, 560, 0.6);
      }
    }
  }

  // Tối ưu nhạc nếu file tải lên quá nặng
  if (cloned.countdownMusicUrl && cloned.countdownMusicUrl.startsWith("data:") && sizeKb > 4000) {
    cloned.countdownMusicUrl = "assets/audio/ngan-nam-anh-sang.mp3";
    cloned.countdownMusicTitle = "Ngàn Năm Ánh Sáng";
  }

  return cloned;
}

document.addEventListener("DOMContentLoaded", () => {
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

  // 6. Hệ thống tự động lưu nháp & khôi phục dữ liệu (Draft Manager)
  initDraftManager();
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
const DEFAULT_GALLERY_PHOTOS = JSON.parse(JSON.stringify(galleryPhotos));

// Danh sách nhạc preset
const MUSIC_PRESETS = {
  "preset-romantic-candle": {
    title: "Món Quà Sinh Nhật Lãng Mạn (birthday.mp3)",
    src: "assets/audio/birthday.mp3"
  },
  "preset-piano": {
    title: "Happy Birthday Remix",
    src: "assets/audio/Happy Birthday Remix.m4a"
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
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
      });

      // Cập nhật url
      const urlInput = item.querySelector(".photo-url-input");
      urlInput.addEventListener("change", (e) => {
        galleryPhotos[index].url = e.target.value.trim();
        renderList();
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
      });

      // Xóa ảnh
      const btnRemove = item.querySelector(".btn-remove-photo");
      btnRemove.addEventListener("click", () => {
        galleryPhotos.splice(index, 1);
        renderList();
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
      });

      container.appendChild(item);
    });
  };

  window.renderPhotoList = renderList;
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
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
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
          const caption = file.name.replace(/\.[^/.]+$/, "") || "Kỷ niệm đẹp ✨";

          galleryPhotos.push({
            url: url,
            caption: caption
          });
        }
        renderList();
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
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
const DEFAULT_QUIZ_LIST = JSON.parse(JSON.stringify(dynamicQuizList));

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
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
      });

      const qHintInput = card.querySelector(".q-hint-input");
      qHintInput.addEventListener("input", (e) => {
        dynamicQuizList[qIdx].hint = e.target.value;
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
      });

      const optInputs = card.querySelectorAll(".q-opt-input");
      optInputs.forEach((optIn) => {
        optIn.addEventListener("input", (e) => {
          const optIdx = parseInt(e.target.dataset.optidx, 10);
          dynamicQuizList[qIdx].options[optIdx] = e.target.value;
          if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
        });
      });

      const radios = card.querySelectorAll(`input[name="q_correct_${qIdx}"]`);
      radios.forEach((r) => {
        r.addEventListener("change", (e) => {
          dynamicQuizList[qIdx].correctIndex = parseInt(e.target.value, 10);
          if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
        });
      });

      const btnDel = card.querySelector(".btn-delete-q");
      btnDel.addEventListener("click", () => {
        dynamicQuizList.splice(qIdx, 1);
        renderQuizList();
        if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
      });

      container.appendChild(card);
    });
  };

  window.renderQuizList = renderQuizList;
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
      if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
    });
  }
}

// Cấu hình âm nhạc theo từng giai đoạn
let currentPlayingStage = null;

/**
 * Quản lý chọn nhạc & test nhạc theo từng giai đoạn
 */
// Quản lý file âm thanh tùy chỉnh tải lên theo từng giai đoạn
let customUploadedAudios = {
  bg: null,
  countdown: null
};

/**
 * Quản lý chọn nhạc & test nhạc theo từng giai đoạn (Nhạc đếm ngược & Nhạc toàn bộ thiệp)
 */
function initMusicManager() {
  const audioPlayer = document.getElementById("creator-audio-player");
  const previewBtns = document.querySelectorAll(".audio-preview-btn");

  previewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const selectEl = document.getElementById(targetId);
      if (!selectEl) return;
      
      let trackUrl = selectEl.value;
      const stage = selectEl.getAttribute("data-stage") || (targetId.includes("countdown") ? "countdown" : "bg");

      if (trackUrl === "custom-upload") {
        trackUrl = customUploadedAudios[stage]?.src || selectEl.options[selectEl.selectedIndex]?.dataset?.customSrc || "";
      } else if (trackUrl === "custom-url") {
        const urlIn = document.querySelector(`.stage-url-input[data-stage="${stage}"]`);
        trackUrl = urlIn?.value.trim() || "";
      }

      if (btn.classList.contains("playing")) {
        audioPlayer.pause();
        btn.textContent = "▶️ Nghe thử";
        btn.classList.remove("playing");
      } else {
        previewBtns.forEach(b => {
          b.textContent = "▶️ Nghe thử";
          b.classList.remove("playing");
        });

        if (!trackUrl || trackUrl === "custom-upload" || trackUrl === "custom-url") {
          alert("Vui lòng chọn bài hát có sẵn hoặc tải file nhạc lên trước khi nghe thử!");
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

  const stages = ["bg", "countdown"];
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
          if (uploadBox) uploadBox.style.display = "block";
          if (urlBox) urlBox.style.display = "none";
          if (customUploadedAudios[stage]) {
            if (statusBadge) statusBadge.textContent = `✅ ${customUploadedAudios[stage].title}`;
          } else {
            if (statusBadge) statusBadge.textContent = "Chưa chọn file";
          }
        } else if (val === "custom-url") {
          if (uploadBox) uploadBox.style.display = "none";
          if (urlBox) urlBox.style.display = "block";
          if (urlInput && urlInput.value.trim()) {
            if (statusBadge) statusBadge.textContent = "Link MP3 đã nhập";
          } else {
            if (statusBadge) statusBadge.textContent = "Chưa nhập link";
          }
        } else {
          if (uploadBox) uploadBox.style.display = "none";
          if (urlBox) urlBox.style.display = "none";
          const selOpt = select.options[select.selectedIndex];
          if (statusBadge) {
            statusBadge.textContent = selOpt ? selOpt.textContent.trim() : "Đã chọn nhạc có sẵn";
          }
        }
      });
    }

    if (fileInput && select) {
      fileInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
          if (statusBadge) statusBadge.textContent = `⏳ Đang đọc file ${file.name}...`;
          const reader = new FileReader();
          reader.onload = ev => {
            const dataUrl = ev.target.result;
            let opt = select.querySelector('option[value="custom-upload"]');
            if (opt) {
              opt.dataset.customSrc = dataUrl;
            }
            customUploadedAudios[stage] = {
              src: dataUrl,
              title: file.name,
              size: file.size
            };

            // Lưu vào IndexedDB để an toàn cho preview không bị giới hạn quota
            if (window.CardAudioStorage) {
              window.CardAudioStorage.set(`audio_${stage}`, {
                src: dataUrl,
                title: file.name,
                stage: stage
              });
            }

            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            if (statusBadge) statusBadge.textContent = `✅ ${file.name} (${sizeMb} MB)`;
          };
          reader.onerror = () => {
            alert("Lỗi khi đọc file âm thanh!");
            if (statusBadge) statusBadge.textContent = "Lỗi đọc file";
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (urlInput && select) {
      urlInput.addEventListener("input", () => {
        const val = urlInput.value.trim();
        let opt = select.querySelector('option[value="custom-url"]');
        if (opt) {
          opt.dataset.customSrc = val;
        }
        if (statusBadge) statusBadge.textContent = val ? "Link MP3 đã nhập" : "Chưa nhập link";
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
      if (typeof triggerDraftAutoSave === "function") triggerDraftAutoSave();
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
  let startDate = document.getElementById("input-start-date")?.value || "";
  let endDate = document.getElementById("input-end-date")?.value || "";
  if (startDate && isNaN(Date.parse(startDate))) startDate = "";
  if (endDate && isNaN(Date.parse(endDate))) endDate = "";

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

  // Âm thanh đoạn chờ mở thiệp (Giai đoạn chờ đếm ngược)
  const cdSelect = document.getElementById('music-countdown') || document.getElementById('music-bg');
  let countdownMusicUrl = "assets/audio/ngan-nam-anh-sang.mp3";
  let countdownMusicTitle = "Ngàn Năm Ánh Sáng";
  if (cdSelect) {
    if (cdSelect.value === "custom-upload") {
      countdownMusicUrl = customUploadedAudios.countdown?.src || customUploadedAudios.bg?.src || cdSelect.options[cdSelect.selectedIndex]?.dataset?.customSrc || "";
      countdownMusicTitle = customUploadedAudios.countdown?.title || customUploadedAudios.bg?.title || "Nhạc tải lên từ máy";
    } else if (cdSelect.value === "custom-url") {
      const urlInput = document.getElementById('input-countdown-url') || document.querySelector('.stage-url-input[data-stage="countdown"]') || document.querySelector('.stage-url-input[data-stage="bg"]');
      countdownMusicUrl = urlInput?.value.trim() || "";
      countdownMusicTitle = "Nhạc link MP3 tùy chỉnh";
    } else {
      countdownMusicUrl = cdSelect.value;
      const selOpt = cdSelect.options[cdSelect.selectedIndex];
      countdownMusicTitle = selOpt ? selOpt.textContent.trim().replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/u, '') : "Ngàn Năm Ánh Sáng";
    }
  }

  // Âm nhạc thiệp chính thức đã được thiết lập mặc định (Birthday - Somi, chuyển Yung Kai & Nơi Này Có Anh)
  const defaultCardMusicUrl = "assets/audio/birthday.mp3";
  const defaultCardMusicTitle = "Birthday - Somi";

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
    musicUrl: countdownMusicUrl || defaultCardMusicUrl,
    slug: customSlug,
    unlockDateTime: startDate,
    startDate,
    endDate,
    backgroundMusic: countdownMusicUrl || defaultCardMusicUrl,
    musicTitle: countdownMusicTitle || defaultCardMusicTitle,
    countdownMusicUrl: countdownMusicUrl,
    countdownMusicTitle: countdownMusicTitle,
    sceneMusic: {
      countdown: { src: countdownMusicUrl, title: countdownMusicTitle },
      intro: { src: defaultCardMusicUrl, title: defaultCardMusicTitle },
      beats: { src: "assets/audio/Yung Kai.m4a", title: "Blue - Yung Kai" },
      heart: { src: "assets/audio/Noi Nay Co Anh.m4a", title: "Nơi Này Có Anh" }
    },
    luckyWheel: {
      enabled: true,
      spinLimit,
      spinMode,
      prizes,   // ưu tiên prizes để main.js đọc đúng
      gifts: prizes // giữ lại gifts để tương thích ngược
    },
    quiz: quizQuestions,
    icons: iconsList,
    gallery: galleryPhotos.length ? galleryPhotos : []
  };

  return cardData;
}

/**
 * Lưu backup vào storage (an toàn với dữ liệu âm thanh lớn qua IndexedDB)
 */
function saveToStorage(key, data) {
  try {
    const textOnlyData = { ...data };

    // Lưu âm thanh lớn vào IndexedDB trước để preview luôn phát đầy đủ không lo lỗi quota
    if (window.CardAudioStorage) {
      if (textOnlyData.countdownMusicUrl && textOnlyData.countdownMusicUrl.startsWith('data:')) {
        window.CardAudioStorage.set('audio_countdown', {
          src: textOnlyData.countdownMusicUrl,
          title: textOnlyData.countdownMusicTitle,
          stage: 'countdown'
        });
      }
      if (textOnlyData.backgroundMusic && textOnlyData.backgroundMusic.startsWith('data:')) {
        window.CardAudioStorage.set('audio_bg', {
          src: textOnlyData.backgroundMusic,
          title: textOnlyData.musicTitle,
          stage: 'bg'
        });
      }
    }

    // Thử lưu vào localStorage (nếu dung lượng quá lớn thì fallback)
    try {
      localStorage.setItem(key, JSON.stringify(textOnlyData));
    } catch (quotaErr) {
      console.warn("localStorage quota exceeded, saving text-safe version with IndexedDB references:", quotaErr);
      const safeData = { ...textOnlyData };
      if (safeData.countdownMusicUrl && safeData.countdownMusicUrl.startsWith('data:')) {
        safeData.countdownMusicUrl = 'indexeddb://audio_countdown';
      }
      if (safeData.backgroundMusic && safeData.backgroundMusic.startsWith('data:')) {
        safeData.backgroundMusic = 'indexeddb://audio_bg';
        safeData.musicUrl = 'indexeddb://audio_bg';
      }
      localStorage.setItem(key, JSON.stringify(safeData));
    }
  } catch (finalErr) {
    console.error("Lưu backup cấu hình thất bại:", finalErr);
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
    const originalBtnHtml = triggerBtn ? triggerBtn.innerHTML : "";
    try {
      if (triggerBtn) {
        triggerBtn.dataset.originalHtml = originalBtnHtml;
        triggerBtn.disabled = true;
        triggerBtn.innerHTML = "⏳ Đang chuẩn bị dữ liệu...";
      }

      const data = collectFormData();
      // Lưu vào Storage làm bản sao lưu với fallback
      saveToStorage("custom_birthday_card", data);

      if (triggerBtn) {
        triggerBtn.innerHTML = "⏳ Đang tối ưu & gửi lên mây...";
      }

      // Tự động nén ảnh nếu tổng dung lượng vượt quá ngưỡng Cloud (3.5MB - 5MB)
      let cloudData = await autoCompressDataPayload(data, (msg) => {
        if (triggerBtn) triggerBtn.innerHTML = msg;
      });

      // Lưu lên Cloud Database
      const recordId = await window.CardStorage.saveToCloud(cloudData);

      // Sinh Link chia sẻ 100% Client-side qua ID
      const targetShareUrl = window.CardStorage.createShareUrl(recordId);

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

        const fallbackImgQR = () => {
          try {
            let img = document.getElementById('qr-fallback-img');
            if (!img) {
              img = document.createElement('img');
              img.id = 'qr-fallback-img';
              img.alt = 'Mã QR Thiệp Sinh Nhật';
              img.style.cssText = 'display: block; margin: 15px auto; width: 180px; height: 180px; border-radius: 12px; background: #ffffff; padding: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);';
              qrCanvas.parentNode.insertBefore(img, qrCanvas);
            }
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrRenderUrl)}`;
            qrCanvas.style.display = 'none';
            img.style.display = 'block';
          } catch (e) {
            console.error("Lỗi fallback QR image:", e);
          }
        };

        const safeRenderCanvas = (targetUrl) => {
          if (!window.QRCode || typeof window.QRCode.toCanvas !== 'function') {
            console.warn("window.QRCode chưa sẵn sàng, dùng fallback QR hình ảnh.");
            fallbackImgQR();
            return;
          }

          try {
            QRCode.toCanvas(qrCanvas, targetUrl, {
              width: 220,
              margin: 2,
              errorCorrectionLevel: frameType !== 'none' ? 'H' : 'M',
              color: { dark: '#000000', light: '#ffffff' }
            }, function (error) {
              if (error) {
                console.warn("Lỗi tạo QR Canvas với URL hiện tại, chuyển sang fallback:", error);
                fallbackImgQR();
                return;
              }

              // Ẩn ảnh fallback nếu canvas đã vẽ thành công
              const fallbackImg = document.getElementById('qr-fallback-img');
              if (fallbackImg) fallbackImg.style.display = 'none';
              qrCanvas.style.display = 'block';

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

              // Ép Canvas hiển thị ngay lập tức
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
            console.error("Lỗi gọi QRCode.toCanvas, chuyển sang fallback:", renderError);
            fallbackImgQR();
          }
        };

        safeRenderCanvas(qrRenderUrl);
      };

      if (modal) modal.classList.add("active");
      drawQR();
      if (qrFrameSelect) {
        qrFrameSelect.onchange = drawQR;
      }
    } catch (error) {
      console.error("Lỗi khi mở modal chia sẻ:", error);
      alert("Đã xảy ra lỗi khi tạo thiệp: " + error.message);
    } finally {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = triggerBtn.dataset.originalHtml || originalBtnHtml || "✨ Tạo & Lấy Link";
      }
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

  // Xem thiệp mẫu (mở tab mới để không làm mất trang chỉnh sửa của người dùng)
  const btnViewDemo = document.getElementById("btn-view-demo");
  if (btnViewDemo) {
    btnViewDemo.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        const viewUrl = new URL("gift.html", window.location.href).href;
        window.open(viewUrl, "_blank");
      } catch (err) {
        console.error("Lỗi xem thiệp mẫu:", err);
        window.open("gift.html", "_blank"); // fallback
      }
    });
  }

  // Xem trước thiệp ngay
  if (btnPreview) {
    btnPreview.addEventListener("click", async () => {
      try {
        const data = collectFormData();
        saveToStorage("custom_birthday_card", data);
        if (window.CardAudioStorage) {
          if (data.countdownMusicUrl && data.countdownMusicUrl.startsWith("data:")) {
            await window.CardAudioStorage.set("audio_countdown", {
              src: data.countdownMusicUrl,
              title: data.countdownMusicTitle,
              stage: "countdown"
            });
          }
          if (data.backgroundMusic && data.backgroundMusic.startsWith("data:")) {
            await window.CardAudioStorage.set("audio_bg", {
              src: data.backgroundMusic,
              title: data.musicTitle,
              stage: "bg"
            });
          }
        }
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
  const handlePreviewCountdown = async () => {
    try {
      const data = collectFormData();
      if (!data.startDate) {
        const demoDate = new Date(Date.now() + 2 * 86400000);
        data.startDate = demoDate.toISOString().slice(0, 16);
        data.unlockDateTime = data.startDate;
      }
      saveToStorage("custom_birthday_card", data);
      if (window.CardAudioStorage && data.countdownMusicUrl && data.countdownMusicUrl.startsWith("data:")) {
        await window.CardAudioStorage.set("audio_countdown", {
          src: data.countdownMusicUrl,
          title: data.countdownMusicTitle,
          stage: "countdown"
        });
      }
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
  };

  const btnPreviewCd = document.getElementById("btn-preview-countdown-lock");
  if (btnPreviewCd) {
    btnPreviewCd.addEventListener("click", handlePreviewCountdown);
  }

  const btnPreviewCdFromMusic = document.getElementById("btn-preview-cd-from-music");
  if (btnPreviewCdFromMusic) {
    btnPreviewCdFromMusic.addEventListener("click", handlePreviewCountdown);
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
 * =========================================================
 * HỆ THỐNG QUẢN LÝ BẢN NHÁP TỰ ĐỘNG & BẢO VỆ DỮ LIỆU
 * (COMPREHENSIVE DRAFT MANAGER & ACCIDENTAL EXIT PROTECTION)
 * =========================================================
 * - Tự động lưu mọi thay đổi (text, câu hỏi quiz, ảnh kỷ niệm, 6 món quà, âm nhạc, icon)
 * - Tự động khôi phục nguyên vẹn khi người dùng quay lại hoặc vô tình thoát trang
 * - Cảnh báo trước khi thoát tab (beforeunload) để không bao giờ bị mất dữ liệu
 * - Hỗ trợ phím tắt Ctrl+S / Cmd+S và nút Lưu nháp thủ công
 */

const DRAFT_STORAGE_KEY = "birthday_card_draft_v2";
const LEGACY_DRAFT_KEY = "birthday_card_draft";

let draftSaveTimer = null;
let isFormDirty = false;

/**
 * Cập nhật trạng thái hiển thị trên thanh Header
 */
function updateDraftStatusUI(state, timeStr) {
  const dot = document.getElementById("draft-dot");
  const text = document.getElementById("draft-status-text");
  if (!dot || !text) return;

  if (state === "saving") {
    dot.className = "draft-indicator-dot saving";
    text.textContent = "Đang lưu nháp...";
  } else if (state === "saved") {
    dot.className = "draft-indicator-dot saved";
    const displayTime = timeStr || new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    text.textContent = `Đã lưu nháp (${displayTime})`;
  } else if (state === "recovered") {
    dot.className = "draft-indicator-dot saved";
    text.textContent = `Đã khôi phục (${timeStr || "vừa xong"})`;
  } else if (state === "error") {
    dot.className = "draft-indicator-dot error";
    text.textContent = "Lỗi lưu nháp";
  }
}

/**
 * Kích hoạt tự động lưu có Debounce (350ms)
 */
function triggerDraftAutoSave() {
  isFormDirty = true;
  updateDraftStatusUI("saving");
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(() => {
    saveDraft(true);
  }, 350);
}

/**
 * Thực hiện lưu toàn bộ dữ liệu hiện tại vào localStorage
 */
function saveDraft(showStatus = true) {
  try {
    const form = document.getElementById("creator-form");
    if (!form) return false;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const draft = {
      version: 2,
      savedAt: now.toISOString(),
      savedTime: timeStr,
      fields: {},
      gifts: [],
      quiz: JSON.parse(JSON.stringify(dynamicQuizList || [])),
      photos: JSON.parse(JSON.stringify(galleryPhotos || [])),
      iconTheme: document.querySelector('input[name="icon-theme"]:checked')?.value || "birthday",
      musicStageCountdown: document.getElementById("music-countdown")?.value || "",
      qrFrame: document.getElementById("qr-frame-select")?.value || "none"
    };

    // 1. Lưu tất cả input, textarea, select có ID
    const inputs = form.querySelectorAll('input:not([type="file"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, select');
    inputs.forEach(input => {
      if (input.id) {
        draft.fields[input.id] = input.value;
      }
    });

    // 2. Lưu trọn vẹn 6 món quà Vòng Quay May Mắn (kể cả không có ID)
    const giftCards = document.querySelectorAll(".gift-item-card");
    giftCards.forEach((card) => {
      draft.gifts.push({
        name: card.querySelector(".gift-name")?.value || "",
        msg: card.querySelector(".gift-msg")?.value || "",
        rate: card.querySelector(".gift-rate")?.value || ""
      });
    });

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      // Tương thích ngược với key cũ
      localStorage.setItem(LEGACY_DRAFT_KEY, JSON.stringify(draft.fields));
    } catch (quotaError) {
      console.warn("Storage quota vượt quá giới hạn, lưu bản nháp an toàn ký tự:", quotaError);
      // Nếu có ảnh base64 quá lớn, dùng link placeholder an toàn để không làm mất chữ viết
      const safePhotos = draft.photos.map(p => ({
        url: p.url && p.url.startsWith("data:") ? "assets/images/photo1.jpg" : p.url,
        caption: p.caption
      }));
      draft.photos = safePhotos;
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e2) {
        console.error("Không thể lưu localStorage:", e2);
      }
    }

    if (showStatus) {
      updateDraftStatusUI("saved", timeStr);
    }
    return true;
  } catch (err) {
    console.error("Lỗi khi lưu nháp:", err);
    if (showStatus) updateDraftStatusUI("error");
    return false;
  }
}

/**
 * Tải và khôi phục toàn bộ bản nháp khi mở trang
 */
function loadAndRestoreDraft() {
  try {
    const rawV2 = localStorage.getItem(DRAFT_STORAGE_KEY);
    const rawV1 = localStorage.getItem(LEGACY_DRAFT_KEY);

    let draft = null;
    if (rawV2) {
      try { draft = JSON.parse(rawV2); } catch (e) {}
    } else if (rawV1) {
      try {
        const fields = JSON.parse(rawV1);
        if (fields && typeof fields === "object") {
          draft = { fields: fields };
        }
      } catch (e) {}
    }

    if (!draft || (!draft.fields && !draft.gifts && !draft.quiz && !draft.photos)) {
      return false;
    }

    // 1. Khôi phục các trường input, textarea, select theo ID
    if (draft.fields) {
      Object.keys(draft.fields).forEach(id => {
        const el = document.getElementById(id);
        if (el && draft.fields[id] !== undefined) {
          el.value = draft.fields[id];
        }
      });
    }

    // 2. Khôi phục 6 phần quà vòng quay may mắn
    if (Array.isArray(draft.gifts) && draft.gifts.length > 0) {
      const giftCards = document.querySelectorAll(".gift-item-card");
      giftCards.forEach((card, idx) => {
        if (draft.gifts[idx]) {
          const nameInput = card.querySelector(".gift-name");
          const msgInput = card.querySelector(".gift-msg");
          const rateInput = card.querySelector(".gift-rate");
          if (nameInput && draft.gifts[idx].name !== undefined) nameInput.value = draft.gifts[idx].name;
          if (msgInput && draft.gifts[idx].msg !== undefined) msgInput.value = draft.gifts[idx].msg;
          if (rateInput && draft.gifts[idx].rate !== undefined) rateInput.value = draft.gifts[idx].rate;
        }
      });
    }

    // 3. Khôi phục danh sách câu hỏi trắc nghiệm động
    if (Array.isArray(draft.quiz) && draft.quiz.length > 0) {
      dynamicQuizList = draft.quiz;
      if (typeof window.renderQuizList === "function") {
        window.renderQuizList();
      }
    }

    // 4. Khôi phục danh sách ảnh kỷ niệm Polaroid
    if (Array.isArray(draft.photos) && draft.photos.length > 0) {
      galleryPhotos = draft.photos;
      if (typeof window.renderPhotoList === "function") {
        window.renderPhotoList();
      }
    }

    // 5. Khôi phục icon theme
    if (draft.iconTheme) {
      const targetRadio = document.querySelector(`input[name="icon-theme"][value="${draft.iconTheme}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
        document.querySelectorAll(".icon-preset-card").forEach(c => c.classList.remove("active"));
        targetRadio.closest(".icon-preset-card")?.classList.add("active");
      }
    }

    // 6. Khôi phục bài hát đếm ngược
    if (draft.musicStageCountdown) {
      const musicCdSelect = document.getElementById("music-countdown");
      if (musicCdSelect) {
        musicCdSelect.value = draft.musicStageCountdown;
        musicCdSelect.dispatchEvent(new Event("change"));
      }
    }

    // 7. Khôi phục mẫu QR code
    if (draft.qrFrame) {
      const qrSelect = document.getElementById("qr-frame-select");
      if (qrSelect) qrSelect.value = draft.qrFrame;
    }

    // Hiển thị trạng thái khôi phục
    const savedTime = draft.savedTime || (draft.savedAt ? new Date(draft.savedAt).toLocaleTimeString("vi-VN") : "trước đó");
    updateDraftStatusUI("recovered", savedTime);

    // Bật thanh thông báo khôi phục nháp
    const alertBanner = document.getElementById("draft-recovery-alert");
    const alertTimeText = document.getElementById("draft-alert-time-text");
    if (alertBanner) {
      if (alertTimeText) {
        const dateStr = draft.savedAt ? new Date(draft.savedAt).toLocaleDateString("vi-VN") : "gần đây";
        alertTimeText.textContent = `Bản nháp được lưu lúc ${savedTime} (${dateStr}) trên thiết bị này. Mọi nội dung đang chỉnh sửa dở đã được nạp lại đầy đủ!`;
      }
      alertBanner.style.display = "flex";
    }

    isFormDirty = true;
    return true;
  } catch (err) {
    console.error("Lỗi khôi phục bản nháp:", err);
    return false;
  }
}

/**
 * Xóa sạch bản nháp và đưa về thiệp mẫu ban đầu
 */
function resetDraftToDefault() {
  const confirmed = confirm(
    "⚠️ BẠN CÓ CHẮC MUỐN ĐẶT LẠI TOÀN BỘ NỘI DUNG?\n\nThao tác này sẽ xóa sạch bản nháp tự động đang lưu và đưa toàn bộ nội dung về thiệp mẫu ban đầu.\nMọi thông tin bạn đã chỉnh sửa sẽ bị hủy bỏ."
  );
  if (!confirmed) return;

  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    isFormDirty = false;
    showCreatorToast("Đã xóa nháp và đặt lại ban đầu", "🔄");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    console.error("Lỗi xóa nháp:", err);
  }
}

/**
 * Hiển thị Toast thông báo nhanh góc dưới màn hình
 */
function showCreatorToast(msg, icon = "💾") {
  const toast = document.getElementById("creator-toast");
  const msgEl = document.getElementById("toast-msg");
  const iconEl = document.getElementById("toast-icon");
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  if (iconEl) iconEl.textContent = icon;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/**
 * Khởi tạo toàn bộ sự kiện cho hệ thống Draft Manager
 */
function initDraftManager() {
  try {
    const form = document.getElementById("creator-form");

    // 1. Lắng nghe mọi thay đổi phím gõ / click trong Form để auto-save
    if (form) {
      form.addEventListener("input", () => triggerDraftAutoSave());
      form.addEventListener("change", () => triggerDraftAutoSave());
    }

    // 2. Nút Lưu nháp thủ công trên Header
    const btnManualSave = document.getElementById("btn-manual-save-draft");
    if (btnManualSave) {
      btnManualSave.addEventListener("click", () => {
        saveDraft(true);
        showCreatorToast("Đã lưu bản nháp thành công!", "✅");
      });
    }

    // 3. Nút Đặt lại / Xóa nháp trên Header
    const btnReset = document.getElementById("btn-reset-draft");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        resetDraftToDefault();
      });
    }

    // 4. Các nút trên thanh thông báo khôi phục bản nháp
    const btnDismissAlert = document.getElementById("btn-dismiss-draft-alert");
    if (btnDismissAlert) {
      btnDismissAlert.addEventListener("click", () => {
        const alertBanner = document.getElementById("draft-recovery-alert");
        if (alertBanner) alertBanner.style.display = "none";
        showCreatorToast("Bạn có thể tiếp tục chỉnh sửa bình thường!", "👍");
      });
    }

    const btnResetFromAlert = document.getElementById("btn-alert-reset-draft");
    if (btnResetFromAlert) {
      btnResetFromAlert.addEventListener("click", () => {
        resetDraftToDefault();
      });
    }

    // 5. Phím tắt tiện lợi Ctrl+S / Cmd+S để lưu ngay
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft(true);
        showCreatorToast("Đã lưu nháp tức thì (Ctrl+S)!", "💾");
      }
    });

    // 6. BẢO VỆ CHỐNG ẤN NHẦM THOÁT TRANG (beforeunload & pagehide)
    window.addEventListener("beforeunload", (e) => {
      if (isFormDirty) {
        // Lưu đồng bộ ngay lập tức trước khi tab bị đóng
        saveDraft(false);
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang không?";
        return e.returnValue;
      }
    });

    window.addEventListener("pagehide", () => {
      if (isFormDirty) {
        saveDraft(false);
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && isFormDirty) {
        saveDraft(false);
      }
    });

    // 7. Bảo vệ Header Logo không làm gián đoạn người dùng
    const logoHeader = document.getElementById("header-logo");
    if (logoHeader) {
      logoHeader.addEventListener("click", () => {
        if (isFormDirty) {
          showCreatorToast("Dữ liệu thiệp của bạn luôn được tự động lưu an toàn! 💖", "🛡️");
        }
      });
    }

    // 8. Tự động kiểm tra và khôi phục bản nháp đã lưu
    loadAndRestoreDraft();
  } catch (err) {
    console.error("Lỗi khởi tạo Draft Manager:", err);
  }
}

