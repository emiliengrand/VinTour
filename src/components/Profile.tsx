import { ArrowLeft, ChevronRight, Bell, Vote, ShoppingBag, MapPin, HelpCircle } from 'lucide-react';

interface ProfileProps {
  navigate: (screen: string, data?: any) => void;
}

export default function Profile({ navigate }: ProfileProps) {
  const menuSections = [
    {
      title: 'Mon activité',
      items: [
        { icon: Bell, label: 'Mes alertes', count: 3, action: 'alertSettings' },
        { icon: Vote, label: 'Mes votes', count: 1, action: 'voteHome' },
        { icon: ShoppingBag, label: 'Mes achats Outlet', count: 0, action: 'outletHome' },
        { icon: MapPin, label: 'Mes villes suivies', count: 2, action: 'planning' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Aide / FAQ', action: 'faq' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('home')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Profil & Paramètres</h1>
      </div>

      <div className="p-6">
        {/* User Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-xl font-medium mb-1">Utilisateur Vinted Bus</h2>
          <p className="text-gray-600 text-sm">Membre depuis janvier 2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">3</div>
            <div className="text-xs text-gray-600 mt-1">Alertes actives</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <div className="text-xs text-gray-600 mt-1">Vote cette semaine</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">0</div>
            <div className="text-xs text-gray-600 mt-1">Achats Outlet</div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h3 className="font-medium text-gray-500 text-sm uppercase mb-3">
              {section.title}
            </h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => navigate(item.action)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span className="bg-cyan-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 mt-12">
          <p className="mb-1">Vinted x Tadao – Vinted Bus</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
