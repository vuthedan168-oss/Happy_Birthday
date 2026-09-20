/**
 * =========================================================
 * MAIN.JS - TRẢI NGHIỆM SINH NHẬT ĐIỆN ẢNH & TƯƠNG TÁC CAO CẤP
 * =========================================================
 * Tích hợp toàn diện: Date Reel, Thổi Nến Bánh Kem Chân Thực,
 * Chọn Điều Ước, Trái Tim Mosaic Kỷ Niệm, Thư Vintage,
 * Bầu Trời Sao Băng Starlight & Vòng Quay May Mắn.
 */

let ACTIVE_CONFIG = {};
let CURRENT_STAGE = "opening";
let SELECTED_WISH = "";
let LIGHTBOX_CURRENT_INDEX = 0;
let IS_STAR_LAUNCHED = false;
let COUNTDOWN_INTERVAL = null;

// ==================== NEW FEATURES UTILS ====================
function safeVibrate(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch(e) {}
}

let audioCtx = null;
let analyser = null;
let micStream = null;
let micBlowInterval = null;

function initMicBlowing(onBlowOut) {
  let hasTriggered = false;
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          micStream = stream;
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 256;
          
          let blowFrames = 0;
          micBlowInterval = setInterval(() => {
            if (!IS_CARD_LOCKED && CURRENT_STAGE === 'intro' && !hasTriggered) {
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);
              
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const average = sum / dataArray.length;
              
              const flame = document.getElementById('flame-element');
              if (flame && !flame.classList.contains('lovegift-blowout')) {
                const flickerScale = 1 + (average / 255) * 0.5;
                const flickerRot = (Math.random() - 0.5) * (average / 5);
                flame.style.transform = `scale(${flickerScale}) rotate(${flickerRot}deg)`;
              }

              if (average > 80) {
                blowFrames++;
                if (blowFrames > 8) { // ~0.8s liên tục vượt ngưỡng
                  hasTriggered = true;
                  stopMicBlowing(); // Dừng mic an toàn trước
                  onBlowOut();
                }
              } else {
                blowFrames = Math.max(0, blowFrames - 2);
              }
            }
          }, 100);
        })
        .catch(err => console.log('Mic error:', err));
    }
  } catch(e) {}
}

function stopMicBlowing() {
  if (micBlowInterval) clearInterval(micBlowInterval);
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }
  if (audioCtx) {
    audioCtx.close().catch(e => {});
  }
}

let typewriterInterval = null;
function typeWriterEffect(element, text, speed = 30) {
  element.innerHTML = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      let char = text.charAt(i);
      if (char === '\n') element.innerHTML += '<br>';
      else element.innerHTML += char;
      i++;
      let delay = speed + Math.random() * 20;
      if (char === '.' || char === ',' || char === '—') delay += 200;
      typewriterInterval = setTimeout(type, delay);
    } else {
      const sign = document.getElementById('letter-signature-text');
      if (sign) sign.style.opacity = '1';
      const nextBtn = document.getElementById('btn-goto-final');
      if (nextBtn) nextBtn.style.display = 'inline-block';
      const skipBtn = document.getElementById('btn-skip-typewriter');
      if (skipBtn) skipBtn.style.display = 'none';
      const scroll = document.getElementById('letter-scroll-content');
      if (scroll) scroll.style.pointerEvents = 'auto';
    }
  }
  type();
}

let selfieStream = null;
let selfieDataUrl = null;

function showCameraNotice(msg) {
  const notice = document.getElementById('selfie-camera-notice');
  if (notice) {
    if (msg) notice.textContent = msg;
    notice.style.display = 'block';
  }
}

function hideCameraNotice() {
  const notice = document.getElementById('selfie-camera-notice');
  if (notice) notice.style.display = 'none';
}

function openSelfieModal() {
  const modal = document.getElementById('modal-photobooth');
  const video = document.getElementById('selfie-video');
  const canvas = document.getElementById('selfie-canvas');
  const initActions = document.getElementById('selfie-initial-actions');
  const reviewActions = document.getElementById('selfie-review-actions');
  const btnTake = document.getElementById('btn-take-selfie');
  
  if (modal) modal.style.display = 'flex';
  if (video) video.style.display = 'block';
  if (canvas) canvas.style.display = 'none';
  if (initActions) initActions.style.display = 'flex';
  if (reviewActions) reviewActions.style.display = 'none';
  hideCameraNotice();

  // Kiểm tra nếu API camera không khả dụng hoặc bị chặn bởi trình duyệt
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraNotice("⚠️ Trình duyệt đang chặn camera trực tiếp (cần chạy qua localhost/https). Hãy bấm 'Tải ảnh từ máy' hoặc 'Bỏ qua' để tiếp tục!");
    if (btnTake) {
      btnTake.disabled = true;
      btnTake.style.opacity = '0.6';
    }
    return; // Giữ nguyên modal, không tự động đóng skipSelfie()!
  }

  if (btnTake) {
    btnTake.disabled = false;
    btnTake.style.opacity = '1';
  }

  try {
    const constraints = { video: { facingMode: "user" }, audio: false };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        selfieStream = stream;
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => {});
        }
        hideCameraNotice();
      })
      .catch(err => {
        console.warn('Camera error/permission denied:', err);
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          showCameraNotice("⚠️ Trình duyệt đang chặn Camera. Vui lòng tắt bong bóng chat, hoặc ấn dấu 3 chấm góc phải chọn 'Mở bằng trình duyệt' (Chrome/Safari)!");
        } else if (err.name === 'NotFoundError') {
          showCameraNotice("📸 Không tìm thấy Camera. Hãy dùng nút 'Tải ảnh từ máy' bên dưới nhé!");
        } else {
          showCameraNotice("⚠️ Trình duyệt đang chặn Camera. Vui lòng tắt bong bóng chat, hoặc ấn dấu 3 chấm góc phải chọn 'Mở bằng trình duyệt' (Chrome/Safari)!");
        }
        if (btnTake) {
          btnTake.disabled = true;
          btnTake.style.opacity = '0.6';
        }
        // Giữ nguyên modal để người dùng chọn tải ảnh hoặc bỏ qua, không tự ý đóng!
      });
  } catch(e) {
    console.warn('Lỗi khi mở camera:', e);
    showCameraNotice("⚠️ Trình duyệt đang chặn Camera. Vui lòng tắt bong bóng chat, hoặc ấn dấu 3 chấm góc phải chọn 'Mở bằng trình duyệt' (Chrome/Safari)!");
    if (btnTake) {
      btnTake.disabled = true;
      btnTake.style.opacity = '0.6';
    }
  }
}

function handleSelfieFileUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    selfieDataUrl = e.target.result;
    
    const canvas = document.getElementById('selfie-canvas');
    const video = document.getElementById('selfie-video');
    const initActions = document.getElementById('selfie-initial-actions');
    const reviewActions = document.getElementById('selfie-review-actions');
    
    if (canvas) {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        if (video) video.style.display = 'none';
        canvas.style.display = 'block';
        hideCameraNotice();
        if (initActions) initActions.style.display = 'none';
        if (reviewActions) reviewActions.style.display = 'flex';
      };
      img.src = selfieDataUrl;
    }
  };
  reader.readAsDataURL(file);
}

function stopSelfieCamera() {
  if (selfieStream) {
    selfieStream.getTracks().forEach(track => track.stop());
    selfieStream = null;
  }
}

function skipSelfie() {
  stopSelfieCamera();
  const modal = document.getElementById('modal-photobooth');
  if (modal) modal.style.display = 'none';
  triggerOutro();
}

function openStoryExport() {
  stopSelfieCamera();
  const photoModal = document.getElementById('modal-photobooth');
  if (photoModal) photoModal.style.display = 'none';
  
  const exportModal = document.getElementById('modal-story-export');
  const exportImg = document.getElementById('export-selfie-img');
  
  if (selfieDataUrl && exportImg) {
    exportImg.src = selfieDataUrl;
    exportImg.style.display = 'block';
    exportImg.style.transform = 'none';
  }
  
  if (exportModal) exportModal.style.display = 'flex';
}

