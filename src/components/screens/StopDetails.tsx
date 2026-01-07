import React from 'react';
import { ArrowLeft, MapPin, Clock, Bell, Navigation } from 'lucide-react';

interface StopDetailsProps {
  navigate: (screen: string) => void;
}

export default function StopDetails({ navigate }: StopDetailsProps) {
  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('map')} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Détails de l'arrêt</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stop info */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Béthune - Université</h2>
          
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Place de l'Université, 62400 Béthune</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <h3 className="font-medium">Horaires de présence</h3>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>Demain : 10h00 - 18h00</span>
          </div>
        </div>

        {/* Next stops (optional) */}
        <div className="space-y-2">
          <h3 className="font-medium">Prochains passages</h3>
          
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium">Demain</p>
              <p className="text-sm text-gray-600">10h00 - 18h00</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium">Jeudi prochain</p>
              <p className="text-sm text-gray-600">10h00 - 18h00</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('alert-settings')}
            className="w-full py-4 bg-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Activer une alerte pour cet arrêt
          </button>
          
          <button className="w-full py-4 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" />
            Itinéraire
          </button>
        </div>
      </div>
    </div>
  );
}
