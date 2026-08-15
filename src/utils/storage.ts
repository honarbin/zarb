import { UserStats, DifficultyLevel, Question, WeaknessItem, Badge } from '../types';

const STORAGE_KEY = 'zarbyar_user_data_v1';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_practice',
    title: 'قدم اول 🐾',
    description: 'انجام اولین تمرین جدول ضرب',
    icon: '🎯',
    requiredPractices: 1,
  },
  {
    id: 'streak_5',
    title: 'تمرکز عالی ⚡',
    description: 'پاسخ صحیح به ۵ سؤال متوالی',
    icon: '🔥',
    requiredStreak: 5,
  },
  {
    id: 'streak_10',
    title: 'زنجیره طلایی 🌟',
    description: 'پاسخ صحیح به ۱۰ سؤال متوالی',
    icon: '👑',
    requiredStreak: 10,
  },
  {
    id: 'speed_master',
    title: 'قهرمان سرعت ⚡',
    description: 'کسب بیش از ۱۰۰ امتیاز در مسابقه سرعتی',
    icon: '🚀',
    requiredScore: 100,
  },
  {
    id: 'practice_10',
    title: 'کوشا و قهرمان 📚',
    description: 'تکمیل ۱۰ دوره تمرین',
    icon: '🏆',
    requiredPractices: 10,
  },
  {
    id: 'score_500',
    title: 'استاد ضرب‌بار 🧙‍♂️',
    description: 'رسیدن به مجموع ۵۰۰ امتیاز',
    icon: '⭐',
    requiredScore: 500,
  },
];

export const INITIAL_USER_STATS: UserStats = {
  username: 'قهرمان کوچک',
  avatar: 'fox',
  totalScore: 0,
  highScore: 0,
  maxStreak: 0,
  bestSpeedScore: 0,
  totalPractices: 0,
  totalCorrect: 0,
  totalWrong: 0,
  soundEnabled: true,
  tableStats: {},
  unlockedBadges: ['first_practice'],
  selectedHat: 'none',
  selectedGlasses: 'none',
  selectedAccessory: 'none',
};

export const loadUserStats = (): UserStats => {
  if (typeof window === 'undefined') return INITIAL_USER_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_USER_STATS;
    const data = JSON.parse(raw);
    const stats = { ...INITIAL_USER_STATS, ...data };
    
    // Migrate old emoji avatars to modern character IDs
    const validCharacters = ['robot', 'fox', 'panda', 'cat'];
    if (!validCharacters.includes(stats.avatar)) {
      stats.avatar = 'fox';
    }
    
    if (!stats.selectedHat) stats.selectedHat = 'none';
    if (!stats.selectedGlasses) stats.selectedGlasses = 'none';
    if (!stats.selectedAccessory) stats.selectedAccessory = 'none';
    
    return stats;
  } catch {
    return INITIAL_USER_STATS;
  }
};

export const saveUserStats = (stats: UserStats): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
};

// Record question outcome for adaptive difficulty analytics
export const recordQuestionResult = (
  stats: UserStats,
  f1: number,
  f2: number,
  isCorrect: boolean
): UserStats => {
  const key = `${Math.min(f1, f2)}x${Math.max(f1, f2)}`;
  const current = stats.tableStats[key] || {
    factor1: Math.min(f1, f2),
    factor2: Math.max(f1, f2),
    attempts: 0,
    correct: 0,
    wrong: 0,
  };

  const updatedTableStat = {
    ...current,
    attempts: current.attempts + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
    wrong: current.wrong + (isCorrect ? 0 : 1),
  };

  const newStats: UserStats = {
    ...stats,
    totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
    totalWrong: stats.totalWrong + (isCorrect ? 0 : 1),
    tableStats: {
      ...stats.tableStats,
      [key]: updatedTableStat,
    },
  };

  return newStats;
};

// Check for newly unlocked badges
export const checkBadges = (stats: UserStats): UserStats => {
  const unlocked = new Set(stats.unlockedBadges || []);

  ALL_BADGES.forEach((badge) => {
    if (unlocked.has(badge.id)) return;

    let shouldUnlock = false;
    if (badge.requiredPractices && stats.totalPractices >= badge.requiredPractices) {
      shouldUnlock = true;
    }
    if (badge.requiredStreak && stats.maxStreak >= badge.requiredStreak) {
      shouldUnlock = true;
    }
    if (badge.requiredScore && stats.totalScore >= badge.requiredScore) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      unlocked.add(badge.id);
    }
  });

  return {
    ...stats,
    unlockedBadges: Array.from(unlocked),
  };
};

