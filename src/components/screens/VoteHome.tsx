import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Vote as VoteIcon, Clock } from 'lucide-react';
import { getPollId, getTimeLeftToNextWeek, voteResults, voteSession } from '../../utils/voteApi';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface VoteHomeProps {
  navigate: (screen: string) => void;
}

type Row = { city: string; votes: number; percentage: number };

function findScrollContainer(start: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = start;

  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY || style.overflow;
    const isScrollable = /(auto|scroll)/.test(overflowY);

    if (isScrollable && el.scrollHeight > el.clientHeight + 1) return el;
    el = el.parentElement;
  }

  // null = scroll window (default ScrollTrigger)
  return null;
}

export default function VoteHome({ navigate }: VoteHomeProps) {
  const pollId = useMemo(() => getPollId(), []);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeftToNextWeek());
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeftToNextWeek()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const s = await voteSession(pollId);
      if (!alive) return;

      if (!s.ok) {
        setError(
          s.error ||
            "Impossible de contacter l'API de vote. (Astuce: ajoute VITE_API_BASE dans .env.local puis relance npm run dev)"
        );
        setLoading(false);
        return;
      }

      setHasVoted(!!s.hasVoted);

      const r = await voteResults(pollId);
      if (!alive) return;

      if (!r.ok) {
        setError(r.error || 'Impossible de charger les résultats du vote.');
        setLoading(false);
        return;
      }

      const mapped: Row[] = (r.results || []).map((x) => ({
        city: x.optionId,
        votes: x.votes,
        percentage: x.percentage,
      }));

      setRows(mapped);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [pollId]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const scrollerEl = findScrollContainer(root.parentElement);

      const makeST = (trigger: Element) => {
        const st: ScrollTrigger.Vars = {
          trigger,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        };
        if (scrollerEl) st.scroller = scrollerEl;
        return st;
      };

      const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

      elements.forEach((el) => {
        if (el.dataset.gsapReveal === '1') return;
        el.dataset.gsapReveal = '1';

        gsap.set(el, { opacity: 0, y: 16 });

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: makeST(el),
        });
      });

      const aboveFold = elements.slice(0, 3);
      if (aboveFold.length) {
        gsap.to(aboveFold, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.08,
          delay: 0.05,
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());

      window.setTimeout(() => {
        elements.forEach((el) => {
          if (window.getComputedStyle(el).opacity === '0') gsap.set(el, { opacity: 1, y: 0 });
        });
      }, 900);
    }, root);

    return () => ctx.revert();
  }, [loading, rows.length, error]);

  return (
    <div ref={rootRef} className="bg-white h-full">
      {/* Header */}
      <div data-reveal className="p-4 lg:p-6 border-b border-gray-100">
        <h1 className="text-xl lg:text-2xl font-bold">Vote ton arrêt</h1>
      </div>

      {/* pb-24 pour éviter que le bas passe sous la nav mobile */}
      <div className="p-6 lg:px-12 lg:py-8 max-w-4xl mx-auto space-y-6 lg:space-y-8 pb-24 lg:pb-0">
        {/* Intro */}
        <div data-reveal className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-center mb-4">
            <VoteIcon className="w-16 h-16 lg:w-20 lg:h-20 text-yellow-400" strokeWidth={1.5} />
          </div>

          <h2 className="text-2xl lg:text-3xl font-semibold text-center">Vote ton arrêt</h2>

          <p className="text-gray-600 lg:text-lg text-center max-w-2xl mx-auto">
            Chaque semaine, une journée &quot;Joker&quot; est laissée libre dans le planning. Le lieu ayant le plus de
            votes gagne l&apos;arrêt du bus.
          </p>

          <p className="text-xs text-gray-500 text-center">Semaine de vote : {pollId}</p>
        </div>

        {/* Countdown */}
        <div
          data-reveal
          className="p-4 lg:p-6 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-center gap-2"
        >
          <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
          <span className="font-medium lg:text-lg text-yellow-900">Temps restant : {timeLeft}</span>
        </div>

        {/* Error */}
        {error && (
          <div data-reveal className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <div className="mt-2 text-xs text-red-600">
              Si tu es en dev sur Vite: crée <code className="px-1 bg-red-100 rounded">.env.local</code> avec{' '}
              <code className="px-1 bg-red-100 rounded">VITE_API_BASE=http://localhost/tadao</code> (ou ton URL MAMP/WAMP),
              puis relance <code className="px-1 bg-red-100 rounded">npm run dev</code>.
            </div>
          </div>
        )}

        {/* Votes list */}
        <div className="space-y-3 lg:space-y-4">
          <h3 data-reveal className="font-medium lg:text-lg">
            Classement actuel
          </h3>

          {loading ? (
            <div data-reveal className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
              Chargement…
            </div>
          ) : rows.length === 0 ? (
            <div data-reveal className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
              Aucun vote pour l&apos;instant. Sois le premier 👀
            </div>
          ) : (
            rows.map((item, index) => (
              <div key={item.city} data-reveal className="space-y-2 p-4 lg:p-5 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium lg:text-lg">{item.city}</span>
                  </div>
                  <span className="text-gray-600 lg:text-lg">
                    {item.votes} vote{item.votes > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                  <div
                    className={`h-2 lg:h-3 rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-gray-400'}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div data-reveal className="space-y-3 pt-4 lg:flex lg:gap-4 lg:space-y-0">
          <button
            onClick={() => navigate(hasVoted ? 'vote-results' : 'vote-choose')}
            disabled={!!error || loading}
            className={`w-full lg:flex-1 py-4 rounded-lg font-medium transition-colors ${
              !!error || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : hasVoted
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-yellow-400 text-black hover:bg-yellow-500'
            }`}
          >
            {hasVoted ? 'Déjà voté ✅ (voir résultats)' : 'Voter maintenant'}
          </button>

          <button
            onClick={() => navigate('vote-results')}
            className="w-full lg:flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Voir les résultats précédents
          </button>
        </div>

        {hasVoted && !error && (
          <div data-reveal className="text-center text-sm text-gray-600">
            Merci ! Ton vote est enregistré pour cette semaine.
          </div>
        )}
      </div>
    </div>
  );
}