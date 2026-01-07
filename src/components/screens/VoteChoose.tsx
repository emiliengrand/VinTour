import React, { useState } from 'react';
import { ArrowLeft, Search, MapPin } from 'lucide-react';

interface VoteChooseProps {
  navigate: (screen: string) => void;
}

export default function VoteChoose({ navigate }: VoteChooseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');

  const suggestions = [
    'Douai - Centre',
    'Liévin - Stade',
    'Carvin - Mairie',
    'Bruay-la-Buissière - Place',
    'Noeux-les-Mines - Gare',
    'Avion - Centre',
  ];

  const filteredSuggestions = suggestions.filter(place =>
    place.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Search field */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ville, quartier ou arrêt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className={`w-full p-4 rounded-lg border-2 text-left flex items-center gap-3 ${
                  selectedPlace === place
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <MapPin className={`w-5 h-5 ${
                  selectedPlace === place ? 'text-yellow-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">{place}</span>
                {selectedPlace === place && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('vote-confirm')}
          disabled={!selectedPlace}
          className={`w-full py-4 rounded-lg font-medium ${
            selectedPlace
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Valider mon vote
        </button>
      </div>
    </div>
  );
}
