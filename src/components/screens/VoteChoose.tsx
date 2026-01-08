import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { castVote, getPollId, voteSession } from '../../utils/voteApi';

interface VoteChooseProps {
  navigate: (screen: string) => void;
}

export default function VoteChoose({ navigate }: VoteChooseProps) {
  const pollId = useMemo(() => getPollId(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');

  const [checking, setChecking] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [myVote, setMyVote] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    'Douai - Centre',
    'Liévin - Stade',
    'Carvin - Mairie',
    'Bruay-la-Buissière - Place',
    'Noeux-les-Mines - Gare',
    'Avion - Centre',
  ];

  const filteredSuggestions = suggestions.filter((place) =>
    place.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      setChecking(true);
      setError(null);

      const s = await voteSession(pollId);
      if (!alive) return;

      if (!s.ok) {
        setError(s.error || "Impossible de vérifier ton statut de vote.");
        setChecking(false);
        return;
      }

      setHasVoted(!!s.hasVoted);
      setMyVote(s.myVote ?? null);
      setChecking(false);
    })();

    return () => {
      alive = false;
    };
  }, [pollId]);

  const onSubmit = async () => {
    if (!selectedPlace || submitting) return;

    setSubmitting(true);
    setError(null);

    const res = await castVote(pollId, selectedPlace);

    // Stocke pour l'écran de confirmation
    localStorage.setItem('tadao_last_vote_poll', pollId);
    localStorage.setItem('tadao_last_vote_option', selectedPlace);

    if (res.ok) {
      localStorage.setItem('tadao_vote_just_cast', '1');
      setSubmitting(false);
      navigate('vote-confirm');
      return;
    }

    // Déjà voté (serveur)
    if (res.error === 'already_voted') {
      localStorage.setItem('tadao_vote_just_cast', '0');
      if (res.myVote) {
        localStorage.setItem('tadao_last_vote_option', res.myVote);
      }
      setSubmitting(false);
      navigate('vote-confirm');
      return;
    }

    setError("Impossible d'enregistrer ton vote. Réessaie.");
    setSubmitting(false);
  };

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('vote')} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Choisir un lieu</h1>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-gray-600">
          Recherche et vote pour l'arrêt que tu souhaites voir dans le planning.
        </p>

        <p className="text-xs text-gray-500">Semaine de vote : {pollId}</p>

        {/* Status */}
        {checking ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">Chargement…</div>
        ) : hasVoted ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-sm">
            Tu as déjà voté cette semaine{myVote ? ` : ${myVote}` : ''}.
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => navigate('vote-results')}
                className="px-4 py-2 rounded-lg bg-black text-white font-medium"
              >
                Voir les résultats
              </button>
              <button
                onClick={() => navigate('vote')}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium"
              >
                Retour
              </button>
            </div>
          </div>
        ) : null}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <div className="mt-2 text-xs text-red-600">
              Si tu es en dev: configure <code className="px-1 bg-red-100 rounded">VITE_API_BASE</code> (WAMP/MAMP) dans{" "}
              <code className="px-1 bg-red-100 rounded">.env.local</code>.
            </div>
          </div>
        )}

        {/* Search field */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ville, quartier ou arrêt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={hasVoted || checking}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-600">Suggestions locales</h3>

          <div className="space-y-2">
            {filteredSuggestions.map((place, index) => (
              <button
                key={index}
                onClick={() => setSelectedPlace(place)}
                disabled={hasVoted || checking}
                className={`w-full p-4 rounded-lg border-2 text-left flex items-center gap-3 disabled:opacity-60 ${
                  selectedPlace === place ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
                }`}
              >
                <MapPin className={`w-5 h-5 ${selectedPlace === place ? 'text-yellow-600' : 'text-gray-400'}`} />
                <span className="font-medium">{place}</span>
                {selectedPlace === place && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onSubmit}
          disabled={!selectedPlace || hasVoted || checking || submitting}
          className={`w-full py-4 rounded-lg font-medium ${
            !selectedPlace || hasVoted || checking || submitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-400 text-black hover:bg-yellow-500'
          }`}
        >
          {submitting ? 'Envoi du vote…' : 'Valider mon vote'}
        </button>
      </div>
    </div>
  );
}