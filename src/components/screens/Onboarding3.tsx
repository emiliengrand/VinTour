import React from 'react';
import { Bell } from 'lucide-react';

interface Onboarding3Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding3({ onNext, onSkip }: Onboarding3Props) {
  return (
    <div className="flex flex-col items-center justify-between h-full p-6 lg:p-12 bg-white max-w-3xl mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <Bell className="w-24 h-24 lg:w-32 lg:h-32 text-yellow-400 mx-auto" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl lg:text-5xl mb-4 lg:mb-6">
          Active les notifications
        </h1>
        
        <div className="bg-gray-50 p-4 lg:p-6 rounded-lg border border-gray-200 max-w-sm lg:max-w-2xl">
          <p className="text-sm lg:text-base text-gray-700">
            Ex: "Le Vinted Bus sera à 500m de chez toi demain matin à l'arrêt Université Artois"
          </p>
        </div>
      </div>

      <div className="w-full lg:w-auto lg:min-w-96 space-y-3">
        <button
          onClick={onNext}
          className="w-full py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Activer les notifications
        </button>
        
        <button
          onClick={onSkip}
          className="w-full py-4 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}