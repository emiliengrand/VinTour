import L from "leaflet";

// Leaflet's default marker icons don't work out-of-the-box with bundlers
// (Vite / Webpack) because the image URLs are resolved at runtime.
// This file patches the defaults to use imported assets.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Vite will resolve these to hashed URLs in dev/build.
// @ts-expect-error - image modules are handled by Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-expect-error - image modules are handled by Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-expect-error - image modules are handled by Vite
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
