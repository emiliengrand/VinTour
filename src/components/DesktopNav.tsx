import React from 'react';
import { Home, Map, Vote, Settings } from 'lucide-react';
import logoPng from '../assets/logo.png';

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

  const isActive = (tabId: string) => currentScreen === tabId || currentScreen.startsWith(tabId);
  const isSettingsActive = currentScreen === 'profile' || currentScreen === 'faq';

  return (
    <nav className="w-full bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo PNG */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center"
          aria-label="Aller à l'accueil"
        >
          <img
            src={logoPng}
            alt="Vin'Tour"
            className="h-10 w-auto select-none"
            draggable={false}
          />
        </button>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  active ? 'bg-white/10 text-[#ECC625]' : 'text-gray-200 hover:bg-white/5',
                ].join(' ')}
              >
                <Icon
                  className={['w-5 h-5', active ? 'text-[#ECC625]' : 'text-gray-300'].join(' ')}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}

          {/* Paramètres */}
          <button
            onClick={() => navigate('profile')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isSettingsActive ? 'bg-white/10 text-[#ECC625]' : 'text-gray-200 hover:bg-white/5',
            ].join(' ')}
          >
            <Settings className={['w-5 h-5', isSettingsActive ? 'text-[#ECC625]' : 'text-gray-300'].join(' ')} />
            <span className="font-medium">Paramètres</span>
          </button>
        </div>
      </div>
    </nav>
  );
}