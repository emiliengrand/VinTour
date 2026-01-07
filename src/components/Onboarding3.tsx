interface Onboarding3Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding3({ onNext, onSkip }: Onboarding3Props) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-8">
          <div className="text-6xl">🔔</div>
        </div>
        
        <h1 className="text-3xl mb-4">
          Active les notifications
        </h1>
        
        <div className="bg-gray-50 p-4 rounded-lg max-w-sm">
          <p className="text-sm text-gray-700">
            Ex: "Le Vinted Bus sera à 500m de chez toi demain matin à l'arrêt Université Artois"
          </p>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onNext}
          className="w-full bg-black text-white py-4 rounded-lg font-medium"
        >
          Activer les notifications
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
