import { useState, useEffect } from 'react';

// Persian digits conversion helper
export const toPersianDigits = (num: number | string): string => {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
};

export const formatTimePersian = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${toPersianDigits(formattedMins)}:${toPersianDigits(formattedSecs)}`;
};

// Convert numbers 1-100 to standard spoken Persian words
export const numberToPersianWords = (num: number): string => {
  if (num === 0) return 'صفر';
  if (num === 1) return 'یک';

  const ones: Record<number, string> = {
    1: 'یک',
    2: 'دو',
    3: 'سه',
    4: 'چهار',
    5: 'پنج',
    6: 'شش',
    7: 'هفت',
    8: 'هشت',
    9: 'نه',
    10: 'ده',
  };
  if (ones[num]) return ones[num];

  const teens: Record<number, string> = {
    11: 'یازده',
    12: 'دوازده',
    13: 'سیزده',
    14: 'چهارده',
    15: 'پانزده',
    16: 'شانزده',
    17: 'هفده',
    18: 'هجده',
    19: 'نوزده',
  };
  if (teens[num]) return teens[num];

  const tens: Record<number, string> = {
    20: 'بیست',
    30: 'سی',
    40: 'چهل',
    50: 'پنجاه',
    60: 'شصت',
    70: 'هفتاد',
    80: 'هشتاد',
    90: 'نود',
    100: 'صد',
  };
  if (tens[num]) return tens[num];

  if (num > 20 && num < 100) {
    const t = Math.floor(num / 10) * 10;
    const o = num % 10;
    return `${tens[t]} و ${ones[o]}`;
  }

  return String(num);
};

// Traditional Iranian Multiplication Rhythmic Phrasing
// Examples:
// 1 x 1 => "یکی یکی، یکی"
// 2 x 2 => "دو دوتا، چهارتا"
// 2 x 3 => "دو سه تا، شش تا"
// 3 x 3 => "سه سه تا، نه تا"
// 4 x 5 => "چهار پنج تا، بیست تا"
// 7 x 8 => "هفت هشت تا، پنجاه و شش تا"
// 9 x 9 => "نه نه تا، هشتاد و یک تا"
export const getTraditionalPersianMultiplicationPhrase = (f1: number, f2: number): string => {
  const result = f1 * f2;

  const f1Word = f1 === 1 ? 'یکی' : numberToPersianWords(f1);
  
  let f2Word = '';
  if (f2 === 1) {
    f2Word = 'یکی';
  } else if (f2 === 2) {
    f2Word = 'دوتا';
  } else if (f2 === 4) {
    f2Word = 'چهارتا';
  } else {
    f2Word = `${numberToPersianWords(f2)} تا`;
  }

  let resWord = '';
  if (result === 1) {
    resWord = 'یکی';
  } else if (result === 2) {
    resWord = 'دوتا';
  } else if (result === 4) {
    resWord = 'چهارتا';
  } else {
    resWord = `${numberToPersianWords(result)} تا`;
  }

  if (f1 === 1 && f2 === 1) {
    return 'یکی یکی، یکی';
  }

  return `${f1Word} ${f2Word}، ${resWord}`;
};

// Web Audio API & Cross-Platform Speech Engine (Web & Android Compatible)
class SoundEffects {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingId: string | null = null;
  private listeners: Set<() => void> = new Set();
  private isUnlocked: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private voiceVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private soundEnabled: boolean = true;

  constructor() {
    this.setupUnlockListeners();
  }

  public setSettings(soundEnabled: boolean, voiceVolume: number = 1.0, sfxVolume: number = 1.0) {
    this.soundEnabled = soundEnabled;
    this.voiceVolume = Math.max(0, Math.min(1, voiceVolume));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
  }

  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.unlockAudioContext();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
  }

  public unlockAudioContext() {
    if (this.isUnlocked) return;
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.isUnlocked = true;
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getCurrentlyPlayingId(): string | null {
    return this.currentPlayingId;
  }

  public isPlaying(id?: string): boolean {
    if (!id) return this.currentPlayingId !== null;
    return this.currentPlayingId === id;
  }

  public stopSpeech() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    this.currentPlayingId = null;
    this.notify();
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Preload key audio files into browser cache for instant playback
  public preloadKeyAudio() {
    if (typeof window === 'undefined') return;
    const keyPaths = [
      '/audio/correct/correct_01.mp3',
      '/audio/correct/correct_02.mp3',
      '/audio/correct/correct_03.mp3',
      '/audio/wrong/wrong_01.mp3',
      '/audio/wrong/wrong_02.mp3',
      '/audio/wrong/wrong_03.mp3',
      '/audio/instructions/game_start.mp3',
      '/audio/rewards/level_complete.mp3',
      '/audio/rewards/reward_star.mp3',
      '/audio/rewards/reward_badge.mp3',
    ];

    keyPaths.forEach((path) => {
      if (!this.audioCache.has(path)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.audioCache.set(path, audio);
      }
    });
  }

  // Helper to play an MP3 path cleanly with ID and volume controls
  private playMp3File(mp3Path: string, id: string, volume: number = 1.0, onEndedCallback?: () => void): void {
    if (!this.soundEnabled) return;
    this.unlockAudioContext();

    // Stop current playing audio
    this.stopSpeech();

    this.currentPlayingId = id;
    this.notify();

    try {
      let audio = this.audioCache.get(mp3Path);
      if (!audio) {
        audio = new Audio(mp3Path);
        this.audioCache.set(mp3Path, audio);
      } else {
        audio.currentTime = 0;
      }

      audio.volume = Math.max(0, Math.min(1, volume));
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.currentAudio = null;
          this.notify();
        }
        if (onEndedCallback) onEndedCallback();
      };

      audio.onerror = () => {
        console.warn(`فایل صوتی یافت نشد یا قابل پخش نیست: ${mp3Path}`);
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.currentAudio = null;
          this.notify();
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: Error) => {
          console.warn(`خطا در پخش صوتی [${err.name}]: ${err.message}`);
          if (this.currentPlayingId === id) {
            this.currentPlayingId = null;
            this.currentAudio = null;
            this.notify();
          }
        });
      }
    } catch (err) {
      console.warn(`خطا در اجرای Audio:`, err);
      if (this.currentPlayingId === id) {
        this.currentPlayingId = null;
        this.currentAudio = null;
        this.notify();
      }
    }
  }

  // Play a happy success chord + Persian praise voice
  playCorrectSound() {
    if (!this.soundEnabled) return;

    // 1. Play synthesized chord
    try {
      const ctx = this.getContext();
      if (ctx && this.sfxVolume > 0) {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          const vol = 0.2 * this.sfxVolume;
          gain.gain.setValueAtTime(0, now + idx * 0.05);
          gain.gain.linearRampToValueAtTime(vol, now + idx * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.3);
        });
      }
    } catch {
      // Ignore
    }

    // 2. Play spoken praise
    if (this.voiceVolume > 0) {
      const randomIdx = Math.floor(Math.random() * 3) + 1;
      const mp3Path = `/audio/correct/correct_0${randomIdx}.mp3`;
      this.playMp3File(mp3Path, 'feedback-correct', this.voiceVolume);
    }
  }

  // Play gentle error boop sound + Persian encouraging voice
  playWrongSound() {
    if (!this.soundEnabled) return;

    // 1. Play error tone
    try {
      const ctx = this.getContext();
      if (ctx && this.sfxVolume > 0) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        const vol = 0.15 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Ignore
    }

    // 2. Play encouraging spoken phrase
    if (this.voiceVolume > 0) {
      const randomIdx = Math.floor(Math.random() * 3) + 1;
      const mp3Path = `/audio/wrong/wrong_0${randomIdx}.mp3`;
      this.playMp3File(mp3Path, 'feedback-wrong', this.voiceVolume);
    }
  }

  // Play fan fare for streak
  playStreakSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (ctx && this.sfxVolume > 0) {
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.08);

          const vol = 0.25 * this.sfxVolume;
          gain.gain.setValueAtTime(vol, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.4);
        });
      }
    } catch {
      // Ignore
    }
  }

  // Play game start sound ("بریم بازی رو شروع کنیم!")
  playGameStart() {
    this.playMp3File('/audio/instructions/game_start.mp3', 'game-start', this.voiceVolume);
  }

  // Play level complete sound ("هورااا! این مرحله با موفقیت تموم شد!")
  playLevelComplete() {
    this.playMp3File('/audio/rewards/level_complete.mp3', 'level-complete', this.voiceVolume);
  }

  // Play reward star sound ("تبریک می‌گم! یک ستاره‌ی طلایی جدید گرفتی!")
  playRewardStar() {
    this.playMp3File('/audio/rewards/reward_star.mp3', 'reward-star', this.voiceVolume);
  }

  // Play badge unlock sound ("مدال جدید باز شد! آفرین به تو قهرمان!")
  playRewardBadge() {
    this.playMp3File('/audio/rewards/reward_badge.mp3', 'reward-badge', this.voiceVolume);
  }

  // Play local MP3 audio for table row (e.g. 2x3 -> 2-3.mp3)
  public speakTraditionalMultiplication(f1: number, f2: number, id?: string): void {
    const audioId = id || `table-mult-${f1}-${f2}`;
    const mp3Path = `/audio/multiplication/${f1}-${f2}.mp3`;
    this.playMp3File(mp3Path, audioId, this.voiceVolume);
  }

  // Speak Persian text or play mapped audio file
  public speakPersian(text: string, id: string = 'global-speech'): void {
    this.playMp3File('/audio/instructions/game_start.mp3', id, this.voiceVolume);
  }
}

export const sounds = new SoundEffects();

export function useAudioState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = sounds.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return {
    currentlyPlayingId: sounds.getCurrentlyPlayingId(),
    isPlaying: (id?: string) => sounds.isPlaying(id),
    stopSpeech: () => sounds.stopSpeech(),
    speakPersian: (text: string, id?: string) => sounds.speakPersian(text, id),
    speakTraditionalMultiplication: (f1: number, f2: number, id?: string) =>
      sounds.speakTraditionalMultiplication(f1, f2, id),
    playCorrectSound: () => sounds.playCorrectSound(),
    playWrongSound: () => sounds.playWrongSound(),
    playGameStart: () => sounds.playGameStart(),
    playLevelComplete: () => sounds.playLevelComplete(),
    playRewardStar: () => sounds.playRewardStar(),
    playRewardBadge: () => sounds.playRewardBadge(),
    preloadKeyAudio: () => sounds.preloadKeyAudio(),
  };
}

