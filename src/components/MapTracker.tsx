import { MapPin, Clock, Navigation, ChevronUp } from 'lucide-react';

interface MapTrackerProps {
  navigate: (screen: string, data?: any) => void;
}

export default function MapTracker({ navigate }: MapTrackerProps) {
  const currentStop = {
    name: 'Lens - Gare',
    address: 'Place de la Gare, 62300 Lens',
    hours: '10h - 18h',
    lat: 50.4282,
    lng: 2.8325,
  };

  const upcomingStops = [
    { time: 'Demain 10h', name: 'Béthune - Université', eta: '18h' },
    { time: 'Mercredi 10h', name: 'Hénin-Beaumont - Place Jean Jaurès', eta: '16h' },
    { time: 'Jeudi 10h', name: 'Douai - Centre Commercial', eta: '14h' },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Map Area */}
      <div className="flex-1 bg-gray-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-red-500 mx-auto mb-2" />
            <div className="font-medium">Carte interactive</div>
            <div className="text-sm text-gray-500">Position du bus en temps réel</div>
          </div>
        </div>

        {/* Bus marker simulation */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-cyan-500 text-white p-3 rounded-full shadow-lg">
            🚌
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white rounded-t-3xl shadow-2xl p-6 max-h-[60vh] overflow-y-auto">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

        {/* Current Stop */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2">Arrêt actuel</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-lg">{currentStop.name}</div>
                <div className="text-sm text-gray-500">{currentStop.address}</div>
              </div>
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">LIVE</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4" />
              <span>Sur place : {currentStop.hours}</span>
            </div>
          </div>
        </div>

        {/* Upcoming Stops */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Prochains arrêts</h3>
          <div className="space-y-2">
            {upcomingStops.map((stop, index) => (
              <button
                key={index}
                onClick={() => navigate('stopDetails', { stop })}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stop.name}</div>
                    <div className="text-sm text-gray-500">{stop.time}</div>
                  </div>
                  <div className="text-sm text-gray-400">jusqu'à {stop.eta}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('planning')}
            className="w-full bg-black text-white py-3 rounded-lg font-medium"
          >
            Voir le planning 7 jours
          </button>
          
          <button
            onClick={() => navigate('alertSettings')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            🔔 Activer une alerte
          </button>
        </div>
      </div>
    </div>
  );
}
