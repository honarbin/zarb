import React from 'react';
import { motion } from 'motion/react';
import { toPersianDigits } from '../utils/persian';

export type CharacterId = 'robot' | 'fox' | 'panda' | 'cat';
export type CharacterExpression = 'idle' | 'correct' | 'wrong' | 'thinking' | 'celebration' | 'cheering';

export interface GameCharacterProps {
  characterId: CharacterId;
  expression?: CharacterExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hat?: string;
  glasses?: string;
  accessory?: string;
  className?: string;
}

export interface CharacterMetadata {
  id: CharacterId;
  name: string;
  tagline: string;
  description: string;
  colorClass: string;
  accentColor: string;
  emoji: string;
}

export const CHARACTERS_METADATA: Record<CharacterId, CharacterMetadata> = {
  robot: {
    id: 'robot',
    name: 'روبو-یار (ربات باهوش) 🤖',
    tagline: 'سریع، دقیق و پر از انرژی دیجیتالی!',
    description: 'عاشق محاسبات فوق‌سریع و فرمول‌های پیشرفته ضرب. آماده است تا با موتورهای توربو خودت رو به قهرمانی برسونه!',
    colorClass: 'from-cyan-400 to-blue-600',
    accentColor: '#06b6d4',
    emoji: '🤖',
  },
  fox: {
    id: 'fox',
    name: 'روبو-فاکس (روباه زرنگ) 🦊',
    tagline: 'استاد ترفندهای ضرب و رازهای جادویی!',
    description: 'کنجکاو و بسیار باهوش. بهت یاد میده چطور با ترفندهای هوشمندانه، سخت‌ترین ضرب‌ها رو توی هوا روی انگشتات حل کنی!',
    colorClass: 'from-orange-400 to-amber-600',
    accentColor: '#f97316',
    emoji: '🦊',
  },
  panda: {
    id: 'panda',
    name: 'پاندا-یار (پاندا آرام) 🐼',
    tagline: 'صبور، دوست‌داشتنی و عاشق یادگیری گام‌به‌گام!',
    description: 'بسیار خونسرد و مهربان. با حوصله زیاد قدم‌به‌قدم کنارت می‌مونه تا ضرب‌ها به ساده‌ترین شکل توی ذهنت موندگار بشن.',
    colorClass: 'from-slate-400 to-zinc-600',
    accentColor: '#64748b',
    emoji: '🐼',
  },
  cat: {
    id: 'cat',
    name: 'پیشی-یار (گربه شیطون) 🐱',
    tagline: 'پر از بازیگوشی، شادی و مسابقات پرسرعت!',
    description: 'شیطون و شوخ‌طبع. یادگیری رو برات تبدیل به یک بازی هیجان‌انگیز می‌کنه و با شوخی‌هاش همیشه شادت نگه می‌داره!',
    colorClass: 'from-pink-400 to-rose-600',
    accentColor: '#ec4899',
    emoji: '🐱',
  },
};

