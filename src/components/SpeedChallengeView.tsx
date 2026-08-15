import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Clock,
  Trophy,
  Flame,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Check,
  Grid,
  BookOpen,
  RefreshCw,
  Star,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { UserStats, Question } from '../types';
import { toPersianDigits, sounds } from '../utils/persian';
import {
  generateQuestion,
  recordQuestionResult,
  saveUserStats,
  checkBadges,
  createQuestionWithChoices,
} from '../utils/storage';
import { MathFormula } from './MathFormula';
import { GameCharacter } from './GameCharacter';

export interface SpeedMistake {
  factor1: number;
  factor2: number;
  userAnswer: number;
  correctAnswer: number;
}

interface SpeedChallengeProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onBackToMenu: () => void;
}

const POSITIVE_MESSAGES = ['آفرین! 👏', 'عالی بود! ⭐', 'درست گفتی! 🚀', 'فوق‌العاده! 🌟', 'بی‌نظیر! 🔥'];

export const SpeedChallengeView: React.FC<SpeedChallengeProps> = ({
  stats,
  onUpdateStats,
  onBackToMenu,
}) => {
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

  // Instant inline feedback during gameplay
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    selectedOption: number;
    correctAnswer: number;
    message: string;
  } | null>(null);

  // List of mistakes recorded during the speed challenge
  const [mistakes, setMistakes] = useState<SpeedMistake[]>([]);

  // Retry mistakes practice mode state
  const [isReviewingMistakes, setIsReviewingMistakes] = useState<boolean>(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [reviewFeedback, setReviewFeedback] = useState<{
    isCorrect: boolean;
    selectedOption: number;
  } | null>(null);
  const [reviewCompleted, setReviewCompleted] = useState<boolean>(false);

  // Selected tables for speed challenge: default all 1 to 10
  const [selectedTables, setSelectedTables] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);

  const soundEnabled = stats.soundEnabled;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Toggle table selection
  const handleToggleTable = (num: number) => {
    if (selectedTables.includes(num)) {
      if (selectedTables.length > 1) {
        setSelectedTables(selectedTables.filter((t) => t !== num));
      }
    } else {
      setSelectedTables([...selectedTables, num].sort((a, b) => a - b));
    }
  };

  // Preset selectors
  const handleSelectAll = () => {
    setSelectedTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  };

  const handleSelectRange = (from: number, to: number) => {
    const range: number[] = [];
    for (let i = from; i <= to; i++) range.push(i);
    setSelectedTables(range);
  };

  const getSelectionDescription = () => {
    if (selectedTables.length === 10) {
      return 'تمام جدول‌های ۱ تا ۱۰';
    }
    if (selectedTables.length === 1) {
      return `فقط جدول ${toPersianDigits(selectedTables[0])}`;
    }
    return `جدول‌های ${selectedTables.map((t) => toPersianDigits(t)).join('، ')}`;
  };

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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
    setMistakes([]);
    setIsReviewingMistakes(false);
    setReviewCompleted(false);

    const firstQ = generateQuestion('hard', stats, selectedTables);
    setCurrentQuestion(firstQ);
  };

  // Handle Answer Choice in Speed Game
  const handleAnswer = (option: number) => {
    if (!isPlaying || isFinished || !currentQuestion || feedback) return;

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
      const msg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
      setFeedback({
        isCorrect: true,
        selectedOption: option,
        correctAnswer: currentQuestion.answer,
        message: msg,
      });
    } else {
      setCombo(0);
      setWrongCount((prev) => prev + 1);
      if (soundEnabled) sounds.playWrongSound();

      // Record mistake for review and smart practice
      const newMistake: SpeedMistake = {
        factor1: currentQuestion.factor1,
        factor2: currentQuestion.factor2,
        userAnswer: option,
        correctAnswer: currentQuestion.answer,
      };
      setMistakes((prev) => [...prev, newMistake]);

      setFeedback({
        isCorrect: false,
        selectedOption: option,
        correctAnswer: currentQuestion.answer,
        message: `اشکالی نداره! پاسخ درست: ${toPersianDigits(currentQuestion.answer)} 🌱`,
      });
    }

    // Update table accuracy stats (connects directly to smart review weaknesses)
    const updatedUserStats = recordQuestionResult(
      stats,
      currentQuestion.factor1,
      currentQuestion.factor2,
      isCorrect
    );
    onUpdateStats(updatedUserStats);

    // Transition timing: snappy 350ms for correct, 750ms for wrong so correct answer is clearly seen
    const transitionDelay = isCorrect ? 350 : 750;

    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      if (questionIndex + 1 >= 30) {
        handleFinishGame();
      } else {
        setQuestionIndex((prev) => prev + 1);
        const nextQ = generateQuestion('hard', stats, selectedTables);
        setCurrentQuestion(nextQ);
      }
    }, transitionDelay);
  };

  // Finish Speed Challenge
  const handleFinishGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsFinished(true);
    setIsPlaying(false);
    setFeedback(null);

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Save records
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

  // Start Retry Mistakes Practice Mode
  const handleStartReviewPractice = () => {
    if (mistakes.length === 0) return;
    // Shuffle the mistakes to avoid static order
    const shuffledMistakes = [...mistakes].sort(() => Math.random() - 0.5);
    const questions = shuffledMistakes.map((m) =>
      createQuestionWithChoices(m.factor1, m.factor2)
    );
    setReviewQuestions(questions);
    setReviewIndex(0);
    setReviewFeedback(null);
    setReviewCompleted(false);
    setIsReviewingMistakes(true);
  };

  // Handle Answer in Mistakes Practice Mode
  const handleReviewAnswer = (option: number) => {
    if (reviewFeedback || reviewCompleted) return;
    const currentQ = reviewQuestions[reviewIndex];
    if (!currentQ) return;

    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      if (soundEnabled) sounds.playCorrectSound();
      setReviewFeedback({ isCorrect: true, selectedOption: option });
    } else {
      if (soundEnabled) sounds.playWrongSound();
      setReviewFeedback({ isCorrect: false, selectedOption: option });
    }

    // Also update stats so practice counts towards learning
    const updated = recordQuestionResult(stats, currentQ.factor1, currentQ.factor2, isCorrect);
    onUpdateStats(updated);

    const delay = isCorrect ? 450 : 850;
    setTimeout(() => {
      setReviewFeedback(null);
      if (reviewIndex + 1 >= reviewQuestions.length) {
        setReviewCompleted(true);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        setReviewIndex((prev) => prev + 1);
      }
    }, delay);
  };

  // ----------------------------------------------------
  // VIEW: RETRY MISTAKES PRACTICE MODE
  // ----------------------------------------------------
  if (isReviewingMistakes) {
    const currentQ = reviewQuestions[reviewIndex];

    if (reviewCompleted) {
      return (
        <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-emerald-300 space-y-6"
          >
            <div className="flex justify-center pb-1">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression="celebration"
                size="lg"
                hat={stats.selectedHat}
                glasses={stats.selectedGlasses}
                accessory={stats.selectedAccessory}
              />
            </div>

            <div className="space-y-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                آفرین قهرمان! 🌟
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                همه اشتباه‌ها رو با موفقیت یاد گرفتی! 🎉
              </h2>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                تمام سؤال‌هایی که اشتباه کرده بودی رو با تمرین دوباره مسلط شدی. حالا آماده‌ای تا در مسابقه بعدی رکورد بهتری بزنی!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg border-b-4 border-purple-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <Zap className="w-5 h-5" />
                <span>شروع چالش سرعتی جدید</span>
              </button>

              <button
                onClick={() => setIsReviewingMistakes(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-4 px-4 rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                <span>بازگشت به کارنامه</span>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 font-black text-sm">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>تمرین و مرور اشتباهات</span>
          </div>

          <div className="text-xs font-black text-slate-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            سؤال {toPersianDigits(reviewIndex + 1)} از {toPersianDigits(reviewQuestions.length)}
          </div>

          <button
            onClick={() => setIsReviewingMistakes(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1"
          >
            خروج از تمرین
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${((reviewIndex + (reviewFeedback ? 1 : 0)) / reviewQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-xl border-4 border-amber-300 space-y-5">
            <div className="flex justify-center -mt-1 pb-1">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression={
                  reviewFeedback
                    ? reviewFeedback.isCorrect
                      ? 'celebration'
                      : 'thinking'
                    : 'idle'
                }
                size="md"
                hat={stats.selectedHat}
                glasses={stats.selectedGlasses}
                accessory={stats.selectedAccessory}
              />
            </div>

            {/* Hint / Support Label */}
            <p className="text-xs font-bold text-amber-800 bg-amber-50 py-1.5 px-3 rounded-full inline-block border border-amber-200">
              این ضرب را با دقت پاسخ بده 🌱
            </p>

            {/* Math Formula Display */}
            <div className="py-4 bg-amber-50/70 rounded-2xl border-2 border-amber-200 shadow-inner flex justify-center items-center">
              <MathFormula
                factor1={currentQ.factor1}
                factor2={currentQ.factor2}
                answer={reviewFeedback ? currentQ.answer : '؟'}
                className="text-slate-900 tracking-wider"
                symbolColor="text-amber-500"
                size="display"
              />
            </div>

            {/* Multiple Choices Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = reviewFeedback?.selectedOption === option;
                const isTheCorrectAnswer = option === currentQ.answer;

                let btnClass = 'bg-amber-50/80 hover:bg-amber-100 text-amber-950 border-amber-200';

                if (reviewFeedback) {
                  if (isTheCorrectAnswer) {
                    btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-102';
                  } else if (isSelected && !reviewFeedback.isCorrect) {
                    btnClass = 'bg-rose-100 text-rose-800 border-rose-400 opacity-90';
                  } else {
                    btnClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!reviewFeedback}
                    onClick={() => handleReviewAnswer(option)}
                    className={`py-4 px-4 rounded-2xl typo-math-large border-2 shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${btnClass}`}
                  >
                    <span>{toPersianDigits(option)}</span>
                    {reviewFeedback && isTheCorrectAnswer && (
                      <CheckCircle className="w-5 h-5 text-white animate-bounce shrink-0" />
                    )}
                    {reviewFeedback && isSelected && !reviewFeedback.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: START SCREEN & TABLE SELECTOR
  // ----------------------------------------------------
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
            ۳۰ سؤال در ۶۰ ثانیه! جدول‌های مورد نظرت را انتخاب کن، سریع پاسخ بده و رکورد بزن!
          </p>
        </div>

        {/* Table Selection Panel */}
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-200 shadow-md space-y-4 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Grid className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  انتخاب جدول‌ها برای چالش
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  می‌توانی یک جدول، چند جدول یا همه را انتخاب کنی
                </p>
              </div>
            </div>

            {/* Current Selection summary pill */}
            <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-xl self-start sm:self-auto border border-purple-200">
              {toPersianDigits(selectedTables.length)} جدول فعال
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSelectAll}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedTables.length === 10
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ✨ همه جدول‌ها (۱ تا ۱۰)
            </button>

            <button
              onClick={() => handleSelectRange(1, 5)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedTables.length === 5 && selectedTables.every((t) => t <= 5)
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🌱 پایه (۱ تا ۵)
            </button>

            <button
              onClick={() => handleSelectRange(6, 10)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedTables.length === 5 && selectedTables.every((t) => t >= 6)
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🔥 پیشرفته (۶ تا ۱۰)
            </button>
          </div>

          {/* Grid of 10 Tables (5 columns) */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedTables.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleToggleTable(num)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-400 shadow-md ring-2 ring-purple-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                  title={`جدول ${toPersianDigits(num)}`}
                >
                  <span
                    className={`text-base sm:text-lg font-black leading-tight ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {toPersianDigits(num)}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-purple-100' : 'text-slate-400'
                    }`}
                  >
                    جدول
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active selection note */}
          <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200 flex items-center gap-2 text-xs font-bold text-purple-900">
            <span className="text-sm">🎯</span>
            <span>
              محدوده سؤال‌ها:{' '}
              <strong className="font-black text-purple-700">
                {getSelectionDescription()}
              </strong>
            </span>
          </div>
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
                <p className="text-xs font-extrabold text-purple-900">
                  بهترین رکورد سرعتی تو:
                </p>
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
          <span>شروع چالش سرعتی</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: FINISHED / RESULTS & MISTAKES REVIEW SCREEN
  // ----------------------------------------------------
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
            <div className="flex justify-center pb-2">
              <GameCharacter
                characterId={(stats.avatar as any) || 'fox'}
                expression="celebration"
                size="lg"
                hat={stats.selectedHat}
                glasses={stats.selectedGlasses}
                accessory={stats.selectedAccessory}
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900">پایان مسابقه سرعتی!</h2>
            <p className="text-xs text-slate-500 font-bold">
              عملکرد فوق‌العاده‌ای در ۶۰ ثانیه داشتی!
            </p>
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

          {/* Active selection in summary */}
          <div className="text-xs font-bold text-slate-500 bg-slate-50 py-2 px-3 rounded-xl border border-slate-200">
            تمرین انجام‌شده در: {getSelectionDescription()}
          </div>

          {/* ----------------------------------------------- */}
          {/* MISTAKES REVIEW SECTION (Rule 3, 4, 5)          */}
          {/* ----------------------------------------------- */}
          {mistakes.length === 0 ? (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-5 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-emerald-600 fill-emerald-200" />
              </div>
              <h3 className="font-black text-emerald-900 text-base">
                فوق‌العاده است! بدون هیچ اشتباهی! 🌟
              </h3>
              <p className="text-xs text-emerald-700 font-bold">
                تمام سؤال‌هایی که پاسخ دادی ۱۰۰٪ درست بود. عالی تلاش کردی!
              </p>
            </div>
          ) : (
            <div className="bg-amber-50/60 rounded-3xl p-4 sm:p-5 border-2 border-amber-200 text-right space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">
                      اشتباه‌هات رو مرور کنیم 💡
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      با مرور این ضرب‌ها، دفعه بعد بدون اشتباه رکورد می‌زنی!
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-black text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-xl border border-amber-300 shrink-0">
                  {toPersianDigits(mistakes.length)} سؤال نیاز به مرور
                </span>
              </div>

              {/* Cards List of Mistakes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between gap-2"
                  >
                    {/* Math Expression */}
                    <div className="font-black text-base text-slate-800 flex items-center gap-1.5 typo-math-medium">
                      <span className="text-purple-600">
                        {toPersianDigits(m.factor1)} × {toPersianDigits(m.factor2)}
                      </span>
                      <span className="text-slate-400">=</span>
                    </div>

                    {/* Comparison Chips */}
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {/* User's wrong answer */}
                      <span
                        className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-xl flex items-center gap-1"
                        title="پاسخ شما"
                      >
                        <span className="text-[10px] text-rose-500">شما:</span>
                        <span className="font-black typo-math-small line-through decoration-rose-400">
                          {toPersianDigits(m.userAnswer)}
                        </span>
                      </span>

                      {/* Correct answer */}
                      <span
                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-xl flex items-center gap-1 font-black"
                        title="پاسخ درست"
                      >
                        <span className="text-[10px] text-emerald-600">درست:</span>
                        <span className="typo-math-small text-emerald-700">
                          {toPersianDigits(m.correctAnswer)}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Retry Mistakes Button */}
              <button
                onClick={handleStartReviewPractice}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-md border-b-4 border-amber-700 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
                <span>دوباره تمرین کنیم (مرور {toPersianDigits(mistakes.length)} اشتباه)</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={startGame}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg border-b-4 border-purple-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>تلاش دوباره مسابقه</span>
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

  // ----------------------------------------------------
  // VIEW: ACTIVE CHALLENGE GAMEPLAY
  // ----------------------------------------------------
  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24 space-y-5">
      {/* Top Bar: Timer, Score, Combo */}
      <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-purple-200 flex items-center justify-between">
        {/* Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-base ${
            timeLeft <= 10
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-purple-100 text-purple-900'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{toPersianDigits(timeLeft)} ثانیه</span>
        </div>

        {/* Question Index */}
        <div className="text-xs font-black text-slate-500">
          سؤال {toPersianDigits(questionIndex + 1)} از ۳۰
        </div>

        {/* Combo */}
        <div className="flex items-center gap-1 text-purple-600 font-black text-sm">
          <Flame
            className={`w-5 h-5 ${
              combo > 0 ? 'animate-bounce text-orange-500 fill-orange-400' : 'opacity-30'
            }`}
          />
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
        {/* Dynamic Interactive Character Companion */}
        <div className="flex justify-center -mt-1 pb-1">
          <GameCharacter
            characterId={(stats.avatar as any) || 'fox'}
            expression={
              feedback
                ? feedback.isCorrect
                  ? combo >= 3
                    ? 'celebration'
                    : 'correct'
                  : 'thinking'
                : combo > 3
                ? 'cheering'
                : 'idle'
            }
            size="md"
            hat={stats.selectedHat}
            glasses={stats.selectedGlasses}
            accessory={stats.selectedAccessory}
          />
        </div>

        {/* Score & Feedback Toast */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 min-h-[22px]">
          {feedback ? (
            <span
              className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                feedback.isCorrect
                  ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {feedback.message}
            </span>
          ) : (
            <span>مسابقه سرعتی</span>
          )}

          <span className="text-purple-600 font-black text-sm">
            امتیاز: {toPersianDigits(score)}
          </span>
        </div>

        {/* Multiplication Question */}
        <div className="py-4 bg-purple-50 rounded-2xl border-2 border-purple-200/80 shadow-inner flex justify-center items-center">
          <MathFormula
            factor1={currentQuestion?.factor1 ?? 1}
            factor2={currentQuestion?.factor2 ?? 1}
            answer={
              feedback ? currentQuestion?.answer ?? '؟' : '؟'
            }
            className="text-slate-900 tracking-wider"
            symbolColor="text-purple-500"
            size="display"
          />
        </div>

        {/* Fast Choices Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = feedback?.selectedOption === option;
            const isTheCorrectAnswer = option === currentQuestion.answer;

            let btnStyle =
              'bg-purple-50 hover:bg-purple-200 text-purple-900 border-purple-200';

            if (feedback) {
              if (isTheCorrectAnswer) {
                btnStyle =
                  'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-102';
              } else if (isSelected && !feedback.isCorrect) {
                btnStyle =
                  'bg-rose-100 text-rose-800 border-rose-400 line-through decoration-rose-500 opacity-90';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                disabled={!!feedback}
                onClick={() => handleAnswer(option)}
                className={`py-4 px-4 rounded-2xl typo-math-large border-2 shadow transition-all active:scale-90 cursor-pointer flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{toPersianDigits(option)}</span>
                {feedback && isTheCorrectAnswer && (
                  <Check className="w-5 h-5 text-white animate-bounce shrink-0" />
                )}
                {feedback && isSelected && !feedback.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

