/**
 * =========================================================
 * AUDIO.JS - HE THONG AM THANH & HIET UNG WEB AUDIO API
 * =========================================================
 * Am thanh chat luong cao: cong tac den, phep thuat, thoi nen, quiz, phao hoa & nhac nen
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.bgAudio = null;
    this.isPlaying = false;
    this.isSynthesizedPlaying = false;
    this.synthTimeout = null;
    this.windNode = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. TIENG BAT CONG TAC DEN CO HOC (LIGHT SWITCH CLICK)
  playLightSwitch() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Click 1 (Snap)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(2200, now);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.03);
      gain1.gain.setValueAtTime(0.8, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.03);

      // Click 2 (Spring bounce)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain2.gain.setValueAtTime(0.5, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio switch error:", e);
    }
  }

  // 2. DUA THAN PHOI PHEP THUAT (MAGIC WAND GLISSANDO)
  playMagicWand() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const harpNotes = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];

      harpNotes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch (e) {
      console.warn("Audio magic wand error:", e);
    }
  }

  // 3. AM THANH TRA LOI DUNG TRAC NGHIEM (QUIZ SUCCESS CHIME)
  playQuizCorrect() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch (e) {
      console.warn("Audio quiz chime error:", e);
    }
  }

  // 4. TIENG BONG BAY / NUT BAM POP
  playPop() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio pop error:", e);
    }
  }

  // 5. HIET UNG THOI TAT NEN (CANDLE BLOW & PUFF)
  playBlow() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(550, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);
    } catch (e) {
      console.warn("Audio blow error:", e);
    }
  }

  // 6. TIENG GIO THOI NEN KHI GIU MAN HINH (HOLD WIND GAUGE)
  startWindSound() {
    try {
      this.initContext();
      if (!this.ctx || this.windNode) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 1.8);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.windNode = { noise, gain };
    } catch (e) {
      console.warn("Wind sound error:", e);
    }
  }

  stopWindSound() {
    if (this.windNode) {
      try {
        this.windNode.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        this.windNode.noise.stop(this.ctx.currentTime + 0.1);
      } catch (e) {}
      this.windNode = null;
    }
  }

  // 7. VONG XOAY THOI KHONG MA THUAT (COSMIC VORTEX WHOOSH)
  playVortex() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(80, now + 2.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(2500, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.2);
    } catch (e) {
      console.warn("Vortex sound error:", e);
    }
  }

  // 8. ANH SAO LUNG LINH & DIEU UOC (SPARKLE CHIMES)
  playSparkle() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      const now = this.ctx.currentTime;

      freqs.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + index * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch (e) {
      console.warn("Audio sparkle error:", e);
    }
  }

  // 8.5. TIENG CHIME KHI CHON DIEU UOC (WISH CHIME)
  playChime() {
    this.playSparkle();
  }

  // 9. VONG QUAY TICK
  playWheelTick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 10. PHAN THUONG TRUNG THUONG (FANFARE)
  playFanfare() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.35, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + (idx === 3 ? 0.9 : 0.28));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + (idx === 3 ? 0.9 : 0.28));
      });
    } catch (e) {}
  }

  // 11. NHAC NEN (BACKGROUND MUSIC) & THEO PHAN DOAN (SCENE MUSIC)
  initBackgroundMusic(src) {
    this.sceneMusicMap = {};
    this.currentTrackSrc = src || "";
    if (src) {
      this.bgAudio = new Audio(src);
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.7;
    }
  }

  setSceneMusicConfig(sceneConfig) {
    if (!sceneConfig) return;
    this.sceneMusicMap = sceneConfig;
  }

  playSceneMusic(stageName) {
    if (!this.sceneMusicMap) return;
    const stageKeyMap = {
      "scene-dark-room": "intro",
      "scene-quiz": "intro",
      "scene-cake": "cake",
      "scene-wheel": "wheel",
      "scene-vortex-portal": "galaxy",
      "scene-galaxy": "galaxy"
    };

    const targetKey = stageKeyMap[stageName] || stageName;
    const track = this.sceneMusicMap[targetKey];
    if (!track || !track.src) return;

    // Neu dang phat dung bai nay thi tiep tuc
    if (this.currentTrackSrc === track.src && this.isPlaying && this.bgAudio && !this.bgAudio.paused) {
      this.updateTrackLabel(track.title);
      return;
    }

    this.currentTrackSrc = track.src;
    this.updateTrackLabel(track.title);

    // Chuyen nhac em diu
    this.switchAudioTrack(track.src);
  }

  switchAudioTrack(newSrc) {
    this.initContext();
    this.stopSynthMelody();

    if (!this.bgAudio) {
      this.bgAudio = new Audio();
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.7;
    }

    // Fade out nhanh roi doi src
    if (this.bgAudio && !this.bgAudio.paused) {
      try {
        this.bgAudio.pause();
      } catch (e) {}
    }

    this.bgAudio.src = newSrc;
    this.bgAudio.currentTime = 0;

    const playPromise = this.bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updateMusicUI(true);
        })
        .catch(() => {
          // Neu loi hoac bi chan, dung synth thay the
          this.playSynthMelody();
          this.isPlaying = true;
          this.updateMusicUI(true);
        });
    }
  }

  updateTrackLabel(title) {
    const label = document.getElementById("music-player-label");
    if (label && title) {
      label.textContent = title;
    }
  }

  playBgMusic() {
    this.initContext();
    if (this.bgAudio && this.currentTrackSrc) {
      const playPromise = this.bgAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.updateMusicUI(true);
          })
          .catch(() => {
            this.playSynthMelody();
            this.isPlaying = true;
            this.updateMusicUI(true);
          });
      }
    } else {
      this.playSynthMelody();
      this.isPlaying = true;
      this.updateMusicUI(true);
    }
  }

  pauseBgMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    this.stopSynthMelody();
    this.isPlaying = false;
    this.updateMusicUI(false);
  }

  toggleBgMusic() {
    if (this.isPlaying) {
      this.pauseBgMusic();
    } else {
      this.playBgMusic();
    }
  }

  updateMusicUI(playing) {
    const musicBtn = document.getElementById('music-toggle-btn');
    const vinyl = document.getElementById('vinyl-disc');
    const eqBars = document.querySelectorAll('.eq-bar');

    if (musicBtn) {
      musicBtn.classList.toggle('playing', playing);
      musicBtn.setAttribute('aria-label', playing ? 'Tat nhac' : 'Bat nhac');
    }
    if (vinyl) {
      if (playing) {
        vinyl.classList.add('spinning');
      } else {
        vinyl.classList.remove('spinning');
      }
    }
    eqBars.forEach((bar) => {
      bar.style.animationPlayState = playing ? 'running' : 'paused';
    });
  }

  playSynthMelody() {
    if (this.isSynthesizedPlaying) return;
    this.isSynthesizedPlaying = true;

    const melody = [
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 0.6 }, { f: 261.63, d: 0.6 }, { f: 349.23, d: 0.6 }, { f: 329.63, d: 1.1 },
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 0.6 }, { f: 261.63, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 349.23, d: 1.1 },
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 523.25, d: 0.6 }, { f: 440.00, d: 0.6 }, { f: 349.23, d: 0.6 }, { f: 329.63, d: 0.6 }, { f: 293.66, d: 0.8 },
      { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.25 }, { f: 440.00, d: 0.6 }, { f: 349.23, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 349.23, d: 1.2 }
    ];

    let noteIndex = 0;
    const playNextNote = () => {
      if (!this.isSynthesizedPlaying || !this.ctx) return;
      const note = melody[noteIndex];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + note.d);

      noteIndex = (noteIndex + 1) % melody.length;
      this.synthTimeout = setTimeout(playNextNote, note.d * 1000 + 40);
    };

    playNextNote();
  }

  playStarLaunch() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    } catch (e) {}
  }

  playMeteorDrop() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
      const f = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.6);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  stopSynthMelody() {
    this.isSynthesizedPlaying = false;
    if (this.synthTimeout) {
      clearTimeout(this.synthTimeout);
      this.synthTimeout = null;
    }
  }

  playWinPrize() {
    this.playFanfare();
  }

  fadeOutAudio(duration = 2000) {
    if (this.bgAudio && !this.bgAudio.paused) {
      const startVolume = this.bgAudio.volume;
      const step = startVolume / (duration / 50);
      
      const fadeInterval = setInterval(() => {
        if (this.bgAudio.volume > step) {
          this.bgAudio.volume -= step;
        } else {
          this.bgAudio.volume = 0;
          this.bgAudio.pause();
          clearInterval(fadeInterval);
        }
      }, 50);
    }
    this.stopSynthMelody();
  }
}

window.BirthdayAudio = new SoundEffects();
