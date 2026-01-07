import React from 'react';
import { CheckCircle2, Bell } from 'lucide-react';

interface AlertConfirmProps {
  navigate: (screen: string) => void;
}

export default function AlertConfirm({ navigate }: AlertConfirmProps) {
  return (
    <div className="bg-white h-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <CheckCircle2 className="w-20 h-20 text-cyan-500 mx-auto" strokeWidth={1.5} />
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Alerte créée !</h1>
          <p className="text-gray-600">Tes préférences ont été enregistrées</p>
        </div>

        {/* Résumé paramètres */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-left">
          <h3 className="font-medium">Résumé de tes alertes</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rayon :</span>
              <span className="font-medium">500m</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Créneau :</span>
              <span className="font-medium">Matin (8h-12h)</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Ville :</span>
              <span className="font-medium">Lens</span>
            </div>
          </div>
        </div>

        {/* Exemple notification */}
        <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-medium text-sm mb-1">Exemple de notification</p>
              <p className="text-sm text-gray-700">
                "Le Vinted Bus sera à 500m de chez toi demain matin à l'arrêt Université Artois."
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('map')}
            className="w-full py-4 bg-black text-white rounded-lg font-medium"
          >
            Retour à la carte
          </button>
          
          <button
            onClick={() => navigate('home')}
            className="w-full py-4 text-gray-600 font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
