import React from "react";

interface MapScreenProps {
  navigate: (screen: string) => void;
}

/**
 * Carte Tadao (design d'origine)
 * On embarque directement la page PHP (public/carte/index.php) servie par WAMP.
 *
 * Surcharge possible via .env.local :
 *   VITE_CARTE_URL=http://localhost/tadao/carte/index.php
 */
export default function MapScreen({ navigate }: MapScreenProps) {
  // navigate est conservé pour compatibilité avec la nav existante.
  const src = import.meta.env.VITE_CARTE_URL ?? "http://localhost/tadao/carte/index.php";

  return (
    <div className="relative w-full h-full">
      <iframe
        title="Carte Tadao"
        src={src}
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        allow="geolocation"
      />
    </div>
  );
}
