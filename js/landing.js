/**
 * Universal Birthday Studio - Showcase Interactive Engine
 * Author: Vu The Dan (DAN168)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Particle Canvas Simulation
  initParticles();

  // 2. 5 Vibes Interactive Switcher
  initVibeSwitcher();

  // 3. Launch Studio Modal Controller
  initModal();
});

/* ===================================================================
   Particle Background
   =================================================================== */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 18), 70);
  const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b'];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * 0.02 + 0.01
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      p.alpha += Math.sin(Date.now() * 0.002) * 0.005;
      const displayAlpha = Math.max(0.1, Math.min(0.7, p.alpha));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = displayAlpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ===================================================================
   5 Vibes Data & Switcher
   =================================================================== */
const VIBES_DATA = {
  romantic: {
    title: 'Lãng Mạn & Ngọt Ngào',
    badge: 'Dành cho Người Yêu / Crush',
    badgeBg: 'rgba(236, 72, 153, 0.2)',
    badgeColor: '#f472b6',
    desc: 'Không gian ngập tràn hoa hồng, hiệu ứng cánh hoa bay dịu dàng, giai điệu ballad du dương và những mật thư lời chúc thổ lộ tình cảm chân thành.',
    perks: [
      { icon: '🌹', text: 'Hiệu ứng cánh hoa hồng & trái tim 3D bay bổng' },
      { icon: '💌', text: 'Thư tình bí mật kèm đếm ngược kỷ niệm yêu' },
      { icon: '🎵', text: 'Tích hợp giai điệu lãng mạn (Nơi Này Có Anh, Yung Kai...)' },
      { icon: '✨', text: 'Ánh nến lung linh & pháo hoa trái tim bùng nổ' }
    ],
    mockupIcon: '💖',
    mockupTitle: 'Happy Birthday My Love',
    mockupSub: '“Cảm ơn vì đã đến và làm dịu êm thế giới của anh...”',
    mockupBg: 'linear-gradient(135deg, #4c0519 0%, #1e1b4b 100%)'
  },
  friend: {
    title: 'Bạn Thân Lầy Lội & Bất Ngờ',
    badge: 'Dành cho Bạn Thân / Tri Kỷ / Gen Z',
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    badgeColor: '#a78bfa',
    desc: 'Phong cách độc lạ cực hài hước, hiệu ứng câu đố troll bất ngờ, dán sticker meme hài hước cùng giai điệu remix sôi động chúc mừng thêm 1 tuổi già.',
    perks: [
      { icon: '⚡', text: 'Giao diện Cyber Neon phá cách & năng động' },
      { icon: '🤣', text: 'Bộ câu đố giải mã hài hước thử thách bạn thân' },
      { icon: '📸', text: 'Photobooth dán sticker meme troll kỷ niệm' },
      { icon: '🔥', text: 'Bùng nổ nhạc sinh nhật Remix giật cực sung' }
    ],
    mockupIcon: '⚡',
    mockupTitle: 'Mừng Bạn Tôi Thêm 1 Nồi Bánh Chưng',
    mockupSub: '“Bớt cà khịa lại và mau giàu để bao tôi đi ăn nhé!”',
    mockupBg: 'linear-gradient(135deg, #1e1b4b 0%, #064e3b 100%)'
  },
  family: {
    title: 'Gia Đình Ấm Áp & Tri Ân',
    badge: 'Dành cho Bố Mẹ / Con Cái / Người Thân',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeColor: '#fbbf24',
    desc: 'Tông màu vàng cam mật ong đầm ấm, không gian hoài niệm lắng đọng với album ảnh gia đình qua từng năm tháng và những lời chúc sức khỏe, trường thọ.',
    perks: [
      { icon: '🌿', text: 'Tông màu nắng ấm dịu mắt, trang nhã và tôn kính' },
      { icon: '👨‍👩‍👧', text: 'Album kỷ niệm hành trình trưởng thành bên gia đình' },
      { icon: '📜', text: 'Lời chúc hiếu nghĩa chạm đến trái tim người thân' },
      { icon: '🕯️', text: 'Thắp nến cầu chúc sức khỏe, an khang & hạnh phúc' }
    ],
    mockupIcon: '🏡',
    mockupTitle: 'Chúc Mừng Sinh Nhật Bố/Mẹ Yêu',
    mockupSub: '“Cảm ơn công ơn sinh thành và tình yêu thương vô bờ bến...”',
    mockupBg: 'linear-gradient(135deg, #451a03 0%, #1c1917 100%)'
  },
  luxury: {
    title: 'Sang Trọng & Đẳng Cấp Hoàng Gia',
    badge: 'Dành cho Sếp / Đồng Nghiệp / Đối Tác',
    badgeBg: 'rgba(217, 119, 6, 0.25)',
    badgeColor: '#fcd34d',
    desc: 'Tông nền đen tuyền huyền bí kết hợp ánh kim nhũ vàng (Black & Gold). Thiết kế tinh gọn, sang trọng và chuẩn mực cho các mối quan hệ cao cấp.',
    perks: [
      { icon: '👑', text: 'Giao diện Black & Gold đẳng cấp quý phái' },
      { icon: '🥂', text: 'Lời chúc lịch thiệp, thành công & vạn sự như ý' },
      { icon: '🎼', text: 'Nhạc giao hưởng / Acoustic êm ái sang trọng' },
      { icon: '💎', text: 'Hiệu ứng ánh sáng tinh thể kim cương lấp lánh' }
    ],
    mockupIcon: '👑',
    mockupTitle: 'Wishing You A Spectacular Year',
    mockupSub: '“Chúc Anh/Chị thêm tuổi mới thành công rực rỡ & vạn sự hanh thông!”',
    mockupBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)'
  },
  cute: {
    title: 'Kẹo Ngọt Đáng Yêu & Tuổi Mới',
    badge: 'Dành cho Bé Yêu / Bạn Gái / Tuổi Trẻ',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    badgeColor: '#60a5fa',
    desc: 'Bữa tiệc sắc màu kẹo ngọt pastel, bóng bay ngũ sắc, bánh kem 3 tầng vui nhộn cùng giai điệu tươi sáng mang lại nụ cười rạng rỡ tức thì.',
    perks: [
      { icon: '🎈', text: 'Bóng bay pastel & pháo giấy ngũ sắc rực rỡ' },
      { icon: '🎂', text: 'Bánh kem hoạt hình 3 tầng siêu đáng yêu' },
      { icon: '🌈', text: 'Giao diện ngọt ngào, năng động và trong trẻo' },
      { icon: '🧸', text: 'Hiệu ứng chúc mừng rộn ràng mang lại niềm vui trọn vẹn' }
    ],
    mockupIcon: '🧁',
    mockupTitle: 'Happy Sweet Birthday!',
    mockupSub: '“Chúc em luôn vui tươi, xinh xắn và tràn đầy năng lượng tích cực!”',
    mockupBg: 'linear-gradient(135deg, #0c4a6e 0%, #172554 100%)'
  }
};

