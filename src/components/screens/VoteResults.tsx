import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Trophy, MapPin, Bell } from 'lucide-react';
import { getPollId, getPreviousPollId, voteResults } from '../../utils/voteApi';

interface VoteResultsProps {
  navigate: (screen: string) => void;
}

type Row = { optionId: string; votes: number; percentage: number };

export default function VoteResults({ navigate }: VoteResultsProps) {
  const currentPoll = useMemo(() => getPollId(), []);
  const previousPoll = useMemo(() => getPreviousPollId(), []);

  // Par défaut: résultats de la semaine dernière
  const [pollId, setPollId] = useState(previousPoll);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const r = await voteResults(pollId);
      if (!alive) return;

      if (!r.ok) {
        setError(r.error || 'Impossible de charger les résultats.');
        setRows([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      setRows(r.results || []);
      setTotal(r.total || 0);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [pollId]);

  const winner = rows[0];
  const topThree = rows.slice(0, 3);

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
        {/* Poll selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPollId(previousPoll)}
            className={`flex-1 py-2 rounded-lg border font-medium ${
              pollId === previousPoll ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Semaine dernière
          </button>
          <button
            onClick={() => setPollId(currentPoll)}
            className={`flex-1 py-2 rounded-lg border font-medium ${
              pollId === currentPoll ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Semaine en cours
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <div className="mt-2 text-xs text-red-600">
              Si tu es en dev: configure <code className="px-1 bg-red-100 rounded">VITE_API_BASE</code> (WAMP/MAMP) dans{' '}
              <code className="px-1 bg-red-100 rounded">.env.local</code>.
            </div>
          </div>
        )}

        {/* Winner */}
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto" strokeWidth={1.5} />

          {loading ? (
            <div className="text-gray-600">Chargement…</div>
          ) : winner ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {pollId === previousPoll ? "Arrêt Joker de la semaine dernière" : "Leader de la semaine en cours"}
              </p>
              <h2 className="text-2xl font-bold">{winner.optionId}</h2>
              <p className="text-gray-600">
                {winner.votes} vote{winner.votes > 1 ? 's' : ''} ({winner.percentage}%)
              </p>
              <p className="mt-2 text-xs text-gray-500">Semaine : {pollId}</p>
            </div>
          ) : (
            <div className="text-gray-600">Aucun vote</div>
          )}
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">
              {pollId === previousPoll ? "Le bus s'y est arrêté vendredi dernier" : "Arrêt pressenti"}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {winner ? `Lieu : ${winner.optionId}` : "Votez pour choisir l'arrêt."}
          </p>
        </div>

        {/* Top 3 */}
        <div className="space-y-3">
          <h3 className="font-medium">Top 3</h3>

          {loading ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">Chargement…</div>
          ) : topThree.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
              Aucun vote pour cette semaine.
            </div>
          ) : (
            topThree.map((item, idx) => {
              const position = idx + 1;
              return (
                <div
                  key={item.optionId}
                  className={`p-4 rounded-lg border ${
                    position === 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        position === 1 ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {position}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.optionId}</p>
                      <p className="text-sm text-gray-600">{item.votes} vote{item.votes > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={position === 1 ? 'bg-yellow-400' : 'bg-gray-400'}
                      style={{
                        width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                        height: '100%',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">Stats</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de votes :</span>
              <span className="font-medium">{total}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Participants :</span>
              <span className="font-medium">{total}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Lieux proposés :</span>
              <span className="font-medium">{rows.length}</span>
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