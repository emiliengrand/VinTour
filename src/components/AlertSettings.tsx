import { ArrowLeft, MapPin } from 'lucide-react';
import { useState } from 'react';

interface AlertSettingsProps {
  navigate: (screen: string, data?: any) => void;
}

export default function AlertSettings({ navigate }: AlertSettingsProps) {
  const [radius, setRadius] = useState('500m');
  const [timeSlot, setTimeSlot] = useState<string[]>(['matin']);
  const [followedCities, setFollowedCities] = useState<string[]>(['Lens']);

  const cities = ['Lens', 'Béthune', 'Hénin-Beaumont', 'Douai', 'Arras', 'Liévin'];

  const toggleTimeSlot = (slot: string) => {
    if (timeSlot.includes(slot)) {
      setTimeSlot(timeSlot.filter(s => s !== slot));
    } else {
      setTimeSlot([...timeSlot, slot]);
    }
  };

  const toggleCity = (city: string) => {
    if (followedCities.includes(city)) {
      setFollowedCities(followedCities.filter(c => c !== city));
    } else {
      setFollowedCities([...followedCities, city]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('map')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Paramètres d'alerte</h1>
      </div>

      <div className="p-6">
        {/* Radius */}
        <div className="mb-8">
          <h2 className="font-medium mb-3">Rayon de détection</h2>
          <p className="text-sm text-gray-500 mb-4">
            Tu seras alerté quand le bus arrive dans ce périmètre.
          </p>
          
          <div className="flex gap-3">
            {['300m', '500m', '1km'].map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`flex-1 py-3 rounded-lg border font-medium transition ${
                  radius === r
                    ? 'bg-[#007782] text-white border-[#007782]'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-8">
          <h2 className="font-medium mb-3">Créneaux horaires</h2>
          <p className="text-sm text-gray-500 mb-4">
            Quand veux-tu être alerté ?
          </p>
          
          <div className="flex gap-3">
            {[
              { id: 'matin', label: 'Matin', time: '8h-12h' },
              { id: 'midi', label: 'Midi', time: '12h-14h' },
              { id: 'soir', label: 'Soir', time: '14h-20h' },
            ].map((slot) => (
              <button
                key={slot.id}
                onClick={() => toggleTimeSlot(slot.id)}
                className={`flex-1 py-3 rounded-lg border font-medium transition ${
                  timeSlot.includes(slot.id)
                    ? 'bg-[#007782] text-white border-[#007782]'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-sm">{slot.label}</div>
                <div className="text-xs opacity-80">{slot.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div className="mb-8">
          <h2 className="font-medium mb-3">Villes suivies</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sélectionne les villes où tu veux être alerté.
          </p>

          <div className="bg-gray-50 p-3 rounded-lg mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Ma ville détectée : Lens</span>
          </div>
          
          <div className="space-y-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  followedCities.includes(city)
                    ? 'bg-cyan-50 border-cyan-500'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{city}</span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    followedCities.includes(city)
                      ? 'bg-cyan-500 border-cyan-500'
                      : 'border-gray-300'
                  }`}>
                    {followedCities.includes(city) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => navigate('alertCreated')}
          className="w-full bg-black text-white py-4 rounded-lg font-medium"
        >
          Enregistrer mes alertes
        </button>
      </div>
    </div>
  );
}
