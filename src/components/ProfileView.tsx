import React, { useState } from 'react';
import { User, Award, BrainCircuit, Edit2, Check, Sparkles, AlertCircle, Play } from 'lucide-react';
import { UserStats, Badge, DifficultyLevel } from '../types';
import { toPersianDigits, sounds } from '../utils/persian';
import { MathFormula } from './MathFormula';
import { ALL_BADGES, getWeaknessList, saveUserStats } from '../utils/storage';

interface ProfileViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onStartFocusedPractice: () => void;
}

const AVATARS = ['🦁', '🦸', '🚀', '🐻', '🐱', '🦉', '🤖', '🌟'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  onUpdateStats,
  onStartFocusedPractice,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(stats.username || 'قهرمان کوچک');

  const weaknesses = getWeaknessList(stats);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = { ...stats, username: nameInput.trim() };
    saveUserStats(updated);
    onUpdateStats(updated);
    setIsEditingName(false);
  };

  const handleSelectAvatar = (av: string) => {
    const updated = { ...stats, avatar: av };
    saveUserStats(updated);
    onUpdateStats(updated);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white rounded-3xl p-6 shadow-lg border-4 border-rose-300 space-y-4 text-center relative overflow-hidden">
        
        {/* Avatar Selection Circle */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-3xl bg-white text-5xl flex items-center justify-center shadow-md border-4 border-rose-200 animate-pulse-subtle">
            {stats.avatar || '🦁'}
          </div>

          {/* Username Input or Display */}
          <div className="flex items-center justify-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-white/20 p-1 rounded-2xl">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-white text-slate-900 font-bold px-3 py-1 rounded-xl text-center text-sm w-36 outline-none"
                  maxLength={15}
                />
                <button
                  onClick={handleSaveName}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-xl cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{stats.username}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="bg-white/20 hover:bg-white/30 p-1.5 rounded-xl text-white cursor-pointer transition-colors"
                  title="ویرایش نام"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avatars Picker Row */}
        <div className="pt-2 border-t border-white/20">
          <p className="text-[11px] font-bold text-rose-100 mb-2">انتخاب تصویر پروفایل:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => handleSelectAvatar(av)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-transform cursor-pointer ${
                  stats.avatar === av
                    ? 'bg-white scale-110 shadow-md ring-2 ring-rose-300'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Sound & Audio Settings Section */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-indigo-200 space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <h3 className="font-black text-base">تنظیمات صدا و گوینده 🔊</h3>
          </div>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-1 rounded-full">
            فارسی معیّار کودکان
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div>
              <h4 className="font-bold text-xs text-slate-800">فعال بودن سیستم صوتی</h4>
              <p className="text-[11px] text-slate-500">پخش افکت‌ها و خواندن ضرب‌ها به زبان فارسی</p>
            </div>
            <button
              onClick={() => {
                const updated = { ...stats, soundEnabled: !stats.soundEnabled };
                saveUserStats(updated);
                onUpdateStats(updated);
              }}
              className={`px-4 py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                stats.soundEnabled
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {stats.soundEnabled ? 'روشن 🔊' : 'خاموش 🔇'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
            <div>
              <h4 className="font-bold text-xs text-slate-800">تست صدای گوینده کودکانه</h4>
              <p className="text-[11px] text-slate-500">پخش پیام تشویقی نمونه</p>
            </div>
            <button
              onClick={() => {
                sounds.playCorrectSound();
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-black text-xs cursor-pointer shadow-xs"
            >
              پخش نمونه 🎵
            </button>
          </div>
        </div>
      </div>

      {/* Weaknesses Analysis Section (ضعف‌های من) */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-3 border-rose-200 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2 text-rose-900">
            <BrainCircuit className="w-6 h-6 text-rose-600" />
            <h3 className="font-black text-base">ضعف‌های من (تحلیل عملکرد)</h3>
          </div>
          <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-1 rounded-full">
            ⭐ نیاز به تمرین بیشتر
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          سیستم بر اساس پاسخ‌های صحیح و اشتباه، ضرب‌هایی را که در آن‌ها نیاز به دقت بیشتر داری شناسایی کرده است:
        </p>

        {/* Weaknesses List */}
        <div className="space-y-2.5">
          {weaknesses.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-rose-50/80 border-2 border-rose-200 p-3.5 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-rose-600">⭐</span>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 flex items-center justify-end dir-ltr">
                    <MathFormula factor1={item.factor1} factor2={item.factor2} />
                  </span>
                  <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                    تلاش: {toPersianDigits(item.attempts)} | صحیح: {toPersianDigits(item.correct)} | غلط: {toPersianDigits(item.wrong)}
                  </p>
                </div>
              </div>

              <div className="text-xs bg-rose-200 text-rose-900 font-black px-2.5 py-1 rounded-xl">
                نیاز به تمرین
              </div>
            </div>
          ))}
        </div>

        {/* Targeted Practice Action */}
        <button
          onClick={onStartFocusedPractice}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3 px-4 rounded-2xl shadow-md border-b-4 border-rose-700 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>تمرین تمرکزی روی این ضرب‌ها</span>
        </button>
      </div>

      {/* Badges & Medals Section */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-amber-200 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-amber-100 pb-3">
          <Award className="w-6 h-6 text-amber-500 fill-amber-300" />
          <h3 className="font-black text-base">مدال‌ها و افتخارات کسب‌شده</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = (stats.unlockedBadges || []).includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl shrink-0">{badge.icon}</div>
                <div className="text-right">
                  <h4 className="font-black text-xs text-slate-900 flex items-center gap-1">
                    {badge.title}
                    {isUnlocked && <span className="text-[10px] text-emerald-600 font-bold">✓ کسب‌شده</span>}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
