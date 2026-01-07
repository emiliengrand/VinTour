import { ArrowLeft, MapPin, Clock, Bell, Navigation } from 'lucide-react';

interface StopDetailsProps {
  stop: any;
  navigate: (screen: string, data?: any) => void;
}

export default function StopDetails({ stop, navigate }: StopDetailsProps) {
  const stopData = stop || {
    name: 'Béthune - Université',
    address: 'Avenue de l\'Université, 62400 Béthune',
    date: 'Demain',
    hours: '10h - 18h',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('map')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Détails de l'arrêt</h1>
      </div>

      <div className="p-6">
        {/* Map preview */}
        <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
          <MapPin className="w-12 h-12 text-gray-400" />
        </div>

        {/* Stop Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-medium mb-2">{stopData.name}</h2>
          <p className="text-gray-600 mb-4">{stopData.address}</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5" />
              <div>
                <div className="font-medium">{stopData.date}</div>
                <div className="text-sm text-gray-500">Horaires : {stopData.hours}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('alertSettings')}
            className="w-full bg-cyan-500 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Activer une alerte pour cet arrêt
          </button>

          <button className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-medium flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" />
            Itinéraire
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">💡 Bon à savoir :</span> Le bus reste en moyenne 6-8h par arrêt. 
            N'hésite pas à activer une alerte pour ne pas manquer sa venue !
          </p>
        </div>
      </div>
    </div>
  );
}
