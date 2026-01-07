import { Check, Bell } from 'lucide-react';

interface AlertCreatedProps {
  navigate: (screen: string, data?: any) => void;
}

export default function AlertCreated({ navigate }: AlertCreatedProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-medium mb-4 text-center">
        Alerte créée avec succès !
      </h1>

      <p className="text-gray-600 text-center mb-8">
        Tu recevras une notification dès que le bus passe dans ta zone.
      </p>

      {/* Summary */}
      <div className="w-full bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-4">Résumé de tes paramètres</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Rayon de détection</span>
            <span className="font-medium">500m</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Créneaux horaires</span>
            <span className="font-medium">Matin</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Villes suivies</span>
            <span className="font-medium">Lens</span>
          </div>
        </div>
      </div>

      {/* Example Notification */}
      <div className="w-full mb-8">
        <p className="text-sm text-gray-500 mb-3">Exemple de notification :</p>
        
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Bell className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              "Le Vinted Bus sera à 500m de chez toi demain matin à l'arrêt Université Artois."
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <button
          onClick={() => navigate('map')}
          className="w-full bg-black text-white py-4 rounded-lg font-medium"
        >
          Voir le bus en direct
        </button>
        
        <button
          onClick={() => navigate('home')}
          className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-medium"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
