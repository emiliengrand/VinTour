import React from 'react';
import { ArrowLeft, Trophy, MapPin, Bell } from 'lucide-react';

interface VoteResultsProps {
  navigate: (screen: string) => void;
}

export default function VoteResults({ navigate }: VoteResultsProps) {
  const topThree = [
    { position: 1, city: 'Douai - Centre', votes: 487, percentage: 52 },
    { position: 2, city: 'Liévin - Stade', votes: 321, percentage: 34 },
    { position: 3, city: 'Carvin - Mairie', votes: 198, percentage: 21 },
  ];

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('vote')} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Résultats</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Winner */}
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto" strokeWidth={1.5} />
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Arrêt Joker de la semaine dernière</p>
            <h2 className="text-2xl font-bold">Douai - Centre</h2>
            <p className="text-gray-600">487 votes (52%)</p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Le bus s'y est arrêté vendredi dernier</span>
          </div>
          <p className="text-sm text-gray-700">De 10h00 à 18h00, Place du Marché</p>
        </div>

        {/* Top 3 */}
        <div className="space-y-3">
          <h3 className="font-medium">Top 3 de la semaine</h3>
          
          {topThree.map((item) => (
            <div
              key={item.position}
              className={`p-4 rounded-lg border ${
                item.position === 1
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  item.position === 1 ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-700'
                }`}>
                  {item.position}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.city}</p>
                  <p className="text-sm text-gray-600">{item.votes} votes</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={item.position === 1 ? 'bg-yellow-400' : 'bg-gray-400'}
                  style={{ width: `${item.percentage}%`, height: '100%', borderRadius: '9999px' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">Stats de la semaine</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de votes :</span>
              <span className="font-medium">1,234</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Participants :</span>
              <span className="font-medium">892</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Lieux proposés :</span>
              <span className="font-medium">12</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('alert-settings')}
            className="w-full py-4 bg-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Ajouter au planning / activer alerte
          </button>
          
          <button
            onClick={() => navigate('vote')}
            className="w-full py-4 border border-gray-300 text-gray-700 rounded-lg font-medium"
          >
            Retour au vote
          </button>
        </div>
      </div>
    </div>
  );
}
