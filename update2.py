import codecs
import re

print('Updating lovegift.css...')
with codecs.open('css/lovegift.css', 'r', 'utf-8', errors='ignore') as f:
    css = f.read()

# 1. Photobooth Layout
# Let's find modal-photobooth and its modal-card
# We can just add CSS to enforce the new layout
photobooth_layout = '''
#modal-photobooth .modal-card {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 20px !important;
  overflow-x: hidden !important;
}
.photobooth-frame {
  max-width: 100%;
}
.camera-filters {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 10px !important;
  width: 100%;
  margin-top: 5px !important;
}
.camera-filters button {
  border-radius: 20px !important;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
  padding: 6px 16px !important;
}
#selfie-initial-actions button, #selfie-review-actions button {
  border-radius: 20px !important;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
}
'''
if '#modal-photobooth .modal-card {' not in css:
    css += photobooth_layout

# 2. Slot Machine CSS
slot_css = '''
@keyframes rollingInfinite {
  0% { transform: translateY(var(--reel-from)); filter: blur(5px); }
  100% { transform: translateY(calc(var(--reel-from) - 760px)); filter: blur(5px); }
}
.rolling-fast {
  animation: rollingInfinite 0.4s linear infinite !important;
}
@keyframes lovegiftReelStop {
  0% { transform: translateY(calc(var(--reel-from) - 760px)); filter: blur(5px); }
  100% { transform: translateY(var(--reel-to)); filter: blur(0); }
}
.stopping-fast {
  animation: 1.5s cubic-bezier(0.1, 0.7, 0.1, 1) forwards lovegiftReelStop !important;
}
'''
if '.rolling-fast {' not in css:
    css += slot_css

with codecs.open('css/lovegift.css', 'w', 'utf-8') as f:
    f.write(css)

print('Updating main.js...')
with codecs.open('js/main.js', 'r', 'utf-8') as f:
    js = f.read()

# Fix slot machine in initStageOpening
old_slot_js = '''    // Khôi phục logic .rolling
    reelScroller.classList.add("rolling");
    setTimeout(() => {
      if (reelScroller) { reelScroller.classList.remove("rolling"); reelScroller.classList.add("birthday-glow"); }
    }, 3500);
  }

  // Tự động chuyển sang stage 2 sau khi hiệu ứng mở đầu hoàn tất (tăng lên 6.7s để số quay đủ lâu)
  if (OPENING_TIMER) clearTimeout(OPENING_TIMER);
  OPENING_TIMER = setTimeout(() => {
    switchStage("intro");
  }, 6700);'''

new_slot_js = '''    // Chạy animation cuộn nhanh liên tục
    reelScroller.classList.add("rolling-fast");
    setTimeout(() => {
      if (reelScroller) { 
        reelScroller.classList.remove("rolling-fast");
        reelScroller.classList.add("stopping-fast"); // Hãm phanh từ từ
        
        // Chờ 1.5s hãm phanh xong thì phát sáng
        setTimeout(() => {
          if (selectedDayEl) selectedDayEl.classList.add("birthday-glow");
        }, 1500);
      }
    }, 3500);
  }

  if (OPENING_TIMER) clearTimeout(OPENING_TIMER);
  OPENING_TIMER = setTimeout(() => {
    switchStage("intro");
  }, 7000);'''

if 'reelScroller.classList.add("rolling");' in js:
    js = js.replace(old_slot_js, new_slot_js)

# Add beauty filter to JS
old_filter_js = '''} else if (filterType === "peach") {'''
new_filter_js = '''} else if (filterType === "beauty") {
          videoEl.style.filter = "brightness(1.15) contrast(1.05) saturate(1.2) blur(0.5px)";
        } else if (filterType === "peach") {'''
if 'filterType === "beauty"' not in js:
    js = js.replace(old_filter_js, new_filter_js)

with codecs.open('js/main.js', 'w', 'utf-8') as f:
    f.write(js)

print('Updating gift.html...')
with codecs.open('gift.html', 'r', 'utf-8') as f:
    html = f.read()

# Add beauty button
old_buttons = '''<button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="none">Gốc</button>
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="peach">Đào ngâm</button>'''
new_buttons = '''<button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="none">Gốc</button>
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="beauty">Mịn da</button>
        <button type="button" class="lovegift-btn-gold" style="font-size: 0.8rem; padding: 5px 10px; min-width: auto;" data-filter="peach">Đào ngâm</button>'''
if 'data-filter="beauty"' not in html:
    html = html.replace(old_buttons, new_buttons)

with codecs.open('gift.html', 'w', 'utf-8') as f:
    f.write(html)

print('Done!')
