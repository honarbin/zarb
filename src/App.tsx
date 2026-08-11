/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, UserStats } from './types';
import { loadUserStats, saveUserStats, checkBadges } from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PracticeView } from './components/PracticeView';
import { LearnView } from './components/LearnView';
import { SpeedChallengeView } from './components/SpeedChallengeView';
import { RecordsView } from './components/RecordsView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('practice');
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats());
  const [focusedTableForPractice, setFocusedTableForPractice] = useState<number | null>(null);

  // Load and save user stats sync
  useEffect(() => {
    const loaded = loadUserStats();
    const verified = checkBadges(loaded);
    setUserStats(verified);
  }, []);

  const handleUpdateStats = (newStats: UserStats) => {
    const checked = checkBadges(newStats);
    setUserStats(checked);
    saveUserStats(checked);
  };

  const handleToggleSound = () => {
    const updated = { ...userStats, soundEnabled: !userStats.soundEnabled };
    handleUpdateStats(updated);
  };

  const handleStartTablePractice = (tableNum: number) => {
    setFocusedTableForPractice(tableNum);
    setCurrentView('practice');
  };

  const handleStartWeaknessPractice = () => {
    setCurrentView('practice');
  };

  return (
    <div className="min-h-screen bg-amber-50/60 text-slate-800 font-['Vazirmatn',sans-serif] selection:bg-amber-200 flex flex-col dir-rtl">
      
      {/* Header */}
      <Header
        stats={userStats}
        onToggleSound={handleToggleSound}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'practice' && (
          <PracticeView
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onNavigateToLearn={() => setCurrentView('learn')}
          />
        )}

        {currentView === 'learn' && (
          <LearnView
            onStartTablePractice={handleStartTablePractice}
          />
        )}

        {currentView === 'speed' && (
          <SpeedChallengeView
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToMenu={() => setCurrentView('practice')}
          />
        )}

        {currentView === 'records' && (
          <RecordsView
            stats={userStats}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onStartFocusedPractice={handleStartWeaknessPractice}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

    </div>
  );
}
