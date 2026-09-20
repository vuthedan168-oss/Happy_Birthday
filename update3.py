import codecs

print('Updating lovegift.css...')
with codecs.open('css/lovegift.css', 'r', 'utf-8', errors='ignore') as f:
    css = f.read()

old_frame = '''
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
'''
new_frame = '''
.photobooth-frame {
  background: repeating-linear-gradient(45deg, #ffe6ea, #ffe6ea 10px, #ffccd5 10px, #ffccd5 20px);
  padding: 15px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  aspect-ratio: 3 / 4;
  width: min(340px, 85vw);
  display: flex;
  justify-content: center;
  align-items: center;
}
.photobooth-frame > video, .photobooth-frame > canvas {
  border-radius: 8px;
  border: 4px solid #fff;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  box-sizing: border-box;
}
'''

if 'aspect-ratio: 3 / 4;' not in css:
    css = css.replace(old_frame.strip(), new_frame.strip())
    with codecs.open('css/lovegift.css', 'w', 'utf-8') as f:
        f.write(css)

print('Updating main.js...')
with codecs.open('js/main.js', 'r', 'utf-8') as f:
    js = f.read()

old_timer = '''  if (OPENING_TIMER) clearTimeout(OPENING_TIMER);
  OPENING_TIMER = setTimeout(() => {
    switchStage("intro");
  }, 7000);'''
new_timer = '''  if (OPENING_TIMER) clearTimeout(OPENING_TIMER);
  OPENING_TIMER = setTimeout(() => {
    switchStage("intro");
  }, 9000); // 5s cuộn/dừng + 4s đọc lời chúc'''

if '9000' not in js:
    js = js.replace(old_timer, new_timer)
    with codecs.open('js/main.js', 'w', 'utf-8') as f:
        f.write(js)

print('Done!')