function downloadStory() {
  const frame = document.getElementById('story-export-frame');
  if (!frame || typeof html2canvas !== 'function') return;
  
  html2canvas(frame, { scale: 2, useCORS: true, backgroundColor: '#2c1520' }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'HappyBirthday_Story.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(e => console.log('Export error', e));
}

function triggerOutro() {
  const exportModal = document.getElementById('modal-story-export');
  if (exportModal) exportModal.style.display = 'none';
  const prizeModal = document.getElementById('prize-popup-overlay');
  if (prizeModal) prizeModal.style.display = 'none';

  if (window.BirthdayAudio && typeof window.BirthdayAudio.fadeOutAudio === 'function') {
    window.BirthdayAudio.fadeOutAudio(2500);
  }

  if (window.BirthdayAudio && typeof window.BirthdayAudio.playApplause === 'function') {
    window.BirthdayAudio.playApplause();
  }
  
  const outro = document.getElementById('outro-overlay');
  const text = document.getElementById('outro-text');
  if (outro) {
    outro.style.opacity = '1';
    outro.style.pointerEvents = 'all';
  }
  if (text) {
    text.style.opacity = '1';
  }

  const curtainLeft = document.getElementById('curtain-left');
  const curtainRight = document.getElementById('curtain-right');
  const curtainText = document.getElementById('curtain-text');
  
  if (curtainLeft && curtainRight && curtainText) {
    setTimeout(() => {
      curtainLeft.style.transform = 'translateX(0)';
      curtainRight.style.transform = 'translateX(0)';
      curtainText.style.opacity = '1';
    }, 4000);
  }
}

// BINDINGS FOR MODALS
document.addEventListener("DOMContentLoaded", () => {
  const btnSkipSelfie = document.getElementById('btn-skip-selfie');
  const btnTakeSelfie = document.getElementById('btn-take-selfie');
  const btnRetakeSelfie = document.getElementById('btn-retake-selfie');
  const btnConfirmSelfie = document.getElementById('btn-confirm-selfie');
  
  const btnDownloadStory = document.getElementById('btn-download-story');
  const btnFinish = document.getElementById('btn-finish-experience');

  if (btnSkipSelfie) btnSkipSelfie.addEventListener('click', skipSelfie);
  
  if (btnTakeSelfie) {
    btnTakeSelfie.addEventListener('click', () => {
      const video = document.getElementById('selfie-video');
      const canvas = document.getElementById('selfie-canvas');
      const countdownOverlay = document.getElementById('selfie-countdown-overlay');
      const flashOverlay = document.getElementById('selfie-flash-overlay');
      const btnSkip = document.getElementById('btn-skip-selfie');

      if (video && canvas) {
        // Khóa nút trong lúc đếm ngược
        btnTakeSelfie.disabled = true;
        if (btnSkip) btnSkip.disabled = true;

        if (countdownOverlay) {
          countdownOverlay.style.display = 'flex';
          let count = 3;
          countdownOverlay.textContent = count;
          
          const interval = setInterval(() => {
            count--;
            if (count > 0) {
              countdownOverlay.textContent = count;
            } else {
              clearInterval(interval);
              countdownOverlay.style.display = 'none';
              
              // Hiệu ứng chớp Flash trắng
              if (flashOverlay) {
                flashOverlay.style.display = 'block';
                flashOverlay.style.opacity = '1';
                setTimeout(() => {
                  flashOverlay.style.opacity = '0';
                  setTimeout(() => {
                    flashOverlay.style.display = 'none';
                  }, 500);
                }, 50);
              }
              
              // Chụp ảnh
              const ctx = canvas.getContext('2d');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.translate(canvas.width, 0); // Lật ảnh gương
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              selfieDataUrl = canvas.toDataURL('image/jpeg', 0.9);
              video.style.display = 'none';
              canvas.style.display = 'block';
              
              document.getElementById('selfie-initial-actions').style.display = 'none';
              document.getElementById('selfie-review-actions').style.display = 'flex';
              
              // Khôi phục nút
              btnTakeSelfie.disabled = false;
              if (btnSkip) btnSkip.disabled = false;
              safeVibrate([40]);
            }
          }, 1000);
        } else {
          // Fallback nếu không có overlay
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          selfieDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          video.style.display = 'none';
          canvas.style.display = 'block';
          
          document.getElementById('selfie-initial-actions').style.display = 'none';
          document.getElementById('selfie-review-actions').style.display = 'flex';
          btnTakeSelfie.disabled = false;
          if (btnSkip) btnSkip.disabled = false;
          safeVibrate([40]);
        }
      }
    });
  }

  const btnUploadSelfie = document.getElementById('btn-upload-selfie');
  const selfieFileInput = document.getElementById('selfie-file-input');

  if (btnUploadSelfie && selfieFileInput) {
    btnUploadSelfie.addEventListener('click', () => {
      selfieFileInput.click();
    });

    selfieFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelfieFileUpload(e.target.files[0]);
      }
    });
  }

  if (btnRetakeSelfie) {
    btnRetakeSelfie.addEventListener('click', () => {
      const video = document.getElementById('selfie-video');
      const canvas = document.getElementById('selfie-canvas');
      const initActions = document.getElementById('selfie-initial-actions');
      const reviewActions = document.getElementById('selfie-review-actions');
      const fileInput = document.getElementById('selfie-file-input');
      const btnTake = document.getElementById('btn-take-selfie');

      if (fileInput) fileInput.value = '';
      selfieDataUrl = null;

      if (selfieStream && selfieStream.active) {
        if (video) video.style.display = 'block';
        if (canvas) canvas.style.display = 'none';
        hideCameraNotice();
        if (btnTake) {
          btnTake.disabled = false;
          btnTake.style.opacity = '1';
        }
      } else {
        openSelfieModal();
      }

      if (initActions) initActions.style.display = 'flex';
      if (reviewActions) reviewActions.style.display = 'none';
    });
  }

  if (btnConfirmSelfie) btnConfirmSelfie.addEventListener('click', openStoryExport);
  if (btnDownloadStory) btnDownloadStory.addEventListener('click', downloadStory);
  if (btnFinish) btnFinish.addEventListener('click', triggerOutro);
});
// ==================== END NEW FEATURES ====================
let OPENING_TIMER = null;
let IS_CARD_LOCKED = false;
let IS_JOURNEY_STARTED = false;

document.addEventListener("DOMContentLoaded", async () => {
  // Hiển thị giao diện Loading
  const appContainer = document.getElementById("app-container");
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "global-loading-overlay";
  loadingOverlay.style.cssText = "position: fixed; inset: 0; background: #2c1520; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffd98e; font-family: var(--font-sans, sans-serif); transition: opacity 0.5s ease;";
  loadingOverlay.innerHTML = `
    <style>
      @keyframes cdPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.9); opacity: 0.7; } }
      .cd-pulse-anim { animation: cdPulse 1.5s infinite; }
    </style>
    <div class="cd-pulse-anim" style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
    <div style="font-size: 1.2rem; font-weight: 500;">Đang tải dữ liệu thiệp...</div>
  `;
  if (appContainer) appContainer.appendChild(loadingOverlay);
  else document.body.appendChild(loadingOverlay);

  // 1. Khởi tạo cấu hình (URL > LocalStorage > config.js)
  await initCardConfiguration();

  // Ẩn giao diện Loading
  loadingOverlay.style.opacity = "0";
  setTimeout(() => loadingOverlay.remove(), 500);

  // 2. Khởi tạo các tiện ích dùng chung: Vòng Quay, Lightbox
  initLuckyWheel();
  initLightbox();
  initUtilities();

  // 3. Khởi tạo nhạc nền ngay lập tức và ép trình duyệt tải trước
  window.currentAudio = new Audio('assets/audio/birthday.mp3');
  window.currentAudio.preload = 'auto';

  const lockStatus = checkCardLockStatus();
  const startOverlay = document.getElementById("start-overlay");

  if (startOverlay) {
    // Lắng nghe khi nhạc đã tải xong đủ để phát không giật lag
    window.currentAudio.addEventListener('canplaythrough', function() {
        startOverlay.innerHTML = "Chạm vào đây để mở thiệp ✨";
        startOverlay.style.pointerEvents = "auto"; // Cho phép click
        startOverlay.style.opacity = "1";
        startOverlay.classList.add('pulse-animation'); // Thêm class hiệu ứng đập nhịp nhàng
    });

    // Xử lý khi người dùng chạm
    startOverlay.addEventListener('click', function() {
        window.currentAudio.play(); // Nhạc sẽ nổ ra ngay lập tức 100% không độ trễ
        startOverlay.style.display = 'none';
        
        const audioIcon = document.getElementById("audio-icon");
        if (audioIcon) audioIcon.textContent = "🔊";

        if (lockStatus.isLocked) {
          initStageCountdown(lockStatus);
        } else {
          startCelebrationJourney();
        }
    });
  } else {
    if (lockStatus.isLocked) {
      initStageCountdown(lockStatus);
    } else {
      startCelebrationJourney();
    }
  }
});

