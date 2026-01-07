import React from 'react';
import { Vote, Clock } from 'lucide-react';

interface VoteHomeProps {
  navigate: (screen: string) => void;
}

export default function VoteHome({ navigate }: VoteHomeProps) {
  const votes = [
    { city: 'Douai - Centre', votes: 342, percentage: 45 },
    { city: 'Liévin - Stade', votes: 289, percentage: 38 },
    { city: 'Carvin - Mairie', votes: 156, percentage: 20 },
    { city: 'Bruay-la-Buissière', votes: 98, percentage: 13 },
  ];

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <h1 className="text-xl lg:text-2xl font-bold">Vote ton arrêt</h1>
      </div>

      <div className="p-6 lg:px-12 lg:py-8 max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Intro */}
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-center mb-4">
            <Vote className="w-16 h-16 lg:w-20 lg:h-20 text-yellow-400" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-semibold text-center">Vote ton arrêt</h2>
          
          <p className="text-gray-600 lg:text-lg text-center max-w-2xl mx-auto">
            Chaque semaine, une journée 'Joker' est laissée libre dans le planning. Le lieu ayant le plus de votes gagne l'arrêt du bus.
          </p>
        </div>

        {/* Countdown */}
        <div className="p-4 lg:p-6 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
          <span className="font-medium lg:text-lg text-yellow-900">Temps restant : 3j 12h 45min</span>
        </div>

        {/* Votes list */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-medium lg:text-lg">Classement actuel</h3>
          
          {votes.map((item, index) => (
            <div key={index} className="space-y-2 p-4 lg:p-5 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium lg:text-lg">{item.city}</span>
                </div>
                <span className="text-gray-600 lg:text-lg">{item.votes} votes</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div
                  className={`h-2 lg:h-3 rounded-full ${
                    index === 0 ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-4 lg:flex lg:gap-4 lg:space-y-0">
          <button
            onClick={() => navigate('vote-choose')}
            className="w-full lg:flex-1 py-4 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            Voter maintenant
          </button>
          
          <button
            onClick={() => navigate('vote-results')}
            className="w-full lg:flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Voir les résultats précédents
          </button>
        </div>
      </div>
    </div>
  );
}