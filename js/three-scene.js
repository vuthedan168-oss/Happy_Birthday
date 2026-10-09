// Khởi tạo môi trường 3D cơ bản
let scene, camera, renderer, particles;
let carouselGroup;
const carouselRadius = 15;

function initThreeScene(galleryData) {
  const canvas = document.getElementById("webgl-canvas");
  if (!canvas) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Ánh sáng
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
  pointLight.position.set(0, 10, 20);
  scene.add(pointLight);

  // Tạo hiệu ứng hạt (Starfield / Confetti)
  createParticles();

  // Tạo 3D Image Carousel từ galleryData
  if (galleryData && galleryData.length > 0) {
    createCarousel(galleryData);
  }

  
let cakeGroup;
let candleLights = [];
let candleFlames = [];

function createCake() {
  cakeGroup = new THREE.Group();
  scene.add(cakeGroup);

  // Base layer (pink)
  const baseGeo = new THREE.CylinderGeometry(8, 8, 4, 32);
  const baseMat = new THREE.MeshPhongMaterial({ color: 0xffb6c1 });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -2;
  cakeGroup.add(baseMesh);

  // Top layer (cream)
  const topGeo = new THREE.CylinderGeometry(6, 6, 3, 32);
  const topMat = new THREE.MeshPhongMaterial({ color: 0xfffdd0 });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = 1.5;
  cakeGroup.add(topMesh);

  // Candles
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 / 3) * i;
    const r = 3;
    const cx = Math.sin(angle) * r;
    const cz = Math.cos(angle) * r;

    // Candle body
    const candleGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const candleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(cx, 4, cz);
    cakeGroup.add(candle);

    // Flame (Cone)
    const flameGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(cx, 5.3, cz);
    cakeGroup.add(flame);
    candleFlames.push(flame);

    // PointLight for the flame
    const light = new THREE.PointLight(0xffcc00, 1, 15);
    light.position.set(cx, 5.3, cz);
    cakeGroup.add(light);
    candleLights.push(light);
  }

  cakeGroup.position.y = -5; // Move down a bit
  cakeGroup.visible = false;
}

function show3DCake(show) {
  if (cakeGroup) cakeGroup.visible = show;
  if (carouselGroup) carouselGroup.visible = !show;
}

function blowCandles3D(progress) {
  const intensity = Math.max(0, 1 - (progress / 100));
  candleLights.forEach(light => { light.intensity = intensity; });
  candleFlames.forEach(flame => { flame.scale.set(intensity, Math.max(0.01, intensity), intensity); });
}

window.show3DCake = show3DCake;
window.blowCandles3D = blowCandles3D;

  createCake();
  // Animation Loop
  animate();

  // Xử lý sự kiện tương tác
  setupInteraction();

  window.addEventListener('resize', onWindowResize, false);
}

function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const count = 1000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

    color.setHSL(Math.random() * 0.2 + 0.1, 1.0, 0.5); // Vàng, cam, đỏ ấm áp
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createCarousel(photos) {
  carouselGroup = new THREE.Group();
  scene.add(carouselGroup);

  const textureLoader = new THREE.TextureLoader();
  const angleStep = (Math.PI * 2) / photos.length;

  photos.forEach((photo, idx) => {
    const angle = idx * angleStep;
    
    // Geometry & Material
    const geometry = new THREE.PlaneGeometry(8, 10);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    
    // Load ảnh thật dán lên mặt trước
    textureLoader.load(photo.url, (texture) => {
      material.map = texture;
      material.needsUpdate = true;
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = Math.sin(angle) * carouselRadius;
    mesh.position.z = Math.cos(angle) * carouselRadius;
    
    mesh.rotation.y = angle;

    carouselGroup.add(mesh);
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (particles) {
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
  }

  // Auto rotate carousel slightly
  if (carouselGroup && carouselGroup.visible && !isDragging) {
    carouselGroup.rotation.y -= 0.002;
  }
  if (cakeGroup && cakeGroup.visible && !isDragging) {
    cakeGroup.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

// Xử lý kéo chuột để xoay Carousel
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function setupInteraction() {
  const canvas = renderer.domElement;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
      };

      if (carouselGroup && carouselGroup.visible) {
        carouselGroup.rotation.y += deltaMove.x * 0.01;
      } else if (cakeGroup && cakeGroup.visible) {
        cakeGroup.rotation.y += deltaMove.x * 0.01;
        cakeGroup.rotation.x += deltaMove.y * 0.01;
      }
    }
    previousMousePosition = { x: e.offsetX, y: e.offsetY };
  });

  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      if (carouselGroup && carouselGroup.visible) {
        carouselGroup.rotation.y += deltaMove.x * 0.01;
      } else if (cakeGroup && cakeGroup.visible) {
        cakeGroup.rotation.y += deltaMove.x * 0.01;
        cakeGroup.rotation.x += deltaMove.y * 0.01;
      }
    }
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  canvas.addEventListener('touchend', () => { isDragging = false; });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Hàm được gọi khi muốn hiển thị / giấu WebGL Canvas
function toggle3DScene(show) {
  const canvas = document.getElementById("webgl-canvas");
  if (canvas) {
    canvas.style.zIndex = show ? "0" : "-1";
    canvas.style.opacity = show ? "1" : "0";
    canvas.style.pointerEvents = show ? "auto" : "none";
  }
}
window.initThreeScene = initThreeScene;
window.toggle3DScene = toggle3DScene;
