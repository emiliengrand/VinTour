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
    <div className="w-full">
      {/*
        IMPORTANT:
        - Le contenu est dans un container scrollable.
        - Si la hauteur est en "auto", un iframe en 100% peut finir à 0px -> blanc.
        - On force donc une hauteur viewport côté MapScreen.
      */}
      <div className="relative w-full" style={{ height: "calc(100vh - 80px)" }}>
        <iframe
          title="Carte Tadao"
          src={src}
          className="w-full h-full"
          style={{ border: 0 }}
          allow="geolocation"
        />
      </div>

      {/* Fallback si l'iframe est bloqué (X-Frame-Options / CSP / serveur down) */}
      <div className="p-4 text-sm text-gray-600">
        Si la carte est blanche, ouvre la carte directement :{" "}
        <a className="underline" href={src} target="_blank" rel="noreferrer">
          {src}
        </a>
      </div>
    </div>
  );
}