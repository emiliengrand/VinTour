import React, { useLayoutEffect, useRef } from 'react';
import {
  MapPin,
  Package,
  Shirt,
  DollarSign,
  Bell,
  User,
  Instagram,
  Facebook,
} from 'lucide-react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HomeScreenProps {
  navigate: (screen: string) => void;
}

function findScrollContainer(start: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = start;

  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY || style.overflow;
    const isScrollable = /(auto|scroll)/.test(overflowY);

    if (isScrollable && el.scrollHeight > el.clientHeight + 1) return el;
    el = el.parentElement;
  }

  return null;
}

export default function HomeScreen({ navigate }: HomeScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) return;

    const scrollerEl = findScrollContainer(root.parentElement);

    const ctx = gsap.context(() => {
      const makeST = (trigger: Element): ScrollTrigger.Vars => {
        const st: ScrollTrigger.Vars = {
          trigger,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        };
        if (scrollerEl) st.scroller = scrollerEl;
        return st;
      };

      const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
      const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-stagger]'));

      // Reveals simples
      reveals.forEach((el) => {
        if (el.dataset.gsapReveal === '1') return;
        el.dataset.gsapReveal = '1';

        // reset sécurité (évite un état “bloqué”)
        gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform,opacity' });

        // puis on anime
        gsap.set(el, { opacity: 0, y: 18 });

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: makeST(el),
        });
      });

      // Reveals en groupe (stagger)
      groups.forEach((group) => {
        if (group.dataset.gsapStagger === '1') return;
        group.dataset.gsapStagger = '1';

        const items = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal-item]'));
        if (!items.length) return;

        // reset sécurité
        gsap.set(items, { opacity: 1, y: 0, scale: 1, clearProps: 'transform,opacity' });

        gsap.set(items, { opacity: 0, y: 16, scale: 0.985 });

        gsap.to(items, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: (() => {
            const st = makeST(group);
            (st as any).start = 'top 82%';
            return st;
          })(),
        });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      // FAIL-SAFE : force visible si jamais ça reste opacity:0
      window.setTimeout(() => {
        const all = [
          ...Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]')),
          ...Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-item]')),
        ];

        all.forEach((el) => {
          const cs = window.getComputedStyle(el);
          if (cs.opacity === '0' || cs.visibility === 'hidden') {
            gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: 'transform,opacity' });
          }
        });
      }, 300);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-white min-h-screen overflow-x-hidden">
      {/* Header */}
      <div data-reveal className="p-4 flex justify-between items-center border-b border-gray-100 lg:hidden">
        <div className="text-xl lg:text-2xl font-bold">Vinted Bus</div>
        <button onClick={() => navigate('profile')} className="p-2 lg:hidden">
          <User className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Container principal */}
      <div className="p-6 lg:px-12 lg:py-8 max-w-6xl mx-auto space-y-8 lg:space-y-12 pb-24 lg:pb-0">
        {/* Hero */}
        <section data-reveal className="relative overflow-hidden rounded-2xl min-h-[520px] lg:min-h-[620px]">
          <img
            src="https://images.unsplash.com/photo-1599012307530-d163bd04ecab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBzdG9yZXxlbnwxfHx8fDE3Njc3OTQxODl8MA&ixlib=rb-4.1.0&q=80&w=1600"
            alt="Vinted Bus"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

          <div className="relative h-full p-6 lg:p-12 flex items-center">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center px-4 py-2 bg-[#ECC625] text-black backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                Maintenant dans le Bassin Minier
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Le premier Pop-up store itinérant du Bassin Minier.
              </h1>

              <p className="text-lg lg:text-xl text-gray-200 mb-8">
                Pop-up store itinérant • 0€ frais de port • Essayage gratuit
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('map')}
                  className="inline-flex items-center gap-2 px-8 py-5 rounded-xl bg-[#007782] text-white font-semibold hover:opacity-90 transition
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007782]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <MapPin className="w-5 h-5" />
                  Voir le bus en direct
                </button>

                <button
                  onClick={() => document.getElementById('home-footer')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-semibold transition-colors"
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section data-reveal className="space-y-4 lg:space-y-6">
          <div data-reveal-stagger className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              data-reveal-item
              className="flex items-start gap-3 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Package className="w-6 h-6 text-[#007782] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Adieu les cartons</h3>
                <p className="text-sm text-gray-600">Dépose tes vêtements sans emballage directement au comptoir.</p>
              </div>
            </div>

            <div
              data-reveal-item
              className="flex items-start gap-3 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Shirt className="w-6 h-6 text-[#007782] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Essayage immédiat</h3>
                <p className="text-sm text-gray-600">
                  Peur de la taille ? Une cabine t&apos;attend à bord pour tester avant de payer.
                </p>
              </div>
            </div>

            <div
              data-reveal-item
              className="flex items-start gap-3 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <DollarSign className="w-6 h-6 text-[#ECC625] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Prix Cassés</h3>
                <p className="text-sm text-gray-600">
                  Zéro frais de port sur le Click & Collect, des prix imbattables.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Tracker */}
        <section data-reveal className="space-y-3 lg:space-y-4 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl lg:text-2xl font-semibold">Le Vin&apos;Tour passe chez vous.</h2>

          <div className="space-y-2">
            <div data-reveal className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium">Aujourd&apos;hui : Lens - Gare</p>
                <p className="text-sm text-gray-600">Jusqu&apos;à 18h</p>
              </div>
            </div>

            <div data-reveal className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">Demain : Béthune - Université</p>
              </div>
            </div>

            <div data-reveal className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">Mercredi : Hénin-Beaumont - Place Jean Jaurès</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('alert-settings')}
            className="w-full lg:w-auto lg:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            M&apos;alerter quand le bus est dans ma ville
          </button>
        </section>

        {/* Partenaires */}
        <section data-reveal className="space-y-3 lg:space-y-4">
          <h2 className="text-2xl lg:text-3xl font-semibold">Plus qu&apos;un bus, une solution anti-inflation.</h2>

          <p className="text-gray-600 lg:text-lg max-w-3xl">
            En partenariat avec le réseau Tadao, nous rapprochons la seconde main de ceux qui en ont besoin. Moins de
            camions de livraison sur les routes, plus de pouvoir d&apos;achat dans votre poche.
          </p>

          <div data-reveal className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Partenaires</p>
            <p className="font-medium">Vinted x Tadao x Région Hauts-de-France</p>
          </div>
        </section>

        {/* Footer */}
        <footer id="home-footer" className="bg-black text-white rounded-2xl overflow-hidden">
          <div className="px-12 py-16 lg:px-20 lg:py-20">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-14 lg:gap-24">
              <div className="max-w-xl">
                <h3 className="text-5xl font-bold mb-8 tracking-tight">Vin&apos;Tour</h3>

                <p className="text-gray-400 text-lg leading-relaxed mb-10">
                  Retrouvez le bus dans une des 15 villes du Bassin Minier chaque semaine
                </p>

                <button
                  onClick={() => navigate('map')}
                  className="inline-flex items-center gap-2 px-8 py-5 rounded-xl bg-[#007782] text-white font-semibold hover:opacity-90 transition
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007782]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <MapPin className="w-5 h-5" />
                  Voir le bus en direct
                </button>
              </div>

              <div className="space-y-10 lg:max-w-xl">
                <div className="space-y-3">
                  <h5 className="text-xl font-semibold">Villes desservies</h5>
                  <p className="text-gray-400 leading-relaxed">
                    Lens • Béthune • Hénin-Beaumont • Liévin • Carvin • Bruay-la-Buissière • Douai • Arras • Harnes •
                    Méricourt • Oignies • Billy-Berclau
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-lg font-semibold">
                  <button onClick={() => navigate('faq')} className="text-gray-300 hover:text-white transition-colors">
                    FAQ
                  </button>
                  <span className="text-gray-700">•</span>
                  <button className="text-gray-300 hover:text-white transition-colors">Contact</button>
                  <span className="text-gray-700">•</span>
                  <button className="text-gray-300 hover:text-white transition-colors">CGU</button>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <p className="text-sm text-gray-500">© 2026 Vin&apos;Tour</p>

              <div className="flex items-center gap-5">
                <button className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="w-6 h-6" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}