interface Onboarding2Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding2({ onNext, onSkip }: Onboarding2Props) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-8">
          <div className="text-6xl">📍</div>
        </div>
        
        <h1 className="text-3xl mb-4">
          Active ta localisation
        </h1>
        
        <p className="text-gray-600 max-w-sm">
          Pour te prévenir quand le bus passe près de chez toi.
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onNext}
          className="w-full bg-black text-white py-4 rounded-lg font-medium"
        >
          Activer la localisation
        </button>
        
        <button
          onClick={onSkip}
          className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-medium"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
