import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, BarChart3, Home as HomeIcon } from 'lucide-react';
import { getPollId, voteSession } from '../../utils/voteApi';

interface VoteConfirmProps {
  navigate: (screen: string) => void;
}

export default function VoteConfirm({ navigate }: VoteConfirmProps) {
  const pollId = useMemo(() => localStorage.getItem('tadao_last_vote_poll') || getPollId(), []);
  const [myVote, setMyVote] = useState<string | null>(localStorage.getItem('tadao_last_vote_option'));
  const [mode, setMode] = useState<'loading' | 'success' | 'already' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const justCast = localStorage.getItem('tadao_vote_just_cast') === '1';

      const s = await voteSession(pollId);
      if (!alive) return;

      if (!s.ok) {
        setMode('error');
        setError(s.error || "Impossible de vérifier le vote.");
        return;
      }

      if (!s.hasVoted) {
        // Cas rare : on arrive ici sans vote
        setMode('error');
        setError("Aucun vote détecté pour cette semaine.");
        return;
      }

      if (s.myVote) setMyVote(s.myVote);

      setMode(justCast ? 'success' : 'already');

      // Nettoyage
      localStorage.removeItem('tadao_vote_just_cast');
    })();

    return () => {
      alive = false;
    };
  }, [pollId]);

  const title =
    mode === 'success' ? 'Vote enregistré !' : mode === 'already' ? 'Tu as déjà voté' : mode === 'error' ? 'Oups' : '';

  const subtitle =
    mode === 'success'
      ? 'Merci pour ta participation'
      : mode === 'already'
        ? 'Merci ! Ton vote est déjà enregistré pour cette semaine'
        : mode === 'error'
          ? error || "Erreur"
          : '';

  return (
    <div className="bg-white h-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <CheckCircle2 className="w-20 h-20 text-yellow-400 mx-auto" strokeWidth={1.5} />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{mode === 'loading' ? 'Chargement…' : title}</h1>
          <p className="text-gray-600">{subtitle}</p>

          {myVote && mode !== 'loading' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-gray-600">Ton choix</div>
              <div className="font-semibold">{myVote}</div>
              <div className="mt-2 text-xs text-gray-500">Semaine : {pollId}</div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('vote-results')}
            className="w-full py-4 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Voir les résultats
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full py-4 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
}