import React, { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';

interface AlertSettingsProps {
  navigate: (screen: string) => void;
}

export default function AlertSettings({ navigate }: AlertSettingsProps) {
  const [radius, setRadius] = useState('500m');
  const [timeSlot, setTimeSlot] = useState('matin');

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('map')} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Alertes</h1>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-gray-600">
          Configure tes alertes pour être prévenu quand le bus passe près de chez toi.
        </p>

        {/* Radius parameter */}
        <div className="space-y-3">
          <h3 className="font-medium">Rayon de notification</h3>
          
          <div className="space-y-2">
            {['300m', '500m', '1km'].map((option) => (
              <button
                key={option}
                onClick={() => setRadius(option)}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  radius === option
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {radius === option && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time slot parameter */}
        <div className="space-y-3">
          <h3 className="font-medium">Créneau préféré</h3>
          
          <div className="space-y-2">
            {[
              { value: 'matin', label: 'Matin (8h-12h)' },
              { value: 'midi', label: 'Midi (12h-14h)' },
              { value: 'soir', label: 'Soir (17h-19h)' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeSlot(option.value)}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  timeSlot === option.value
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {timeSlot === option.value && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* My city */}
        <div className="space-y-3">
          <h3 className="font-medium">Ma ville</h3>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="font-medium">Lens</p>
              <p className="text-sm text-gray-600">Détectée automatiquement</p>
            </div>
          </div>
        </div>

        {/* Followed cities */}
        <div className="space-y-3">
          <h3 className="font-medium">Villes/arrêts suivis</h3>
          
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <span>Béthune - Université</span>
              <button className="text-sm text-red-500">Retirer</button>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <span>Arras - Place des Héros</span>
              <button className="text-sm text-red-500">Retirer</button>
            </div>
            
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium">
              + Ajouter un arrêt
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => navigate('alert-confirm')}
          className="w-full py-4 bg-black text-white rounded-lg font-medium"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
