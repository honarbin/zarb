import React from 'react';
import { Trophy, Flame, Target, Zap, Award, CheckCircle2, XCircle, Percent } from 'lucide-react';
import { UserStats } from '../types';
import { toPersianDigits } from '../utils/persian';

interface RecordsViewProps {
  stats: UserStats;
}

export const RecordsView: React.FC<RecordsViewProps> = ({ stats }) => {
  const totalAnswers = stats.totalCorrect + stats.totalWrong;
  const accuracyPercent =
    totalAnswers > 0 ? Math.round((stats.totalCorrect / totalAnswers) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-3xl p-6 shadow-lg border-4 border-emerald-300 space-y-2">
        <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
          آمار و رکوردهای من
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          تالار افتخارات ضربیار 🏆
        </h2>
        <p className="text-xs text-emerald-100 font-medium leading-relaxed">
          تمام فعالیت‌ها و پیشرفت‌های تو به صورت خودکار ذخیره شده است.
        </p>
      </div>

      {/* Main Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* High Score */}
        <div className="bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm text-right space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-xs text-slate-500 font-bold pt-1">بیشترین امتیاز کل</p>
          <p className="text-2xl font-black text-slate-900">
            {toPersianDigits(stats.totalScore)}
          </p>
        </div>

        {/* Max Streak */}
        <div className="bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm text-right space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-400" />
          </div>
          <p className="text-xs text-slate-500 font-bold pt-1">بیشترین زنجیره متوالی</p>
          <p className="text-2xl font-black text-slate-900">
            {toPersianDigits(stats.maxStreak)} <span className="text-xs text-slate-400">سؤال</span>
          </p>
        </div>

        {/* Best Speed Score */}
        <div className="bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm text-right space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6 text-purple-500 fill-purple-400" />
          </div>
          <p className="text-xs text-slate-500 font-bold pt-1">بهترین رکورد سرعتی</p>
          <p className="text-2xl font-black text-slate-900">
            {toPersianDigits(stats.bestSpeedScore)}
          </p>
        </div>

        {/* Total Practices */}
        <div className="bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm text-right space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6 text-sky-500" />
          </div>
          <p className="text-xs text-slate-500 font-bold pt-1">تعداد کل تمرین‌ها</p>
          <p className="text-2xl font-black text-slate-900">
            {toPersianDigits(stats.totalPractices)}
          </p>
        </div>

      </div>

      {/* Accuracy & Detailed Counters */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600" />
          <span>دقت پاسخ‌دهی کل:</span>
          <span className="text-emerald-600 font-black text-base">
            %{toPersianDigits(accuracyPercent)}
          </span>
        </h3>

        {/* Accuracy Progress Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${accuracyPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] text-emerald-800 font-bold">پاسخ صحیح کل</p>
              <p className="text-lg font-black text-emerald-900">
                {toPersianDigits(stats.totalCorrect)}
              </p>
            </div>
          </div>

          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex items-center gap-2.5">
            <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <p className="text-[11px] text-rose-800 font-bold">پاسخ اشتباه کل</p>
              <p className="text-lg font-black text-rose-900">
                {toPersianDigits(stats.totalWrong)}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
