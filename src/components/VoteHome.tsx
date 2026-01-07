import { ArrowLeft, Clock } from 'lucide-react';

interface VoteHomeProps {
  navigate: (screen: string, data?: any) => void;
}

export default function VoteHome({ navigate }: VoteHomeProps) {
  const locations = [
    { name: 'Carvin - Place Foch', votes: 284, percentage: 35 },
    { name: 'Bruay-la-Buissière - Gare', votes: 198, percentage: 24 },
    { name: 'Sallaumines - Centre', votes: 156, percentage: 19 },
    { name: 'Noyelles-Godault - Zone commerciale', votes: 122, percentage: 15 },
    { name: 'Billy-Montigny - Mairie', votes: 58, percentage: 7 },
  ];

  const timeRemaining = {
    days: 3,
    hours: 14,
    minutes: 28,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('home')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Vote ton arrêt</h1>
      </div>

      <div className="p-6">
        {/* Intro */}
        <div className="mb-6">
          <h2 className="text-2xl font-medium mb-3">Choisis le prochain arrêt Joker</h2>
          <p className="text-gray-600">
            Chaque semaine, une journée 'Joker' est laissée libre dans le planning. 
            Le lieu ayant le plus de votes gagne l'arrêt du bus.
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Temps restant avant clôture</span>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{timeRemaining.days}</div>
              <div className="text-xs text-gray-600">jours</div>
            </div>
            <div className="text-2xl font-bold text-gray-400">:</div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{timeRemaining.hours}</div>
              <div className="text-xs text-gray-600">heures</div>
            </div>
            <div className="text-2xl font-bold text-gray-400">:</div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{timeRemaining.minutes}</div>
              <div className="text-xs text-gray-600">minutes</div>
            </div>
          </div>
        </div>

        {/* Voting List */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Classement actuel</h3>
          <div className="space-y-3">
            {locations.map((location, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-yellow-700 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-500">{location.votes} votes</div>
                  </div>
                  <div className="text-lg font-bold text-gray-700">{location.percentage}%</div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      index === 0 ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('voteChoose')}
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-medium"
          >
            Voter maintenant
          </button>
          
          <button
            onClick={() => navigate('voteResults')}
            className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-medium"
          >
            Voir les résultats de la semaine dernière
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 Tu peux voter une fois par semaine. Le vote se clôture chaque jeudi soir, 
            et le gagnant est annoncé vendredi matin.
          </p>
        </div>
      </div>
    </div>
  );
}
