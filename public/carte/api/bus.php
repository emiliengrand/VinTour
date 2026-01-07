<?php
// ✅ FICHIER À ÉDITER : mets ici les coordonnées exactes de stationnement du bus pop-up
// Tu peux éditer soit bus.json, soit changer les valeurs ci-dessous (mais recommandé: bus.json)
require_once __DIR__ . "/lib.php";

$busJson = __DIR__ . "/bus.json";
if (!file_exists($busJson)) {
  error_response("Fichier bus.json introuvable", 500);
}
$bus = json_decode(file_get_contents($busJson), true);
if (!is_array($bus) || !isset($bus["lat"]) || !isset($bus["lon"])) {
  error_response("bus.json invalide (lat/lon manquants)", 500);
}

json_response($bus);
