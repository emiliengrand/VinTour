interface Onboarding1Props {
  onNext: () => void;
}

export default function Onboarding1({ onNext }: Onboarding1Props) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-8">
          <div className="text-6xl">🚌</div>
        </div>
        
        <h1 className="text-3xl mb-4">
          Vinted descend du web et monte dans le bus.
        </h1>
        
        <p className="text-gray-600 max-w-sm">
          Le premier Pop-up store itinérant du Bassin Minier. Achetez, vendez, essayez. 
          0€ de frais de port. 0 colis à faire.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-black text-white py-4 rounded-lg font-medium"
      >
        Commencer
      </button>
    </div>
  );
}
