import React from 'react';
import { CheckCircle2, Bell } from 'lucide-react';

interface VoteConfirmProps {
  navigate: (screen: string) => void;
}

export default function VoteConfirm({ navigate }: VoteConfirmProps) {
  return (
    <div className="bg-white h-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <CheckCircle2 className="w-20 h-20 text-yellow-400 mx-auto" strokeWidth={1.5} />
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Vote enregistré !</h1>
          <p className="text-gray-600">Merci pour ta participation</p>
        </div>

        {/* Recap */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 space-y-2">
          <h3 className="font-medium">Ton vote</h3>
          <p className="text-lg font-semibold">Douai - Centre</p>
        </div>

        {/* Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            Tu peux revoter la semaine prochaine pour un autre lieu ou le même.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('alert-settings')}
            className="w-full py-4 bg-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Activer une alerte si le lieu gagne
          </button>
          
          <button
            onClick={() => navigate('vote')}
            className="w-full py-4 border border-gray-300 text-gray-700 rounded-lg font-medium"
          >
            Retour au vote
          </button>
          
          <button
            onClick={() => navigate('home')}
            className="w-full py-4 text-gray-600 font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
