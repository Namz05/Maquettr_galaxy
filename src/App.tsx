import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/common/ToastContainer';

// The 10 Main Screens
import { Screen1Login } from './screens/Screen1Login';
import { Screen2Dashboard } from './screens/Screen2Dashboard';
import { Screen3Rooms } from './screens/Screen3Rooms';
import { Screen4Reservations } from './screens/Screen4Reservations';
import { Screen5RestaurantPOS } from './screens/Screen5RestaurantPOS';
import { Screen6RestaurantHistory } from './screens/Screen6RestaurantHistory';
import { Screen7Transactions } from './screens/Screen7Transactions';
import { Screen8FinancialReports } from './screens/Screen8FinancialReports';
import { Screen9StockStatus } from './screens/Screen9StockStatus';
import { Screen10StockMovements } from './screens/Screen10StockMovements';
import { Screen11HR } from './screens/Screen11HR';

const MainLayout: React.FC = () => {
  const { currentScreen, isAuthenticated, sidebarCollapsed } = useApp();

  // If unauthenticated or explicit login screen, display Screen 1 (Login)
  if (!isAuthenticated || currentScreen === 'login') {
    return (
      <>
        <Screen1Login />
        <ToastContainer />
      </>
    );
  }

  // Render current authenticated screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Screen2Dashboard />;
      case 'rooms':
        return <Screen3Rooms />;
      case 'reservations':
        return <Screen4Reservations />;
      case 'restaurant-pos':
        return <Screen5RestaurantPOS />;
      case 'restaurant-history':
        return <Screen6RestaurantHistory />;
      case 'finances-transactions':
        return <Screen7Transactions />;
      case 'finances-reports':
        return <Screen8FinancialReports />;
      case 'stock-status':
        return <Screen9StockStatus />;
      case 'stock-movements':
        return <Screen10StockMovements />;
      case 'hr-staff':
        return <Screen11HR />;
      default:
        return <Screen2Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex text-[#263445]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Content Body Viewport */}
        <main className="flex-1 pt-20 pb-10 px-6 sm:px-8 max-w-[1600px] w-full mx-auto">
          {renderScreen()}
        </main>
      </div>

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
