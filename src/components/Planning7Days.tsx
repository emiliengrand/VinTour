import { ArrowLeft, Bell, Share2, MapPin } from 'lucide-react';

interface Planning7DaysProps {
  navigate: (screen: string, data?: any) => void;
}

export default function Planning7Days({ navigate }: Planning7DaysProps) {
  const schedule = [
    {
      day: 'Lundi 6 Jan',
      stops: [
        { city: 'Lens', location: 'Gare', hours: '10h - 18h' },
      ],
    },
    {
      day: 'Mardi 7 Jan',
      stops: [
        { city: 'Béthune', location: 'Université', hours: '10h - 18h' },
      ],
    },
    {
      day: 'Mercredi 8 Jan',
      stops: [
        { city: 'Hénin-Beaumont', location: 'Place Jean Jaurès', hours: '10h - 16h' },
      ],
    },
    {
      day: 'Jeudi 9 Jan',
      stops: [
        { city: 'Douai', location: 'Centre Commercial', hours: '12h - 20h' },
      ],
    },
    {
      day: 'Vendredi 10 Jan',
      stops: [
        { city: 'Arras', location: 'Grand Place', hours: '10h - 18h' },
      ],
    },
    {
      day: 'Samedi 11 Jan',
      stops: [
        { city: 'Liévin', location: 'Stade Couvert', hours: '9h - 19h' },
      ],
    },
    {
      day: 'Dimanche 12 Jan',
      stops: [
        { city: 'Vote Joker', location: 'À déterminer par vote', hours: 'TBD' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('map')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Planning 7 jours</h1>
      </div>

      <div className="p-4">
        {/* Info Banner */}
        <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            📅 Planning de la semaine du 6 au 12 janvier 2026
          </p>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {schedule.map((day, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="font-medium">{day.day}</div>
              </div>

              <div className="divide-y divide-gray-100">
                {day.stops.map((stop, stopIndex) => (
                  <div key={stopIndex} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{stop.city} - {stop.location}</span>
                        </div>
                        <div className="text-sm text-gray-500 ml-6">
                          Horaires : {stop.hours}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-6">
                      <button
                        onClick={() => navigate('alertSettings')}
                        className="flex-1 text-sm border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        Alerte
                      </button>
                      
                      <button className="flex-1 text-sm border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Partager
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vote Reminder */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            <span className="font-medium">🗳️ Dimanche = Jour Joker !</span>
            <br />
            L'arrêt du dimanche est choisi par vote. Participe pour décider où le bus passera.
          </p>
          <button
            onClick={() => navigate('voteHome')}
            className="w-full bg-yellow-400 text-black py-2 rounded-lg font-medium text-sm"
          >
            Voter maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
