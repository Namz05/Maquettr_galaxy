import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StockMovement, MovementType, StockLocation } from '../types';
import {
  IconArrowsExchange,
  IconSearch,
  IconFilter,
  IconPlus,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconRefresh,
  IconAlertOctagon,
  IconTool,
  IconEye,
  IconCalendar,
  IconX,
  IconFileText
} from '@tabler/icons-react';
import {
  CalendarDateFilter,
  formatFrenchDateShort
} from '../components/common/CalendarDateFilter';

export const Screen10StockMovements: React.FC = () => {
  const { stockMovements, stockItems, addStockMovement, setCurrentScreen, selectedDate } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterArticle, setFilterArticle] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>(''); // empty means all dates

  // All dates with recorded stock movements
  const activeMovementDates = Array.from(
    new Set(stockMovements.map((mv) => mv.dateTime.slice(0, 10)))
  ).filter(Boolean);

  // Modals state
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  // New Movement form state
  const [newItemId, setNewItemId] = useState(stockItems[0]?.id || '');
  const [newType, setNewType] = useState<MovementType>('Transfert');
  const [newQty, setNewQty] = useState<number>(2);
  const [newSource, setNewSource] = useState<StockLocation>('Magasin');
  const [newDestination, setNewDestination] = useState<StockLocation>('Cuisine');
  const [newResponsible, setNewResponsible] = useState('Économe Principal');
  const [newReason, setNewReason] = useState('');

  // Filtered movements
  const filteredMovements = stockMovements.filter((mv) => {
    const matchSearch =
      mv.ref.toLowerCase().includes(search.toLowerCase()) ||
      mv.itemName.toLowerCase().includes(search.toLowerCase()) ||
      mv.reason.toLowerCase().includes(search.toLowerCase()) ||
      mv.responsibleUser.toLowerCase().includes(search.toLowerCase());

    const matchType = filterType === 'all' || mv.type === filterType;
    const matchArticle = filterArticle === 'all' || mv.itemId === filterArticle;
    const matchDate = !filterDate || mv.dateTime.startsWith(filterDate);

    return matchSearch && matchType && matchArticle && matchDate;
  });

  const getMovementTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'Entrée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <IconArrowDownLeft stroke={1.75} className="w-3.5 h-3.5" />
            Entrée
          </span>
        );
      case 'Sortie':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <IconArrowUpRight stroke={1.75} className="w-3.5 h-3.5" />
            Sortie
          </span>
        );
      case 'Transfert':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#4C97DB] border border-blue-200">
            <IconArrowsExchange stroke={1.75} className="w-3.5 h-3.5" />
            Transfert
          </span>
        );
      case 'Perte':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <IconAlertOctagon stroke={1.75} className="w-3.5 h-3.5" />
            Perte / Rebut
          </span>
        );
      case 'Correction':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <IconTool stroke={1.75} className="w-3.5 h-3.5" />
            Correction
          </span>
        );
    }
  };

  const handleCreateMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stockItems.find((s) => s.id === newItemId);
    if (!item || newQty <= 0) return;

    addStockMovement({
      itemId: item.id,
      itemName: item.name,
      type: newType,
      quantity: newQty,
      unit: item.unit,
      sourceLocation: newSource,
      destinationLocation: newDestination,
      responsibleUser: newResponsible,
      reason: newReason || 'Mouvement validé via console logistique.',
    });

    setIsNewMovementModalOpen(false);
    setNewReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Traçabilité des Mouvements de Stock
          </h2>
          <p className="text-xs text-[#718096]">
            Historique d'audit des entrées fournisseurs, transferts internes, sorties et inventaires
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentScreen('stock-status')}
            className="px-3 py-2 bg-[#F5F8FC] hover:bg-[#E5EAF1] text-[#263445] text-xs font-semibold rounded-xl border border-[#E5EAF1] transition-colors"
          >
            État actuel du Stock
          </button>

          <button
            onClick={() => setIsNewMovementModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <IconPlus stroke={1.75} className="w-4 h-4" />
            <span>Enregistrer un mouvement</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch stroke={1.75} className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par n° de réf (MV-...), article, motif ou agent..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Movement Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Tous les types de flux</option>
            <option value="Entrée">Entrées (+)</option>
            <option value="Sortie">Sorties (-)</option>
            <option value="Transfert">Transferts (Magasin → Cuisine)</option>
            <option value="Perte">Pertes & Déchets</option>
            <option value="Correction">Corrections d'inventaire</option>
          </select>

          {/* Article filter */}
          <select
            value={filterArticle}
            onChange={(e) => setFilterArticle(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] max-w-xs truncate"
          >
            <option value="all">Tous les articles</option>
            {stockItems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Calendar Date Filter */}
          <CalendarDateFilter
            value={filterDate}
            onChange={(d) => setFilterDate(d)}
            activeDates={activeMovementDates}
            allowClear
            clearLabel="Toutes les dates"
            label="Date"
            align="right"
          />
        </div>
      </div>

      {/* Movements History Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Type de mouvement</th>
                <th className="py-3 px-4 text-center">Quantité</th>
                <th className="py-3 px-4">Origine</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 max-w-xs">Motif</th>
                <th className="py-3 px-4 text-right">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
              {filteredMovements.map((mv) => (
                <tr key={mv.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#4C97DB]">
                    {mv.ref}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#718096]">
                    {mv.dateTime}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#263445]">
                    {mv.itemName}
                  </td>
                  <td className="py-3.5 px-4">
                    {getMovementTypeBadge(mv.type)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                    {mv.type === 'Sortie' || mv.type === 'Perte' ? '-' : '+'}
                    {mv.quantity} <span className="text-[10px] text-[#718096] font-normal">{mv.unit}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#F5F8FC] border border-[#E5EAF1] text-[11px]">
                      {mv.sourceLocation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#F5F8FC] border border-[#E5EAF1] text-[11px]">
                      {mv.destinationLocation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#718096]">
                    {mv.responsibleUser}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-[#718096]">
                    {mv.reason}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedMovement(mv)}
                      className="p-1.5 text-[#4C97DB] hover:bg-[#4C97DB]/10 rounded-lg transition-colors"
                      title="Consulter le détail"
                    >
                      <IconEye stroke={1.75} className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Enregistrer un nouveau mouvement */}
      {isNewMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <IconArrowsExchange stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
                <h3 className="text-base font-bold text-[#263445]">
                  Enregistrer un flux logistique
                </h3>
              </div>
              <button
                onClick={() => setIsNewMovementModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovementSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Article concerné *
                </label>
                <select
                  value={newItemId}
                  onChange={(e) => setNewItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Magasin: {s.qtyWarehouse} · Cuisine: {s.qtyKitchen})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Nature du mouvement
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      const t = e.target.value as MovementType;
                      setNewType(t);
                      if (t === 'Entrée') {
                        setNewSource('Fournisseur');
                        setNewDestination('Magasin');
                      } else if (t === 'Transfert') {
                        setNewSource('Magasin');
                        setNewDestination('Cuisine');
                      } else if (t === 'Sortie') {
                        setNewSource('Magasin');
                        setNewDestination('Client');
                      } else if (t === 'Perte') {
                        setNewSource('Cuisine');
                        setNewDestination('Pertes');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Transfert">Transfert interne</option>
                    <option value="Entrée">Entrée (Fournisseur)</option>
                    <option value="Sortie">Sortie (Consommation)</option>
                    <option value="Perte">Perte / Déchet</option>
                    <option value="Correction">Correction inventaire</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Quantité déplacée *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Emplacement source
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as StockLocation)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Fournisseur">Fournisseur</option>
                    <option value="Magasin">Magasin</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Ajustement">Ajustement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Emplacement cible
                  </label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value as StockLocation)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Magasin">Magasin</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Client">Client</option>
                    <option value="Pertes">Pertes</option>
                    <option value="Ajustement">Ajustement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Agent responsable
                </label>
                <input
                  type="text"
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Motif / Justification *
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Justification détaillée du déplacement..."
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#4C97DB] text-white"
                >
                  Enregistrer le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Consulter les détails d'un mouvement */}
      {selectedMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div>
                <h3 className="text-base font-bold text-[#263445]">
                  Fiche de Mouvement
                </h3>
                <span className="font-mono text-xs text-[#4C97DB] font-semibold">
                  {selectedMovement.ref}
                </span>
              </div>
              <button
                onClick={() => setSelectedMovement(null)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-1">
                <span className="text-[#718096] block text-[10px]">Désignation de l'article :</span>
                <p className="font-bold text-sm text-[#263445]">{selectedMovement.itemName}</p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span>Type d'opération :</span>
                  {getMovementTypeBadge(selectedMovement.type)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-[#E5EAF1]">
                  <span className="text-[#718096] block text-[10px]">Origine</span>
                  <span className="font-semibold text-[#263445]">{selectedMovement.sourceLocation}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E5EAF1]">
                  <span className="text-[#718096] block text-[10px]">Destination</span>
                  <span className="font-semibold text-[#263445]">{selectedMovement.destinationLocation}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E5EAF1] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#718096]">Quantité :</span>
                  <span className="font-mono font-bold text-sm text-[#263445]">
                    {selectedMovement.quantity} {selectedMovement.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Date & Heure :</span>
                  <span className="font-mono">{selectedMovement.dateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Responsable :</span>
                  <span className="font-medium text-[#263445]">{selectedMovement.responsibleUser}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#718096] block mb-1">Motif consigné :</span>
                <p className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] text-[#263445] leading-relaxed">
                  {selectedMovement.reason}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAF1] flex justify-end">
              <button
                onClick={() => setSelectedMovement(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
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