/**
 * Nạp và chuẩn hóa dữ liệu cấu hình
 */
async function initCardConfiguration() {
  let urlData = null;
  if (window.CardStorage) {
    urlData = await window.CardStorage.getFromUrl();
  }

  const baseConfig = typeof BIRTHDAY_CONFIG !== "undefined" ? BIRTHDAY_CONFIG : {};
  ACTIVE_CONFIG = Object.assign({}, baseConfig, urlData || {});

  // Chuẩn hóa tên và lời chúc
  const receiver = ACTIVE_CONFIG.recipientName || "Hương Giang";
  const sender = ACTIVE_CONFIG.senderName || "Tớ";

  const replacePlaceholders = (str) => {
    if (!str) return "";
    return str.replace(/\{receiver\}/g, receiver).replace(/\{sender\}/g, sender);
  };

  // Cập nhật các trường văn bản
  if (ACTIVE_CONFIG.recipientName) {
    document.title = `Món Quà Sinh Nhật Dành Cho ${receiver} 🎂✨`;
  }

  const setSafeText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = replacePlaceholders(String(val));
  };

  const setSafeHtml = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.innerHTML = replacePlaceholders(String(val)).replace(/\n/g, "<br>");
  };

  setSafeText("opening-greeting", ACTIVE_CONFIG.openingGreeting || "Happy Birthday");
  setSafeText("cake-intro-line1", ACTIVE_CONFIG.cakeTitle || "Có một món quà nhỏ dành cho cậu…");
  setSafeText("cake-intro-line2", ACTIVE_CONFIG.cakeSubtitle || "Nhưng trước khi mở, thổi nến trước nhé 🎂");
  setSafeText("candle-hint", ACTIVE_CONFIG.cakePrompt || "👆 Nhấn giữ ngọn nến hoặc THỔI trực tiếp vào micro để dập tắt 💨");

  setSafeText("wish-kicker", ACTIVE_CONFIG.wishKicker || "Một điều ước");
  setSafeText("wish-question", ACTIVE_CONFIG.wishQuestion || "Bây giờ… chọn một điều ước cho ngày sinh nhật của cậu.");
  setSafeText("wish-reply", ACTIVE_CONFIG.wishReply || "Điều ước đã được nhận. Mong nó từ từ thành hiện thực.");

  setSafeText("heart-caption", ACTIVE_CONFIG.heartCaption || "Tất cả những kỷ niệm nhỏ này là dành cho cậu.");
  setSafeText("heart-title", ACTIVE_CONFIG.heartTitle || `Chúc Mừng Sinh Nhật, ${receiver}.`);
  setSafeText("heart-subtitle", ACTIVE_CONFIG.heartSubtitle || "Hôm nay cậu nhất định phải được ăn mừng.");
  setSafeText("heart-tap-hint", ACTIVE_CONFIG.heartTapHint || "Chạm vào trái tim để xem ảnh ♡");

  setSafeText("letter-kicker", ACTIVE_CONFIG.letterKicker || "Lá thư nhỏ");
  setSafeHtml("letter-body-text", ACTIVE_CONFIG.letterBody || `Tớ không giỏi nói mấy lời hoa mỹ, nên viết đơn giản thôi: chúc mừng sinh nhật cậu nhé.\n\nNăm vừa rồi chắc chẳng dễ dàng gì, vậy mà cậu vẫn đi tới được hôm nay — giỏi hơn cậu nghĩ nhiều đấy.\n\nTớ chỉ mong cậu ăn ngon ngủ đủ, bớt lo một chút, và nhớ là luôn có người ở đây khi cậu cần.`);
  setSafeText("letter-signature-text", ACTIVE_CONFIG.letterSignature || `— ${sender}`);

  setSafeText("final-kicker", ACTIVE_CONFIG.finalKicker || "Dành cho cậu");
  setSafeText("final-title", ACTIVE_CONFIG.finalTitle || `Chúc Mừng Sinh Nhật, ${receiver}`);
  setSafeText("final-from", ACTIVE_CONFIG.finalFrom || `từ ${sender}`);
  setSafeText("final-message", ACTIVE_CONFIG.finalMessage || "Mong điều ước cậu chọn lúc nãy thật sự tìm được đường đến với cậu trong năm nay.");

  setSafeText("starlight-kicker", ACTIVE_CONFIG.starlightKicker || "Gửi lên trời");
  setSafeText("starlight-title", ACTIVE_CONFIG.starlightTitle || "Biến điều ước thành sao băng");
  setSafeText("starlight-subtitle", ACTIVE_CONFIG.starlightSubtitle || "Chạm vào ngôi sao để gửi điều ước của cậu lên trời đêm ✨");
  setSafeText("starlight-sent-title", ACTIVE_CONFIG.starlightSentTitle || "Điều ước đã được gửi đi ✨");
  setSafeText("starlight-sent-msg", ACTIVE_CONFIG.starlightSentMessage || "Người ta nói điều ước theo sao băng sớm muộn cũng thành hiện thực. Từ đêm nay, sẽ luôn có một ngôi sao giữ lời ước ấy giúp cậu.");
  setSafeText("starlight-tap-hint", ACTIVE_CONFIG.starlightTapHint || "Chạm vào bầu trời để thả thêm sao băng nhé ✧");
}

/**
 * Chuyển đổi giữa các giai đoạn hiển thị
 */
function switchStage(stageName) {
  CURRENT_STAGE = stageName;



  const stages = [
    "stage-countdown", "stage-opening", "stage-intro", "stage-beats", "stage-wish",
    "stage-heart", "stage-letter", "stage-final", "stage-starlight"
  ];

  stages.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === `stage-${stageName}`) {
        el.style.display = "flex";
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        el.style.display = "none";
      }
    }
  });

  // Tự động kích hoạt cánh hoa rơi ở các màn lãng mạn (chỉ khi không bị khóa)
  const petalsWrap = document.getElementById("petals-container");
  if (petalsWrap && !IS_CARD_LOCKED) {
    if (["heart", "letter", "final", "starlight"].includes(stageName)) {
      petalsWrap.style.display = "block";
    }
  }
}

/**
 * Khởi tạo hệ thống âm thanh & nhạc nền
 */
function initAudioSystem() {
  const audioBtn = document.getElementById("btn-audio-toggle");
  const audioIcon = document.getElementById("audio-icon");

  if (window.currentAudio) {
    window.currentAudio.volume = 0.6;
  }

  if (audioBtn && window.currentAudio) {
    audioBtn.addEventListener("click", () => {
      if (window.currentAudio.paused) {
        window.currentAudio.play().then(() => {
          if (audioIcon) audioIcon.textContent = "🔊";
        });
      } else {
        window.currentAudio.pause();
        if (audioIcon) audioIcon.textContent = "🔇";
      }
    });
  }
}

/**
 * Cánh hoa rơi lơ lửng tự nhiên
 */
