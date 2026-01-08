import React, { useState } from "react";

// Import screens
import Onboarding1 from "./components/screens/Onboarding1";
import HomeScreen from "./components/screens/HomeScreen";
import MapScreen from "./components/screens/MapScreen";
import StopDetails from "./components/screens/StopDetails";
import WeekSchedule from "./components/screens/WeekSchedule";
import AlertSettings from "./components/screens/AlertSettings";
import AlertConfirm from "./components/screens/AlertConfirm";
import VoteHome from "./components/screens/VoteHome";
import VoteChoose from "./components/screens/VoteChoose";
import VoteConfirm from "./components/screens/VoteConfirm";
import VoteResults from "./components/screens/VoteResults";
import Profile from "./components/screens/Profile";
import FAQ from "./components/screens/FAQ";

import BottomNav from "./components/BottomNav";
import DesktopNav from "./components/DesktopNav";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("onboarding1");
  const [showOnboarding, setShowOnboarding] = useState(true);

  const isOnboarding = showOnboarding && currentScreen === "onboarding1";

  const navigate = (screen: string) => setCurrentScreen(screen);

  const finishOnboarding = () => {
    setShowOnboarding(false);
    setCurrentScreen("home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "onboarding1":
        return <Onboarding1 onNext={finishOnboarding} />;

      case "home":
        return <HomeScreen navigate={navigate} />;

      case "map":
        return <MapScreen navigate={navigate} />;
      case "stop-details":
        return <StopDetails navigate={navigate} />;
      case "week-schedule":
        return <WeekSchedule navigate={navigate} />;
      case "alert-settings":
        return <AlertSettings navigate={navigate} />;
      case "alert-confirm":
        return <AlertConfirm navigate={navigate} />;

      case "vote":
        return <VoteHome navigate={navigate} />;
      case "vote-choose":
        return <VoteChoose navigate={navigate} />;
      case "vote-confirm":
        return <VoteConfirm navigate={navigate} />;
      case "vote-results":
        return <VoteResults navigate={navigate} />;

      case "profile":
        return <Profile navigate={navigate} />;
      case "faq":
        return <FAQ navigate={navigate} />;

      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  // Hauteur nav : 72px + safe area iPhone (si présent)
  const navHeight = 72;

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      {!isOnboarding && (
        <div className="hidden lg:block">
          <DesktopNav currentScreen={currentScreen} navigate={navigate} />
        </div>
      )}

      {/* Zone viewport */}
      <div className="flex-1 relative min-h-0">
        {/* Contenu scrollable : on réserve l’espace de la nav en bas */}
        <div
          className="absolute inset-0 overflow-y-auto"
          style={{
            paddingBottom: isOnboarding ? 0 : `calc(${navHeight}px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          {renderScreen()}
        </div>

        {/* Nav mobile FIXED en bas d'écran (pas bas de page) */}
        {!isOnboarding && (
          <div
            className="lg:hidden fixed left-0 right-0 z-[99999]"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              height: `calc(${navHeight}px + env(safe-area-inset-bottom, 0px))`,
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              background: "white",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 -8px 20px rgba(0,0,0,0.06)",
            }}
          >
            <BottomNav currentScreen={currentScreen} navigate={navigate} />
          </div>
        )}
      </div>
    </div>
  );
}