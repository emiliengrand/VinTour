import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { useState } from 'react';

interface VoteChooseLocationProps {
  navigate: (screen: string, data?: any) => void;
}

export default function VoteChooseLocation({ navigate }: VoteChooseLocationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const suggestions = [
    { name: 'Carvin - Place Foch', type: 'Centre-ville' },
    { name: 'Bruay-la-Buissière - Gare', type: 'Transport' },
    { name: 'Sallaumines - Centre', type: 'Centre-ville' },
    { name: 'Noyelles-Godault - Zone commerciale', type: 'Commerce' },
    { name: 'Billy-Montigny - Mairie', type: 'Centre-ville' },
    { name: 'Harnes - Stade Municipal', type: 'Sport' },
    { name: 'Courrières - Place Jean Jaurès', type: 'Centre-ville' },
  ];

  const filteredSuggestions = searchQuery
    ? suggestions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestions;

  const handleVote = () => {
    if (selectedLocation) {
      navigate('voteConfirmation', { location: selectedLocation });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => navigate('voteHome')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Choisis un lieu</h1>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une ville, quartier ou arrêt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-medium">💡 Astuce :</span> Choisis un lieu central et accessible en transport pour maximiser tes chances !
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">
            {searchQuery ? 'Résultats' : 'Suggestions locales'}
          </h3>
          
          <div className="space-y-2">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setSelectedLocation(suggestion.name)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedLocation === suggestion.name
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{suggestion.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6">{suggestion.type}</div>
                  </div>
                  
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedLocation === suggestion.name
                      ? 'bg-yellow-400 border-yellow-400'
                      : 'border-gray-300'
                  }`}>
                    {selectedLocation === suggestion.name && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun résultat trouvé</p>
              <p className="text-sm mt-2">Essaie un autre terme de recherche</p>
            </div>
          )}
        </div>

        {/* Validate Button */}
        <button
          onClick={handleVote}
          disabled={!selectedLocation}
          className={`w-full py-4 rounded-lg font-medium transition ${
            selectedLocation
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
