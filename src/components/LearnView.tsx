import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Volume2, ArrowRight, Grid, Sparkles, Play, CheckCircle } from 'lucide-react';
import { toPersianDigits, sounds } from '../utils/persian';

interface LearnViewProps {
  onStartTablePractice: (tableNum: number) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onStartTablePractice }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeVisualPair, setActiveVisualPair] = useState<{ f1: number; f2: number } | null>(null);

  // Read row aloud in Persian
  const handleSpeakRow = (f1: number, f2: number) => {
    const text = `${toPersianDigits(f1)} ضرب در ${toPersianDigits(f2)} می‌شود ${toPersianDigits(f1 * f2)}`;
    sounds.speakPersian(text);
  };

  // Table Cards Overview
  if (selectedTable === null) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white rounded-3xl p-6 shadow-lg border-4 border-sky-300 relative overflow-hidden space-y-2">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
            جدول‌های ۱ تا ۱۰
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            کدام جدول ضرب رو می‌خواهی یاد بگیری؟ 📖
          </h2>
          <p className="text-xs text-sky-100 font-medium leading-relaxed">
            یک کارت را انتخاب کن تا جدول ضرب آن را با توضیحات تصویری و صوتی ببینی.
          </p>
        </div>

        {/* 1 to 10 Table Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const bgColors = [
              'bg-emerald-500 border-emerald-600',
              'bg-amber-500 border-amber-600',
              'bg-sky-500 border-sky-600',
              'bg-purple-500 border-purple-600',
              'bg-rose-500 border-rose-600',
              'bg-teal-500 border-teal-600',
              'bg-indigo-500 border-indigo-600',
              'bg-orange-500 border-orange-600',
              'bg-cyan-500 border-cyan-600',
              'bg-violet-500 border-violet-600',
            ];
            const colorClass = bgColors[(num - 1) % bgColors.length];

            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedTable(num);
                  setActiveVisualPair({ f1: num, f2: 1 });
                }}
                className={`p-5 rounded-2xl ${colorClass} text-white shadow-md border-b-4 text-right flex flex-col justify-between cursor-pointer group h-32 relative overflow-hidden`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-3xl font-black text-white drop-shadow">
                    جدول {toPersianDigits(num)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    📖
                  </div>
                </div>

                <div className="text-[11px] font-extrabold text-white/90 bg-black/10 px-2.5 py-1 rounded-xl w-max">
                  مشاهده ۱۰ ضرب ←
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>
    );
  }

  // Selected Table Detail View
  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-5">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedTable(null)}
          className="flex items-center gap-1 text-slate-700 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-2xl border-2 border-slate-200 font-bold text-xs shadow-sm cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به لیست جدول‌ها</span>
        </button>

        <button
          onClick={() => onStartTablePractice(selectedTable)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-2xl font-black text-xs shadow-md border-b-2 border-amber-600 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-900" />
          <span>تمرین جدول {toPersianDigits(selectedTable)}</span>
        </button>
      </div>

      {/* Table Title Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-5 shadow-lg border-4 border-sky-300 flex items-center justify-between">
        <div>
          <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
            یادگیری دقیق
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            جدول ضرب {toPersianDigits(selectedTable)} 🌟
          </h2>
        </div>
        <div className="text-4xl bg-white/10 p-3 rounded-2xl">
          {toPersianDigits(selectedTable)}×
        </div>
      </div>

      {/* Visual Dot Grid Demonstrator (Interactive Matrix) */}
      {activeVisualPair && (
        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-sky-200 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700">
            <Grid className="w-4 h-4 text-sky-500" />
            <span>
              نمایش تصویری ضرب:{' '}
              <strong className="text-sky-600 text-sm">
                {toPersianDigits(activeVisualPair.f1)} دسته‌ی {toPersianDigits(activeVisualPair.f2)}‌تایی
              </strong>{' '}
              = {toPersianDigits(activeVisualPair.f1 * activeVisualPair.f2)}
            </span>
          </div>

          {/* Render Dot Grid */}
          <div className="bg-sky-50/80 p-3 rounded-xl border border-sky-100 flex flex-col items-center justify-center gap-1.5 max-h-48 overflow-y-auto">
            {Array.from({ length: Math.min(activeVisualPair.f1, 10) }).map((_, r) => (
              <div key={r} className="flex gap-1.5">
                {Array.from({ length: Math.min(activeVisualPair.f2, 10) }).map((_, c) => (
                  <motion.div
                    key={c}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (r * 10 + c) * 0.01 }}
                    className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs"
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multiplication Items List */}
      <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-sky-200 divide-y divide-slate-100">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((f2) => {
          const result = selectedTable * f2;
          const isSelectedPair = activeVisualPair?.f1 === selectedTable && activeVisualPair?.f2 === f2;

          return (
            <div
              key={f2}
              onClick={() => setActiveVisualPair({ f1: selectedTable, f2 })}
              className={`py-3 px-3 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                isSelectedPair ? 'bg-sky-100/80 border-2 border-sky-300 shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              {/* Formula */}
              <div className="flex items-center gap-3 dir-ltr text-lg font-black text-slate-800">
                <span className="w-8 text-center text-sky-600 font-extrabold">{toPersianDigits(selectedTable)}</span>
                <span className="text-slate-400">×</span>
                <span className="w-8 text-center text-slate-700">{toPersianDigits(f2)}</span>
                <span className="text-slate-400">=</span>
                <span className="text-emerald-600 font-black text-xl">{toPersianDigits(result)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeakRow(selectedTable, f2);
                  }}
                  className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-200 text-sky-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="خواندن صوتی"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVisualPair({ f1: selectedTable, f2 });
                  }}
                  className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-xl"
                >
                  نمایش اشکال
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