function initVibeSwitcher() {
  const tabBtns = document.querySelectorAll('.vibe-tab-btn');
  const titleEl = document.getElementById('vibe-title');
  const badgeEl = document.getElementById('vibe-badge');
  const descEl = document.getElementById('vibe-desc');
  const perksEl = document.getElementById('vibe-perks');
  const mockupEl = document.getElementById('vibe-mockup');
  const mockupIconEl = document.getElementById('vibe-mockup-icon');
  const mockupTitleEl = document.getElementById('vibe-mockup-title');
  const mockupSubEl = document.getElementById('vibe-mockup-sub');

  if (!tabBtns.length || !titleEl) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const vibeKey = btn.dataset.vibe;
      const data = VIBES_DATA[vibeKey];
      if (!data) return;

      // Update contents
      titleEl.textContent = data.title;
      badgeEl.textContent = data.badge;
      badgeEl.style.backgroundColor = data.badgeBg;
      badgeEl.style.color = data.badgeColor;
      descEl.textContent = data.desc;

      // Update perks
      perksEl.innerHTML = data.perks
        .map(
          (p) =>
            `<li><span class="icon">${p.icon}</span><span>${p.text}</span></li>`
        )
        .join('');

      // Update Mockup
      mockupIconEl.textContent = data.mockupIcon;
      mockupTitleEl.textContent = data.mockupTitle;
      mockupSubEl.textContent = data.mockupSub;
      mockupEl.style.background = data.mockupBg;

      // Update CTA button to go to studio with this vibe
      const vibeMap = {
        romantic: 'party',
        friend: 'bff',
        family: 'family',
        luxury: 'elegant',
        cute: 'sweet'
      };
      const targetStudioVibe = vibeMap[vibeKey] || 'party';
      const applyBtn = document.getElementById('btn-apply-vibe');
      if (applyBtn) {
        applyBtn.href = `studio.html?vibe=${targetStudioVibe}`;
      }
    });
  });
}

/* ===================================================================
   Studio Controller
   =================================================================== */
function initModal() {
  // Direct navigation is handled via native anchor tags pointing to studio.html
}
