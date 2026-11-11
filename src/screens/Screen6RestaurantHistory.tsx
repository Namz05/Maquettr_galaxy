import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantSale, CashRegisterClosure } from '../types';
import {
  IconReceipt,
  IconSearch,
  IconFilter,
  IconCoin,
  IconShoppingBag,
  IconCreditCard,
  IconBed,
  IconShieldCheck,
  IconCircleCheck,
  IconAlertTriangle,
  IconPrinter,
  IconCalendar,
  IconX,
  IconCirclePlus,
  IconEye,
  IconLock
} from '@tabler/icons-react';
import {
  CalendarDateFilter,
  formatFrenchDateShort
} from '../components/common/CalendarDateFilter';

export const Screen6RestaurantHistory: React.FC = () => {
  const { restaurantSales, cashClosures, closeCashRegister, setCurrentScreen, selectedDate, setSelectedDate } = useApp();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterServer, setFilterServer] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>(''); // empty means all dates

  // All dates with restaurant sales
  const activeSalesDates = Array.from(new Set(restaurantSales.map((s) => s.date))).filter(Boolean);

  // Closure modal state
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [countedAmount, setCountedAmount] = useState<number>(0);
  const [cashierName, setCashierName] = useState('Awa Sanogo');
  const [supervisorName, setSupervisorName] = useState('Administrateur');
  const [closureNotes, setClosureNotes] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<RestaurantSale | null>(null);

  // Filtered sales
  const filteredSales = restaurantSales.filter((sale) => {
    const matchSearch =
      sale.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      sale.serverName.toLowerCase().includes(search.toLowerCase()) ||
      (sale.guestName && sale.guestName.toLowerCase().includes(search.toLowerCase())) ||
      (sale.roomNumber && sale.roomNumber.includes(search));

    const matchMode = filterMode === 'all' || sale.status === filterMode;
    const matchServer = filterServer === 'all' || sale.serverName === filterServer;
    const matchDate = !filterDate || sale.date === filterDate;

    return matchSearch && matchMode && matchServer && matchDate;
  });

  // KPI Calculations
  const activeDayKey = filterDate || selectedDate || '2026-11-10';
  const daySales = restaurantSales.filter((s) => s.date === activeDayKey);
  const relevantList = filterDate ? filteredSales : daySales;

  const totalSalesAmount = relevantList.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalOrdersCount = relevantList.length;

  const totalPaidDirect = relevantList
    .filter((s) => s.paymentMode === 'Paiement direct')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalBilledRooms = relevantList
    .filter((s) => s.paymentMode === 'Affectation chambre')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  // Cash theoretical for today's closure
  const theoreticalCashToday = daySales
    .filter((s) => s.paymentMode === 'Paiement direct' && s.paymentMethod === 'Espèces')
    .reduce((sum, s) => sum + s.totalAmount, 0) || 145000;

  const discrepancy = countedAmount - theoreticalCashToday;

  const handleOpenClosureModal = () => {
    setCountedAmount(theoreticalCashToday);
    setIsClosureModalOpen(true);
  };

  const handlePerformClosure = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashRegister({
      theoreticalAmount: theoreticalCashToday,
      actualAmount: countedAmount,
      discrepancy,
      cashierName,
      supervisorName,
      notes: closureNotes || (discrepancy === 0 ? 'Caisse parfaitement équilibrée.' : 'Écart constaté.'),
    });
    setIsClosureModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Historique des ventes & Clôture de caisse
          </h2>
          <p className="text-xs text-[#718096]">
            Contrôle des encaissements, répartition des règlements et audit financier du service
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenClosureModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <IconLock stroke={1.75} className="w-4 h-4" />
            <span>Clôturer la caisse du jour</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventes du jour */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Ventes du jour</span>
            <div className="text-xl font-bold font-mono text-[#263445] mt-1 tabular-nums">
              {totalSalesAmount.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-[#718096]">Service bar & restaurant</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center">
            <IconCoin stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Nombre de commandes */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Commandes servies</span>
            <div className="text-xl font-bold font-mono text-[#263445] mt-1 tabular-nums">
              {totalOrdersCount} <span className="text-xs text-[#718096] font-sans">tickets</span>
            </div>
            <span className="text-[11px] text-[#718096]">Panier moyen: ~{totalOrdersCount > 0 ? Math.round(totalSalesAmount / totalOrdersCount).toLocaleString('fr-FR') : 0} F</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IconShoppingBag stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Montant payé direct */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Encaissé en direct</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
              {totalPaidDirect.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-[#718096]">Espèces, Carte, Mobile</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IconCreditCard stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Montant affecté aux chambres */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Imputé sur chambres</span>
            <div className="text-xl font-bold font-mono text-[#4C97DB] mt-1 tabular-nums">
              {totalBilledRooms.toLocaleString('fr-FR')} <span className="text-xs text-[#718096] font-sans">FCFA</span>
            </div>
            <span className="text-[11px] text-[#718096]">À solder au check-out</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4C97DB] flex items-center justify-center">
            <IconBed stroke={1.75} className="w-5 h-5" />
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
            placeholder="Rechercher par n° de reçu (REC-...), serveur ou client..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Date Filter */}
          <CalendarDateFilter
            value={filterDate}
            onChange={(d) => setFilterDate(d)}
            activeDates={activeSalesDates}
            allowClear
            clearLabel="Toutes les dates"
            label="Date"
            align="right"
          />

          {/* Mode select */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Tous les règlements</option>
            <option value="Payé direct">Paiement direct</option>
            <option value="Affecté chambre">Affecté sur chambre</option>
          </select>

          {/* Server select */}
          <select
            value={filterServer}
            onChange={(e) => setFilterServer(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Tous les serveurs</option>
            <option value="Mamadou Koné">Mamadou Koné</option>
            <option value="Awa Sanogo">Awa Sanogo</option>
          </select>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">N° Reçu</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Serveur</th>
                <th className="py-3 px-4">Articles vendus</th>
                <th className="py-3 px-4">Montant total</th>
                <th className="py-3 px-4">Règlement</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#4C97DB]">
                    {sale.receiptNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#263445]">{sale.date}</span>
                    <span className="text-[11px] text-[#718096] block font-mono">{sale.time}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {sale.serverName}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="truncate text-xs text-[#263445]">
                      {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <span className="text-[10px] text-[#718096]">{sale.mealType}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sm">
                    {sale.totalAmount.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3.5 px-4">
                    {sale.paymentMode === 'Paiement direct' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        Direct ({sale.paymentMethod})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#4C97DB] font-medium">
                        Chambre {sale.roomNumber} ({sale.guestName})
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {sale.status === 'Payé direct' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Payé direct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#4C97DB] border border-blue-200">
                        Affecté chambre
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(sale)}
                      className="p-1.5 text-[#4C97DB] hover:bg-[#4C97DB]/10 rounded-lg transition-colors"
                      title="Voir le reçu de caisse"
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

      {/* Closures History Archive */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs p-5 space-y-3">
        <h3 className="font-bold text-sm text-[#263445]">
          Historique des clôtures de caisse validées
        </h3>
        <div className="divide-y divide-[#E5EAF1] text-xs">
          {cashClosures.map((cl) => (
            <div key={cl.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#263445]">
                  Clôture du {cl.date} à {cl.time}
                </span>
                <p className="text-[11px] text-[#718096]">
                  Caissier : {cl.cashierName} · Validé par : {cl.supervisorName}
                </p>
                {cl.notes && (
                  <p className="text-[11px] italic text-[#718096] mt-0.5">{cl.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-[#718096] block">Montant théorique</span>
                  <span className="font-mono font-semibold text-[#263445]">
                    {cl.theoreticalAmount.toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718096] block">Compté physique</span>
                  <span className="font-mono font-bold text-[#263445]">
                    {cl.actualAmount.toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718096] block">Écart</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-lg ${
                      cl.discrepancy === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {cl.discrepancy >= 0 ? '+' : ''}{cl.discrepancy.toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Clôture de Caisse */}
      {isClosureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <IconLock stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
                <h3 className="text-base font-bold text-[#263445]">
                  Procès-verbal de clôture de caisse
                </h3>
              </div>
              <button
                onClick={() => setIsClosureModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePerformClosure} className="space-y-4 text-xs">
              {/* Theoretical Amount (System) */}
              <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-[#E5EAF1] space-y-1">
                <span className="text-[#718096] font-medium block">
                  Montant théorique du système (Espèces directes du jour)
                </span>
                <span className="font-mono font-bold text-lg text-[#263445]">
                  {theoreticalCashToday.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Actual Counted Input */}
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Montant réellement compté en caisse (Espèces physiques) *
                </label>
                <input
                  type="number"
                  step="500"
                  value={countedAmount}
                  onChange={(e) => setCountedAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold text-base focus:ring-2 focus:ring-[#4C97DB]/20"
                />
              </div>

              {/* Écart Indicator */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  discrepancy === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : discrepancy > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <span className="font-semibold block">Écart constaté :</span>
                  <span className="text-[11px]">
                    {discrepancy === 0
                      ? 'Aucun écart (Caisse parfaite)'
                      : discrepancy > 0
                      ? 'Excédent de caisse'
                      : 'Manquant en caisse'}
                  </span>
                </div>
                <span className="font-mono font-bold text-base">
                  {discrepancy >= 0 ? '+' : ''}{discrepancy.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Signature du caissier
                  </label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Validation responsable
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Observations ou justification de l'écart
                </label>
                <textarea
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  placeholder="Notes sur la fermeture du service..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClosureModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4C97DB] hover:bg-[#58A2F7] text-white shadow-xs"
                >
                  Valider et Clôturer la caisse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reçu de caisse inspection */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div id="printable-content" className="p-4 bg-white border border-dashed border-[#E5EAF1] rounded-2xl font-mono text-xs text-[#263445] space-y-3">
              <div className="text-center border-b border-[#E5EAF1] pb-3">
                <h2 className="font-bold text-sm tracking-widest">GALAXY HÔTEL</h2>
                <p className="text-[10px] text-[#718096]">RESTAURANT & BAR</p>
              </div>

              <div className="space-y-1 text-[11px] text-[#718096]">
                <div className="flex justify-between">
                  <span>Reçu N° :</span>
                  <span className="font-bold text-[#263445]">{selectedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Heure :</span>
                  <span>{selectedReceipt.date} {selectedReceipt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serveur :</span>
                  <span>{selectedReceipt.serverName}</span>
                </div>
              </div>

              <div className="border-y border-[#E5EAF1] py-2 space-y-1 text-xs">
                {selectedReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="truncate pr-2">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-bold shrink-0">{it.total.toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-sm font-bold">
                  <span>TOTAL :</span>
                  <span className="text-[#4C97DB]">{selectedReceipt.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#718096]">
                  <span>Règlement :</span>
                  <span className="font-semibold text-[#263445]">
                    {selectedReceipt.paymentMode === 'Paiement direct'
                      ? `Direct (${selectedReceipt.paymentMethod})`
                      : `Chambre ${selectedReceipt.roomNumber}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4C97DB] text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <IconPrinter stroke={1.75} className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
