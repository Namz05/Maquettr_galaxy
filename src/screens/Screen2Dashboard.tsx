import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconTrendingUp,
  IconReceipt,
  IconBed,
  IconCircleCheck,
  IconArrowRight,
  IconArrowUpRight,
  IconArrowDownRight,
  IconBuildingStore,
  IconCalendarEvent,
  IconWallet,
  IconClock
} from '@tabler/icons-react';
import {
  CalendarDateFilter,
  formatFrenchDateFull,
  formatFrenchDateShort
} from '../components/common/CalendarDateFilter';

export const Screen2Dashboard: React.FC = () => {
  const {
    reservations,
    transactions,
    restaurantSales,
    setCurrentScreen,
    selectedDate,
    setSelectedDate
  } = useApp();

  // Compute all dates with recorded operations
  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    transactions.forEach((t) => t.date && dates.add(t.date));
    restaurantSales.forEach((s) => s.date && dates.add(s.date));
    reservations.forEach((r) => {
      if (r.checkIn) dates.add(r.checkIn);
      if (r.checkOut) dates.add(r.checkOut);
    });
    return Array.from(dates);
  }, [transactions, restaurantSales, reservations]);

  // Day's financial metrics for selectedDate
  const dayRevenues = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Recette' && t.date === selectedDate && t.status === 'Validé')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedDate]);

  const dayExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Dépense' && t.date === selectedDate && t.status === 'Validé')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedDate]);

  const dayNetResult = dayRevenues - dayExpenses;

  // Month totals (for reference)
  const selectedMonthPrefix = selectedDate ? selectedDate.slice(0, 7) : '2026-11';
  const monthRevenues = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Recette' && t.status === 'Validé' && t.date.startsWith(selectedMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonthPrefix]);

  const monthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Dépense' && t.status === 'Validé' && t.date.startsWith(selectedMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonthPrefix]);

  // Day's room interactions
  const dayArrivals = useMemo(() => {
    return reservations.filter((r) => r.checkIn === selectedDate);
  }, [reservations, selectedDate]);

  const dayDepartures = useMemo(() => {
    return reservations.filter((r) => r.checkOut === selectedDate);
  }, [reservations, selectedDate]);

  const dayActiveStays = useMemo(() => {
    return reservations.filter(
      (r) => r.checkIn <= selectedDate && r.checkOut >= selectedDate && r.status !== 'Annulée'
    );
  }, [reservations, selectedDate]);

  // Day's restaurant sales
  const dayRestaurantSales = useMemo(() => {
    return restaurantSales.filter((s) => s.date === selectedDate);
  }, [restaurantSales, selectedDate]);

  // Day's financial transactions
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const formattedDateFull = formatFrenchDateFull(selectedDate);
  const formattedDateShort = formatFrenchDateShort(selectedDate);

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Row with Calendar Button */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Vue d'ensemble de l'établissement
          </h2>
        </div>

        {/* Filter Controls: Interactive Calendar Button */}
        <div className="flex items-center gap-2">
          <CalendarDateFilter
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            activeDates={activeDates}
            label="Date"
            align="right"
          />
        </div>
      </div>

      {/* 2 Cartes : CA du mois & Dépenses effectuées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: CA du mois */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#718096] mb-3">
            <span className="text-xs font-semibold">CA du mois</span>
            <div className="w-8 h-8 rounded-lg bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center">
              <IconTrendingUp stroke={1.75} className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#263445] font-mono tabular-nums leading-none">
              {monthRevenues.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans text-[#718096]">FCFA</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dépenses effectuées */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#718096] mb-3">
            <span className="text-xs font-semibold">Dépenses effectuées</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <IconReceipt stroke={1.75} className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#263445] font-mono tabular-nums leading-none">
              {monthExpenses.toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans text-[#718096]">FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc Fixe à 3 Colonnes : Hébergement · Restaurant · Finances */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1: Hébergement & Réception */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF1]">
              <span className="text-xs font-bold text-[#263445] flex items-center gap-1.5">
                <IconBed stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
                Hébergement & Réception
              </span>
              <button
                onClick={() => setCurrentScreen('reservations')}
                className="text-[11px] text-[#4C97DB] font-semibold hover:underline flex items-center gap-0.5"
              >
                Planning
                <IconArrowRight stroke={1.75} className="w-3 h-3" />
              </button>
            </div>

            {dayArrivals.length === 0 && dayDepartures.length === 0 ? (
              <p className="text-xs text-[#718096] py-3 italic">
                Aucun check-in ou check-out prévu à cette date.
              </p>
            ) : (
              <div className="space-y-2">
                {dayArrivals.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#4C97DB]/15 text-[#4C97DB] font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                        {res.roomNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#263445] truncate">{res.guestName}</p>
                        <p className="text-[11px] text-[#718096]">
                          Arrivée {res.roomCategory} · {res.occupants} pers.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        Check-in
                      </span>
                      <p className="text-[11px] font-mono text-[#263445] font-bold mt-0.5">
                        {res.totalAmount.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                  </div>
                ))}

                {dayDepartures.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                        {res.roomNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#263445] truncate">{res.guestName}</p>
                        <p className="text-[11px] text-[#718096]">
                          Départ prévu · {res.roomCategory}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        Check-out
                      </span>
                      <p className="text-[11px] font-mono text-[#263445] font-bold mt-0.5">
                        Solde: {res.balance.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne 2: Ventes Restaurant & Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF1]">
              <span className="text-xs font-bold text-[#263445] flex items-center gap-1.5">
                <IconBuildingStore stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
                Ventes Restaurant & Bar
              </span>
              <button
                onClick={() => setCurrentScreen('restaurant-history')}
                className="text-[11px] text-[#4C97DB] font-semibold hover:underline flex items-center gap-0.5"
              >
                Caisse
                <IconArrowRight stroke={1.75} className="w-3 h-3" />
              </button>
            </div>

            {dayRestaurantSales.length === 0 ? (
              <p className="text-xs text-[#718096] py-3 italic">
                Aucune commande restaurant enregistrée à cette date.
              </p>
            ) : (
              <div className="space-y-2">
                {dayRestaurantSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#263445] font-mono">{sale.receiptNumber}</span>
                        <span className="text-[10px] text-[#718096]">{sale.time}</span>
                      </div>
                      <p className="text-[11px] text-[#718096] truncate">
                        {sale.mealType} · {sale.serverName}
                        {sale.roomNumber ? ` · Ch. ${sale.roomNumber}` : ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          sale.paymentMode === 'Affectation chambre'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {sale.paymentMode === 'Affectation chambre' ? `Ch. ${sale.roomNumber}` : (sale.paymentMethod || 'Direct')}
                      </span>
                      <p className="font-mono font-bold text-[#263445] text-xs mt-0.5">
                        {sale.totalAmount.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne 3: Flux Financiers & Caisse */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF1]">
              <span className="text-xs font-bold text-[#263445] flex items-center gap-1.5">
                <IconWallet stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
                Flux Financiers & Caisse
              </span>
              <button
                onClick={() => setCurrentScreen('finances-transactions')}
                className="text-[11px] text-[#4C97DB] font-semibold hover:underline flex items-center gap-0.5"
              >
                Grand Livre
                <IconArrowRight stroke={1.75} className="w-3 h-3" />
              </button>
            </div>

            {dayTransactions.length === 0 ? (
              <p className="text-xs text-[#718096] py-3 italic">
                Aucune transaction financière saisie pour cette journée.
              </p>
            ) : (
              <div className="space-y-2">
                {dayTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          tx.type === 'Recette'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {tx.type === 'Recette' ? (
                          <IconArrowUpRight stroke={1.75} className="w-3.5 h-3.5" />
                        ) : (
                          <IconArrowDownRight stroke={1.75} className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#263445] truncate">{tx.description}</p>
                        <p className="text-[11px] text-[#718096]">
                          {tx.department} · {tx.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold text-xs ${
                          tx.type === 'Recette' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'Recette' ? '+' : '-'}
                        {tx.amount.toLocaleString('fr-FR')} F
                      </span>
                      <p className="text-[10px] text-[#718096] font-mono">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
