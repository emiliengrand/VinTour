import React from 'react';
import { Bus } from 'lucide-react';

interface Onboarding1Props {
  onNext: () => void;
}

export default function Onboarding1({ onNext }: Onboarding1Props) {
  return (
    <div className="flex flex-col items-center justify-between h-full p-6 lg:p-12 bg-white max-w-3xl mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <Bus className="w-24 h-24 lg:w-32 lg:h-32 text-cyan-500 mx-auto" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl lg:text-5xl mb-4 lg:mb-6">
          Vinted descend du web et monte dans le bus.
        </h1>
        
        <p className="text-gray-600 lg:text-lg max-w-sm lg:max-w-2xl">
          Le premier Pop-up store itinérant du Bassin Minier. Achetez, vendez, essayez. 0€ de frais de port. 0 colis à faire.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full lg:w-auto lg:px-12 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Commencer
      </button>
    </div>
  );
}