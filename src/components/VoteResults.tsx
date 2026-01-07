import { ArrowLeft, Trophy, MapPin, Bell } from 'lucide-react';

interface VoteResultsProps {
  navigate: (screen: string, data?: any) => void;
}

export default function VoteResults({ navigate }: VoteResultsProps) {
  const winner = {
    name: 'Carvin - Place Foch',
    votes: 412,
    percentage: 38,
    date: 'Dimanche 5 Janvier',
  };

  const topLocations = [
    { rank: 1, name: 'Carvin - Place Foch', votes: 412, percentage: 38 },
    { rank: 2, name: 'Bruay-la-Buissière - Gare', votes: 285, percentage: 26 },
    { rank: 3, name: 'Sallaumines - Centre', votes: 198, percentage: 18 },
  ];

  const stats = {
    totalVotes: 1089,
    totalParticipants: 942,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('voteHome')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Résultats du vote</h1>
      </div>

      <div className="p-6">
        {/* Period */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Arrêt Joker de la semaine dernière</p>
          <p className="font-medium text-lg">Vote du 30 Déc - 2 Jan 2026</p>
        </div>

        {/* Winner */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-black" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold mb-2">🎉 Gagnant !</h2>
          
          <div className="text-center mb-4">
            <div className="text-xl font-medium mb-1">{winner.name}</div>
            <div className="text-sm text-gray-600">{winner.date}</div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{winner.votes}</div>
            <div className="text-sm text-gray-600">votes ({winner.percentage}%)</div>
          </div>
        </div>

        {/* Top 3 */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Top 3</h3>
          <div className="space-y-3">
            {topLocations.map((location) => (
              <div
                key={location.rank}
                className={`border rounded-lg p-4 ${
                  location.rank === 1 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    location.rank === 1 ? 'bg-yellow-400 text-black' :
                    location.rank === 2 ? 'bg-gray-300 text-black' :
                    'bg-yellow-700 text-white'
                  }`}>
                    {location.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{location.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{location.votes}</div>
                    <div className="text-xs text-gray-500">{location.percentage}%</div>
                  </div>
                </div>
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={location.rank === 1 ? 'bg-yellow-400 h-full' : 'bg-gray-300 h-full'}
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Statistiques</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.totalVotes}</div>
              <div className="text-sm text-gray-600">Total de votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.totalParticipants}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('planning')}
            className="w-full bg-black text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Ajouter au planning / voir l'arrêt
          </button>
          
          <button
            onClick={() => navigate('alertSettings')}
            className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Activer une alerte pour cet arrêt
          </button>

          <button
            onClick={() => navigate('voteHome')}
            className="w-full text-gray-600 py-4 rounded-lg font-medium"
          >
            Voter pour cette semaine
          </button>
        </div>
      </div>
    </div>
  );
}