export const GameCharacter: React.FC<GameCharacterProps> = ({
  characterId,
  expression = 'idle',
  size = 'md',
  hat = 'none',
  glasses = 'none',
  accessory = 'none',
  className = '',
}) => {
  // Compute size in pixels
  const sizeMap = {
    xs: 40,
    sm: 70,
    md: 110,
    lg: 150,
    xl: 200,
    '2xl': 260,
  };
  const pixelSize = sizeMap[size];

  // Base animation variants based on expressions
  const characterVariants = {
    idle: {
      y: [0, -4, 0],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      },
    },
    correct: {
      y: [0, -25, 0],
      scale: [1, 1.12, 1],
      rotate: [0, 8, -8, 0],
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
    wrong: {
      x: [0, -8, 8, -6, 6, 0],
      rotate: [0, -3, 3, 0],
      transition: {
        duration: 0.4,
      },
    },
    thinking: {
      rotate: [0, -2, 2, -2, 0],
      transition: {
        repeat: Infinity,
        duration: 2.5,
        ease: 'easeInOut',
      },
    },
    celebration: {
      y: [0, -15, 0, -15, 0],
      scale: [1, 1.08, 0.95, 1.08, 1],
      rotate: [0, 10, -10, 10, 0],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      },
    },
    cheering: {
      scale: [1, 1.05, 1],
      y: [0, -8, 0],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  };

  // Eyes coordinates and states depending on expression
  const isEyeClosed = expression === 'correct' || expression === 'celebration';
  const isEyeSad = expression === 'wrong';
  const isEyeThinking = expression === 'thinking';

  // Sub-animation variants for specific parts
  const armVariants = {
    idle: { rotate: [0, 5, 0] },
    correct: { rotate: [0, -80, 0], transition: { duration: 0.45 } },
    wrong: { rotate: [0, 15, 0] },
    thinking: { rotate: [-10, -25, -10], transition: { duration: 1, repeat: Infinity } },
    celebration: { rotate: [0, -120, -120, 0], transition: { duration: 0.8 } },
    cheering: { rotate: [-40, -60, -40], transition: { duration: 1, repeat: Infinity } },
  };

  // 1. ACCESSORIES RENDERING HELPERS
  const renderHat = () => {
    if (hat === 'none') return null;

    if (hat === 'detective') {
      return (
        <g id="accessory-hat-detective" className="origin-bottom" style={{ transform: 'translate(0px, -6px)' }}>
          <defs>
            <linearGradient id="detective-brown" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="60%" stopColor="#713f12" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="detective-ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          {/* Main Cap Dome */}
          <path d="M 22 35 C 22 10, 78 10, 78 35 Z" fill="url(#detective-brown)" stroke="#451a03" strokeWidth="2.5" />
          {/* Top Button */}
          <circle cx="50" cy="11" r="4.5" fill="#451a03" />
          {/* Shadow stitch line */}
          <path d="M 50 11 Q 50 25 50 35" fill="none" stroke="#451a03" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          {/* Cap Ribbon/Band */}
          <rect x="22" y="28" width="56" height="7" fill="url(#detective-ribbon)" stroke="#451a03" strokeWidth="1.5" />
          {/* Gold Buckle on Band */}
          <rect x="44" y="26" width="12" height="11" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
          <rect x="47" y="29" width="6" height="5" fill="#451a03" />
          {/* Visor Brim */}
          <path d="M 14 35 L 86 35 Q 92 35, 84 41 L 16 41 Q 8 35, 14 35 Z" fill="#451a03" stroke="#1c1917" strokeWidth="1" />
          {/* Cap peak reflection */}
          <path d="M 28 20 Q 50 14 72 20" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.15" />
        </g>
      );
    }

    if (hat === 'crown') {
      return (
        <g id="accessory-hat-crown" className="origin-bottom" style={{ transform: 'translate(0px, -6px)' }}>
          <defs>
            <linearGradient id="gold-crown-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="ruby-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="sapphire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          {/* Back shadow base */}
          <rect x="23" y="32" width="54" height="4" rx="2" fill="#78350f" opacity="0.3" />
          {/* Main Gold Crown Tips */}
          <path d="M 23 35 L 18 12 L 34 24 L 50 8 L 66 24 L 82 12 L 77 35 Z" fill="url(#gold-crown-grad)" stroke="#78350f" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Crown Rim Base */}
          <path d="M 22 32 L 78 32 Q 81 32 78 36 L 22 36 Q 19 32 22 32 Z" fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
          {/* Pearl details along base */}
          <circle cx="28" cy="34" r="1.5" fill="#ffffff" />
          <circle cx="39" cy="34" r="1.5" fill="#ffffff" />
          <circle cx="50" cy="34" r="1.5" fill="#ffffff" />
          <circle cx="61" cy="34" r="1.5" fill="#ffffff" />
          <circle cx="72" cy="34" r="1.5" fill="#ffffff" />
          {/* Rubies and Sapphires Gems */}
          <circle cx="50" cy="8" r="3.5" fill="url(#ruby-grad)" stroke="#4c0519" strokeWidth="1" />
          <circle cx="18" cy="12" r="3" fill="url(#sapphire-grad)" stroke="#172554" strokeWidth="1" />
          <circle cx="82" cy="12" r="3" fill="url(#sapphire-grad)" stroke="#172554" strokeWidth="1" />
          <rect x="47" y="19" width="6" height="6" rx="1" fill="url(#sapphire-grad)" stroke="#172554" strokeWidth="1" transform="rotate(45 50 22)" />
          <circle cx="31" cy="24" r="2.5" fill="url(#ruby-grad)" stroke="#4c0519" strokeWidth="1" />
          <circle cx="69" cy="24" r="2.5" fill="url(#ruby-grad)" stroke="#4c0519" strokeWidth="1" />
          {/* Shining Sparkle FX */}
          <path d="M 44 4 L 46 7 L 49 7 L 47 9 L 48 12 L 44 10 L 40 12 L 41 9 L 39 7 L 42 7 Z" fill="#ffffff" opacity="0.9" transform="scale(0.5) translate(30, -5)" />
          <path d="M 50 4 L 52 7 L 55 7 L 53 9 L 54 12 L 50 10 L 46 12 L 47 9 L 45 7 L 48 7 Z" fill="#ffffff" opacity="0.9" transform="scale(0.5) translate(110, -5)" />
        </g>
      );
    }

    if (hat === 'wizard') {
      return (
        <g id="accessory-hat-wizard" className="origin-bottom" style={{ transform: 'translate(0px, -10px)' }}>
          <defs>
            <linearGradient id="wizard-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="40%" stopColor="#6366f1" />
              <stop offset="80%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
            <linearGradient id="wizard-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Wizard point hat */}
          <path d="M 16 33 Q 32 -14, 50 -16 Q 62 -14, 84 33 Z" fill="url(#wizard-purple)" stroke="#312e81" strokeWidth="2.5" />
          {/* Curved glowing brim */}
          <ellipse cx="50" cy="33" rx="42" ry="7" fill="#4338ca" stroke="#312e81" strokeWidth="2.5" />
          {/* Hat Ribbon */}
          <path d="M 23 29 Q 50 25, 77 29 L 79 33 Q 50 30, 21 33 Z" fill="url(#wizard-gold)" stroke="#854d0e" strokeWidth="1" />
          {/* Shiny magic stars */}
          <path d="M 46 8 L 48 11 L 51 11 L 49 13 L 50 16 L 46 14 L 42 16 L 43 13 L 41 11 L 44 11 Z" fill="#fef08a" transform="scale(0.8) translate(10, 5)" />
          <path d="M 46 8 L 48 11 L 51 11 L 49 13 L 50 16 L 46 14 L 42 16 L 43 13 L 41 11 L 44 11 Z" fill="#ffffff" opacity="0.85" transform="scale(0.5) translate(40, 32)" />
          <path d="M 46 8 L 48 11 L 51 11 L 49 13 L 50 16 L 46 14 L 42 16 L 43 13 L 41 11 L 44 11 Z" fill="#fef08a" opacity="0.9" transform="scale(0.6) translate(80, 16)" />
          {/* Soft highlights */}
          <path d="M 25 22 Q 40 -2 50 -10" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
        </g>
      );
    }

    return null;
  };

  const renderGlasses = () => {
    if (glasses === 'none') return null;

    if (glasses === 'cool') {
      return (
        <g id="accessory-glasses-cool" style={{ transform: 'translate(0px, 12px)' }}>
          <defs>
            <linearGradient id="cool-lens" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="neon-rim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Sunglasses Frames with Neon Glowing style */}
          <rect x="15" y="32" width="31" height="18" rx="8" fill="url(#cool-lens)" stroke="url(#neon-rim)" strokeWidth="3" />
          <rect x="54" y="32" width="31" height="18" rx="8" fill="url(#cool-lens)" stroke="url(#neon-rim)" strokeWidth="3" />
          {/* Bridge */}
          <rect x="44" y="37" width="12" height="4" rx="1" fill="#a855f7" />
          {/* Glass glare line reflections */}
          <path d="M 19 36 L 31 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
          <path d="M 33 36 L 37 40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <path d="M 58 36 L 70 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
          <path d="M 72 36 L 76 40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        </g>
      );
    }

    if (glasses === 'smart') {
      return (
        <g id="accessory-glasses-smart" style={{ transform: 'translate(0px, 10px)' }}>
          <defs>
            <linearGradient id="lens-blue-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Intelligent/Scientific Round Golden Glasses */}
          {/* Lenses */}
          <circle cx="31" cy="42" r="14" fill="url(#lens-blue-glow)" />
          <circle cx="69" cy="42" r="14" fill="url(" />
          {/* Gold Rims */}
          <circle cx="31" cy="42" r="14" fill="none" stroke="#eab308" strokeWidth="3" />
          <circle cx="69" cy="42" r="14" fill="none" stroke="#eab308" strokeWidth="3" strokeContent="transparent" />
          {/* Bridge */}
          <path d="M 45 40 Q 50 37, 55 40" fill="none" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" />
          {/* Temple arms */}
          <path d="M 17 40 Q 11 36 7 42" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <path d="M 83 40 Q 89 36 93 42" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          {/* Glass Sparkle Glare */}
          <path d="M 23 35 Q 35 44 35 44" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 61 35 Q 73 44 73 44" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    }

    return null;
  };

  const renderMedal = () => {
    if (accessory === 'none') return null;

    if (accessory === 'gold_medal') {
      return (
        <g id="accessory-medal" style={{ transform: 'translate(50px, 86px)' }}>
          <defs>
            <linearGradient id="gold-medal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="ribbon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          {/* Shaded hanging ribbon */}
          <path d="M -9 -14 L 0 4 L 9 -14 Z" fill="#ef4444" stroke="#9f1239" strokeWidth="1" />
          <path d="M -14 -14 L -5 -14 L -9 1 Z" fill="url(#ribbon-grad)" stroke="#172554" strokeWidth="1" />
          <path d="M 14 -14 L 5 -14 L 9 1 Z" fill="url(#ribbon-grad)" stroke="#172554" strokeWidth="1" />
          {/* Medal Base (Gold Circle with Inner Rings) */}
          <circle cx="0" cy="7" r="13" fill="#ca8a04" />
          <circle cx="0" cy="7" r="12" fill="url(#gold-medal-grad)" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="0" cy="7" r="9.5" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="7" r="8" fill="#d97706" opacity="0.15" />
          {/* Number 1 in center */}
          <text x="0" y="11" textAnchor="middle" fontSize="11" fontWeight="1000" fill="#78350f" fontFamily="sans-serif">۱</text>
          {/* Glistening Shine on medal */}
          <path d="M -8 2 Q 0 -6 6 1" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    }

    if (accessory === 'star_badge') {
      return (
        <g id="accessory-star-badge" style={{ transform: 'translate(23px, 80px)' }}>
          <defs>
            <linearGradient id="badge-red-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="badge-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Red ribbon backing */}
          <path d="M -8 -2 L -12 12 L -5 8 L 0 12 L -2 -2 Z" fill="#9f1239" />
          {/* Star Shape Badge */}
          <path
            d="M 0 -11 L 3 -3 L 11 -3 L 5 2 L 7 10 L 0 5 L -7 10 L -5 2 L -11 -3 L -3 -3 Z"
            fill="url(#badge-red-grad)"
            stroke="#4c0519"
            strokeWidth="1.5"
            transform="scale(1.15)"
          />
          {/* Inner Golden Star Accent */}
          <path
            d="M 0 -6 L 1.5 -1.5 L 6 -1.5 L 2.5 1 L 3.5 5 L 0 2.5 L -3.5 5 L -2.5 1 L -6 -1.5 L -1.5 -1.5 Z"
            fill="url(#badge-gold-grad)"
          />
          {/* Specular White Dot */}
          <circle cx="-1.5" cy="-2" r="1.2" fill="#ffffff" opacity="0.8" />
        </g>
      );
    }

    return null;
  };

  // 2. CHARACTER SPECIFIC SVG GENERATORS
  const renderRobot = () => {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="robo-body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="robo-ears-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="robo-belly-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="robo-face-glass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0f1d" />
            <stop offset="100%" stopColor="#02040a" />
          </linearGradient>
          <linearGradient id="robo-cheek-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#020617" floodOpacity="0.22" />
          </filter>
        </defs>

        <g filter="url(#soft-shadow)">
          {/* Ground shadow */}
          <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#020617" opacity="0.2" />

          {/* Left Arm / Cyber-Connector */}
          <motion.path
            d="M 14 62 Q 2 64 8 76"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="7.5"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-right"
            style={{ originX: '14px', originY: '62px' }}
          />
          {/* Left Claw */}
          <circle cx="8" cy="76" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* Right Arm / Cyber-Connector */}
          <motion.path
            d="M 86 62 Q 98 64 92 76"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="7.5"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-left"
            style={{ originX: '86px', originY: '62px' }}
          />
          {/* Right Claw */}
          <circle cx="92" cy="76" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* Body Base Block */}
          <rect x="20" y="52" width="60" height="37" rx="16" fill="url(#robo-body-gradient)" stroke="#0369a1" strokeWidth="2.5" />
          
          {/* Sleek metallic plate highlight */}
          <path d="M 23 55 Q 50 62 77 55" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />

          {/* Digital Smart Screen in stomach */}
          <rect x="30" y="59" width="40" height="23" rx="7" fill="url(#robo-belly-gradient)" stroke="#1e293b" strokeWidth="1.5" />
          {/* Outer blue neon glow around screen */}
          <rect x="29" y="58" width="42" height="25" rx="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.45" />
          
          <motion.g
            animate={isEyeClosed ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {/* Holographic math grid on stomach screen */}
            <line x1="33" y1="70" x2="67" y2="70" stroke="#00f5ff" strokeWidth="0.5" opacity="0.2" />
            <line x1="50" y1="61" x2="50" y2="80" stroke="#00f5ff" strokeWidth="0.5" opacity="0.2" />
            
            <text
              x="50"
              y="75"
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="12.5"
              fontWeight="1000"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              {isEyeClosed ? '✓✓✓' : isEyeSad ? '۹×۹=؟' : '۹×۹='}
            </text>
          </motion.g>

          {/* Neck with hydraulic rings */}
          <rect x="40" y="44" width="20" height="12" rx="3.5" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="43" y1="48" x2="57" y2="48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="43" y1="52" x2="57" y2="52" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Head Group */}
          <motion.g
            animate={expression === 'idle' ? { y: [0, -2.5, 0] } : expression === 'thinking' ? { rotate: [-6, 6, -6] } : {}}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="origin-bottom"
          >
            {/* Side Bolts / Cyber Ears with gold glow */}
            <rect x="12" y="24" width="10" height="16" rx="4" fill="url(#robo-ears-gradient)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="78" y="24" width="10" height="16" rx="4" fill="url(#robo-ears-gradient)" stroke="#78350f" strokeWidth="1.5" />
            
            {/* Glowing signal circles inside bolts */}
            <circle cx="17" cy="32" r="2.5" fill="#ffffff" />
            <circle cx="83" cy="32" r="2.5" fill="#ffffff" />

            {/* Antenna tower */}
            <line x1="50" y1="18" x2="50" y2="6" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="18" x2="50" y2="6" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            
            {/* Glowing Antenna Tip Sphere */}
            <motion.circle
              cx="50"
              cy="4"
              r="6.5"
              fill="#fbbf24"
              stroke="#ca8a04"
              strokeWidth="1.5"
              animate={isEyeClosed ? { scale: [1, 1.5, 1], fill: '#10b981' } : { scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            {/* Mini glow ring around antenna */}
            <circle cx="50" cy="4" r="11" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />

            {/* Helmet Faceplate */}
            <rect x="18" y="16" width="64" height="34" rx="14" fill="url(#robo-body-gradient)" stroke="#0369a1" strokeWidth="2.5" />
            <path d="M 22 19 Q 50 25 78 19" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />

            {/* Dark glass monitor screen face */}
            <rect x="24" y="21" width="52" height="24" rx="10" fill="url(#robo-face-glass)" stroke="#1e293b" strokeWidth="1" />
            {/* Cyan glass visor edge glow */}
            <rect x="23" y="20" width="54" height="26" rx="11" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.45" />

            {/* Glass reflection sheen */}
            <path d="M 25 22 Q 50 28 75 22 Q 50 17 25 22" fill="#ffffff" opacity="0.12" />

            {/* Eyes */}
            {isEyeClosed ? (
              <>
                {/* Cheerful happy cyber arches */}
                <path d="M 30 33 Q 36 27, 42 33" fill="none" stroke="#00f5ff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 58 33 Q 64 27, 70 33" fill="none" stroke="#00f5ff" strokeWidth="3.5" strokeLinecap="round" />
                {/* Glistening star indicators */}
                <path d="M 36 24 L 38 27 L 41 27 L 39 29 L 40 32 L 36 30 L 32 32 L 33 29 L 31 27 L 34 27 Z" fill="#10b981" opacity="0.8" transform="scale(0.5) translate(36, 12)" />
                <path d="M 36 24 L 38 27 L 41 27 L 39 29 L 40 32 L 36 30 L 32 32 L 33 29 L 31 27 L 34 27 Z" fill="#10b981" opacity="0.8" transform="scale(0.5) translate(88, 12)" />
              </>
            ) : isEyeSad ? (
              <>
                {/* Gentle supportive round green-cyan eyes for cheering up (NOT sad) */}
                <circle cx="36" cy="31" r="5.5" fill="#34d399" />
                <circle cx="64" cy="31" r="5.5" fill="#34d399" />
                <circle cx="34.5" cy="29.5" r="1.8" fill="#ffffff" />
                <circle cx="62.5" cy="29.5" r="1.8" fill="#ffffff" />
                <path d="M 30 24 Q 36 21, 42 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 58 24 Q 64 21, 70 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : isEyeThinking ? (
              <>
                {/* Luminous curious eyes looking up/side */}
                <circle cx="38" cy="29" r="5.5" fill="#22d3ee" />
                <circle cx="66" cy="29" r="5.5" fill="#22d3ee" />
                {/* Dual highlights inside pupils */}
                <circle cx="36.5" cy="27.5" r="2" fill="#ffffff" />
                <circle cx="64.5" cy="27.5" r="2" fill="#ffffff" />
                <circle cx="39.5" cy="30.5" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="67.5" cy="30.5" r="1" fill="#ffffff" opacity="0.8" />
              </>
            ) : (
              <>
                {/* Beautiful large cybernetic eyes with high detail */}
                <circle cx="36" cy="31" r="5.5" fill="#00f5ff" />
                <circle cx="64" cy="31" r="5.5" fill="#00f5ff" />
                {/* Specular Glare Dots */}
                <circle cx="34" cy="29" r="2" fill="#ffffff" />
                <circle cx="62" cy="29" r="2" fill="#ffffff" />
                <circle cx="38" cy="33" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="66" cy="33" r="1" fill="#ffffff" opacity="0.8" />
                {/* Luminous neon rings */}
                <circle cx="36" cy="31" r="7.5" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
                <circle cx="64" cy="31" r="7.5" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
              </>
            )}

            {/* Mouth */}
            {isEyeSad ? (
              /* Sweet friendly neutral mouth for wrong answer (encouraging smile) */
              <path d="M 44 40 Q 50 43, 56 40" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            ) : (
              /* Broad natural smile */
              <path d="M 43 38 Q 50 44, 57 38" fill="none" stroke="#22d3ee" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {/* Custom Accessories inside group */}
            {renderHat()}
            {renderGlasses()}
          </motion.g>

          {/* Medals */}
          {renderMedal()}

          {/* Futuristic rolling wheels/tank tracks */}
          <rect x="28" y="87" width="15" height="8" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="57" y="87" width="15" height="8" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          {/* Luminous track hubs */}
          <circle cx="32" cy="91" r="2.5" fill="#22d3ee" />
          <circle cx="40" cy="91" r="2.5" fill="#22d3ee" />
          <circle cx="61" cy="91" r="2.5" fill="#22d3ee" />
          <circle cx="69" cy="91" r="2.5" fill="#22d3ee" />
        </g>
      </svg>
    );
  };

  const renderFox = () => {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="fox-body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="fox-white-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3f4f6" />
          </linearGradient>
          <linearGradient id="fox-ear-pink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#fda4af" />
          </linearGradient>
          <linearGradient id="fox-eye" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c1a04" />
            <stop offset="100%" stopColor="#120a02" />
          </linearGradient>
          <radialGradient id="fox-rosy-cheeks">
            <stop offset="0%" stopColor="#fecdd3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fecdd3" stopOpacity="0" />
          </radialGradient>
          <filter id="beauty-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#1e1b4b" floodOpacity="0.18" />
          </filter>
        </defs>

        <g filter="url(#beauty-shadow)">
          {/* Shadow */}
          <ellipse cx="50" cy="94" rx="28" ry="4" fill="#020617" opacity="0.2" />

          {/* Curly Extra Fluffy Tail */}
          <motion.path
            d="M 70 73 C 88 73, 100 54, 88 42 C 75 32, 74 54, 70 68"
            fill="url(#fox-body-gradient)"
            stroke="#9a3412"
            strokeWidth="2.5"
            animate={expression === 'idle' ? { rotate: [0, 5, -5, 0] } : { rotate: [0, 18, -18, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="origin-bottom-left"
            style={{ originX: '70px', originY: '68px' }}
          />
          {/* Fluffy tail white tip */}
          <motion.path
            d="M 88 42 C 84 38, 78 41, 74 44 C 76 48, 80 52, 88 42 Z"
            fill="url(#fox-white-gradient)"
            stroke="#9a3412"
            strokeWidth="1.5"
            animate={expression === 'idle' ? { rotate: [0, 5, -5, 0] } : { rotate: [0, 18, -18, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="origin-bottom-left"
            style={{ originX: '70px', originY: '68px' }}
          />

          {/* Left Paw Hand */}
          <motion.path
            d="M 23 64 Q 10 65, 14 76"
            fill="none"
            stroke="#ea580c"
            strokeWidth="7"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-right"
            style={{ originX: '23px', originY: '64px' }}
          />
          <circle cx="14" cy="76" r="3.5" fill="#ffffff" stroke="#ea580c" strokeWidth="1" />

          {/* Right Paw Hand */}
          <motion.path
            d="M 77 64 Q 90 65, 86 76"
            fill="none"
            stroke="#ea580c"
            strokeWidth="7"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-left"
            style={{ originX: '77px', originY: '64px' }}
          />
          <circle cx="86" cy="76" r="3.5" fill="#ffffff" stroke="#ea580c" strokeWidth="1" />

          {/* Torso Body */}
          <rect x="23" y="55" width="54" height="35" rx="18" fill="url(#fox-body-gradient)" stroke="#9a3412" strokeWidth="2.5" />
          {/* Layered White Chest Fur */}
          <path d="M 35 55 Q 50 75, 65 55 Q 58 84, 42 84 Q 37 78, 35 55 Z" fill="url(#fox-white-gradient)" stroke="#cbd5e1" strokeWidth="1" />

          {/* Head Group */}
          <motion.g
            animate={expression === 'idle' ? { y: [0, -2, 0] } : expression === 'thinking' ? { rotate: [4, -4, 4] } : {}}
            transition={{ repeat: Infinity, duration: 2.8 }}
            className="origin-bottom"
          >
            {/* Left Big Fluffy Fox Ear */}
            <path d="M 23 25 L 11 -4 L 34 14 Z" fill="url(#fox-body-gradient)" stroke="#9a3412" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 21 21 L 14 2 L 30 13 Z" fill="url(#fox-ear-pink)" />
            {/* Inner ear fluff lines */}
            <path d="M 20 18 L 15 11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M 24 16 L 21 10" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

            {/* Right Big Fluffy Fox Ear */}
            <path d="M 77 25 L 89 -4 L 66 14 Z" fill="url(#fox-body-gradient)" stroke="#9a3412" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 79 21 L 86 2 L 70 13 Z" fill="url(#fox-ear-pink)" />
            {/* Inner ear fluff lines */}
            <path d="M 80 18 L 85 11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M 76 16 L 79 10" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

            {/* Main Face Shape */}
            <ellipse cx="50" cy="33" rx="31" ry="22" fill="url(#fox-body-gradient)" stroke="#9a3412" strokeWidth="2.5" />

            {/* Extra cute white fluffy cheeks */}
            <path d="M 19 36 Q 31 46, 50 44 Q 69 46, 81 36 Q 74 53, 50 53 Q 26 53, 19 36 Z" fill="url(#fox-white-gradient)" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 19 36 Q 25 32, 28 36" fill="none" stroke="#9a3412" strokeWidth="1.5" opacity="0.3" />
            <path d="M 81 36 Q 75 32, 72 36" fill="none" stroke="#9a3412" strokeWidth="1.5" opacity="0.3" />

            {/* Cheek blush */}
            <circle cx="25" cy="39" r="4.5" fill="url(#fox-rosy-cheeks)" />
            <circle cx="75" cy="39" r="4.5" fill="url(#fox-rosy-cheeks)" />

            {/* Little Glistening black nose */}
            <ellipse cx="50" cy="44" rx="4.5" ry="3" fill="#1e293b" />
            <circle cx="48.5" cy="42.5" r="1.2" fill="#ffffff" />

            {/* Eyes */}
            {isEyeClosed ? (
              <>
                {/* Cheerful anime curved eyes */}
                <path d="M 29 31 Q 35 25, 41 31" fill="none" stroke="#120a02" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 59 31 Q 65 25, 71 31" fill="none" stroke="#120a02" strokeWidth="4.5" strokeLinecap="round" />
                {/* Sparkly lashes */}
                <path d="M 27 30 L 25 27" stroke="#120a02" strokeWidth="2" strokeLinecap="round" />
                <path d="M 73 30 L 75 27" stroke="#120a02" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : isEyeSad ? (
              <>
                {/* Supportive encouraging eyes (Not sad, wide and friendly) */}
                <circle cx="35" cy="30" r="5.5" fill="url(#fox-eye)" />
                <circle cx="65" cy="30" r="5.5" fill="url(#fox-eye)" />
                <circle cx="33.5" cy="27.5" r="2" fill="#ffffff" />
                <circle cx="63.5" cy="27.5" r="2" fill="#ffffff" />
                <circle cx="37" cy="32" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="67" cy="32" r="1" fill="#ffffff" opacity="0.8" />
              </>
            ) : isEyeThinking ? (
              <>
                {/* Luminous sparkling big eyes */}
                <circle cx="36" cy="29" r="6.5" fill="url(#fox-eye)" />
                <circle cx="64" cy="29" r="6.5" fill="url(#fox-eye)" />
                {/* Multiple catching lights for anime style */}
                <circle cx="34.2" cy="26.2" r="2.5" fill="#ffffff" />
                <circle cx="62.2" cy="26.2" r="2.5" fill="#ffffff" />
                <circle cx="38.5" cy="31" r="1.5" fill="#ffffff" opacity="0.8" />
                <circle cx="66.5" cy="31" r="1.5" fill="#ffffff" opacity="0.8" />
                <circle cx="33.5" cy="31" r="1" fill="#ffffff" opacity="0.5" />
                <circle cx="61.5" cy="31" r="1" fill="#ffffff" opacity="0.5" />
              </>
            ) : (
              <>
                {/* Standard ultra-cute sparkling cartoon eyes */}
                <circle cx="35" cy="30" r="6.5" fill="url(#fox-eye)" />
                <circle cx="65" cy="30" r="6.5" fill="url(#fox-eye)" />
                {/* Dual Luminous Highlights (Catchlights) */}
                <circle cx="33.2" cy="27.2" r="2.5" fill="#ffffff" />
                <circle cx="63.2" cy="27.2" r="2.5" fill="#ffffff" />
                <circle cx="37.2" cy="32" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="67.2" cy="32" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="32" cy="31" r="1" fill="#ffffff" opacity="0.6" />
                <circle cx="62" cy="31" r="1" fill="#ffffff" opacity="0.6" />
              </>
            )}

            {/* Expressive Cute Eyebrows */}
            <motion.path
              d="M 25 21 Q 33 15, 38 21"
              fill="none"
              stroke="#7c2d12"
              strokeWidth="3.5"
              strokeLinecap="round"
              animate={expression === 'thinking' ? { y: [-2, 2, -2] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.path
              d="M 75 21 Q 67 15, 62 21"
              fill="none"
              stroke="#7c2d12"
              strokeWidth="3.5"
              strokeLinecap="round"
              animate={expression === 'thinking' ? { y: [2, -2, 2] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />

            {/* Cute Smile / Mouth */}
            {isEyeSad ? (
              /* Comforting sweet smile */
              <path d="M 44 41 Q 50 45, 56 41" fill="none" stroke="#120a02" strokeWidth="3" strokeLinecap="round" />
            ) : (
              /* Playful open smile */
              <path d="M 43 41 Q 50 47, 57 41" fill="none" stroke="#120a02" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {/* Accessories in Fox Head */}
            {renderHat()}
            {renderGlasses()}
          </motion.g>

          {/* Medal */}
          {renderMedal()}

          {/* Little padded feet */}
          <ellipse cx="33" cy="88" rx="8" ry="4.5" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
          <ellipse cx="67" cy="88" rx="8" ry="4.5" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
        </g>
      </svg>
    );
  };

  const renderPanda = () => {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="panda-slate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="panda-white" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="panda-scarf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <radialGradient id="panda-rosy-cheeks">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
          </radialGradient>
          <filter id="cute-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#334155" floodOpacity="0.16" />
          </filter>
        </defs>

        <g filter="url(#cute-shadow)">
          {/* Ground shadow */}
          <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#020617" opacity="0.18" />

          {/* Left Arm (Sleek slate-gray) */}
          <motion.ellipse
            cx="21"
            cy="68"
            rx="7.5"
            ry="13"
            fill="url(#panda-slate)"
            stroke="#0f172a"
            strokeWidth="1.5"
            variants={armVariants}
            animate={expression}
            className="origin-top-right"
            style={{ originX: '25px', originY: '60px' }}
          />

          {/* Right Arm (Sleek slate-gray) */}
          <motion.ellipse
            cx="79"
            cy="68"
            rx="7.5"
            ry="13"
            fill="url(#panda-slate)"
            stroke="#0f172a"
            strokeWidth="1.5"
            variants={armVariants}
            animate={expression}
            className="origin-top-left"
            style={{ originX: '75px', originY: '60px' }}
          />

          {/* Cute Torso with dark upper shoulder strap */}
          <rect x="22" y="54" width="56" height="36" rx="18" fill="url(#panda-white)" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Upper shoulder strap */}
          <path d="M 22 66 Q 50 56, 78 66 L 75 54 L 25 54 Z" fill="url(#panda-slate)" stroke="#0f172a" strokeWidth="1" />

          {/* Cozy Green Scarf around neck */}
          <rect x="33" y="47" width="34" height="7.5" rx="3.5" fill="url(#panda-scarf)" stroke="#047857" strokeWidth="1.5" />
          {/* Scarf hanging tail */}
          <path d="M 58 53 L 64 68 L 70 65 L 63 53 Z" fill="url(#panda-scarf)" stroke="#047857" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Head Group */}
          <motion.g
            animate={expression === 'idle' ? { y: [0, -1.8, 0] } : expression === 'thinking' ? { rotate: [-3, 3, -3] } : {}}
            transition={{ repeat: Infinity, duration: 3.2 }}
            className="origin-bottom"
          >
            {/* Fluffy Panda Ears */}
            <circle cx="23" cy="18" r="11" fill="url(#panda-slate)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="77" cy="18" r="11" fill="url(#panda-slate)" stroke="#0f172a" strokeWidth="1.5" />
            {/* White ear center accent */}
            <circle cx="23" cy="18" r="4.5" fill="#475569" opacity="0.35" />
            <circle cx="77" cy="18" r="4.5" fill="#475569" opacity="0.35" />

            {/* Panda Head Base */}
            <ellipse cx="50" cy="34" rx="32" ry="25" fill="url(#panda-white)" stroke="#cbd5e1" strokeWidth="2.5" />
            {/* Glossy forehead highlight */}
            <path d="M 28 23 Q 50 18 72 23" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />

            {/* Big Expressive Teardrop eye patches */}
            <ellipse cx="36" cy="33" rx="9" ry="12.5" fill="url(#panda-slate)" transform="rotate(-15 36 33)" />
            <ellipse cx="64" cy="33" rx="9" ry="12.5" fill="url(#panda-slate)" transform="rotate(15 64 33)" />

            {/* Soft pink blushes */}
            <circle cx="23" cy="41" r="5" fill="url(#panda-rosy-cheeks)" />
            <circle cx="77" cy="41" r="5" fill="url(#panda-rosy-cheeks)" />

            {/* Soft little snout nose */}
            <ellipse cx="50" cy="39" rx="4.5" ry="3" fill="#1e293b" />
            <circle cx="48.5" cy="37.5" r="0.8" fill="#ffffff" />

            {/* Eyes */}
            {isEyeClosed ? (
              <>
                {/* Waving/happy curve eyes inside the patch */}
                <path d="M 32 32 Q 36 27, 40 32" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 60 32 Q 64 27, 68 32" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : isEyeSad ? (
              <>
                {/* Soft, kind eyes for encouragement (Not sad) */}
                <circle cx="36" cy="32" r="4.5" fill="#ffffff" />
                <circle cx="64" cy="32" r="4.5" fill="#ffffff" />
                <circle cx="35.5" cy="31.5" r="2.2" fill="#0f172a" />
                <circle cx="63.5" cy="31.5" r="2.2" fill="#0f172a" />
                <circle cx="34.8" cy="30.5" r="0.9" fill="#ffffff" />
                <circle cx="62.8" cy="30.5" r="0.9" fill="#ffffff" />
              </>
            ) : isEyeThinking ? (
              <>
                {/* Luminous sparkling big eyes looking upward/thoughtfully */}
                <circle cx="36" cy="32" r="4.5" fill="#ffffff" />
                <circle cx="64" cy="32" r="4.5" fill="#ffffff" />
                <circle cx="35" cy="30" r="2.2" fill="#1e293b" />
                <circle cx="63" cy="30" r="2.2" fill="#1e293b" />
                <circle cx="34" cy="29" r="0.9" fill="#ffffff" />
                <circle cx="62" cy="29" r="0.9" fill="#ffffff" />
              </>
            ) : (
              <>
                {/* Double-Highlight glistening premium anime cartoon eyes */}
                <circle cx="36" cy="32" r="4.5" fill="#ffffff" />
                <circle cx="64" cy="32" r="4.5" fill="#ffffff" />
                {/* Pupils */}
                <circle cx="35.5" cy="31.5" r="2.2" fill="#0f172a" />
                <circle cx="63.5" cy="31.5" r="2.2" fill="#0f172a" />
                {/* Dual highlights inside pupils */}
                <circle cx="34.8" cy="30.5" r="1.1" fill="#ffffff" />
                <circle cx="62.8" cy="30.5" r="1.1" fill="#ffffff" />
                <circle cx="36.2" cy="32.5" r="0.6" fill="#ffffff" opacity="0.8" />
                <circle cx="64.2" cy="32.5" r="0.6" fill="#ffffff" opacity="0.8" />
              </>
            )}

            {/* Cute curved smile mouth */}
            {isEyeSad ? (
              /* Supportive reassuring smile */
              <path d="M 45 44 Q 50 48, 55 44" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              /* Wide gentle happy smile */
              <path d="M 44 43 Q 50 48, 56 43" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            )}

            {/* Accessories in Panda */}
            {renderHat()}
            {renderGlasses()}
          </motion.g>

          {/* Medal */}
          {renderMedal()}

          {/* Slate feet */}
          <ellipse cx="34" cy="88" rx="8" ry="4.5" fill="url(#panda-slate)" stroke="#0f172a" strokeWidth="1" />
          <ellipse cx="66" cy="88" rx="8" ry="4.5" fill="url(#panda-slate)" stroke="#0f172a" strokeWidth="1" />
        </g>
      </svg>
    );
  };

  const renderCat = () => {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="cat-skin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="60%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#9d174d" />
          </linearGradient>
          <linearGradient id="cat-emerald-eyes" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="cat-cream-belly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="100%" stopColor="#ffe4e6" />
          </linearGradient>
          <radialGradient id="cat-rosy-cheeks">
            <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
          </radialGradient>
          <filter id="fancy-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#9d174d" floodOpacity="0.16" />
          </filter>
        </defs>

        <g filter="url(#fancy-shadow)">
          {/* Shadow */}
          <ellipse cx="50" cy="94" rx="28" ry="4" fill="#020617" opacity="0.2" />

          {/* Long playful curly pink tail */}
          <motion.path
            d="M 28 84 Q 14 84, 9 69 T 21 53"
            fill="none"
            stroke="#db2777"
            strokeWidth="5.5"
            strokeLinecap="round"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            className="origin-bottom-right"
            style={{ originX: '28px', originY: '84px' }}
          />

          {/* Left Paw */}
          <motion.path
            d="M 23 62 Q 10 63, 14 74"
            fill="none"
            stroke="#db2777"
            strokeWidth="7"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-right"
            style={{ originX: '23px', originY: '62px' }}
          />
          <circle cx="14" cy="74" r="3.5" fill="#ffe4e6" stroke="#db2777" strokeWidth="1" />

          {/* Right Paw */}
          <motion.path
            d="M 77 62 Q 90 63, 86 74"
            fill="none"
            stroke="#db2777"
            strokeWidth="7"
            strokeLinecap="round"
            variants={armVariants}
            animate={expression}
            className="origin-top-left"
            style={{ originX: '77px', originY: '62px' }}
          />
          <circle cx="86" cy="74" r="3.5" fill="#ffe4e6" stroke="#db2777" strokeWidth="1" />

          {/* Soft main Body */}
          <rect x="24" y="52" width="52" height="37" rx="17" fill="url(#cat-skin-gradient)" stroke="#880e4f" strokeWidth="2.5" />
          {/* Soft Cream Stomach */}
          <ellipse cx="50" cy="74" rx="15" ry="11.5" fill="url(#cat-cream-belly)" />

          {/* Head Group */}
          <motion.g
            animate={expression === 'idle' ? { y: [0, -2.2, 0] } : expression === 'thinking' ? { rotate: [-5, 5, -5] } : {}}
            transition={{ repeat: Infinity, duration: 2.6 }}
            className="origin-bottom"
          >
            {/* Pointy Pink Kitty Ears */}
            <path d="M 23 22 L 14 -4 L 34 11 Z" fill="url(#cat-skin-gradient)" stroke="#880e4f" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 21 19 L 16 3 L 30 11 Z" fill="#fbcfe8" />

            <path d="M 77 22 L 86 -4 L 66 11 Z" fill="url(#cat-skin-gradient)" stroke="#880e4f" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 79 19 L 84 3 L 70 11 Z" fill="#fbcfe8" />

            {/* Round Head Base */}
            <ellipse cx="50" cy="32" rx="31" ry="22" fill="url(#cat-skin-gradient)" stroke="#880e4f" strokeWidth="2.5" />
            {/* Forehead hair shine */}
            <path d="M 28 20 Q 50 15 72 20" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />

            {/* Sweet rosy cheeks */}
            <circle cx="25" cy="38" r="4" fill="url(#cat-rosy-cheeks)" />
            <circle cx="75" cy="38" r="4" fill="url(#cat-rosy-cheeks)" />

            {/* Sweet whisker lines */}
            <line x1="21" y1="34" x2="6" y2="32" stroke="#880e4f" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="38" x2="8" y2="40" stroke="#880e4f" strokeWidth="2" strokeLinecap="round" />

            <line x1="79" y1="34" x2="94" y2="32" stroke="#880e4f" strokeWidth="2" strokeLinecap="round" />
            <line x1="79" y1="38" x2="92" y2="40" stroke="#880e4f" strokeWidth="2" strokeLinecap="round" />

            {/* Tiny pink nose */}
            <polygon points="47.5,35 52.5,35 50,38" fill="#fda4af" stroke="#f43f5e" strokeWidth="0.5" />

            {/* Eyes */}
            {isEyeClosed ? (
              <>
                {/* Joyful happy kitty closed eyes */}
                <path d="M 28 29 Q 34 23, 40 29" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 60 29 Q 66 23, 72 29" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
              </>
            ) : isEyeSad ? (
              <>
                {/* Supportive loving wink (^.~) or cute supportive wide eyes */}
                <path d="M 28 29 Q 34 23, 40 29" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="66" cy="28" r="6" fill="url(#cat-emerald-eyes)" stroke="#047857" strokeWidth="1.5" />
                <ellipse cx="66" cy="28" rx="2" ry="4.5" fill="#0a0f1d" />
                <circle cx="64" cy="25.5" r="1.5" fill="#ffffff" />
              </>
            ) : isEyeThinking ? (
              <>
                {/* Large curious emerald eyes looking up/aside */}
                <circle cx="34" cy="28" r="6" fill="url(#cat-emerald-eyes)" stroke="#047857" strokeWidth="1" />
                <circle cx="66" cy="28" r="6" fill="url(#cat-emerald-eyes)" stroke="#047857" strokeWidth="1" />
                <ellipse cx="34" cy="28" rx="2" ry="4.5" fill="#0f172a" />
                <ellipse cx="66" cy="28" rx="2" ry="4.5" fill="#0f172a" />
                <circle cx="32.5" cy="25.5" r="1.5" fill="#ffffff" />
                <circle cx="64.5" cy="25.5" r="1.5" fill="#ffffff" />
                <circle cx="35.5" cy="29.5" r="0.7" fill="#ffffff" opacity="0.8" />
                <circle cx="67.5" cy="29.5" r="0.7" fill="#ffffff" opacity="0.8" />
              </>
            ) : (
              <>
                {/* High fidelity emerald glassy kitten eyes */}
                <circle cx="34" cy="28" r="6.5" fill="url(#cat-emerald-eyes)" stroke="#047857" strokeWidth="1.5" />
                <circle cx="66" cy="28" r="6.5" fill="url(#cat-emerald-eyes)" stroke="#047857" strokeWidth="1.5" />
                {/* Luminous Slit Pupils with soft gradient */}
                <ellipse cx="34" cy="28" rx="2" ry="4.5" fill="#0a0f1d" />
                <ellipse cx="66" cy="28" rx="2" ry="4.5" fill="#0a0f1d" />
                {/* Triple Glistening Catchlights */}
                <circle cx="32" cy="25.5" r="1.6" fill="#ffffff" />
                <circle cx="64" cy="25.5" r="1.6" fill="#ffffff" />
                <circle cx="35.5" cy="29.5" r="0.8" fill="#ffffff" opacity="0.8" />
                <circle cx="67.5" cy="29.5" r="0.8" fill="#ffffff" opacity="0.8" />
                <circle cx="32.5" cy="29.5" r="0.6" fill="#ffffff" opacity="0.5" />
                <circle cx="64.5" cy="29.5" r="0.6" fill="#ffffff" opacity="0.5" />
              </>
            )}

            {/* Cute Cat Mouth (:3 style) */}
            <path d="M 45 40 Q 47.5 43, 50 40 Q 52.5 43, 55 40" fill="none" stroke="#4d0527" strokeWidth="3.2" strokeLinecap="round" />

            {/* Accessories in Cat */}
            {renderHat()}
            {renderGlasses()}
          </motion.g>

          {/* Medal */}
          {renderMedal()}

          {/* Cute pink feet */}
          <ellipse cx="33" cy="88" rx="8" ry="4.5" fill="#be185d" stroke="#880e4f" strokeWidth="1" />
          <ellipse cx="67" cy="88" rx="8" ry="4.5" fill="#be185d" stroke="#880e4f" strokeWidth="1" />
        </g>
      </svg>
    );
  };

  const renderCharacterSVG = () => {
    switch (characterId) {
      case 'robot':
        return renderRobot();
      case 'fox':
        return renderFox();
      case 'panda':
        return renderPanda();
      case 'cat':
        return renderCat();
      default:
        return renderRobot();
    }
  };

  // Sparkles or Stars around head for 'correct' and 'celebration'
  const renderExpressionSparks = () => {
    if (expression !== 'correct' && expression !== 'celebration') return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {[1, 2, 3, 4, 5].map((i) => {
          const delay = i * 0.1;
          const left = 20 + i * 15;
          const top = -15 + (i % 2) * 10;
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0, y: 15 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0], y: -30, rotate: 360 }}
              transition={{ duration: 1.2, delay, repeat: Infinity, repeatDelay: 1.5 }}
              className="absolute text-amber-400 font-extrabold text-lg select-none"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              ⭐
            </motion.span>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      variants={characterVariants}
      animate={expression}
      initial="idle"
      className={`relative inline-block select-none origin-bottom ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {renderExpressionSparks()}
      {renderCharacterSVG()}
    </motion.div>
  );
};
