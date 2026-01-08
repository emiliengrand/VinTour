import React from "react";
import { Home, MapPin, Vote, Settings } from "lucide-react";

interface BottomNavProps {
  currentScreen: string;
  navigate: (screen: string) => void;
}

const tabs = [
  { key: "home", label: "Home", icon: Home },
  { key: "map", label: "Carte", icon: MapPin },
  { key: "vote", label: "Vote", icon: Vote },
  { key: "profile", label: "Paramètres", icon: Settings },
];

export default function BottomNav({ currentScreen, navigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigation"
      style={{
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = currentScreen === t.key;

        return (
          <button
            key={t.key}
            onClick={() => navigate(t.key)}
            style={{
              background: "transparent",
              border: "none",
              padding: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              color: active ? "#007782" : "#6b7280",
              fontWeight: active ? 700 : 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <Icon size={22} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}