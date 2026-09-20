import codecs
import re

print('Updating lovegift.css...')
# 1. Update css/lovegift.css
with codecs.open('css/lovegift.css', 'r', 'utf-8', errors='ignore') as f:
    css = f.read()

glow_css = '''
.birthday-glow {
  text-shadow: 0 0 20px #ffd700, 0 0 40px #ffb300, 0 0 80px #ffffff;
  transform: scale(1.25);
  color: #fff;
  transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}
'''
if '.birthday-glow {' not in css:
    css += glow_css

old_starlight = 'radial-gradient(ellipse at center, #020111 0%, #000000 100%) !important;'
new_starlight = 'radial-gradient(ellipse at bottom, #2a1a1f 0%, #11080b 100%) !important;'
css = css.replace(old_starlight, new_starlight)

photobooth_css = '''
.photobooth-frame {
  background: repeating-linear-gradient(45deg, #ffe6ea, #ffe6ea 10px, #ffccd5 10px, #ffccd5 20px);
  padding: 15px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.photobooth-frame > video, .photobooth-frame > canvas {
  border-radius: 8px;
  border: 4px solid #fff;
}
.coquette-bow {
  position: absolute;
  font-size: 1.8rem;
  z-index: 20;
}
.coquette-bow.tl { top: -12px; left: -12px; transform: rotate(-15deg); }
.coquette-bow.tr { top: -12px; right: -12px; transform: rotate(15deg); }
.coquette-bow.bl { bottom: -12px; left: -12px; transform: rotate(-15deg); }
.coquette-bow.br { bottom: -12px; right: -12px; transform: rotate(15deg); }
'''
if '.photobooth-frame {' not in css:
    css += photobooth_css

with codecs.open('css/lovegift.css', 'w', 'utf-8') as f:
    f.write(css)

print('Updating main.js...')
# 2. Update js/main.js
with codecs.open('js/main.js', 'r', 'utf-8') as f:
    js = f.read()

js = js.replace('if (reelScroller) reelScroller.classList.remove("rolling");', 'if (reelScroller) { reelScroller.classList.remove("rolling"); reelScroller.classList.add("birthday-glow"); }')

stars_pattern = re.compile(r'function createShootingStars\(\).*?\}\n(?=function|const|let|//|/\*)', re.DOTALL)
new_stars = '''function createShootingStars() {
    const starBg = document.getElementById('meteor-sky-container');
    if (!starBg) return;
    starBg.innerHTML = ''; 
    
    for(let i = 0; i < 80; i++) {
        let staticStar = document.createElement('div');
        staticStar.className = 'static-star';
        staticStar.style.left = Math.random() * 100 + 'vw';
        staticStar.style.top = Math.random() * 100 + 'vh';
        let size = Math.random() * 3 + 1; 
        staticStar.style.width = size + 'px';
        staticStar.style.height = size + 'px';
        staticStar.style.animationDelay = (Math.random() * 5) + 's';
        staticStar.style.boxShadow = '0 0 8px #ffdfba';
        starBg.appendChild(staticStar);
    }

    for(let j = 0; j < 15; j++) {
        let meteor = document.createElement('div');
        meteor.className = 'shooting-star-3d';
        meteor.style.left = (Math.random() * 150) + 'vw'; 
        meteor.style.top = (Math.random() * 50 - 20) + 'vh';
        meteor.style.animationDuration = (0.5 + Math.random() * 1) + 's';
        meteor.style.animationDelay = (Math.random() * 1.5) + 's';
        starBg.appendChild(meteor);

        setTimeout(() => {
            if(meteor.parentNode) meteor.parentNode.removeChild(meteor);
        }, 3000);
    }
}
'''
if 'function createShootingStars()' in js:
    parts = js.split('function createShootingStars() {')
    if len(parts) == 2:
        part2 = parts[1]
        next_funcs = ['function playEmotionalBeats()', 'function ', '/**']
        for nf in next_funcs:
            if nf in part2:
                func_end = part2.find(nf)
                break
        
        js = parts[0] + new_stars + part2[func_end:]

filter_js = '''
document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".camera-filters button");
  const videoEl = document.getElementById("selfie-video");
  if (filterBtns && videoEl) {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const filterType = btn.getAttribute("data-filter");
        if (filterType === "none") {
          videoEl.style.filter = "none";
        } else if (filterType === "peach") {
          videoEl.style.filter = "sepia(0.3) saturate(1.4) hue-rotate(-10deg) contrast(1.1)";
        } else if (filterType === "coquette") {
          videoEl.style.filter = "brightness(1.1) saturate(1.5) contrast(1.05) drop-shadow(0 0 5px rgba(255,192,203,0.5))";
        } else if (filterType === "vintage") {
          videoEl.style.filter = "grayscale(0.5) sepia(0.5) contrast(1.2)";
        }
      });
    });
  }
});
'''
if 'data-filter' not in js:
    js += filter_js

with codecs.open('js/main.js', 'w', 'utf-8') as f:
    f.write(js)

print('Updating gift.html...')
# 3. Update gift.html
with codecs.open('gift.html', 'r', 'utf-8') as f:
    html = f.read()

new_camera_html = '''<div class="photobooth-frame">
        <span class="coquette-bow tl">🎀</span>
        <span class="coquette-bow tr">🎀</span>
        <span class="coquette-bow bl">🎀</span>
        <span class="coquette-bow br">🎀</span>
        <video id="selfie-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
        <canvas id="selfie-canvas" style="display: none; width: 100%; height: 100%; object-fit: cover;"></canvas>
'''

if '<div class="photobooth-frame">' not in html:
    camera_wrapper_regex = r'<div class="camera-wrapper">.*?<canvas id="selfie-canvas".*?<\/canvas>\s*<div class="camera-decor-overlay">.*?<\/div>'
    html = re.sub(camera_wrapper_regex, new_camera_html, html, flags=re.DOTALL)

filters_html = '''
      <!-- Input file -->
      <input type="file" id="selfie-file-input" accept="image/*" capture="user" style="display: none;">

      <div class="camera-filters" style="margin-top: 15px; display: flex; gap: 8px; justify-content: center; overflow-x: auto; padding-bottom: 5px;">
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="none">Gốc</button>
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="peach">Đào ngâm</button>
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="coquette">Kẹo ngọt</button>
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="vintage">Cổ điển</button>
      </div>
'''
if 'class="camera-filters"' not in html:
    html = html.replace('<input type="file" id="selfie-file-input" accept="image/*" capture="user" style="display: none;">', filters_html)

with codecs.open('gift.html', 'w', 'utf-8') as f:
    f.write(html)
print('Done!')