function initFallingPetals() {
  const container = document.getElementById("petals-container");
  if (!container) return;

  const petalImages = [
    "assets/images/petals/petal-blush-broad-01.webp",
    "assets/images/petals/petal-cream-long-01.webp",
    "assets/images/petals/petal-peach-broad-01.webp",
    "assets/images/petals/petal-peach-long-01.webp",
    "assets/images/petals/petal-peach-long-02.webp"
  ];

  const totalPetals = 16;
  container.innerHTML = "";

  for (let i = 0; i < totalPetals; i++) {
    const petal = document.createElement("img");
    petal.src = petalImages[i % petalImages.length];
    petal.className = "lovegift-petal";
    petal.alt = "";
    petal.draggable = false;

    const left = Math.random() * 96;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 8;
    const size = 18 + Math.random() * 16;

    petal.style.left = `${left}%`;
    petal.style.top = "-5vh";
    petal.style.width = `${size}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.opacity = (0.5 + Math.random() * 0.45).toString();

    container.appendChild(petal);
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 1: DATE REEL OPENING
 * =========================================================
 */
function initStageOpening() {
  const reelScroller = document.getElementById("reel-scroller");
  const selectedDayEl = document.getElementById("reel-selected-day");
  const selectedMonthEl = document.getElementById("reel-selected-month");
  const skipBtn = document.getElementById("btn-skip-opening");

  const targetDay = parseInt(ACTIVE_CONFIG.birthDay) || 17;
  const targetMonth = parseInt(ACTIVE_CONFIG.birthMonth) || 7;

  if (selectedDayEl) selectedDayEl.textContent = targetDay;
  if (selectedMonthEl) selectedMonthEl.textContent = `Tháng ${targetMonth}`;

  // Tạo danh sách số cuộn: [30, 31, 1, 2, ..., 31, 1, 2, ...]
  if (reelScroller) {
    const numbers = [30, 31];
    for (let i = 1; i <= 31; i++) numbers.push(i);
    for (let i = 1; i <= 5; i++) numbers.push(i);

    reelScroller.innerHTML = "";
    numbers.forEach((num, idx) => {
      const item = document.createElement("div");
      item.className = "lovegift-reel-item";
      item.textContent = num;
      // Ẩn số trùng khớp tại vị trí dừng để nhường chỗ cho số phát sáng
      const isTarget = (num === targetDay && idx >= 2);
      if (isTarget) {
        item.style.opacity = "0";
      }
      reelScroller.appendChild(item);
    });

    // Tính vị trí dừng: tìm index của targetDay
    let targetIndex = numbers.indexOf(targetDay, 2);
    if (targetIndex === -1) targetIndex = 18;

    const itemHeight = 76;
    const centerOffset = 114;
    const reelTo = -(targetIndex * itemHeight - centerOffset);
    const reelFrom = -190;

    reelScroller.style.setProperty("--reel-from", `${reelFrom}px`);
    reelScroller.style.setProperty("--reel-to", `${reelTo}px`);
    
    // Khôi phục logic .rolling
    reelScroller.classList.add("rolling");
    setTimeout(() => {
      if (reelScroller) reelScroller.classList.remove("rolling");
    }, 3500);
  }

  // Tự động chuyển sang stage 2 sau khi hiệu ứng mở đầu hoàn tất (tăng lên 6.7s để số quay đủ lâu)
  if (OPENING_TIMER) clearTimeout(OPENING_TIMER);
  OPENING_TIMER = setTimeout(() => {
    switchStage("intro");
  }, 6700);

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      if (OPENING_TIMER) clearTimeout(OPENING_TIMER);
      switchStage("intro");
    });
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 2: THỔI NẾN BÁNH KEM CHÂN THỰC
 * =========================================================
 */
function initStageIntro() {
  const touchZone = document.getElementById("candle-touch-zone");
  const cakeWrap = document.getElementById("cake-interactive-wrap");
  const flameWrap = document.getElementById("flame-wrap");
  const flameEl = document.getElementById("flame-element");
  const flameHalo = document.getElementById("flame-halo");
  const holdProgressSvg = document.getElementById("hold-progress-svg");
  const progressBar = document.getElementById("hold-progress-bar");
  const smokeEl = document.getElementById("candle-smoke");
  const dimOverlay = document.getElementById("candle-dim-overlay");
  const hintEl = document.getElementById("candle-hint");

  let isHolding = false;
  let isExtinguished = false;
  let holdStartTime = 0;
  let holdAnimFrame = null;
  let tapCount = 0;
  const REQUIRED_HOLD_DURATION = 2200; // 2.2s
  const CIRCUMFERENCE = 289.026; // 2 * PI * 46 (Chuẩn Happy_Birthday)

  if (progressBar) {
    progressBar.style.strokeDasharray = CIRCUMFERENCE.toString();
    progressBar.style.strokeDashoffset = CIRCUMFERENCE.toString();
  }

  const triggerBlowoutSuccess = () => {
    if (isExtinguished) return;
    isExtinguished = true;
    isHolding = false;
    if (holdAnimFrame) cancelAnimationFrame(holdAnimFrame);

    safeVibrate([40, 60, 40]);
    if (typeof stopMicBlowing === "function") stopMicBlowing();

    if (window.BirthdayAudio) {
      window.BirthdayAudio.stopWindSound();
      window.BirthdayAudio.playBlow();
    }

    if (progressBar) progressBar.style.strokeDashoffset = "0";
    if (holdProgressSvg) holdProgressSvg.style.opacity = "0";
    if (flameHalo) flameHalo.style.opacity = "0";
    if (dimOverlay) dimOverlay.style.opacity = "0.7";

    if (flameEl) {
      flameEl.classList.remove("lovegift-blowing");
      flameEl.classList.add("lovegift-blowout");
      flameEl.style.transform = "none";
    }
    setTimeout(() => {
      if (flameWrap) flameWrap.style.display = "none";
      if (smokeEl) smokeEl.style.display = "block";
    }, 700);

    // Pháo hoa giấy confetti chúc mừng thổi nến
    triggerConfettiBurst();

    if (hintEl) hintEl.textContent = "✨ Ngọn nến đã tắt, điều ước đã bay đi...";

    // Chuyển sang Giai đoạn Beats sau 1.6s
    setTimeout(() => {
      playEmotionalBeats();
    }, 1600);
  };


  const resetHold = (e) => {
    if (isExtinguished) return;
    const elapsed = performance.now() - holdStartTime;
    isHolding = false;
    if (holdAnimFrame) cancelAnimationFrame(holdAnimFrame);
    if (progressBar) progressBar.style.strokeDashoffset = CIRCUMFERENCE.toString();
    if (holdProgressSvg) holdProgressSvg.style.opacity = "0.28";
    if (flameHalo) flameHalo.style.opacity = "0.75";
    if (dimOverlay) dimOverlay.style.opacity = "0";
    if (flameEl) {
      flameEl.classList.remove("lovegift-blowing");
      flameEl.style.transform = "none";
    }
    if (window.BirthdayAudio) window.BirthdayAudio.stopWindSound();

    // Nếu người dùng chỉ chạm nhẹ mà không giữ
    if (elapsed < 500) {
      tapCount++;
      if (tapCount >= 2) {
        triggerBlowoutSuccess();
      } else {
        if (hintEl) hintEl.textContent = "👆 Hãy nhấn và GIỮ (Hold) ngọn nến trong 2 giây để thổi tắt nhé! 💨";
        if (flameEl) {
          flameEl.classList.add("lovegift-blowing");
          setTimeout(() => {
            if (!isExtinguished && !isHolding) flameEl.classList.remove("lovegift-blowing");
          }, 600);
        }
      }
    } else {
      if (hintEl) hintEl.textContent = ACTIVE_CONFIG.cakePrompt || "👆 Nhấn & giữ ngọn nến cho đến khi tắt";
    }
  };

  const onHoldProgress = (now) => {
    if (!isHolding || isExtinguished) return;
    const elapsed = now - holdStartTime;
    const progress = Math.min(1, elapsed / REQUIRED_HOLD_DURATION);

    // Cập nhật vòng tiến trình SVG theo chu vi chuẩn
    if (progressBar) {
      progressBar.style.strokeDashoffset = (CIRCUMFERENCE * (1 - progress)).toString();
    }
    if (holdProgressSvg) {
      holdProgressSvg.style.opacity = "1";
    }
    if (flameHalo) {
      flameHalo.style.opacity = "0.9";
    }
    if (flameEl) {
      flameEl.style.transform = `rotate(${22 * progress}deg) scaleY(${1 - 0.35 * progress})`;
    }

    // Làm tối nền dần dần tạo cảm giác tập trung
    if (dimOverlay) {
      dimOverlay.style.opacity = (progress * 0.7).toString();
    }

    if (progress >= 1) {
      triggerBlowoutSuccess();
      return;
    }

    holdAnimFrame = requestAnimationFrame(onHoldProgress);
  };

  const startHold = (e) => {
    if (isExtinguished) return;
    isHolding = true;
    holdStartTime = performance.now();

    if (flameEl) flameEl.classList.add("lovegift-blowing");
    if (holdProgressSvg) holdProgressSvg.style.opacity = "1";
    if (flameHalo) flameHalo.style.opacity = "0.9";
    if (hintEl) hintEl.textContent = ACTIVE_CONFIG.cakeHoldingHint || "giữ nữa… giữ tiếp…";
    if (window.BirthdayAudio) window.BirthdayAudio.startWindSound();

    holdAnimFrame = requestAnimationFrame(onHoldProgress);
  };

  [touchZone, cakeWrap].forEach(el => {
    if (el) {
      el.addEventListener("pointerdown", startHold);
      el.addEventListener("pointerup", resetHold);
      el.addEventListener("pointerleave", resetHold);
      el.addEventListener("pointercancel", resetHold);
    }
  });

  if (typeof initMicBlowing === "function") {
    initMicBlowing((fromMic) => {
      triggerBlowoutSuccess();
    });
  }
}

/**
 * Hiệu ứng nhịp đập cảm xúc (Emotional Beats)
 */
function playEmotionalBeats() {
  switchStage("beats");
  const beatsTextEl = document.getElementById("beats-text");

  const receiver = ACTIVE_CONFIG.recipientName || "Hương Giang";
  const sender = ACTIVE_CONFIG.senderName || "Tớ";

  const rawBeats = ACTIVE_CONFIG.beats || [
    "Ngọn nến đã tắt…",
    "nhưng cậu không đi qua năm nay một mình đâu.",
    "Từ từ thôi nhé, {receiver}. {sender} ở đây mà."
  ];

  const beats = rawBeats.map(b => b.replace(/\{receiver\}/g, receiver).replace(/\{sender\}/g, sender));
  beats.push(ACTIVE_CONFIG.blackoutCaption || "đang thu gom những kỷ niệm…");

  let currentBeatIndex = 0;

  const showNextBeat = () => {
    if (currentBeatIndex >= beats.length) {
      setTimeout(() => {
        switchStage("wish");
      }, 800);
      return;
    }

    if (beatsTextEl) {
      beatsTextEl.style.opacity = "0";
      beatsTextEl.style.transform = "translateY(10px)";
      
      setTimeout(() => {
        beatsTextEl.textContent = beats[currentBeatIndex];
        beatsTextEl.style.opacity = "1";
        beatsTextEl.style.transform = "translateY(0)";

        currentBeatIndex++;
        setTimeout(showNextBeat, 2600);
      }, 400);
    }
  };

  showNextBeat();
}

/**
 * =========================================================
 * GIAI ĐOẠN 3: CHỌN ĐIỀU ƯỚC SINH NHẬT
 * =========================================================
 */
function initStageWish() {
  const container = document.getElementById("wish-cards-container");
  const replyEl = document.getElementById("wish-reply");
  if (!container) return;

  const textArea = document.getElementById("free-wish-input");
  const submitBtn = document.getElementById("btn-submit-wish");

  if (submitBtn && textArea) {
    submitBtn.addEventListener("click", () => {
      const wish = textArea.value.trim() || "Một điều ước bí mật";
      
      SELECTED_WISH = wish;
      const chosenStarText = document.getElementById("starlight-chosen-wish");
      if (chosenStarText) chosenStarText.textContent = `“${wish}”`;

      try {
        if (window.BirthdayAudio) {
          if (typeof window.BirthdayAudio.playChime === 'function') {
            window.BirthdayAudio.playChime();
          } else if (typeof window.BirthdayAudio.playSparkle === 'function') {
            window.BirthdayAudio.playSparkle();
          }
        }
      } catch (e) {
        console.warn("Audio chime error:", e);
      }

      textArea.style.opacity = "0";
      submitBtn.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      submitBtn.style.pointerEvents = "none";

      if (replyEl) replyEl.style.display = "block";

      triggerConfettiBurst();

      // Chuyển trực tiếp sang màn Sao băng như yêu cầu
      setTimeout(() => {
        switchStage("starlight");
      }, 2200);
    });
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 4: TRÁI TIM KỶ NIỆM MOSAIC & LIGHTBOX
 * =========================================================
 */
function initStageHeart() {
  const gridContainer = document.getElementById("heart-grid-tiles");
  const sparksWrap = document.getElementById("heart-sparks-wrap");
  const nextBtn = document.getElementById("btn-goto-letter");

  if (!gridContainer) return;

  const gallery = (ACTIVE_CONFIG.gallery && ACTIVE_CONFIG.gallery.length > 0)
    ? ACTIVE_CONFIG.gallery
    : [
        { url: "assets/images/girl/girl2.jpeg", caption: "Nụ cười rạng rỡ nhất ☀️" },
        { url: "assets/images/girl/girl3.jpeg", caption: "Những khoảnh khắc ngập tràn niềm vui 🌸" },
        { url: "assets/images/photo1.jpg", caption: "Kỷ niệm ngọt ngào 💖" },
        { url: "assets/images/photo2.jpg", caption: "Mỗi ngày đều là món quà ✨" },
        { url: "assets/images/photo3.jpg", caption: "Bình yên và hạnh phúc 🍀" },
        { url: "assets/images/photo4.jpg", caption: "Tuổi mới thật rực rỡ! 🎂" }
      ];

  // Ma trận trái tim 10 hàng x 11 cột
  const HEART_MATRIX = [
    [0,1,1,0,0,0,0,0,1,1,0],
    [1,1,1,1,0,0,0,1,1,1,1],
    [1,1,1,1,1,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0,0]
  ];

  // Thuật toán pseudo-random dựa trên sin
  function pseudoRandom(seed) {
    const s = 43758.5453 * Math.sin(seed);
    return s - Math.floor(s);
  }

  // 1. Tạo các mảnh ghép ảnh
  gridContainer.innerHTML = "";
  HEART_MATRIX.forEach((row, r) => {
    row.forEach((hasTile, c) => {
      if (!hasTile) {
        const emptyTile = document.createElement("span");
        emptyTile.style.aspectRatio = "1";
        gridContainer.appendChild(emptyTile);
        return;
      }

      const n = pseudoRandom(3.7 * r + 19.1 * c + 5);
      const o = pseudoRandom(8.3 * r + 2.9 * c + 1);
      const imgIndex = Math.floor(pseudoRandom(5.2 * r + 9.7 * c + 3) * gallery.length) % gallery.length;
      const photo = gallery[imgIndex];

      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "lovegift-tile-spiral";
      tile.title = photo.caption || "Xem ảnh kỷ niệm";
      tile.style.backgroundImage = `url('${photo.url}')`;
      tile.style.setProperty("--spin", `${210 + 90 * n}deg`);
      tile.style.setProperty("--sc", `${1.55 + 0.7 * n}`);
      tile.style.animationDelay = `${0.35 * o}s`;
      tile.style.transformOrigin = `${50 + (5 - c) * 100}% ${50 + (3.4 - r) * 100}%`;

      tile.addEventListener("click", () => {
        openLightbox(imgIndex);
      });

      gridContainer.appendChild(tile);
    });
  });

  // 2. Tạo 12 tia lửa vàng bung tỏa phía sau trái tim
  if (sparksWrap) {
    sparksWrap.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const spark = document.createElement("span");
      spark.className = "lovegift-heart-spark";
      const rad = (i / 12) * Math.PI * 2 + 0.5 * pseudoRandom(i);
      const dist = 70 + 70 * pseudoRandom(3.1 * i);
      const sx = `${Math.cos(rad) * dist}px`;
      const sy = `${Math.sin(rad) * dist}px`;
      const delay = `${1.6 + 0.18 * pseudoRandom(7.7 * i)}s`;

      spark.style.setProperty("--sx", sx);
      spark.style.setProperty("--sy", sy);
      spark.style.animationDelay = delay;

      sparksWrap.appendChild(spark);
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      switchStage("letter");
    });
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 5: VINTAGE LETTER
 * =========================================================
 */
function initStageLetter() {
  const btnOpen = document.getElementById("btn-open-letter");
  const scrollContent = document.getElementById("letter-scroll-content");
  const bodyText = document.getElementById("letter-body-text");
  const skipBtn = document.getElementById("btn-skip-typewriter");
  const nextBtn = document.getElementById("btn-goto-final");
  const actionsWrap = document.getElementById("letter-actions-wrap");
  const signText = document.getElementById("letter-signature-text");

  const rawLetterText = ACTIVE_CONFIG.letterContent || "Tớ không giỏi nói mấy lời hoa mỹ, nên viết đơn giản thôi: chúc mừng sinh nhật cậu nhé.\n\nNăm vừa rồi chắc chẳng dễ dàng gì, vậy mà cậu vẫn đi tới được hôm nay — giỏi hơn cậu nghĩ nhiều đấy.\n\nTớ chỉ mong cậu ăn ngon ngủ đủ, bớt lo một chút, và nhớ là luôn có người ở đây khi cậu cần.";

  if (btnOpen) {
    btnOpen.addEventListener("click", () => {
      btnOpen.style.opacity = "0";
      btnOpen.style.pointerEvents = "none";
      setTimeout(() => btnOpen.style.display = "none", 300);

      if (scrollContent) scrollContent.style.opacity = "1";
      if (actionsWrap) actionsWrap.style.display = "flex";

      typeWriterEffect(bodyText, rawLetterText, 35);
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      if (typewriterInterval) clearTimeout(typewriterInterval);
      if (bodyText) bodyText.innerHTML = rawLetterText.replace(/\n/g, '<br>');
      if (signText) signText.style.opacity = "1";
      skipBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "inline-block";
      if (scrollContent) scrollContent.style.pointerEvents = "auto";
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      switchStage("final");
    });
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 6: FINAL CARD
 * =========================================================
 */
function initStageFinal() {
  const gotoStarlightBtn = document.getElementById("btn-goto-starlight");

  if (gotoStarlightBtn) {
    gotoStarlightBtn.addEventListener("click", () => {
      switchStage("starlight");
    });
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 7: STARLIGHT SHOOTING STARS SKY
 * =========================================================
 */
function initStageStarlight() {
  const launchStarBtn = document.getElementById("btn-launch-star");
  const starElement = document.getElementById("wishing-star-element");
  const wishPill = document.getElementById("starlight-chosen-wish");
  const feedbackWrap = document.getElementById("starlight-launched-feedback");
  const actionsWrap = document.getElementById("starlight-actions-wrap");
  const openWheelBtn = document.getElementById("btn-open-wheel-starlight");

  if (launchStarBtn) {
    launchStarBtn.addEventListener("click", () => {
      if (IS_STAR_LAUNCHED) return;
      IS_STAR_LAUNCHED = true;

      const swooshSound = new Audio('assets/audio/swoosh.mp3');
      swooshSound.volume = 1.0;
      swooshSound.play();

      // Star phóng lên trời
      if (starElement) {
        starElement.classList.remove("lovegift-twinkle");
        starElement.classList.add("lovegift-launch");
      }
      if (wishPill) wishPill.classList.add("wish-fly-up");

      // Hiển thị lời chúc đã bay lên & hiện duy nhất nút quay thưởng nhận quà
      setTimeout(() => {
        if (feedbackWrap) feedbackWrap.style.display = "block";
        if (actionsWrap) actionsWrap.style.display = "flex";
        // Bắn vài loạt sao băng tự động
        spawnMeteorsBatch(10);
        createShootingStars();
      }, 4000);
    });
  }

  // Tương tác chạm bầu trời để thả thêm sao băng
  window.addEventListener("pointerdown", (e) => {
    if (CURRENT_STAGE !== "starlight") return;
    // Bỏ qua nếu chạm vào button
    if (e.target.closest("button") || e.target.closest("a")) return;

    createShootingStarAt(e.clientX, e.clientY);
  });

  if (openWheelBtn) {
    openWheelBtn.addEventListener("click", () => {
      openLuckyWheelModal();
    });
  }
}

/**
 * Tạo một vệt sao băng rơi tại tọa độ (x, y)
 */
function createShootingStarAt(x, y) {
  const sky = document.getElementById("meteor-sky-container");
  if (!sky) return;

  const meteorWrap = document.createElement("span");
  meteorWrap.className = "lovegift-meteor-wrap";
  meteorWrap.style.left = `${x}px`;
  meteorWrap.style.top = `${y}px`;

  const length = 80 + Math.random() * 45;
  const duration = 0.8 + Math.random() * 0.4;

  meteorWrap.innerHTML = `
    <span class="lovegift-meteor" style="width: ${length}px; animation-duration: ${duration}s;"></span>
  `;

  sky.appendChild(meteorWrap);

  setTimeout(() => {
    meteorWrap.remove();
  }, duration * 1000 + 200);
}

/**
 * Bắn một đàn sao băng ngẫu nhiên
 */
function spawnMeteorsBatch(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const rx = Math.random() * window.innerWidth * 0.8;
      const ry = Math.random() * window.innerHeight * 0.5;
      createShootingStarAt(rx, ry);
    }, i * 220);
  }
}

/**
 * Hàng trăm sao băng 3D
 */
function createShootingStars() {
    const sky = document.getElementById('stage-starlight');
    
    // Giữ lại nội dung cũ của stage-starlight (các class khác như starlight-actions-wrap...) 
    // và chỉ dọn dẹp các sao hiện có (nếu muốn, nhưng tốt nhất là tạo một container riêng 
    // hoặc thêm vào cuối để không xóa đè nút bấm).
    // Vì prompt nói sky.innerHTML = ''; nên nếu áp dụng thẳng sẽ xóa mất nút UI!
    // Vậy ta sẽ tìm meteor-sky-container để an toàn hơn, hoặc theo prompt.
    // Dựa vào prompt, tôi sẽ chèn trực tiếp, nhưng để không bị mất UI, tôi sẽ chọn background element.
    let starBg = document.getElementById('meteor-sky-container');
    if (!starBg) return;
    starBg.innerHTML = ''; 
    
    // 1. Tạo 50 ngôi sao tĩnh nhấp nháy làm phông nền vũ trụ
    for(let i = 0; i < 50; i++) {
        let staticStar = document.createElement('div');
        staticStar.className = 'static-star';
        staticStar.style.left = Math.random() * 100 + 'vw';
        staticStar.style.top = Math.random() * 100 + 'vh';
        let size = Math.random() * 3 + 1; // Kích thước từ 1px đến 4px
        staticStar.style.width = size + 'px';
        staticStar.style.height = size + 'px';
        staticStar.style.animationDelay = (Math.random() * 5) + 's';
        starBg.appendChild(staticStar);
    }

    // 2. Tạo 5-7 vệt sao băng lớn bay xẹt qua
    let numMeteors = 5 + Math.floor(Math.random() * 3);
    for(let j = 0; j < numMeteors; j++) {
        let meteor = document.createElement('div');
        meteor.className = 'shooting-star-3d';
        // Phân bổ vị trí ngẫu nhiên tập trung ở nửa trên và bên phải màn hình
        meteor.style.left = (Math.random() * 150) + 'vw'; 
        meteor.style.top = (Math.random() * 50 - 20) + 'vh';
        meteor.style.animationDelay = (Math.random() * 10) + 's';
        meteor.style.animationDuration = (Math.random() * 2 + 2) + 's'; // Tốc độ bay ngẫu nhiên
        starBg.appendChild(meteor);
    }
}

/**
 * Khởi động lại toàn bộ hành trình
 */
function restartExperience() {
  IS_STAR_LAUNCHED = false;
  SELECTED_WISH = "";

  const flameWrap = document.getElementById("flame-wrap");
  const flameEl = document.getElementById("flame-element");
  const smokeEl = document.getElementById("candle-smoke");
  const starElement = document.getElementById("wishing-star-element");
  const wishPill = document.getElementById("starlight-chosen-wish");
  const feedbackWrap = document.getElementById("starlight-launched-feedback");
  const progressBar = document.getElementById("hold-progress-bar");
  const dimOverlay = document.getElementById("candle-dim-overlay");

  if (flameWrap) flameWrap.style.display = "block";
  if (flameEl) {
    flameEl.classList.remove("lovegift-blowout", "lovegift-blowing");
    flameEl.classList.add("lovegift-flame");
  }
  if (smokeEl) smokeEl.style.display = "none";
  if (progressBar) progressBar.style.strokeDashoffset = "251.2";
  if (dimOverlay) dimOverlay.style.opacity = "0";

  if (starElement) {
    starElement.classList.remove("lovegift-launch");
    starElement.classList.add("lovegift-twinkle");
  }
  if (wishPill) wishPill.style.opacity = "1";
  if (feedbackWrap) feedbackWrap.style.display = "none";

  switchStage("intro");
}

/**
 * =========================================================
 * LIGHTBOX PHÓNG TO ẢNH KỶ NIỆM
 * =========================================================
 */
function initLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const imgEl = document.getElementById("lightbox-img");
  const captionEl = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close-btn");
  const prevBtn = document.getElementById("lightbox-prev-btn");
  const nextBtn = document.getElementById("lightbox-next-btn");

  // LỖI 4 FIX: Đọc gallery động mỗi lần mở lightbox thay vì snapshot tĩnh lúc init
  // ACTIVE_CONFIG.gallery sẽ được ghi đè bởi dữ liệu URL #card=... sau khi initCardConfiguration() chạy
  const getLiveGallery = () => {
    return (ACTIVE_CONFIG.gallery && ACTIVE_CONFIG.gallery.length > 0)
      ? ACTIVE_CONFIG.gallery
      : [];
  };

  window.openLightbox = (index) => {
    const gallery = getLiveGallery();
    if (!gallery || gallery.length === 0) return;
    LIGHTBOX_CURRENT_INDEX = index;
    updateLightboxContent();
    if (modal) modal.style.display = "flex";
  };

  const closeLightbox = () => {
    if (modal) modal.style.display = "none";
  };

  const updateLightboxContent = () => {
    const gallery = getLiveGallery(); // Lúc cập nhật nội dung, đọc lại gallery mới nhất
    const item = gallery[LIGHTBOX_CURRENT_INDEX];
    if (item && imgEl) {
      imgEl.src = item.url;
      if (captionEl) captionEl.textContent = item.caption || "";
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const gallery = getLiveGallery();
      LIGHTBOX_CURRENT_INDEX = (LIGHTBOX_CURRENT_INDEX - 1 + gallery.length) % gallery.length;
      updateLightboxContent();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const gallery = getLiveGallery();
      LIGHTBOX_CURRENT_INDEX = (LIGHTBOX_CURRENT_INDEX + 1) % gallery.length;
      updateLightboxContent();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (modal && modal.style.display === "flex") {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevBtn?.click();
      if (e.key === "ArrowRight") nextBtn?.click();
    }
  });
}

/**
 * =========================================================
 * VÒNG QUAY MAY MẮN (LUCKY SPIN WHEEL)
 * =========================================================
 */
let WHEEL_ROTATION = 0;
let IS_WHEEL_SPINNING = false;

function initLuckyWheel() {
  const closeBtn = document.getElementById("btn-close-wheel");
  const spinBtn = document.getElementById("btn-spin-wheel");
  const claimBtn = document.getElementById("btn-claim-prize");
  const prizePopup = document.getElementById("prize-popup-overlay");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const modal = document.getElementById("modal-lucky-wheel");
      if (modal) modal.style.display = "none";
    });
  }

  if (spinBtn) {
    spinBtn.addEventListener("click", spinLuckyWheel);
  }

  if (claimBtn) {
    claimBtn.addEventListener("click", () => {
      if (prizePopup) prizePopup.style.display = "none";
      const modal = document.getElementById("modal-lucky-wheel");
      if (modal) modal.style.display = "none";

      // Bắn confetti chúc mừng kết thúc trọn vẹn trải nghiệm
      triggerGrandCelebration();
      if (typeof openSelfieModal === "function") {
        openSelfieModal();
      }
    });
  }

  drawLuckyWheel(0);
}

function openLuckyWheelModal() {
  const modal = document.getElementById("modal-lucky-wheel");
  if (modal) {
    modal.style.display = "flex";
    drawLuckyWheel(WHEEL_ROTATION);

  }
}

function drawLuckyWheel(currentAngle) {
  const canvas = document.getElementById("lucky-wheel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 12;

  const defaultPrizes = [
    { name: "1 Chầu Trà Sữa 🧋", message: "Được khao 1 ly trà sữa full topping!", color: "#FF6B6B" },
    { name: "1 Vé Xem Phim 🍿", message: "Một buổi xem phim rạp combo bắp nước!", color: "#4ECDC4" },
    { name: "1 Điều Ước Bất Kỳ 🌟", message: "Người tạo thiệp sẽ thực hiện 1 điều ước!", color: "#FFD93D" },
    { name: "Một Ôm Ấm Áp 🤗", message: "Một cái ôm chân thành tiếp thêm năng lượng!", color: "#FF8E72" },
    { name: "Bữa Tối Thịnh Soạn 🍕", message: "Một bữa ăn thỏa thích món cậu thích!", color: "#6C5CE7" },
    { name: "Quà Bí Mật 🎁", message: "Một hộp quà bất ngờ giao tận tay!", color: "#FFAAA6" }
  ];

  const wheelData = ACTIVE_CONFIG.luckyWheel || {};
  const prizes = (wheelData.prizes && wheelData.prizes.length > 0)
    ? wheelData.prizes
    : ((wheelData.gifts && wheelData.gifts.length > 0) ? wheelData.gifts : defaultPrizes);

  const arc = (Math.PI * 2) / (prizes.length || 1);

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(currentAngle);

  prizes.forEach((p, idx) => {
    const angle = idx * arc;
    ctx.beginPath();
    ctx.fillStyle = p.color || (idx % 2 === 0 ? "#FF6B6B" : "#4ECDC4");
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angle, angle + arc);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.stroke();

    // Border line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Text label
    ctx.save();
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13.5px 'Plus Jakarta Sans', sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(p.name || `Quà ${idx + 1}`, radius - 18, 5);
    ctx.restore();
  });

  // Center golden knob
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd98e";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#c9a24b";
  ctx.stroke();

  ctx.restore();
}

function spinLuckyWheel() {
  if (IS_WHEEL_SPINNING) return;
  IS_WHEEL_SPINNING = true;

  const defaultPrizes = [
    { name: "1 Chầu Trà Sữa 🧋", message: "Được khao 1 ly trà sữa full topping bất kỳ lúc nào!" },
    { name: "1 Vé Xem Phim 🍿", message: "Một buổi đi xem phim rạp với combo bắp nước siêu to!" },
    { name: "1 Điều Ước Bất Kỳ 🌟", message: "Người tạo thiệp sẽ thực hiện 1 điều ước trong khả năng!" },
    { name: "Một Ôm Ấm Áp 🤗", message: "Một cái ôm chân thành tiếp thêm năng lượng tích cực!" },
    { name: "Bữa Tối Thịnh Soạn 🍕", message: "Một bữa ăn thỏa thích với món mà cậu thích nhất!" },
    { name: "Quà Bí Mật 🎁", message: "Một hộp quà bất ngờ được giao tận tay cậu sớm thôi!" }
  ];

  const wheelData = ACTIVE_CONFIG.luckyWheel || {};
  const prizes = (wheelData.prizes && wheelData.prizes.length > 0)
    ? wheelData.prizes
    : ((wheelData.gifts && wheelData.gifts.length > 0) ? wheelData.gifts : defaultPrizes);

  const prizeCount = prizes.length || 1;
  const arc = (Math.PI * 2) / prizeCount;

  // Chọn giải thưởng ngẫu nhiên
  const winningIndex = Math.floor(Math.random() * prizeCount);
  const winningPrize = prizes[winningIndex];

  // Kim chỉ ở đỉnh (-PI/2). Tính góc xoay cần đạt để ô trúng nằm ở đỉnh
  const extraRotations = 5 + Math.floor(Math.random() * 3);
  const targetWedgeAngle = (3 * Math.PI / 2) - (winningIndex * arc + arc / 2);
  const totalTargetAngle = WHEEL_ROTATION + (extraRotations * Math.PI * 2) + ((targetWedgeAngle - (WHEEL_ROTATION % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));

  const startAngle = WHEEL_ROTATION;
  const distance = totalTargetAngle - startAngle;
  const duration = 4500;
  const startTime = performance.now();

  let lastTickAngle = startAngle;

  const animateSpin = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Cubic ease out
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentAngle = startAngle + distance * ease;

    drawLuckyWheel(currentAngle);

    // Tiếng tick khi đi qua mỗi ô
    if (Math.abs(currentAngle - lastTickAngle) >= arc) {
      if (window.BirthdayAudio) window.BirthdayAudio.playWheelTick();
      lastTickAngle = currentAngle;
    }

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      WHEEL_ROTATION = currentAngle % (Math.PI * 2);
      IS_WHEEL_SPINNING = false;
      showPrizeCelebration(winningPrize);
    }
  };

  requestAnimationFrame(animateSpin);
}

function showPrizeCelebration(prize) {
  if (window.BirthdayAudio) window.BirthdayAudio.playWinPrize();
  triggerConfettiBurst();

  const overlay = document.getElementById("prize-popup-overlay");
  const nameDisplay = document.getElementById("prize-name-display");
  const msgDisplay = document.getElementById("prize-message-display");

  if (nameDisplay) nameDisplay.textContent = prize.name;
  if (msgDisplay) msgDisplay.textContent = prize.message || "Món quà tuyệt vời dành riêng cho cậu hôm nay!";
  if (overlay) overlay.style.display = "flex";
}

/**
 * =========================================================
 * HIỆU ỨNG PHÁO HOA & CONFETTI
 * =========================================================
 */

function triggerConfettiBurst() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function triggerGrandCelebration() {
  if (window.BirthdayAudio) window.BirthdayAudio.playWinPrize();
  if (typeof confetti === "function") {
    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }
}

/**
 * =========================================================
 * GIAI ĐOẠN 0: KHÓA HẸN GIỜ (COUNTDOWN LOCK STAGE 0)
 * =========================================================
 */

/**
 * Kiểm tra trạng thái khóa thiệp theo thời gian hoặc chế độ Preview
 */
function checkCardLockStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";

  // 1. Chế độ Preview Demo Giai đoạn 0 (qua query ?countdown=preview hoặc ?lock=1 hoặc #countdown=preview)
  const isPreview = urlParams.get("countdown") === "preview" ||
                    urlParams.get("lock") === "1" ||
                    hash.includes("countdown=preview");

  if (isPreview) {
    // Tạo mốc thời gian demo: 2 ngày 5 giờ 30 phút từ hiện tại để hiển thị đếm ngược sống động
    const demoUnlock = new Date(Date.now() + (2 * 86400000) + (5 * 3600000) + (30 * 60000));
    return {
      isLocked: true,
      isPreview: true,
      isExpired: false,
      unlockDate: demoUnlock,
      unlockTimeStr: demoUnlock.toISOString(),
      endDate: null
    };
  }

  // 2. Lấy cấu hình từ ACTIVE_CONFIG
  const unlockTimeStr = ACTIVE_CONFIG.unlockDateTime || ACTIVE_CONFIG.startDate || "";
  const endTimeStr = ACTIVE_CONFIG.endDate || "";

  let unlockDate = null;
  if (unlockTimeStr) {
    const parsed = new Date(unlockTimeStr);
    if (!isNaN(parsed.getTime())) {
      unlockDate = parsed;
    }
  }

  let endDate = null;
  if (endTimeStr) {
    const parsedEnd = new Date(endTimeStr);
    if (!isNaN(parsedEnd.getTime())) {
      endDate = parsedEnd;
    }
  }

  const now = Date.now();

  // Kiểm tra quá hạn
  if (endDate && now > endDate.getTime()) {
    return {
      isLocked: true,
      isPreview: false,
      isExpired: true,
      unlockDate: unlockDate || endDate,
      unlockTimeStr,
      endDate
    };
  }

  // Kiểm tra còn trước giờ mở
  if (unlockDate && now < unlockDate.getTime()) {
    return {
      isLocked: true,
      isPreview: false,
      isExpired: false,
      unlockDate,
      unlockTimeStr,
      endDate
    };
  }

  return {
    isLocked: false,
    isPreview: false,
    isExpired: false,
    unlockDate: null,
    unlockTimeStr: "",
    endDate: null
  };
}

/**
 * Khởi tạo Giai đoạn 0: Countdown Lock Screen
 */
function initStageCountdown(lockInfo) {
  IS_CARD_LOCKED = true;
  switchStage("countdown");

  const overlay = document.getElementById("stage-countdown");
  const titleEl = document.getElementById("countdown-title");
  const msgEl = document.getElementById("countdown-msg");
  const targetTimeEl = document.getElementById("countdown-target-time");
  const subTextEl = document.getElementById("countdown-sub-text");
  const expiredBox = document.getElementById("countdown-expired-box");
  const timerBlocks = document.getElementById("countdown-timer-blocks");
  const targetDisplay = document.getElementById("countdown-target-display");
  const calendarBtn = document.getElementById("btn-add-calendar");
  const bypassBtn = document.getElementById("btn-bypass-cd");

  const receiver = ACTIVE_CONFIG.recipientName || "Hương Giang";
  const sender = ACTIVE_CONFIG.senderName || "Tớ";

  const highlightEl = document.getElementById("countdown-recipient-highlight");
  if (highlightEl) {
    highlightEl.textContent = receiver;
  }

  if (titleEl) {
    titleEl.textContent = `Món Quà Bí Mật Đang Chuẩn Bị`;
  }

  if (subTextEl) {
    subTextEl.textContent = `Nhắn gửi từ ${sender}: "Hãy kiên nhẫn chờ đợi đến đúng khoảnh khắc nhé! 💖"`;
  }

  // Xử lý nếu đã hết hạn
  if (lockInfo.isExpired) {
    if (expiredBox) expiredBox.style.display = "block";
    if (timerBlocks) timerBlocks.style.display = "none";
    if (targetDisplay) targetDisplay.style.display = "none";
    if (msgEl) msgEl.textContent = "Thời gian tổ chức sự kiện thiệp trực tiếp đã hoàn tất.";
    if (bypassBtn) bypassBtn.textContent = "📖 Xem lại kỷ niệm sinh nhật";
    if (calendarBtn) calendarBtn.style.display = "none";

    if (bypassBtn) {
      bypassBtn.onclick = () => unlockAndStartCard();
    }
    return;
  }

  // Định dạng hiển thị ngày giờ mục tiêu bằng tiếng Việt
  const unlockDate = lockInfo.unlockDate;
  if (unlockDate && targetTimeEl) {
    try {
      const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = daysOfWeek[unlockDate.getDay()];
      const hours = String(unlockDate.getHours()).padStart(2, "0");
      const minutes = String(unlockDate.getMinutes()).padStart(2, "0");
      const day = String(unlockDate.getDate()).padStart(2, "0");
      const month = String(unlockDate.getMonth() + 1).padStart(2, "0");
      const year = unlockDate.getFullYear();

      targetTimeEl.textContent = `${hours}:${minutes} • ${dayName}, ${day}/${month}/${year}`;
    } catch (e) {
      targetTimeEl.textContent = unlockDate.toLocaleString("vi-VN");
    }
  }

  // Cấu hình nút Google Calendar Reminder
  if (calendarBtn && unlockDate) {
    calendarBtn.style.display = "inline-flex";
    const startIso = unlockDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = new Date(unlockDate.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const calTitle = encodeURIComponent(`🎂 Mở Thiệp Sinh Nhật Của ${receiver}!`);
    const calDetails = encodeURIComponent(`Đã đến giờ mở hộp quà & thiệp sinh nhật bí mật được gửi từ ${sender}! Mở link: ${window.location.href}`);
    calendarBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${startIso}/${endIso}&details=${calDetails}`;
  }

  // Cập nhật bộ đếm thời gian thực (Real-time countdown)
  const updateTimer = () => {
    const current = Date.now();
    const diff = unlockDate.getTime() - current;

    if (diff <= 0) {
      if (COUNTDOWN_INTERVAL) clearInterval(COUNTDOWN_INTERVAL);
      unlockAndStartCard();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-minutes");
    const sEl = document.getElementById("cd-seconds");

    if (dEl) dEl.textContent = String(days).padStart(2, "0");
    if (hEl) hEl.textContent = String(hours).padStart(2, "0");
    if (mEl) mEl.textContent = String(minutes).padStart(2, "0");
    if (sEl) sEl.textContent = String(seconds).padStart(2, "0");
  };

  updateTimer();
  if (COUNTDOWN_INTERVAL) clearInterval(COUNTDOWN_INTERVAL);
  COUNTDOWN_INTERVAL = setInterval(updateTimer, 1000);

  // Nút mở thử nghiệm / Bypass dành cho người tạo
  if (bypassBtn) {
    bypassBtn.onclick = () => {
      unlockAndStartCard();
    };
  }
}

/**
 * Hiệu ứng mở khóa thiệp kỳ diệu từ Giai đoạn 0 sang Giai đoạn 1
 */
function unlockAndStartCard() {
  if (COUNTDOWN_INTERVAL) {
    clearInterval(COUNTDOWN_INTERVAL);
    COUNTDOWN_INTERVAL = null;
  }

  // Âm thanh phép thuật khi mở khóa
  if (window.BirthdayAudio) {
    window.BirthdayAudio.playMagicWand();
  }

  // Pháo hoa ăn mừng khoảnh khắc mở khóa
  triggerConfettiBurst();

  const overlay = document.getElementById("stage-countdown");
  if (overlay) {
    overlay.classList.add("stage-unlocking");
  }

  setTimeout(() => {
    if (overlay) {
      overlay.style.display = "none";
      overlay.classList.remove("stage-unlocking");
    }

    // Chính thức bắt đầu toàn bộ hành trình trải nghiệm từ Giai đoạn 1
    startCelebrationJourney();
  }, 1200);
}

/**
 * Bắt đầu hành trình kỷ niệm (Giai đoạn 1 -> Giai đoạn 7)
 */
function startCelebrationJourney() {
  if (IS_JOURNEY_STARTED) return;
  IS_JOURNEY_STARTED = true;
  IS_CARD_LOCKED = false;

  // 1. Khởi tạo âm thanh & nhạc nền
  initAudioSystem();

  // 2. Khởi tạo hiệu ứng cánh hoa bay tự nhiên
  initFallingPetals();

  // 3. Khởi tạo các giai đoạn trải nghiệm (Stages)
  initStageOpening();
  initStageIntro();
  initStageWish();
  initStageHeart();
  initStageLetter();
  initStageFinal();
  initStageStarlight();

  // 5. Chuyển sang Giai đoạn 1: Date Reel Opening
  switchStage("opening");
}

function initUtilities() {
  // Any extra initialization hooks
}
