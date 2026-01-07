import { MapPin, Package, Shirt, DollarSign, User } from 'lucide-react';

interface HomeProps {
  navigate: (screen: string, data?: any) => void;
}

export default function Home({ navigate }: HomeProps) {
  return (
    <div className="overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="text-xl font-bold">Vinted Bus</div>
        <button onClick={() => navigate('profile')} className="p-2">
          <User className="w-6 h-6" />
        </button>
      </div>

      {/* Section 1 - Hero */}
      <section className="p-6 text-center">
        <h1 className="text-3xl mb-4">
          Vinted descend du web et monte dans le bus.
        </h1>
        <p className="text-gray-600 mb-6">
          Le premier Pop-up store itinérant du Bassin Minier. Achetez, vendez, essayez.
          0€ de frais de port. 0 colis à faire.
        </p>
        <button
          onClick={() => navigate('map')}
          className="w-full bg-cyan-500 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          Voir où est le bus en direct
        </button>
      </section>

      {/* Section 2 - Arguments choc */}
      <section className="p-6 bg-gray-50">
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="text-2xl">📦</div>
            <div>
              <h3 className="font-medium mb-1">Adieu les cartons</h3>
              <p className="text-sm text-gray-600">
                Dépose tes vêtements sans emballage directement au comptoir.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="text-2xl">👗</div>
            <div>
              <h3 className="font-medium mb-1">Essayage immédiat</h3>
              <p className="text-sm text-gray-600">
                Peur de la taille ? Une cabine t'attend à bord pour tester avant de payer.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="text-2xl">💸</div>
            <div>
              <h3 className="font-medium mb-1">Prix Cassés</h3>
              <p className="text-sm text-gray-600">
                Zone Outlet 'Tout à 3€' et zéro frais de port sur le Click & Collect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Live Tracker résumé */}
      <section className="p-6 bg-gray-50">
        <h2 className="text-xl mb-4">Le Vinted Tour passe chez vous.</h2>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="flex-1">
              <div className="font-medium">Aujourd'hui : Lens - Gare</div>
              <div className="text-sm text-gray-500">Jusqu'à 18h</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="flex-1">
              <div className="font-medium">Demain : Béthune - Université</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="flex-1">
              <div className="font-medium">Mercredi : Hénin-Beaumont - Place Jean Jaurès</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('alertSettings')}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          🔔 M'alerter quand le bus est dans ma ville
        </button>
      </section>

      {/* Section 5 - Coup de pouce */}
      <section className="p-6">
        <h2 className="text-2xl mb-4">Plus qu'un bus, une solution anti-inflation.</h2>
        <p className="text-gray-600 mb-4">
          En partenariat avec le réseau Tadao, nous rapprochons la seconde main de ceux qui en ont besoin.
          Moins de camions de livraison sur les routes, plus de pouvoir d'achat dans votre poche.
        </p>

        <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-lg">
          <span className="font-medium text-sm">Vinted</span>
          <span className="text-gray-400">×</span>
          <span className="font-medium text-sm">Tadao</span>
          <span className="text-gray-400">×</span>
          <span className="font-medium text-sm">Région HdF</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 bg-black text-white text-center">
        <p className="mb-4 italic">Le style n'a pas de prix, ni de frontière.</p>

        <div className="flex justify-center gap-4 mb-4 text-sm">
          <button className="underline">Télécharger l'App</button>
          <button className="underline">Devenir Bénévole</button>
          <button onClick={() => navigate('faq')} className="underline">FAQ</button>
        </div>

        <div className="flex justify-center gap-6 text-sm">
          <button>Instagram</button>
          <button>TikTok</button>
        </div>
      </footer>
    </div>
  );
}