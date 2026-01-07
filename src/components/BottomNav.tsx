import React from 'react';
import { Home, Map, Vote } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  navigate: (screen: string) => void;
}

export default function BottomNav({ currentScreen, navigate }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'map', label: 'Carte', icon: Map },
    { id: 'vote', label: 'Vote', icon: Vote },
  ];

  const isActive = (tabId: string) => {
    return currentScreen === tabId || currentScreen.startsWith(tabId);
  };

  return (
    <nav className="border-t border-gray-200 bg-white">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
            >
              <Icon 
                className={`w-5 h-5 ${active ? 'text-cyan-500' : 'text-gray-400'}`} 
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-xs ${active ? 'text-cyan-500 font-medium' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}