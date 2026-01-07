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

  const navigate = (screen: string) => setCurrentScreen(screen);

  const finishOnboarding = () => {
    setShowOnboarding(false);
    setCurrentScreen("home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // ✅ Only onboarding step left: Onboarding1 -> Home
      case "onboarding1":
        return <Onboarding1 onNext={finishOnboarding} />;

      // Home
      case "home":
        return <HomeScreen navigate={navigate} />;

      // Map
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

      // Vote
      case "vote":
        return <VoteHome navigate={navigate} />;
      case "vote-choose":
        return <VoteChoose navigate={navigate} />;
      case "vote-confirm":
        return <VoteConfirm navigate={navigate} />;
      case "vote-results":
        return <VoteResults navigate={navigate} />;

      // Profile
      case "profile":
        return <Profile navigate={navigate} />;
      case "faq":
        return <FAQ navigate={navigate} />;

      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      {/* Desktop Top Nav - Hidden on mobile */}
      {!showOnboarding && (
        <div className="hidden lg:block">
          <DesktopNav currentScreen={currentScreen} navigate={navigate} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">{renderScreen()}</div>

        {/* Bottom Nav - Only on mobile */}
        {!showOnboarding && (
          <div className="lg:hidden">
            <BottomNav currentScreen={currentScreen} navigate={navigate} />
          </div>
        )}
      </div>
    </div>
  );
}