import { Check, Bell } from 'lucide-react';

interface VoteConfirmationProps {
  location: string;
  navigate: (screen: string, data?: any) => void;
}

export default function VoteConfirmation({ location, navigate }: VoteConfirmationProps) {
  const votedLocation = location || 'Carvin - Place Foch';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-yellow-600" />
      </div>

      <h1 className="text-2xl font-medium mb-4 text-center">
        Vote enregistré !
      </h1>

      <p className="text-gray-600 text-center mb-8">
        Merci d'avoir participé au choix de l'arrêt Joker de cette semaine.
      </p>

      {/* Vote Summary */}
      <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-3">Ton vote</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            🗳️
          </div>
          <div className="flex-1">
            <div className="font-medium">{votedLocation}</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 text-center">
          <span className="font-medium">📅 Prochaine opportunité :</span>
          <br />
          Tu peux revoter la semaine prochaine.
        </p>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <button
          onClick={() => navigate('alertSettings')}
          className="w-full bg-cyan-500 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" />
          Activer une alerte si ce lieu gagne
        </button>
        
        <button
          onClick={() => navigate('voteHome')}
          className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-medium"
        >
          Voir le classement
        </button>

        <button
          onClick={() => navigate('home')}
          className="w-full text-gray-600 py-4 rounded-lg font-medium"
        >
          Retour à l'accueil
        </button>
      </div>

      {/* Share encouragement */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          💬 Partage ton vote avec tes amis pour augmenter les chances de ton lieu préféré !
        </p>
      </div>
    </div>
  );
}
