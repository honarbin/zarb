import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Clock, Trophy, Flame, RotateCcw, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { UserStats, Question } from '../types';
import { toPersianDigits, formatTimePersian, sounds } from '../utils/persian';
import { generateQuestion, recordQuestionResult, saveUserStats, checkBadges } from '../utils/storage';

interface SpeedChallengeProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onBackToMenu: () => void;
}

export const SpeedChallengeView: React.FC<SpeedChallengeProps> = ({ stats, onUpdateStats, onBackToMenu }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null);

  const soundEnabled = stats.soundEnabled;

  // Countdown Timer Hook
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isFinished]);

  // Start Speed Challenge
  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(60);
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setFeedback(null);

    const firstQ = generateQuestion('hard', stats);
    setCurrentQuestion(firstQ);
  };

  // Handle Answer Choice
  const handleAnswer = (option: number) => {
    if (!isPlaying || isFinished || !currentQuestion) return;

    const isCorrect = option === currentQuestion.answer;
    let addedScore = 0;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      addedScore = 10 + Math.min(newCombo * 2, 20); // combo bonus
      setScore((prev) => prev + addedScore);
      setCorrectCount((prev) => prev + 1);

      if (soundEnabled) sounds.playCorrectSound();
      setFeedback({ isCorrect: true });
    } else {
      setCombo(0);
      setWrongCount((prev) => prev + 1);
      if (soundEnabled) sounds.playWrongSound();
      setFeedback({ isCorrect: false });
    }

    // Update table accuracy stats
    const updatedUserStats = recordQuestionResult(
      stats,
      currentQuestion.factor1,
      currentQuestion.factor2,
      isCorrect
    );
    onUpdateStats(updatedUserStats);

    // Next question or finish if reached 30 questions
    if (questionIndex + 1 >= 30) {
      handleFinishGame();
    } else {
      setQuestionIndex((prev) => prev + 1);
      const nextQ = generateQuestion('hard', stats);
      setCurrentQuestion(nextQ);
    }
  };

  // Finish Speed Challenge
  const handleFinishGame = () => {
    setIsFinished(true);
    setIsPlaying(false);

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Save records
    const isNewRecord = score > stats.bestSpeedScore;
    let newStats: UserStats = {
      ...stats,
      bestSpeedScore: Math.max(stats.bestSpeedScore, score),
      totalScore: stats.totalScore + score,
      highScore: Math.max(stats.highScore, stats.totalScore + score),
      maxStreak: Math.max(stats.maxStreak, maxCombo),
    };

    newStats = checkBadges(newStats);
    saveUserStats(newStats);
    onUpdateStats(newStats);
  };

  // Start Screen
  if (!isPlaying && !isFinished) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white rounded-3xl p-6 shadow-xl border-4 border-purple-300 relative overflow-hidden space-y-3">
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
            چالش زمان‌دار ۶۰ ثانیه‌ای
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            مسابقه سرعتی! ⚡
          </h2>
          <p className="text-sm font-medium text-purple-100 leading-relaxed">
            ۳۰ سؤال تصادفی از جدول ضرب ۱ تا ۱۰ در ۶۰ ثانیه! چقدر می‌تونی سریع باشی و رکورد بزنی؟
          </p>
        </div>

        {/* Rule Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 shadow-sm text-right space-y-1">
            <span className="text-2xl">⏱️</span>
            <h3 className="font-extrabold text-sm text-slate-800">زمان محدود</h3>
            <p className="text-xs text-slate-500">کل مسابقه ۶۰ ثانیه زمان داره</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 shadow-sm text-right space-y-1">
            <span className="text-2xl">🔥</span>
            <h3 className="font-extrabold text-sm text-slate-800">پاداش کمبو</h3>
            <p className="text-xs text-slate-500">پاسخ‌های متوالی امتیاز اضافی داره</p>
          </div>
        </div>

        {/* Best Record Display */}
        {stats.bestSpeedScore > 0 && (
          <div className="bg-purple-100/80 border-2 border-purple-300 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-purple-600 fill-purple-300" />
              <div>
                <p className="text-xs font-extrabold text-purple-900">بهترین رکورد سرعتی تو:</p>
                <p className="text-xl font-black text-purple-700">
                  {toPersianDigits(stats.bestSpeedScore)} امتیاز
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Big Start Game Button */}
        <button
          onClick={startGame}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xl py-5 rounded-3xl shadow-xl border-b-4 border-purple-700 flex items-center justify-center gap-3 cursor-pointer transition-transform active:scale-95"
        >
          <Zap className="w-7 h-7 animate-bounce" />
          <span>شروع مسابقه سرعتی</span>
        </button>

      </div>
    );
  }

  // Summary Finished Screen
  if (isFinished) {
    const totalAnswered = correctCount + wrongCount;
    const avgSpeed = totalAnswered > 0 ? (60 / totalAnswered).toFixed(1) : '0';

    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-purple-300 space-y-6"
        >
          <div className="space-y-2">
            <div className="text-5xl animate-bounce">⚡</div>
            <h2 className="text-2xl font-black text-slate-900">پایان مسابقه سرعتی!</h2>
            <p className="text-xs text-slate-500 font-bold">عملکرد فوق‌العاده‌ای در ۶۰ ثانیه داشتی!</p>
          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-2 gap-3 bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <p className="text-xs text-slate-500 font-bold mb-1">امتیاز نهایی</p>
              <p className="text-2xl font-black text-purple-600 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5 text-purple-500 fill-purple-300" />
                {toPersianDigits(score)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm">
              <p className="text-xs text-slate-500 font-bold mb-1">پاسخ‌های صحیح</p>
              <p className="text-2xl font-black text-emerald-600">
                {toPersianDigits(correctCount)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm">
              <p className="text-xs text-slate-500 font-bold mb-1">کل سؤالات پاسخ داده‌شده</p>
              <p className="text-xl font-black text-slate-800">
                {toPersianDigits(totalAnswered)} از ۳۰
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm">
              <p className="text-xs text-slate-500 font-bold mb-1">میانگین سرعت پاسخ</p>
              <p className="text-xl font-black text-indigo-600">
                {toPersianDigits(avgSpeed)} ثانیه / سؤال
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={startGame}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg border-b-4 border-purple-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>تلاش دوباره</span>
            </button>

            <button
              onClick={onBackToMenu}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>منوی اصلی</span>
            </button>
          </div>

        </motion.div>
      </div>
    );
  }

  // Active Challenge Gameplay
  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24 space-y-5">
      
      {/* Top Bar: Timer, Score, Combo */}
      <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-purple-200 flex items-center justify-between">
        
        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-base ${
          timeLeft <= 10 ? 'bg-rose-500 text-white animate-pulse' : 'bg-purple-100 text-purple-900'
        }`}>
          <Clock className="w-5 h-5" />
          <span>{toPersianDigits(timeLeft)} ثانیه</span>
        </div>

        {/* Question Index */}
        <div className="text-xs font-black text-slate-500">
          سؤال {toPersianDigits(questionIndex + 1)} از ۳۰
        </div>

        {/* Combo */}
        <div className="flex items-center gap-1 text-purple-600 font-black text-sm">
          <Flame className={`w-5 h-5 ${combo > 0 ? 'animate-bounce text-orange-500 fill-orange-400' : 'opacity-30'}`} />
          <span>کمبو: {toPersianDigits(combo)}</span>
        </div>

      </div>

      {/* Timer Bar */}
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000 rounded-full"
          style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-purple-300 space-y-5">
        
        {/* Score Display */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>مسابقه سرعتی</span>
          <span className="text-purple-600 font-black text-sm">
            امتیاز: {toPersianDigits(score)}
          </span>
        </div>

        {/* Multiplication Question */}
        <div className="py-4 bg-purple-50 rounded-2xl border-2 border-purple-200/80 shadow-inner">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-wider flex items-center justify-center gap-3 dir-ltr">
            <span>{toPersianDigits(currentQuestion?.factor1 ?? 1)}</span>
            <span className="text-purple-500">×</span>
            <span>{toPersianDigits(currentQuestion?.factor2 ?? 1)}</span>
            <span className="text-slate-400">=</span>
            <span className="text-purple-600 animate-pulse">؟</span>
          </div>
        </div>

        {/* Fast Choices Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {currentQuestion?.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className="py-4 px-4 rounded-2xl text-2xl font-black bg-purple-50 hover:bg-purple-200 text-purple-900 border-2 border-purple-200 shadow transition-transform active:scale-90 cursor-pointer"
            >
              {toPersianDigits(option)}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
