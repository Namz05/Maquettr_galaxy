import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reservation, ReservationStatus, RoomCategory } from '../types';
import {
  IconCalendarCheck,
  IconSearch,
  IconFilter,
  IconPlus,
  IconEye,
  IconCircleCheck,
  IconCircleX,
  IconLogout,
  IconCalendar,
  IconUser,
  IconPhone,
  IconMail,
  IconFileText,
  IconCreditCard,
  IconAlertTriangle,
  IconX,
  IconClock,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import {
  CalendarDateFilter,
  formatFrenchDateShort
} from '../components/common/CalendarDateFilter';

export const Screen4Reservations: React.FC = () => {
  const {
    reservations,
    rooms,
    addReservation,
    cancelReservation,
    checkInReservation,
    checkOutReservation,
    selectedDate,
    setSelectedDate
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'current' | 'upcoming' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('table');
  const [filterDate, setFilterDate] = useState<string>(''); // empty means all dates
  const [planningBaseDate, setPlanningBaseDate] = useState<string>('2026-11-09');

  // Active reservation dates
  const activeResDates = Array.from(
    new Set([
      ...reservations.map((r) => r.checkIn),
      ...reservations.map((r) => r.checkOut)
    ])
  ).filter(Boolean);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // New Reservation Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>('Standard');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-13');
  const [occupants, setOccupants] = useState(2);
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['Petit-déjeuner inclus']);
  const [deposit, setDeposit] = useState<number>(50000);
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Available rooms for selected category
  const availableRoomsForBooking = rooms.filter(
    (r) => r.category === selectedCategory && (r.status === 'Disponible' || r.id === selectedRoomId)
  );

  // Calculate nights
  const calculateNights = (inDate: string, outDate: string) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));
    return isNaN(diff) ? 1 : diff;
  };

  const nights = calculateNights(checkIn, checkOut);
  const unitPrice = selectedCategory === 'Mini Suite (VIP)' ? 75000 : 45000;
  const extrasCost = selectedExtras.length * 5000 * nights;
  const calculatedTotal = nights * unitPrice + extrasCost;
  const calculatedBalance = Math.max(0, calculatedTotal - deposit);

  // Check for conflict
  const checkRoomConflict = (roomId: string, start: string, end: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return null;

    if (targetRoom.status === 'Hors service') {
      return `La chambre ${targetRoom.number} est actuellement hors service (maintenance).`;
    }

    // Check existing active reservations for same room
    const conflict = reservations.find(
      (r) =>
        r.roomId === roomId &&
        r.status !== 'Annulée' &&
        r.status !== 'Terminée' &&
        !(end <= r.checkIn || start >= r.checkOut)
    );

    if (conflict) {
      return `Conflit détecté : La chambre ${targetRoom.number} est déjà réservée par ${conflict.guestName} du ${conflict.checkIn} au ${conflict.checkOut}.`;
    }

    return null;
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const conflict = checkRoomConflict(roomId, checkIn, checkOut);
    setConflictWarning(conflict);
  };

  const handleExtraToggle = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoomId) {
      alert('Veuillez sélectionner une chambre disponible.');
      return;
    }

    const conflict = checkRoomConflict(selectedRoomId, checkIn, checkOut);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;

    addReservation({
      guestName,
      guestPhone,
      guestEmail: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      guestIdNumber: guestIdNumber || 'PAS-CI-2026',
      roomId: room.id,
      roomNumber: room.number,
      roomCategory: room.category,
      checkIn,
      checkOut,
      occupants,
      totalAmount: calculatedTotal,
      deposit,
      balance: calculatedBalance,
      status: checkIn === '2026-11-10' ? 'En cours' : 'Confirmée',
      extras: selectedExtras,
      notes,
    });

    setIsNewModalOpen(false);
    // Reset form
    setGuestName('');
    setGuestPhone('');
    setSelectedRoomId('');
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    const matchSearch =
      r.guestName.toLowerCase().includes(search.toLowerCase()) ||
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.includes(search) ||
      r.guestPhone.includes(search);

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;

    let matchPeriod = true;
    if (periodFilter === 'current') matchPeriod = r.status === 'En cours';
    if (periodFilter === 'upcoming') matchPeriod = r.status === 'Confirmée';
    if (periodFilter === 'completed') matchPeriod = r.status === 'Terminée';

    const matchDate =
      !filterDate ||
      (r.checkIn <= filterDate && r.checkOut >= filterDate) ||
      r.checkIn === filterDate;

    return matchSearch && matchStatus && matchPeriod && matchDate;
  });

  const getStatusBadge = (st: ReservationStatus) => {
    switch (st) {
      case 'Confirmée':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#4C97DB] border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4C97DB]" />
            Confirmée
          </span>
        );
      case 'En cours':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            En cours
          </span>
        );
      case 'Terminée':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#718096] border border-slate-200">
            Terminée
          </span>
        );
      case 'Annulée':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Annulée
          </span>
        );
    }
  };

  // Calendar dates for availability view (7 days starting from planningBaseDate)
  const calendarDates = (() => {
    const [y, m, d] = planningBaseDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const days: Array<{ label: string; date: string }> = [];

    for (let i = 0; i < 7; i++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const isToday = iso === '2026-11-10';
      const label = `${dayNames[dt.getDay()]} ${String(dt.getDate()).padStart(2, '0')}${isToday ? ' (Auj)' : ''}`;
      days.push({ label, date: iso });
    }
    return days;
  })();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Gestion des réservations
          </h2>
          <p className="text-xs text-[#718096]">
            Suivi des dossiers, plannings d'occupation, check-in et règlements d'acomptes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Table or Visual Calendar */}
          <div className="flex items-center p-1 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'table' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              Liste des dossiers
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'calendar' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              <IconCalendar stroke={1.75} className="w-3.5 h-3.5" />
              <span>Planning visuel</span>
            </button>
          </div>

          {/* New Reservation CTA */}
          <button
            onClick={() => {
              setIsNewModalOpen(true);
              setConflictWarning(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <IconPlus stroke={1.75} className="w-4 h-4" />
            <span>Nouvelle réservation</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <IconSearch stroke={1.75} className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom client, référence (RES-...), n° chambre..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Date Filter */}
          <CalendarDateFilter
            value={filterDate}
            onChange={(d) => {
              setFilterDate(d);
              if (d) setPlanningBaseDate(d);
            }}
            activeDates={activeResDates}
            allowClear
            clearLabel="Toutes dates"
            label="Date"
            align="right"
          />

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="Confirmée">Confirmée</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminée</option>
            <option value="Annulée">Annulée</option>
          </select>

          {/* Period Filter Buttons */}
          <div className="flex items-center p-1 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] text-xs">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                periodFilter === 'all' ? 'bg-white font-semibold text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setPeriodFilter('current')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                periodFilter === 'current' ? 'bg-white font-semibold text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              En séjour
            </button>
            <button
              onClick={() => setPeriodFilter('upcoming')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                periodFilter === 'upcoming' ? 'bg-white font-semibold text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              À venir
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Table of Reservations */}
      {activeTab === 'table' ? (
        <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Réf.</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Chambre</th>
                  <th className="py-3 px-4">Dates séjour</th>
                  <th className="py-3 px-4">Occupants</th>
                  <th className="py-3 px-4">Montant & Solde</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4C97DB]">
                      {res.ref}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#263445]">{res.guestName}</div>
                      <div className="text-[11px] text-[#718096]">{res.guestEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#718096]">
                      {res.guestPhone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sm bg-[#F5F8FC] px-2 py-1 rounded-lg border border-[#E5EAF1]">
                        Ch. {res.roomNumber}
                      </span>
                      <span className="text-[10px] text-[#718096] block mt-0.5">
                        {res.roomCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#263445]">
                        {res.checkIn} → {res.checkOut}
                      </div>
                      <div className="text-[10px] text-[#718096]">
                        {calculateNights(res.checkIn, res.checkOut)} nuit(s)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.occupants} pers.
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-[#263445]">
                        {res.totalAmount.toLocaleString('fr-FR')} FCFA
                      </div>
                      {res.balance > 0 ? (
                        <div className="text-[10px] text-amber-700">
                          Solde dû : {res.balance.toLocaleString('fr-FR')} F
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Payé intégralement
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedRes(res)}
                        className="p-1.5 text-[#4C97DB] hover:bg-[#4C97DB]/10 rounded-lg transition-colors"
                        title="Consulter le dossier"
                      >
                        <IconEye stroke={1.75} className="w-4 h-4" />
                      </button>

                      {res.status === 'Confirmée' && (
                        <button
                          onClick={() => checkInReservation(res.id)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg font-semibold text-[11px] transition-colors"
                          title="Valider l'arrivée du client"
                        >
                          Check-in
                        </button>
                      )}

                      {res.status === 'En cours' && (
                        <button
                          onClick={() => checkOutReservation(res.id)}
                          className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg font-semibold text-[11px] transition-colors"
                          title="Clôturer le séjour (Check-out)"
                        >
                          Check-out
                        </button>
                      )}

                      {res.status !== 'Annulée' && res.status !== 'Terminée' && (
                        <button
                          onClick={() => {
                            if (confirm(`Confirmer l'annulation de la réservation ${res.ref} ?`)) {
                              cancelReservation(res.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Annuler la réservation"
                        >
                          <IconCircleX stroke={1.75} className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Visual Calendar of Availability */
        <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
            <div>
              <h3 className="text-sm font-bold text-[#263445]">
                Calendrier d'occupation par chambre (Semaine en cours)
              </h3>
              <p className="text-xs text-[#718096]">
                Représentation chronologique des réservations confirmées et séjours actifs
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#718096]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Disponible
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#4C97DB]" /> En séjour
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500" /> Confirmée
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E5EAF1] bg-[#F5F8FC]">
                  <th className="py-2.5 px-3 text-left font-bold text-[#263445] w-28">Chambre</th>
                  {calendarDates.map((d, i) => (
                    <th key={i} className="py-2.5 px-2 text-center font-semibold text-[#718096]">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {rooms.slice(0, 15).map((room) => {
                  return (
                    <tr key={room.id} className="hover:bg-[#F5F8FC]/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#263445]">
                        Ch. {room.number}{' '}
                        <span className="text-[10px] text-[#718096] font-sans block">
                          {room.category === 'Mini Suite (VIP)' ? 'VIP' : 'Std'}
                        </span>
                      </td>

                      {calendarDates.map((d, idx) => {
                        // Check if room is booked on that date
                        const booking = reservations.find(
                          (r) =>
                            r.roomId === room.id &&
                            r.status !== 'Annulée' &&
                            d.date >= r.checkIn &&
                            d.date < r.checkOut
                        );

                        if (booking) {
                          const isStart = d.date === booking.checkIn;
                          const bg = booking.status === 'En cours' ? 'bg-[#4C97DB]' : 'bg-amber-500';
                          return (
                            <td key={idx} className="p-1 text-center">
                              <div
                                className={`h-8 rounded-lg ${bg} text-white font-medium flex items-center justify-center text-[10px] truncate px-1 shadow-2xs`}
                                title={`${booking.guestName} (${booking.ref})`}
                              >
                                {isStart ? booking.guestName.split(' ')[0] : '•'}
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={idx} className="p-1 text-center">
                            <div className="h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-medium border border-emerald-100">
                              Libre
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Nouvelle Réservation */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <IconCalendarCheck stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
                <h3 className="text-base font-bold text-[#263445]">
                  Créer une nouvelle réservation
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Conflict Alert */}
            {conflictWarning && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <IconAlertTriangle stroke={1.75} className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Alerte de disponibilité / Conflit :</strong>
                  <span>{conflictWarning}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              {/* Section 1: Coordonnées Client */}
              <div>
                <h4 className="font-bold text-[#263445] text-xs uppercase tracking-wider mb-2">
                  1. Renseignements du client
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Nom complet du client *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="ex: M. Abdoulaye Camara"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+225 07 00 00 00 00"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Adresse e-mail
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="client@domaine.com"
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Pièce d'identité (Passeport / CNI)
                    </label>
                    <input
                      type="text"
                      value={guestIdNumber}
                      onChange={(e) => setGuestIdNumber(e.target.value)}
                      placeholder="ex: CNI-CI-889102"
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dates et Chambre */}
              <div className="pt-3 border-t border-[#E5EAF1]">
                <h4 className="font-bold text-[#263445] text-xs uppercase tracking-wider mb-2">
                  2. Dates du séjour et Attribution de chambre
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Date d'arrivée *
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (selectedRoomId) handleRoomSelect(selectedRoomId);
                      }}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Date de départ *
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        if (selectedRoomId) handleRoomSelect(selectedRoomId);
                      }}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Nombre d'occupants
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={occupants}
                      onChange={(e) => setOccupants(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Catégorie souhaitée
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        const cat = e.target.value as RoomCategory;
                        setSelectedCategory(cat);
                        setSelectedRoomId('');
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                    >
                      <option value="Standard">Standard (45 000 FCFA/nuit)</option>
                      <option value="Mini Suite (VIP)">Mini Suite VIP (75 000 FCFA/nuit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Sélection de la chambre disponible *
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => handleRoomSelect(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-semibold"
                    >
                      <option value="">-- Choisir une chambre libre --</option>
                      {availableRoomsForBooking.map((r) => (
                        <option key={r.id} value={r.id}>
                          Ch. {r.number} ({r.floor}) - {r.price.toLocaleString('fr-FR')} FCFA
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Options supplémentaires */}
              <div className="pt-3 border-t border-[#E5EAF1]">
                <h4 className="font-bold text-[#263445] text-xs uppercase tracking-wider mb-2">
                  3. Prestations et Options complémentaires (+5 000 F/nuit)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Petit-déjeuner inclus',
                    'Navette aéroport',
                    'Lit d’appoint bébé',
                    'Accès Lounge VIP',
                    'Place parking sécurisée',
                  ].map((opt) => {
                    const isChecked = selectedExtras.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleExtraToggle(opt)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-[#4C97DB] text-white border-[#4C97DB]'
                            : 'bg-[#F5F8FC] text-[#263445] border-[#E5EAF1] hover:border-[#4C97DB]'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Récapitulatif financier & Acompte */}
              <div className="pt-3 border-t border-[#E5EAF1] p-4 bg-[#F5F8FC] rounded-2xl border border-[#E5EAF1] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#718096]">Durée du séjour calculée :</span>
                  <span className="font-bold font-mono text-[#263445]">{nights} nuit(s)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#718096]">Total hébergement + options :</span>
                  <span className="font-bold font-mono text-sm text-[#4C97DB]">
                    {calculatedTotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E5EAF1] grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#263445] mb-1">
                      Acompte encaissé à la réservation (FCFA)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={deposit}
                      onChange={(e) => setDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="block font-semibold text-[#718096] mb-1">
                      Reste à solder à l'arrivée
                    </span>
                    <div className="px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-amber-800 font-mono font-bold text-sm">
                      {calculatedBalance.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={Boolean(conflictWarning)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#4C97DB] hover:bg-[#58A2F7] text-white shadow-xs disabled:opacity-50"
                >
                  Enregistrer la réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Consulter les Détails de la Réservation */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#4C97DB]/15 text-[#4C97DB] flex items-center justify-center font-bold">
                  {selectedRes.roomNumber}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263445]">
                    Dossier {selectedRes.ref}
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Réservation {selectedRes.roomCategory}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#718096]">Client titulaire :</span>
                  <span className="font-bold text-[#263445]">{selectedRes.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Téléphone :</span>
                  <span className="font-mono text-[#263445]">{selectedRes.guestPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">E-mail :</span>
                  <span className="text-[#263445]">{selectedRes.guestEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Pièce d'identité :</span>
                  <span className="font-mono text-[#263445]">{selectedRes.guestIdNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-[#E5EAF1]">
                  <span className="text-[#718096] block text-[10px]">Arrivée</span>
                  <span className="font-bold text-[#263445]">{selectedRes.checkIn}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E5EAF1]">
                  <span className="text-[#718096] block text-[10px]">Départ</span>
                  <span className="font-bold text-[#263445]">{selectedRes.checkOut}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5EAF1] space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Montant total séjour :</span>
                  <span className="font-mono text-[#4C97DB]">
                    {selectedRes.totalAmount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-[#718096]">
                  <span>Acompte réglé :</span>
                  <span className="font-mono">{selectedRes.deposit.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-amber-800 font-semibold pt-1 border-t border-[#E5EAF1]">
                  <span>Solde restant :</span>
                  <span className="font-mono">{selectedRes.balance.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {selectedRes.extras && selectedRes.extras.length > 0 && (
                <div>
                  <span className="font-semibold text-[#718096] block mb-1">Options incluses :</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRes.extras.map((ex, i) => (
                      <span
                        key={i}
                        className="bg-[#F5F8FC] text-[#263445] border border-[#E5EAF1] px-2 py-0.5 rounded text-[11px]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
              <button
                onClick={() => setSelectedRes(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
