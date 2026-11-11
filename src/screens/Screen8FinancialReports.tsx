import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconFileSpreadsheet,
  IconDownload,
  IconCalendar,
  IconTrendingUp,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCoin,
  IconCreditCard,
  IconBuilding
} from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  CalendarDateFilter,
  formatFrenchDateShort
} from '../components/common/CalendarDateFilter';

export const Screen8FinancialReports: React.FC = () => {
  const { transactions, addToast, selectedDate, setSelectedDate } = useApp();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');

  const activeTxDates = Array.from(new Set(transactions.map((t) => t.date))).filter(Boolean);

  // Chart data: Monthly comparison of Revenues vs Expenses
  const revenueExpenseComparison = [
    { name: 'Juin', recettes: 18500000, depenses: 6200000, resultat: 12300000 },
    { name: 'Juil', recettes: 22400000, depenses: 7800000, resultat: 14600000 },
    { name: 'Août', recettes: 26800000, depenses: 8400000, resultat: 18400000 },
    { name: 'Sept', recettes: 19500000, depenses: 6900000, resultat: 12600000 },
    { name: 'Oct', recettes: 24100000, depenses: 7500000, resultat: 16600000 },
    { name: 'Nov (En cours)', recettes: 14200000, depenses: 4300000, resultat: 9900000 },
  ];

  // Activities breakdown
  const activityDistribution = [
    { name: 'Chambres & Hébergement', value: 9800000, color: '#4C97DB' },
    { name: 'Restaurant & Traiteur', value: 3400000, color: '#58A2F7' },
    { name: 'Bar & Boissons Lounge', value: 1600000, color: '#93C5FD' },
    { name: 'Location Salles & Séminaires', value: 1200000, color: '#BFDBFE' },
  ];

  // Expenses by category
  const expensesByCategory = [
    { name: 'Approvisionnements Food & F&B', amount: 1650000, color: '#F87171' },
    { name: 'Énergie, Climatisation & SODECI', amount: 980000, color: '#FB923C' },
    { name: 'Salaires & Personnel d’Étage', amount: 1100000, color: '#FBBF24' },
    { name: 'Maintenance & Pièces détachées', amount: 420000, color: '#A78BFA' },
    { name: 'Frais Généraux & Abonnements', amount: 150000, color: '#94A3B8' },
  ];

  // Payment methods breakdown
  const paymentMethodsData = [
    { name: 'Carte bancaire (Visa/Mastercard)', value: 45, color: '#4C97DB' },
    { name: 'Espèces (Caisse réception & restaurant)', value: 30, color: '#10B981' },
    { name: 'Virements bancaires (Entreprises)', value: 15, color: '#6366F1' },
    { name: 'Mobile Money (Wave / Orange Money)', value: 10, color: '#F59E0B' },
  ];

  // Export handlers
  const handleExportExcel = () => {
    addToast('success', 'Exportation Excel générée', 'Le fichier "Rapport_Financier_Galaxy_Hotel_Nov2026.xlsx" a été préparé.');
  };

  const handleExportPDF = () => {
    addToast('success', 'Exportation PDF générée', 'Le document "Synthese_Comptable_Galaxy_Hotel.pdf" est prêt pour impression.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Rapports & Analyses Financières
          </h2>
          <p className="text-xs text-[#718096]">
            Tableaux de bord consolidés, ratios d'exploitation et ventilation des recettes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#F5F8FC] hover:bg-emerald-50 text-[#263445] hover:text-emerald-700 text-xs font-semibold rounded-xl border border-[#E5EAF1] hover:border-emerald-300 transition-all shrink-0"
            title="Exporter vers Microsoft Excel"
          >
            <IconFileSpreadsheet stroke={1.75} className="w-4 h-4 text-emerald-600" />
            <span>Exporter Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            title="Exporter en rapport officiel PDF"
          >
            <IconDownload stroke={1.75} className="w-4 h-4" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Period Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Period tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] text-xs">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: 'week', label: 'Cette semaine' },
            { id: 'month', label: 'Ce mois' },
            { id: 'year', label: 'Cette année' },
            { id: 'custom', label: 'Période personnalisée' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                period === tab.id
                  ? 'bg-white text-[#4C97DB] shadow-xs'
                  : 'text-[#718096] hover:text-[#263445]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Date Filter for specific day report */}
          <CalendarDateFilter
            value={selectedDate}
            onChange={(d) => {
              setSelectedDate(d);
              setStartDate(d);
              setEndDate(d);
              setPeriod('today');
            }}
            activeDates={activeTxDates}
            label="Jour précis"
            align="right"
          />

          {/* Custom date range if selected */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445]"
              />
              <span className="text-[#718096]">au</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Charts: Recettes vs Dépenses & Répartition Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recettes vs Dépenses Comparison BarChart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#263445]">
                Comparaison Recettes vs Dépenses (Semestriel)
              </h3>
              <p className="text-xs text-[#718096]">
                Évolution mensuelle des encaissements bruts comparés aux charges opérationnelles
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#4C97DB]" />
                <span className="text-[#718096]">Recettes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-400" />
                <span className="text-[#718096]">Dépenses</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#718096" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#718096"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString('fr-FR')} FCFA`, '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5EAF1',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="recettes" fill="#4C97DB" radius={[6, 6, 0, 0]} name="Recettes" />
                <Bar dataKey="depenses" fill="#F87171" radius={[6, 6, 0, 0]} name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par Activité Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#263445]">
              Recettes par activité
            </h3>
            <p className="text-xs text-[#718096] mb-3">
              Ventilation des rentrées d'argent
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {activityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString('fr-FR')} FCFA`, '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5EAF1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E5EAF1] pt-3 text-xs">
            {activityDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#263445] font-medium">{item.name}</span>
                </div>
                <span className="font-mono tabular-nums text-[#718096] font-semibold">
                  {item.value.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Dépenses par catégorie & Répartition moyens de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dépenses par Catégorie */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#263445]">
            Postes de dépenses opérationnelles
          </h3>
          <p className="text-xs text-[#718096]">
            Répartition des charges par centre de coût sur le mois
          </p>

          <div className="space-y-3 pt-2">
            {expensesByCategory.map((exp, idx) => {
              const totalExp = expensesByCategory.reduce((s, e) => s + e.amount, 0);
              const pct = Math.round((exp.amount / totalExp) * 100);
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#263445]">{exp.name}</span>
                    <span className="font-mono font-bold text-[#263445]">
                      {exp.amount.toLocaleString('fr-FR')} FCFA ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F8FC] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: exp.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Moyens de Paiement */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#263445]">
            Répartition des moyens de règlement
          </h3>
          <p className="text-xs text-[#718096]">
            Part relative des canaux d'encaissement clients
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {paymentMethodsData.map((pm, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#F5F8FC] border border-[#E5EAF1] flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pm.color }}
                  />
                  <span className="text-xs font-semibold text-[#263445] leading-tight">
                    {pm.name}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#263445]">
                  {pm.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau récapitulatif du Compte de Résultat Simplifié */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#263445]">
          Compte de Résultat Périodique Simplifié
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Rubrique Comptable</th>
                <th className="py-2.5 px-4 text-right">Montant Brut</th>
                <th className="py-2.5 px-4 text-right">% du Chiffre d'Affaires</th>
                <th className="py-2.5 px-4">Commentaire d'Analyse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
              <tr className="bg-emerald-50/40 font-bold">
                <td className="py-3 px-4 text-emerald-800">1. Chiffre d'affaires Hébergement</td>
                <td className="py-3 px-4 font-mono text-right text-emerald-700">9 800 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">61.2%</td>
                <td className="py-3 px-4 text-[#718096]">Taux d'occupation moyen : 58%</td>
              </tr>
              <tr className="bg-emerald-50/40 font-bold">
                <td className="py-3 px-4 text-emerald-800">2. Chiffre d'affaires Restauration & Bar</td>
                <td className="py-3 px-4 font-mono text-right text-emerald-700">5 000 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">31.3%</td>
                <td className="py-3 px-4 text-[#718096]">Tickets moyens : 14 500 FCFA</td>
              </tr>
              <tr className="bg-emerald-50/40 font-bold">
                <td className="py-3 px-4 text-emerald-800">3. Services & Extras (Lounge, Navettes)</td>
                <td className="py-3 px-4 font-mono text-right text-emerald-700">1 200 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">7.5%</td>
                <td className="py-3 px-4 text-[#718096]">Prestations complémentaires</td>
              </tr>
              <tr className="bg-slate-100/60 font-bold border-t-2 border-[#E5EAF1]">
                <td className="py-3 px-4 text-[#263445]">TOTAL PRODUITS D'EXPLOITATION (RECETTES)</td>
                <td className="py-3 px-4 font-mono text-right text-[#4C97DB] text-sm">16 000 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">100.0%</td>
                <td className="py-3 px-4 text-[#718096]">—</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-rose-700">- Consommation matières & denrées (F&B)</td>
                <td className="py-3 px-4 font-mono text-right text-rose-600">-1 650 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">10.3%</td>
                <td className="py-3 px-4 text-[#718096]">Coût matière bien maîtrisé (&lt;33% F&B)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-rose-700">- Charges d'énergie & utilités (Électricité CIE / Eau)</td>
                <td className="py-3 px-4 font-mono text-right text-rose-600">-980 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">6.1%</td>
                <td className="py-3 px-4 text-[#718096]">Optimisation climatisation continue</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-rose-700">- Maintenance, pièces & entretien général</td>
                <td className="py-3 px-4 font-mono text-right text-rose-600">-420 000 FCFA</td>
                <td className="py-3 px-4 font-mono text-right">2.6%</td>
                <td className="py-3 px-4 text-[#718096]">Rénovation splits et plomberie</td>
              </tr>
              <tr className="bg-blue-50/60 font-bold border-t-2 border-[#4C97DB]/30">
                <td className="py-3.5 px-4 text-[#4C97DB] text-sm">RÉSULTAT BRUT D'EXPLOITATION (MARGE)</td>
                <td className="py-3.5 px-4 font-mono text-right text-[#4C97DB] text-base">+11 700 000 FCFA</td>
                <td className="py-3.5 px-4 font-mono text-right">73.1%</td>
                <td className="py-3.5 px-4 text-emerald-700 font-semibold">Excellente rentabilité opérationnelle</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