// Compute Weaknesses (Top multiplication pairs with highest error counts)
export const getWeaknessList = (stats: UserStats): WeaknessItem[] => {
  const items: WeaknessItem[] = [];

  Object.values(stats.tableStats).forEach((item) => {
    if (item.attempts >= 2 && item.wrong > 0) {
      items.push({
        factor1: item.factor1,
        factor2: item.factor2,
        attempts: item.attempts,
        correct: item.correct,
        wrong: item.wrong,
        errorRate: item.wrong / item.attempts,
      });
    }
  });

  // Sort primarily by highest wrong count, then highest error rate
  items.sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate);

  // If child hasn't made mistakes yet or has very few recorded, provide common tricky multiplication defaults
  if (items.length < 3) {
    const defaultTricky = [
      { factor1: 7, factor2: 8 },
      { factor1: 6, factor2: 9 },
      { factor1: 8, factor2: 7 },
      { factor1: 7, factor2: 9 },
      { factor1: 6, factor2: 8 },
    ];

    for (const d of defaultTricky) {
      if (items.length >= 5) break;
      const key = `${Math.min(d.factor1, d.factor2)}x${Math.max(d.factor1, d.factor2)}`;
      if (!items.some((i) => `${i.factor1}x${i.factor2}` === key)) {
        items.push({
          factor1: d.factor1,
          factor2: d.factor2,
          attempts: 0,
          correct: 0,
          wrong: 0,
          errorRate: 0,
        });
      }
    }
  }

  return items;
};

// Adaptive weighted question selection algorithm
export const generateQuestion = (
  level: DifficultyLevel,
  stats: UserStats,
  specificTable?: number
): Question => {
  let minFactor = 1;
  let maxFactor = 10;

  if (specificTable) {
    minFactor = specificTable;
    maxFactor = specificTable;
  } else if (level === 'easy') {
    minFactor = 1;
    maxFactor = 5;
  } else if (level === 'medium') {
    minFactor = 1;
    maxFactor = 7;
  } else if (level === 'hard') {
    minFactor = 1;
    maxFactor = 10;
  } else if (level === 'weaknesses') {
    const weaknesses = getWeaknessList(stats);
    if (weaknesses.length > 0) {
      const picked = weaknesses[Math.floor(Math.random() * Math.min(weaknesses.length, 5))];
      // Randomly decide order (e.g. 7x8 or 8x7)
      const flip = Math.random() > 0.5;
      const f1 = flip ? picked.factor1 : picked.factor2;
      const f2 = flip ? picked.factor2 : picked.factor1;
      return createQuestionWithChoices(f1, f2);
    }
  }

  // Generate potential candidates
  const pool: { f1: number; f2: number; weight: number }[] = [];

  for (let f1 = minFactor; f1 <= maxFactor; f1++) {
    for (let f2 = 1; f2 <= 10; f2++) {
      const key = `${Math.min(f1, f2)}x${Math.max(f1, f2)}`;
      const stat = stats.tableStats[key];
      let weight = 1;

      if (stat && stat.attempts > 0) {
        // Higher weight if wrong answers are frequent
        const wrongRatio = stat.wrong / stat.attempts;
        weight += stat.wrong * 2 + wrongRatio * 3;
      } else {
        // Unattempted questions get a slightly higher weight to encourage learning
        weight = 1.5;
      }

      pool.push({ f1, f2, weight });
    }
  }

  // Weighted random pick
  const totalWeight = pool.reduce((acc, curr) => acc + curr.weight, 0);
  let randomVal = Math.random() * totalWeight;

  let selected = pool[0];
  for (const item of pool) {
    if (randomVal <= item.weight) {
      selected = item;
      break;
    }
    randomVal -= item.weight;
  }

  return createQuestionWithChoices(selected.f1, selected.f2);
};

// Generate 4 plausible multiple choice options (including correct answer)
const createQuestionWithChoices = (f1: number, f2: number): Question => {
  const correctAnswer = f1 * f2;
  const optionsSet = new Set<number>();
  optionsSet.add(correctAnswer);

  // Generate plausible distractors close to correct answer
  const possibleDistractors = [
    correctAnswer + f1,
    correctAnswer - f1,
    correctAnswer + f2,
    correctAnswer - f2,
    correctAnswer + 10,
    correctAnswer - 10,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    (f1 + 1) * f2,
    (f1 - 1) * f2,
  ];

  // Shuffle distractors
  possibleDistractors.sort(() => Math.random() - 0.5);

  for (const d of possibleDistractors) {
    if (optionsSet.size >= 4) break;
    if (d > 0 && d <= 100 && d !== correctAnswer) {
      optionsSet.add(d);
    }
  }

  // Fallback random choices if set < 4
  while (optionsSet.size < 4) {
    const randomDistractor = Math.max(1, correctAnswer + Math.floor(Math.random() * 20) - 10);
    if (randomDistractor !== correctAnswer) {
      optionsSet.add(randomDistractor);
    }
  }

  const options = Array.from(optionsSet);
  // Shuffle options so correct answer is in random position
  options.sort(() => Math.random() - 0.5);

  return {
    factor1: f1,
    factor2: f2,
    answer: correctAnswer,
    options,
  };
};
