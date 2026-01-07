import React from 'react';
import { ArrowLeft, MapPin, Clock, Bell, Share2 } from 'lucide-react';

interface WeekScheduleProps {
  navigate: (screen: string) => void;
}

export default function WeekSchedule({ navigate }: WeekScheduleProps) {
  const schedule = [
    { day: 'Lundi', city: 'Lens', stop: 'Gare', hours: '09h00 - 18h00' },
    { day: 'Mardi', city: 'Béthune', stop: 'Université', hours: '10h00 - 18h00' },
    { day: 'Mercredi', city: 'Hénin-Beaumont', stop: 'Place Jean Jaurès', hours: '10h00 - 18h00' },
    { day: 'Jeudi', city: 'Arras', stop: 'Place des Héros', hours: '09h00 - 18h00' },
    { day: 'Vendredi', city: 'Douai', stop: 'Gare', hours: '10h00 - 18h00' },
    { day: 'Samedi', city: 'Lens', stop: 'Centre-ville', hours: '09h00 - 19h00' },
    { day: 'Dimanche', city: 'Béthune', stop: 'Centre-ville', hours: '10h00 - 17h00' },
  ];

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('map')} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl lg:text-2xl font-bold">Planning 7 jours</h1>
      </div>

      <div className="p-6 lg:px-12 lg:py-8 max-w-6xl mx-auto space-y-4 lg:space-y-6">
        <p className="text-gray-600 lg:text-lg">Retrouvez le bus dans les 7 prochains jours</p>

        {/* Schedule list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {schedule.map((item, index) => (
            <div
              key={index}
              className={`p-4 lg:p-6 rounded-lg border ${
                index === 0 
                  ? 'bg-cyan-50 border-cyan-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm lg:text-base text-gray-600">{item.day}</p>
                  <h3 className="font-semibold text-lg lg:text-xl">{item.city}</h3>
                </div>
                {index === 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    Aujourd'hui
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm lg:text-base">{item.stop}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <Clock className="w-4 h-4" />
                <span className="text-sm lg:text-base">{item.hours}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('alert-settings')}
                  className="flex-1 py-2 text-sm lg:text-base border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Alerter
                </button>
                
                <button className="flex-1 py-2 text-sm lg:text-base border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}