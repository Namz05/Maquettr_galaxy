import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';
import {
  IconLayoutDashboard,
  IconBed,
  IconCalendarEvent,
  IconToolsKitchen2,
  IconReceipt,
  IconWallet,
  IconChartBar,
  IconPackages,
  IconArrowsExchange,
  IconUsers,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconBuildingSkyscraper
} from '@tabler/icons-react';

export const Sidebar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    sidebarCollapsed,
    toggleSidebar,
    logout,
  } = useApp();

  interface NavItem {
    id: ScreenId;
    label: string;
    icon: React.ReactNode;
  }

  interface NavSection {
    sectionTitle: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      sectionTitle: '',
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          icon: <IconLayoutDashboard className="w-5 h-5" stroke={1.75} />,
        },
      ],
    },
    {
      sectionTitle: 'HÉBERGEMENT',
      items: [
        {
          id: 'rooms',
          label: 'Chambres',
          icon: <IconBed className="w-5 h-5" stroke={1.75} />,
        },
        {
          id: 'reservations',
          label: 'Réservations',
          icon: <IconCalendarEvent className="w-5 h-5" stroke={1.75} />,
        },
      ],
    },
    {
      sectionTitle: 'RESTAURANT',
      items: [
        {
          id: 'restaurant-pos',
          label: 'Ventes',
          icon: <IconToolsKitchen2 className="w-5 h-5" stroke={1.75} />,
        },
        {
          id: 'restaurant-history',
          label: 'Historique / Caisse',
          icon: <IconReceipt className="w-5 h-5" stroke={1.75} />,
        },
      ],
    },
    {
      sectionTitle: 'FINANCES',
      items: [
        {
          id: 'finances-transactions',
          label: 'Transactions',
          icon: <IconWallet className="w-5 h-5" stroke={1.75} />,
        },
        {
          id: 'finances-reports',
          label: 'Rapports',
          icon: <IconChartBar className="w-5 h-5" stroke={1.75} />,
        },
      ],
    },
    {
      sectionTitle: 'STOCK',
      items: [
        {
          id: 'stock-status',
          label: 'État du stock',
          icon: <IconPackages className="w-5 h-5" stroke={1.75} />,
        },
        {
          id: 'stock-movements',
          label: 'Mouvements',
          icon: <IconArrowsExchange className="w-5 h-5" stroke={1.75} />,
        },
      ],
    },
    {
      sectionTitle: 'RESSOURCES HUMAINES',
      items: [
        {
          id: 'hr-staff',
          label: 'Personnel & RH',
          icon: <IconUsers className="w-5 h-5" stroke={1.75} />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white border-r border-[#E5EAF1] transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E5EAF1] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4C97DB] to-[#58A2F7] flex items-center justify-center text-white shadow-sm shrink-0">
            <IconBuildingSkyscraper className="w-5 h-5" stroke={1.75} />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-base font-bold tracking-tight text-[#263445] leading-tight">
                GALAXY HÔTEL
              </span>
              <span className="text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                Système de Gestion
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-[#718096] hover:text-[#263445] hover:bg-[#F5F8FC] transition-colors"
          title={sidebarCollapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
        >
          {sidebarCollapsed ? (
            <IconChevronRight className="w-4 h-4" stroke={1.75} />
          ) : (
            <IconChevronLeft className="w-4 h-4" stroke={1.75} />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.sectionTitle && !sidebarCollapsed && (
              <p className="px-3 text-[11px] font-semibold text-[#718096] tracking-wider uppercase mb-1.5">
                {section.sectionTitle}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#4C97DB] text-white shadow-sm shadow-[#4C97DB]/20 font-semibold'
                      : 'text-[#263445] hover:bg-[#F5F8FC] hover:text-[#4C97DB]'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-[#718096]'}`}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-[#E5EAF1] shrink-0 bg-[#F5F8FC]/60">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full bg-[#4C97DB]/15 border border-[#4C97DB]/30 flex items-center justify-center text-[#4C97DB] font-bold text-sm shrink-0">
            AD
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#263445] truncate leading-tight">
                Administrateur
              </p>
              <p className="text-xs text-[#718096] truncate">Administrateur</p>
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-[#718096] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <IconLogout className="w-4 h-4" stroke={1.75} />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <button
            onClick={logout}
            className="w-full mt-2 flex justify-center p-2 text-[#718096] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <IconLogout className="w-5 h-5" stroke={1.75} />
          </button>
        )}
      </div>
    </aside>
  );
};
