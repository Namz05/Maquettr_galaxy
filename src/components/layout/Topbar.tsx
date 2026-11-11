import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';

export const Topbar: React.FC = () => {
  const { currentScreen, sidebarCollapsed } = useApp();

  // Screen meta mapping
  const screenMeta: Record<ScreenId, { title: string }> = {
    login: { title: 'Connexion' },
    dashboard: { title: 'Tableau de bord' },
    rooms: { title: 'Gestion des chambres' },
    reservations: { title: 'Réservations' },
    'restaurant-pos': { title: 'Restaurant – Enregistrement des ventes' },
    'restaurant-history': { title: 'Historique du restaurant et caisse' },
    'finances-transactions': { title: 'Transactions et finances' },
    'finances-reports': { title: 'Rapports financiers' },
    'stock-status': { title: 'Gestion du stock' },
    'stock-movements': { title: 'Mouvements de stock' },
  };

  const currentMeta = screenMeta[currentScreen] || { title: 'Tableau de bord' };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-[#E5EAF1] flex items-center px-6 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div>
        <h1 className="text-xl font-bold text-[#263445] tracking-tight">
          {currentMeta.title}
        </h1>
      </div>
    </header>
  );
};
