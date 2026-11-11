/**
 * Procedural Audio Synthesizer using Web Audio API.
 * 100% self-contained, 0 external assets, instant loading, lag-free.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.15;
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.3;
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (this.bgmGain) this.bgmGain.gain.value = muted ? 0 : 0.15;
      if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : 0.3;
    }
  }

  public getMute(): boolean {
    return this.isMuted;
  }

  private tenseBgmTimer: number | null = null;
  private isTenseBgmPlaying: boolean = false;

  public startBGM() {
    if (this.isBgmPlaying) return;
    this.stopTenseBGM();
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    let step = 0;

    // Upbeat pentatonic chord progression (C - G - Am - F)
    const melody = [
      523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00,
      440.00, 523.25, 659.25, 523.25, 349.23, 440.00, 523.25, 659.25
    ];
    const bass = [130.81, 130.81, 196.00, 196.00, 220.00, 220.00, 174.61, 174.61];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;

      // Melody note
      const mNote = melody[step % melody.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(mNote, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(now);
      osc.stop(now + 0.24);

      // Bass note every 2 steps
      if (step % 2 === 0) {
        const bNote = bass[(step / 2) % bass.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bNote, now);
        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.45);
      }

      // Soft percussion tick every beat
      if (step % 2 === 1) {
        const noise = this.ctx.createOscillator();
        const nGain = this.ctx.createGain();
        noise.type = 'square';
        noise.frequency.setValueAtTime(900 + (step % 4) * 100, now);
        nGain.gain.setValueAtTime(0.03, now);
        nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        noise.connect(nGain);
        nGain.connect(this.bgmGain);
        noise.start(now);
        noise.stop(now + 0.06);
      }

      step++;
      this.bgmTimer = window.setTimeout(playStep, 240); // ~125 BPM
    };

    playStep();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /**
   * Tense, adrenaline-pumping match BGM for in-game domino battle:
   * Driving D-minor staccato arpeggio, suspenseful clock ticking, and deep sub-bass pulses!
   */
  public startTenseBGM() {
    if (this.isTenseBgmPlaying) return;
    this.stopBGM();
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isTenseBgmPlaying = true;
    let step = 0;

    // Intense D-minor suspense progression (Dm - Bb - Gm - A7)
    // Notes: D3 (146.83), F3 (174.61), A3 (220), D4 (293.66), C4 (261.63), Bb3 (233.08)
    const tenseArp = [
      146.83, 220.00, 293.66, 220.00, 174.61, 220.00, 293.66, 349.23,
      116.54, 174.61, 233.08, 174.61, 110.00, 164.81, 220.00, 277.18
    ];
    // Deep pulsating sub-bass notes
    const subBass = [73.42, 73.42, 58.27, 58.27, 49.00, 49.00, 55.00, 55.00];

    const playTenseStep = () => {
      if (!this.isTenseBgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;

      // 1. Tense staccato ostinato
      const noteFreq = tenseArp[step % tenseArp.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(noteFreq, now);

      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(now);
      osc.stop(now + 0.14);

      // 2. Heavy sub-bass pulse every 2 steps
      if (step % 2 === 0) {
        const bassFreq = subBass[(step / 2) % subBass.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bassFreq, now);
        bGain.gain.setValueAtTime(0.16, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);
        bOsc.start(now);
        bOsc.stop(now + 0.3);
      }

      // 3. High-stakes ticking clock percussion on every step (sharp staccato tick)
      const tick = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();
      tick.type = 'square';
      tick.frequency.setValueAtTime(step % 4 === 0 ? 1600 : 1200, now);
      tickGain.gain.setValueAtTime(0.035, now);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      tick.connect(tickGain);
      tickGain.connect(this.bgmGain);
      tick.start(now);
      tick.stop(now + 0.04);

      step++;
      this.tenseBgmTimer = window.setTimeout(playTenseStep, 150); // Fast, driving ~100 BPM 16th notes
    };

    playTenseStep();
  }

  public stopTenseBGM() {
    this.isTenseBgmPlaying = false;
    if (this.tenseBgmTimer) {
      clearTimeout(this.tenseBgmTimer);
      this.tenseBgmTimer = null;
    }
  }

  // SFX: Tile Snap / Domino Clack
  public playTileSnap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // SFX: Correct Equation Solved
  public playCorrectDing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  // SFX: Wrong Answer Buzz
  public playWrongBuzz() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(130, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // SFX: Cat Meow
  public playCatMeow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // SFX: Coin Clink / Win Coins
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.38);
    });
  }

  // SFX: 1 Card Alert ("Tinggal 1 Kartu!")
  public playOneCardAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [600, 900, 1200].forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.25, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.16);
    });
  }

  // SFX: Pass / Skip
  public playPass() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // SFX: Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.15, 0.3, 0.45, 0.7, 0.9];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + times[idx]);
      gain.gain.setValueAtTime(0.25, now + times[idx]);
      gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + times[idx]);
      osc.stop(now + times[idx] + 0.45);
    });
  }

  // SFX: Coin Loss (Penalty)
  public playCoinLoss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [400, 260].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.2, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.25);
    });
  }

  // SFX: Card Throw / Whoosh
  public playWhooshThrow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.14);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // SFX: Exclusive Legendary / Epic Item Equipping Fanfare
  public playExclusiveSparkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66, 1479.98, 1760];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gain.gain.setValueAtTime(0.22, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.42);
    });
  }

  // SFX: Opponent Frustrated / Angry Groan
  public playAngryGroan() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // SFX: Opponent Joyful Chime
  public playJoyfulChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [659.25, 880, 1174.66].forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.18, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.28);
    });
  }

  // SFX: Simple Click
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sounds = new SoundManager();
