# Rejoindre le bus pop-up (MAMP) — style Google Maps (liste + détails)

## Installation
1) Copie le dossier `tadao_popbus_mamp/` dans :
   `Applications/MAMP/htdocs/`
2) Démarre MAMP (Apache)
3) Ouvre :
   `http://localhost:8888/tadao_popbus_mamp/`

## Configurer la destination (bus)
Édite **`api/bus.json`** (lat/lon).

## Fonctionnalités
- 📍 Géolocalisation
- **Liste de plusieurs itinéraires** (départs différents, correspondances possibles)
- Clic sur un itinéraire → **détails** (où monter / où descendre + horaires)
- Carte plus "design" : fond CARTO Voyager (Leaflet)
- Tracé sur la carte :
  - via `api/route/osrm_proxy.php` (OSRM public, profil driving) pour un tracé “sur routes” (approx)
  - fallback en segments si OSRM est indisponible

## API
- `api/route/options.php?lat=...&lon=...&k=8`

## Notes
- Horaires issus du **GTFS** (théoriques), pas de temps réel.


## Tri
- La liste est triée par **heure de départ** (et non par durée).


## Notes
- L'app ne propose plus d'itinéraire "à pied" (trop long). Si aucun trajet bus n'est trouvé, un message s'affiche.


## Heuristique anti "micro-trajets"
- Par défaut, on ignore les trajets bus < 2min30 **et** < 500m (paramètres: `min_ride_s`, `min_ride_m`).
