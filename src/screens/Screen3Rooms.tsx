import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Room, RoomCategory, RoomFloor, RoomStatus } from '../types';
import {
  IconBed,
  IconSearch,
  IconFilter,
  IconPlus,
  IconLayoutGrid,
  IconList,
  IconUser,
  IconPhone,
  IconSparkles,
  IconTool,
  IconCircleCheck,
  IconClock,
  IconX,
  IconEdit,
  IconCalendarCheck,
  IconCheck,
  IconEye
} from '@tabler/icons-react';

export const Screen3Rooms: React.FC = () => {
  const { rooms, addRoom, updateRoom, updateRoomStatus, setCurrentScreen } = useApp();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);

  // New Room Form state
  const [newNumber, setNewNumber] = useState('');
  const [newCategory, setNewCategory] = useState<RoomCategory>('Standard');
  const [newFloor, setNewFloor] = useState<RoomFloor>('Rez-de-chaussée');
  const [newPrice, setNewPrice] = useState<number>(45000);
  const [newCapacity, setNewCapacity] = useState<number>(2);
  const [newFeatures, setNewFeatures] = useState<string>('Grand lit Queen, Climatisation, Wi-Fi');

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchSearch =
      room.number.includes(search) ||
      room.currentGuest?.name.toLowerCase().includes(search.toLowerCase()) ||
      room.category.toLowerCase().includes(search.toLowerCase());

    const matchCategory = filterCategory === 'all' || room.category === filterCategory;
    const matchFloor = filterFloor === 'all' || room.floor === filterFloor;
    const matchStatus = filterStatus === 'all' || room.status === filterStatus;

    return matchSearch && matchCategory && matchFloor && matchStatus;
  });

  // Status badge styling helper
  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Disponible':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Disponible
          </span>
        );
      case 'Occupée':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4C97DB]/10 text-[#4C97DB] border border-[#4C97DB]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4C97DB]" />
            Occupée
          </span>
        );
      case 'Réservée':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Réservée
          </span>
        );
      case 'En nettoyage':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            En nettoyage
          </span>
        );
      case 'Hors service':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Hors service
          </span>
        );
    }
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber) return;

    addRoom({
      number: newNumber,
      category: newCategory,
      floor: newFloor,
      price: Number(newPrice),
      capacity: Number(newCapacity),
      status: 'Disponible',
      features: newFeatures.split(',').map((f) => f.trim()),
      lastCleaned: 'Aujourd’hui 10:00',
    });

    setIsAddModalOpen(false);
    setNewNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Gestion des chambres
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
              title="Affichage en Grille"
            >
              <IconLayoutGrid stroke={1.75} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
              title="Affichage en Tableau"
            >
              <IconList stroke={1.75} className="w-4 h-4" />
            </button>
          </div>

          {/* Add Room Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <IconPlus stroke={1.75} className="w-4 h-4" />
            <span>Ajouter une chambre</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <IconSearch stroke={1.75} className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par n° de chambre, client ou catégorie..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          >
            <option value="all">Toutes catégories</option>
            <option value="Standard">Standard</option>
            <option value="Mini Suite (VIP)">Mini Suite (VIP)</option>
          </select>

          {/* Floor Filter */}
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          >
            <option value="all">Tous niveaux</option>
            <option value="Rez-de-chaussée">Rez-de-chaussée (Chambres 1 à 5)</option>
            <option value="1er Étage">1er Étage (Chambres 6 à 10)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="Disponible">Disponible</option>
            <option value="Occupée">Occupée</option>
            <option value="Réservée">Réservée</option>
            <option value="En nettoyage">En nettoyage</option>
            <option value="Hors service">Hors service</option>
          </select>

          {(search || filterCategory !== 'all' || filterFloor !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterCategory('all');
                setFilterFloor('all');
                setFilterStatus('all');
              }}
              className="text-xs text-[#718096] hover:text-[#263445] px-2 py-1 rounded-lg hover:bg-[#F5F8FC]"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Main Rooms View (Grid or Table) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === 'Occupée';
            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-xs hover:border-[#4C97DB]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Room Number & Category Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono text-[#263445]">
                          Ch. {room.number}
                        </span>
                        {room.category === 'Mini Suite (VIP)' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#718096]">
                        {room.category} · {room.floor}
                      </p>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  {/* Pricing and Capacity */}
                  <div className="flex items-center justify-between text-xs py-2 border-y border-[#E5EAF1]/70 mb-3 font-mono">
                    <span className="font-bold text-[#263445]">
                      {room.price.toLocaleString('fr-FR')} FCFA <span className="text-[10px] font-normal text-[#718096]">/ nuit</span>
                    </span>
                    <span className="text-[#718096] font-sans">
                      {room.capacity} pers. max
                    </span>
                  </div>

                  {/* Guest Info (if occupied) or Cleaned note */}
                  {isOccupied && room.currentGuest ? (
                    <div className="bg-[#F5F8FC] p-2.5 rounded-xl border border-[#E5EAF1] mb-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#263445] truncate">
                        <IconUser stroke={1.75} className="w-3.5 h-3.5 text-[#4C97DB] shrink-0" />
                        <span className="truncate">{room.currentGuest.name}</span>
                      </div>
                      <div className="text-[11px] text-[#718096] mt-1 flex justify-between">
                        <span>Séjour: {room.currentGuest.checkIn.slice(5)} au {room.currentGuest.checkOut.slice(5)}</span>
                        {room.currentGuest.folioBalance ? (
                          <span className="font-mono text-amber-700 font-semibold">
                            +{room.currentGuest.folioBalance.toLocaleString('fr-FR')} F
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#718096] mb-3 min-h-[36px] flex items-center">
                      {room.notes ? (
                        <span className="italic text-amber-700 line-clamp-2">{room.notes}</span>
                      ) : room.lastCleaned ? (
                        <span>Nettoyé : {room.lastCleaned}</span>
                      ) : (
                        <span>Prête pour attribution</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-[#E5EAF1] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex-1 py-1.5 px-3 bg-[#F5F8FC] hover:bg-[#E5EAF1] text-[#263445] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <IconEye stroke={1.75} className="w-3.5 h-3.5 text-[#4C97DB]" />
                    <span>Détails</span>
                  </button>

                  {/* Quick Status cycle */}
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsEditStatusModalOpen(true);
                    }}
                    className="p-1.5 text-[#718096] hover:text-[#4C97DB] hover:bg-[#F5F8FC] rounded-lg transition-colors"
                    title="Changer le statut"
                  >
                    <IconEdit stroke={1.75} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Chambre</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Niveau</th>
                  <th className="py-3 px-4">Tarif nuitée</th>
                  <th className="py-3 px-4">Capacité</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Occupant / Remarque</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-sm">
                      Ch. {room.number}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {room.category}
                    </td>
                    <td className="py-3 px-4 text-[#718096]">
                      {room.floor}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      {room.price.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-4">
                      {room.capacity} personnes
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[#718096]">
                      {room.currentGuest ? (
                        <span className="font-semibold text-[#263445]">
                          {room.currentGuest.name} (jusqu'au {room.currentGuest.checkOut})
                        </span>
                      ) : room.notes ? (
                        <span className="italic text-amber-700">{room.notes}</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#4C97DB] hover:bg-[#4C97DB]/10 rounded-lg transition-colors"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Détails de la chambre */}
      {selectedRoom && !isEditStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center font-bold text-lg font-mono">
                  {selectedRoom.number}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263445]">
                    Chambre n° {selectedRoom.number}
                  </h3>
                  <p className="text-xs text-[#718096]">
                    {selectedRoom.category} · {selectedRoom.floor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445] hover:bg-[#F5F8FC]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Price Row */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1]">
                <span className="text-[#718096] block mb-1">Statut actuel</span>
                {getStatusBadge(selectedRoom.status)}
              </div>
              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1]">
                <span className="text-[#718096] block mb-1">Tarif officiel</span>
                <span className="font-bold text-sm font-mono text-[#263445]">
                  {selectedRoom.price.toLocaleString('fr-FR')} FCFA / nuit
                </span>
              </div>
            </div>

            {/* Current Guest info if occupied */}
            {selectedRoom.currentGuest && (
              <div className="p-4 rounded-2xl bg-[#4C97DB]/5 border border-[#4C97DB]/20 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-[#263445]">
                  <span className="flex items-center gap-2">
                    <IconUser stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
                    Client en séjour : {selectedRoom.currentGuest.name}
                  </span>
                  <span className="font-mono text-[#4C97DB] text-xs">
                    {selectedRoom.currentGuest.reservationRef}
                  </span>
                </div>
                <div className="text-[#718096] grid grid-cols-2 gap-2 pt-1 border-t border-[#4C97DB]/10">
                  <div>
                    <span className="block text-[10px]">Téléphone</span>
                    <span className="font-medium text-[#263445]">
                      {selectedRoom.currentGuest.phone}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px]">Dates de séjour</span>
                    <span className="font-medium text-[#263445]">
                      {selectedRoom.currentGuest.checkIn} au {selectedRoom.currentGuest.checkOut}
                    </span>
                  </div>
                </div>
                {selectedRoom.currentGuest.folioBalance !== undefined && (
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-[#718096]">Consommations restaurant & extras :</span>
                    <span className="font-bold font-mono text-amber-800">
                      {selectedRoom.currentGuest.folioBalance.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Room Features */}
            <div>
              <h4 className="text-xs font-semibold text-[#263445] mb-2">Équipements & Confort</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoom.features.map((feat, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] text-[#263445] px-2.5 py-1 rounded-lg"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Change Status Fast Buttons */}
            <div>
              <h4 className="text-xs font-semibold text-[#263445] mb-2">Modifier l'état de la chambre</h4>
              <div className="grid grid-cols-3 gap-2">
                {(['Disponible', 'En nettoyage', 'Hors service'] as RoomStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, st);
                      setSelectedRoom({ ...selectedRoom, status: st });
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRoom.status === st
                        ? 'border-[#4C97DB] bg-[#4C97DB]/10 text-[#4C97DB]'
                        : 'border-[#E5EAF1] bg-[#F5F8FC] text-[#263445] hover:border-[#4C97DB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5EAF1] flex justify-end gap-2">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Ajouter une chambre */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-base font-bold text-[#263445]">
                Ajouter une nouvelle chambre
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Numéro de chambre *
                  </label>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="ex: 11"
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Capacité (personnes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as RoomCategory;
                      setNewCategory(cat);
                      setNewPrice(cat === 'Mini Suite (VIP)' ? 75000 : 45000);
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Mini Suite (VIP)">Mini Suite (VIP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Niveau
                  </label>
                  <select
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value as RoomFloor)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Rez-de-chaussée">Rez-de-chaussée</option>
                    <option value="1er Étage">1er Étage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Tarif par nuitée (FCFA)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Équipements (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newFeatures}
                  onChange={(e) => setNewFeatures(e.target.value)}
                  placeholder="Lit King Size, Climatisation, Wi-Fi..."
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#4C97DB] hover:bg-[#58A2F7] text-white shadow-xs"
                >
                  Enregistrer la chambre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Changer le statut directement */}
      {isEditStatusModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-sm font-bold text-[#263445]">
                Changer le statut : Chambre {selectedRoom.number}
              </h3>
              <button
                onClick={() => setIsEditStatusModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {(['Disponible', 'Occupée', 'Réservée', 'En nettoyage', 'Hors service'] as RoomStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, st);
                      setIsEditStatusModalOpen(false);
                      setSelectedRoom(null);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      selectedRoom.status === st
                        ? 'border-[#4C97DB] bg-[#4C97DB]/10 text-[#4C97DB] font-semibold'
                        : 'border-[#E5EAF1] hover:bg-[#F5F8FC] text-[#263445]'
                    }`}
                  >
                    <span>{st}</span>
                    {selectedRoom.status === st && <IconCheck stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
