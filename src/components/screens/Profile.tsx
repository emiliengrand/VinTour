import React from 'react';
import { ArrowLeft, Bell, MapPin, HelpCircle, ChevronRight, Settings } from 'lucide-react';

interface ProfileProps {
  navigate: (screen: string) => void;
}

export default function Profile({ navigate }: ProfileProps) {
  const menuItems = [
    { icon: Bell, label: 'Mes alertes', count: 3, onClick: () => navigate('alert-settings') },
    { icon: MapPin, label: 'Mes villes suivies', count: 2, onClick: () => navigate('week-schedule') },
    { icon: HelpCircle, label: 'Aide / FAQ', count: null, onClick: () => navigate('faq') },
  ];

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('home')} className="p-1 lg:hidden">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 lg:px-12 lg:py-8 max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Menu sections */}
        <div className="space-y-2 lg:space-y-3">
          <h3 className="font-medium text-gray-600 text-sm lg:text-base mb-3">Mes préférences</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full p-4 lg:p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{item.label}</span>
                    {item.count !== null && (
                      <span className="px-2 py-0.5 bg-[#007782] text-white text-xs rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-6 border-t border-gray-200 space-y-2 lg:space-y-3">
          <h3 className="font-medium text-gray-600 text-sm lg:text-base mb-3">Paramètres généraux</h3>
          
          <button className="w-full p-4 lg:p-5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between hover:border-cyan-500 transition-colors">
            <span className="font-medium lg:text-lg">Notifications</span>
            <div className="w-12 h-6 bg-[#007782] rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </button>
          
          <button className="w-full p-4 lg:p-5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between hover:border-cyan-500 transition-colors">
            <span className="font-medium lg:text-lg">Localisation</span>
            <div className="w-12 h-6 bg-[#007782] rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}