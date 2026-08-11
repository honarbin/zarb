import React from 'react';
import { Target, BookOpen, Zap, Trophy, User } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const items: { id: AppView; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'practice',
      label: 'تمرین',
      icon: <Target className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'learn',
      label: 'یادگیری',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-sky-500 to-blue-500',
    },
    {
      id: 'speed',
      label: 'مسابقه سرعتی',
      icon: <Zap className="w-6 h-6 animate-pulse" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'records',
      label: 'رکوردها',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'profile',
      label: 'پروفایل',
      icon: <User className="w-6 h-6" />,
      color: 'from-rose-500 to-red-500',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-amber-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-700 bg-amber-100/90 font-black scale-105 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-amber-600' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] mt-1 leading-none tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
