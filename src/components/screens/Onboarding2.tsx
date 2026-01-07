import React from 'react';
import { MapPin } from 'lucide-react';

interface Onboarding2Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding2({ onNext, onSkip }: Onboarding2Props) {
  return (
    <div className="flex flex-col items-center justify-between h-full p-6 lg:p-12 bg-white max-w-3xl mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <MapPin className="w-24 h-24 lg:w-32 lg:h-32 text-yellow-400 mx-auto" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl lg:text-5xl mb-4 lg:mb-6">
          Active ta localisation
        </h1>
        
        <p className="text-gray-600 lg:text-lg max-w-sm lg:max-w-2xl">
          Pour te prévenir quand le bus passe près de chez toi.
        </p>
      </div>

      <div className="w-full lg:w-auto lg:min-w-96 space-y-3">
        <button
          onClick={onNext}
          className="w-full py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Activer la localisation
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