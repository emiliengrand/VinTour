import React from 'react';
import { Home, Map, Vote, Settings } from 'lucide-react';

interface DesktopNavProps {
  currentScreen: string;
  navigate: (screen: string) => void;
}

export default function DesktopNav({ currentScreen, navigate }: DesktopNavProps) {
  const tabs = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'map', label: 'Carte', icon: Map },
    { id: 'vote', label: 'Vote', icon: Vote },
  ];

  const isActive = (tabId: string) => {
    return currentScreen === tabId || currentScreen.startsWith(tabId);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Vin'Tour</h1>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  active 
                    ? 'bg-cyan-50 text-cyan-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 ${active ? 'text-cyan-600' : 'text-gray-600'}`} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`font-medium ${active ? 'text-cyan-600' : 'text-gray-700'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Settings */}
          <button
            onClick={() => navigate('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentScreen === 'profile' || currentScreen === 'faq'
                ? 'bg-cyan-50 text-cyan-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings 
              className={`w-5 h-5 ${
                currentScreen === 'profile' || currentScreen === 'faq' 
                  ? 'text-cyan-600' 
                  : 'text-gray-600'
              }`} 
            />
            <span className={`font-medium ${
              currentScreen === 'profile' || currentScreen === 'faq'
                ? 'text-cyan-600' 
                : 'text-gray-700'
            }`}>
              Paramètres
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}