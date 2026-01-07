import React from 'react';
import { MapPin, Package, Shirt, DollarSign, Bell, User } from 'lucide-react';

interface HomeScreenProps {
  navigate: (screen: string) => void;
}

export default function HomeScreen({ navigate }: HomeScreenProps) {
  return (
    <div className="bg-white min-h-full">
      {/* Header */}
      {/*
        Mobile-only header.
        On desktop we already have the DesktopNav, so this avoids the extra band under the nav.
      */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100 lg:hidden">
        <div className="text-xl lg:text-2xl font-bold">Vinted Bus</div>
        <button onClick={() => navigate('profile')} className="p-2 lg:hidden">
          <User className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="p-6 lg:px-12 lg:py-8 max-w-6xl mx-auto space-y-8 lg:space-y-12">
        {/* Section 1 - Hero */}
        <section className="space-y-4 lg:space-y-6">
          <h1 className="text-4xl lg:text-6xl leading-tight">
            Vinted au plus proche de vous via le réseau Tadao !
          </h1>

          <p className="text-gray-600 lg:text-lg max-w-3xl">
            Le premier Pop-up store itinérant du Bassin Minier. Achetez, vendez, essayez. 0€ de frais de port. 0 colis à faire.
          </p>

          <button
            onClick={() => navigate('map')}
            className="w-full lg:w-auto lg:px-8 py-4 bg-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-600 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Voir où est le bus en direct
          </button>
        </section>

        {/* Section 2 - Arguments choc */}
        <section className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <Package className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Adieu les cartons</h3>
                <p className="text-sm text-gray-600">Dépose tes vêtements sans emballage directement au comptoir.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <Shirt className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Essayage immédiat</h3>
                <p className="text-sm text-gray-600">Peur de la taille ? Une cabine t'attend à bord pour tester avant de payer.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <DollarSign className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Prix Cassés</h3>
                <p className="text-sm text-gray-600">Zéro frais de port sur le Click & Collect, des prix imbattables.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - Live Tracker */}
        <section className="space-y-3 lg:space-y-4 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl lg:text-2xl font-semibold">Le Vinted Tour passe chez vous.</h2>

          <div className="space-y-2">
            <div className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium">Aujourd'hui : Lens - Gare</p>
                <p className="text-sm text-gray-600">Jusqu'à 18h</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">Demain : Béthune - Université</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
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
            M'alerter quand le bus est dans ma ville
          </button>
        </section>

        {/* Section 5 - Coup de pouce */}
        <section className="space-y-3 lg:space-y-4">
          <h2 className="text-2xl lg:text-3xl font-semibold">Plus qu'un bus, une solution anti-inflation.</h2>

          <p className="text-gray-600 lg:text-lg max-w-3xl">
            En partenariat avec le réseau Tadao, nous rapprochons la seconde main de ceux qui en ont besoin. Moins de camions de livraison sur les routes, plus de pouvoir d'achat dans votre poche.
          </p>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Partenaires</p>
            <p className="font-medium">Vinted x Tadao x Région Hauts-de-France</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="space-y-4 pt-8 border-t border-gray-200">
          <p className="text-center font-medium lg:text-lg">Le style n'a pas de prix, ni de frontière.</p>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Télécharger l'App</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Devenir Bénévole</button>
            <button onClick={() => navigate('faq')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">FAQ</button>
          </div>

          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <button>Instagram</button>
            <button>TikTok</button>
          </div>
        </footer>
      </div>
    </div>
  );
}