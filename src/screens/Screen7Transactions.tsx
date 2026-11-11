import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FinancialTransaction,
  Department,
  TransactionType,
  DirectPaymentMethod,
  TransactionStatus
} from '../types';
import {
  IconWallet,
  IconSearch,
  IconFilter,
  IconPlus,
  IconArrowUpRight,
  IconArrowDownRight,
  IconTrendingUp,
  IconReceipt,
  IconClock,
  IconEye,
  IconCircleCheck,
  IconX,
  IconBuilding,
  IconFileSpreadsheet
} from '@tabler/icons-react';
import {
  CalendarDateFilter,
  formatFrenchDateShort,
  formatFrenchDateFull
} from '../components/common/CalendarDateFilter';

export const Screen7Transactions: React.FC = () => {
  const { transactions, addTransaction, reservations, rooms, setCurrentScreen, selectedDate, setSelectedDate } = useApp();

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>(''); // empty means all dates

  // All dates with transactions
  const activeTxDates = Array.from(new Set(transactions.map((t) => t.date))).filter(Boolean);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<FinancialTransaction | null>(null);

  // New Transaction Form State
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState<Department>('Approvisionnement');
  const [newType, setNewType] = useState<TransactionType>('Dépense');
  const [newMethod, setNewMethod] = useState<DirectPaymentMethod>('Virement');
  const [newAmount, setNewAmount] = useState<number>(50000);
  const [newRef, setNewRef] = useState('');

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
      (tx.reference && tx.reference.toLowerCase().includes(search.toLowerCase()));

    const matchDept = filterDept === 'all' || tx.department === filterDept;
    const matchType = filterType === 'all' || tx.type === filterType;
    const matchMethod = filterMethod === 'all' || tx.paymentMethod === filterMethod;
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    const matchDate = !filterDate || tx.date === filterDate;

    return matchSearch && matchDept && matchType && matchMethod && matchStatus && matchDate;
  });

  // Calculations for current selection
  const relevantList = filterDate ? filteredTransactions : transactions;
  const totalRevenues = relevantList
    .filter((t) => t.type === 'Recette' && t.status === 'Validé')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = relevantList
    .filter((t) => t.type === 'Dépense' && t.status === 'Validé')
    .reduce((sum, t) => sum + t.amount, 0);

  const netResult = totalRevenues - totalExpenses;

  // Pending receivables: remaining reservation balances + room folio balances
  const pendingReservationBalances = reservations
    .filter((r) => r.status === 'En cours' || r.status === 'Confirmée')
    .reduce((sum, r) => sum + r.balance, 0);

  const pendingRoomFolios = rooms
    .filter((r) => r.status === 'Occupée' && r.currentGuest)
    .reduce((sum, r) => sum + (r.currentGuest?.folioBalance || 0), 0);

  const totalPendingReceivables = pendingReservationBalances + pendingRoomFolios;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || newAmount <= 0) return;

    addTransaction({
      description: newDesc,
      department: newDept,
      type: newType,
      paymentMethod: newMethod,
      amount: newAmount,
      status: 'Validé',
      reference: newRef || `REF-${Math.floor(100 + Math.random() * 900)}`,
      author: 'Comptable',
    });

    setIsAddModalOpen(false);
    setNewDesc('');
    setNewAmount(50000);
    setNewRef('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Grand Livre des Transactions Financières
          </h2>
          <p className="text-xs text-[#718096]">
            Registre centralisé des flux de trésorerie, règlements d'hébergement et dépenses opérationnelles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('finances-reports')}
            className="flex items-center gap-2 px-3 py-2 bg-[#F5F8FC] hover:bg-[#E5EAF1] text-[#263445] text-xs font-semibold rounded-xl border border-[#E5EAF1] transition-colors"
          >
            <IconFileSpreadsheet stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
            <span>Rapports Financiers</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <IconPlus stroke={1.75} className="w-4 h-4" />
            <span>Ajouter une transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Key Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recettes */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Total des recettes</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
              +{totalRevenues.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Hébergement & Restaurant</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IconArrowUpRight stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* Total Dépenses */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Total des dépenses</span>
            <div className="text-xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
              -{totalExpenses.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-[#718096]">Approvisionnements & Charges</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <IconArrowDownRight stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* Résultat Financier Net */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Résultat net d'exploitation</span>
            <div className="text-xl font-bold font-mono text-[#263445] mt-1 tabular-nums">
              {netResult >= 0 ? '+' : ''}{netResult.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-[#4C97DB] font-medium">Marge bénéficiaire saine</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center">
            <IconTrendingUp stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* Créances en attente */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Créances en attente</span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
              {totalPendingReceivables.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-[#718096]">Soldes séjours + notes en cours</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <IconClock stroke={1.75} className="w-5 h-5" />
          </div>
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
            placeholder="Rechercher par libellé, n° TRX ou référence..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter Button */}
          <CalendarDateFilter
            value={filterDate}
            onChange={(d) => setFilterDate(d)}
            activeDates={activeTxDates}
            allowClear
            clearLabel="Toutes les dates"
            label="Date"
            align="right"
          />

          {/* Pôle filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Tous les pôles</option>
            <option value="Hébergement">Hébergement</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Approvisionnement">Approvisionnement</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Charges générales">Charges générales</option>
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Recettes & Dépenses</option>
            <option value="Recette">Recettes (+)</option>
            <option value="Dépense">Dépenses (-)</option>
          </select>

          {/* Payment method */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Tous moyens</option>
            <option value="Espèces">Espèces</option>
            <option value="Carte bancaire">Carte bancaire</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Virement">Virement</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">N° Transaction</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Pôle concerné</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Moyen</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4C97DB]">
                    {tx.transactionNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span>{tx.date}</span>
                    <span className="text-[10px] text-[#718096] block font-mono">{tx.time}</span>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <p className="font-semibold text-[#263445] truncate">{tx.description}</p>
                    {tx.reference && (
                      <span className="text-[10px] text-[#718096] font-mono">
                        Réf: {tx.reference}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1] text-[#263445] text-[11px] font-medium">
                      {tx.department}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {tx.type === 'Recette' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <IconArrowUpRight stroke={1.75} className="w-3.5 h-3.5" />
                        Recette
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                        <IconArrowDownRight stroke={1.75} className="w-3.5 h-3.5" />
                        Dépense
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#718096]">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sm">
                    <span className={tx.type === 'Recette' ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.type === 'Recette' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
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

      {/* MODAL 1: Ajouter une transaction */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <IconWallet stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
                <h3 className="text-base font-bold text-[#263445]">
                  Enregistrer une transaction
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Type d'opération *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('Recette')}
                    className={`py-2 rounded-xl border text-center font-bold transition-all ${
                      newType === 'Recette'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-[#F5F8FC] text-[#718096] border-[#E5EAF1]'
                    }`}
                  >
                    + Recette (Encaissement)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('Dépense')}
                    className={`py-2 rounded-xl border text-center font-bold transition-all ${
                      newType === 'Dépense'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-[#F5F8FC] text-[#718096] border-[#E5EAF1]'
                    }`}
                  >
                    - Dépense (Décaissement)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Description / Libellé de l'opération *
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="ex: Achat denrées alimentaires ou Facture entretien..."
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Pôle concerné
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Hébergement">Hébergement</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Approvisionnement">Approvisionnement</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Charges générales">Charges générales</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Moyen de règlement
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as DirectPaymentMethod)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Carte bancaire">Carte bancaire</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Virement">Virement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Référence pièce justificative
                  </label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="ex: FACT-2026-402"
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4C97DB] hover:bg-[#58A2F7] text-white shadow-xs"
                >
                  Valider l'écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Consulter les Détails d'une transaction */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div>
                <h3 className="text-base font-bold text-[#263445]">
                  Détail de la pièce
                </h3>
                <span className="font-mono text-xs text-[#4C97DB] font-semibold">
                  {selectedTx.transactionNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-1">
                <span className="text-[#718096] block text-[10px]">Libellé :</span>
                <p className="font-bold text-[#263445] text-sm">{selectedTx.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-[#E5EAF1]">
                  <span className="text-[#718096] block text-[10px]">Date & Heure</span>
                  <span className="font-semibold text-[#263445]">
                    {selectedTx.date} à {selectedTx.time}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E5EAF1]">
                  <span className="text-[#718096] block text-[10px]">Pôle</span>
                  <span className="font-semibold text-[#263445]">{selectedTx.department}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E5EAF1] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#718096]">Montant total :</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedTx.type === 'Recette' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedTx.type === 'Recette' ? '+' : '-'}{selectedTx.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-[#718096]">
                  <span>Moyen de paiement :</span>
                  <span className="font-medium text-[#263445]">{selectedTx.paymentMethod}</span>
                </div>
                {selectedTx.reference && (
                  <div className="flex justify-between text-[#718096] pt-1 border-t border-[#E5EAF1]">
                    <span>Référence externe :</span>
                    <span className="font-mono text-[#263445]">{selectedTx.reference}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#718096]">
                  <span>Auteur saisie :</span>
                  <span className="text-[#263445]">{selectedTx.author}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAF1] flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
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
