/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, UserStats } from './types';
import { loadUserStats, saveUserStats, checkBadges } from './utils/storage';
import { sounds } from './utils/persian';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PracticeView } from './components/PracticeView';
import { LearnView } from './components/LearnView';
import { ConceptView } from './components/ConceptView';
import { TricksView } from './components/TricksView';
import { SpeedChallengeView } from './components/SpeedChallengeView';
import { RecordsView } from './components/RecordsView';
import { ProfileView } from './components/ProfileView';
import { AudioDiagnosticPanel } from './components/AudioDiagnosticPanel';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('concept');
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats());
  const [focusedTableForPractice, setFocusedTableForPractice] = useState<number | null>(null);

  // View keys to force remount of subview state when top-level nav is tapped
  const [viewKeys, setViewKeys] = useState<Record<AppView, number>>({
    concept: 0,
    tricks: 0,
    practice: 0,
    learn: 0,
    speed: 0,
    records: 0,
    profile: 0,
  });

  // Load and save user stats sync & audio setup
  useEffect(() => {
    const loaded = loadUserStats();
    const verified = checkBadges(loaded);
    setUserStats(verified);
    sounds.setSettings(verified.soundEnabled);
    sounds.preloadKeyAudio();
  }, []);

  // Update sound settings whenever soundEnabled changes
  useEffect(() => {
    sounds.setSettings(userStats.soundEnabled);
  }, [userStats.soundEnabled]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, viewKeys]);

  const handleUpdateStats = (newStats: UserStats) => {
    const checked = checkBadges(newStats);
    setUserStats(checked);
    saveUserStats(checked);
  };

  const handleToggleSound = () => {
    if (userStats.soundEnabled) {
      sounds.stopSpeech();
    }
    const updated = { ...userStats, soundEnabled: !userStats.soundEnabled };
    handleUpdateStats(updated);
  };

  const handleNavigate = (view: AppView) => {
    // Increment view key so any active subview/detail state resets to root
    setViewKeys((prev) => ({
      ...prev,
      [view]: prev[view] + 1,
    }));
    setCurrentView(view);
  };

  const handleStartTablePractice = (tableNum: number) => {
    setFocusedTableForPractice(tableNum);
    handleNavigate('practice');
  };

  const handleStartWeaknessPractice = () => {
    handleNavigate('practice');
  };

  return (
    <div className="min-h-screen bg-amber-50/60 text-slate-800 font-['Estedad',sans-serif] selection:bg-amber-200 flex flex-col dir-rtl">
      
      {/* Header */}
      <Header
        stats={userStats}
        onToggleSound={handleToggleSound}
        onNavigate={handleNavigate}
      />

      {/* Audio Diagnostic Panel */}
      <div className="max-w-4xl mx-auto px-4 w-full">
        <AudioDiagnosticPanel />
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'concept' && (
          <ConceptView
            key={`concept-${viewKeys.concept}`}
            stats={userStats}
            onStartTablePractice={handleStartTablePractice}
            onNavigateToPractice={() => handleNavigate('practice')}
          />
        )}

        {currentView === 'tricks' && (
          <TricksView
            key={`tricks-${viewKeys.tricks}`}
            onNavigateToPractice={() => handleNavigate('practice')}
          />
        )}

        {currentView === 'practice' && (
          <PracticeView
            key={`practice-${viewKeys.practice}`}
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onNavigateToLearn={() => handleNavigate('learn')}
          />
        )}

        {currentView === 'learn' && (
          <LearnView
            key={`learn-${viewKeys.learn}`}
            onStartTablePractice={handleStartTablePractice}
            onNavigateToConcept={() => handleNavigate('concept')}
          />
        )}

        {currentView === 'speed' && (
          <SpeedChallengeView
            key={`speed-${viewKeys.speed}`}
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToMenu={() => handleNavigate('practice')}
          />
        )}

        {currentView === 'records' && (
          <RecordsView
            key={`records-${viewKeys.records}`}
            stats={userStats}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            key={`profile-${viewKeys.profile}`}
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onStartFocusedPractice={handleStartWeaknessPractice}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
      />

    </div>
  );
}
