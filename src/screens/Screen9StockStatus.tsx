import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StockItem, StockCategory, StockUnit } from '../types';
import {
  IconPackages,
  IconSearch,
  IconPlus,
  IconArrowsExchange,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconClipboardCheck,
  IconAlertTriangle,
  IconClock,
  IconAlertCircle,
  IconX,
  IconBuildingSkyscraper,
  IconToolsKitchen2,
  IconFilter,
  IconPackage
} from '@tabler/icons-react';

export const Screen9StockStatus: React.FC = () => {
  const {
    stockItems,
    addStockItem,
    addStockMovement,
    performInventoryAdjustment,
    setCurrentScreen,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<'all' | 'warehouse' | 'kitchen'>('all');
  const [filterAlert, setFilterAlert] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Form states for modals
  const [selectedItemId, setSelectedItemId] = useState<string>(stockItems[0]?.id || '');
  const [movementQty, setMovementQty] = useState<number>(5);
  const [movementReason, setMovementReason] = useState<string>('');
  const [movementSource, setMovementSource] = useState<'Magasin' | 'Cuisine'>('Magasin');

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<StockCategory>('Boissons');
  const [newItemUnit, setNewItemUnit] = useState<StockUnit>('Carton');
  const [newWarehouseQty, setNewWarehouseQty] = useState<number>(10);
  const [newKitchenQty, setNewKitchenQty] = useState<number>(2);
  const [newThreshold, setNewThreshold] = useState<number>(5);
  const [newExpiry, setNewExpiry] = useState<string>('2027-12-31');
  const [newCost, setNewCost] = useState<number>(5000);

  // Inventory adjustment state
  const [invCountedQty, setInvCountedQty] = useState<number>(10);
  const [invLocation, setInvLocation] = useState<'Magasin' | 'Cuisine'>('Magasin');

  // KPIs
  const totalItemsCount = stockItems.length;

  const lowStockItems = stockItems.filter(
    (item) => item.qtyWarehouse + item.qtyKitchen <= item.minThreshold
  );

  const now = new Date('2026-11-10');
  const nearExpiryItems = stockItems.filter((item) => {
    const exp = new Date(item.expiryDate);
    const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const expiredItems = stockItems.filter((item) => {
    const exp = new Date(item.expiryDate);
    return exp < now;
  });

  // Filtered Items
  const filteredItems = stockItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || item.category === filterCategory;

    let matchLoc = true;
    if (filterLocation === 'warehouse') matchLoc = item.qtyWarehouse > 0;
    if (filterLocation === 'kitchen') matchLoc = item.qtyKitchen > 0;

    let matchAlert = true;
    const isLow = item.qtyWarehouse + item.qtyKitchen <= item.minThreshold;
    const exp = new Date(item.expiryDate);
    const isExpired = exp < now;
    const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    const isNearExpiry = diffDays >= 0 && diffDays <= 7;

    if (filterAlert === 'low') matchAlert = isLow;
    if (filterAlert === 'near') matchAlert = isNearExpiry;
    if (filterAlert === 'expired') matchAlert = isExpired;

    return matchSearch && matchCat && matchLoc && matchAlert;
  });

  // Action Handlers
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    addStockItem({
      name: newItemName,
      category: newItemCat,
      unit: newItemUnit,
      qtyWarehouse: newWarehouseQty,
      qtyKitchen: newKitchenQty,
      minThreshold: newThreshold,
      expiryDate: newExpiry,
      costPrice: newCost,
    });

    setIsAddModalOpen(false);
    setNewItemName('');
  };

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stockItems.find((s) => s.id === selectedItemId);
    if (!item || movementQty <= 0) return;

    addStockMovement({
      itemId: item.id,
      itemName: item.name,
      type: 'Entrée',
      quantity: movementQty,
      unit: item.unit,
      sourceLocation: 'Fournisseur',
      destinationLocation: 'Magasin',
      responsibleUser: 'Économe Principal',
      reason: movementReason || 'Réception commande fournisseur conforme.',
    });

    setIsEntryModalOpen(false);
    setMovementReason('');
  };

  const handleExitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stockItems.find((s) => s.id === selectedItemId);
    if (!item || movementQty <= 0) return;

    addStockMovement({
      itemId: item.id,
      itemName: item.name,
      type: 'Sortie',
      quantity: movementQty,
      unit: item.unit,
      sourceLocation: movementSource,
      destinationLocation: 'Client',
      responsibleUser: 'Responsable Étage',
      reason: movementReason || 'Sortie pour approvisionnement service ou client.',
    });

    setIsExitModalOpen(false);
    setMovementReason('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stockItems.find((s) => s.id === selectedItemId);
    if (!item || movementQty <= 0) return;

    addStockMovement({
      itemId: item.id,
      itemName: item.name,
      type: 'Transfert',
      quantity: movementQty,
      unit: item.unit,
      sourceLocation: 'Magasin',
      destinationLocation: 'Cuisine',
      responsibleUser: 'Chef Cuisinier',
      reason: movementReason || 'Ravitaillement cuisine centrale depuis le magasin.',
    });

    setIsTransferModalOpen(false);
    setMovementReason('');
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performInventoryAdjustment(
      selectedItemId,
      invLocation,
      invCountedQty,
      movementReason || 'Inventaire mensuel contradictoire'
    );
    setIsInventoryModalOpen(false);
    setMovementReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Gestion du Stock (Magasin & Cuisine)
          </h2>
          <p className="text-xs text-[#718096]">
            Inventaire en temps réel réparti entre l'entrepôt central et la cuisine du restaurant
          </p>
        </div>

        {/* 5 Action Buttons required by spec */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <IconPlus stroke={1.75} className="w-4 h-4" />
            <span>Ajouter un article</span>
          </button>

          <button
            onClick={() => {
              if (stockItems.length > 0) setSelectedItemId(stockItems[0].id);
              setIsEntryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <IconArrowDownLeft stroke={1.75} className="w-4 h-4 text-emerald-600" />
            <span>Enregistrer une entrée</span>
          </button>

          <button
            onClick={() => {
              if (stockItems.length > 0) setSelectedItemId(stockItems[0].id);
              setIsExitModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <IconArrowUpRight stroke={1.75} className="w-4 h-4 text-rose-600" />
            <span>Enregistrer une sortie</span>
          </button>

          <button
            onClick={() => {
              if (stockItems.length > 0) setSelectedItemId(stockItems[0].id);
              setIsTransferModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#4C97DB] border border-blue-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <IconArrowsExchange stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
            <span>Transférer vers cuisine</span>
          </button>

          <button
            onClick={() => {
              if (stockItems.length > 0) {
                setSelectedItemId(stockItems[0].id);
                setInvCountedQty(stockItems[0].qtyWarehouse);
              }
              setIsInventoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F8FC] hover:bg-[#E5EAF1] text-[#263445] border border-[#E5EAF1] text-xs font-semibold rounded-xl transition-colors"
          >
            <IconClipboardCheck stroke={1.75} className="w-4 h-4 text-[#718096]" />
            <span>Faire un inventaire</span>
          </button>
        </div>
      </div>

      {/* 4 Stock KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Articles */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Total références</span>
            <div className="text-xl font-bold font-mono text-[#263445] mt-1 tabular-nums">
              {totalItemsCount} <span className="text-xs text-[#718096] font-sans">produits</span>
            </div>
            <span className="text-[11px] text-[#718096]">Magasin & Cuisine actifs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center">
            <IconPackages stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Stock faible */}
        <div
          onClick={() => setFilterAlert(filterAlert === 'low' ? 'all' : 'low')}
          className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold text-[#718096]">Stock faible / Alerte</span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
              {lowStockItems.length} <span className="text-xs text-[#718096] font-sans">articles</span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Réapprovisionner rapidement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <IconAlertTriangle stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Proche de la péremption */}
        <div
          onClick={() => setFilterAlert(filterAlert === 'near' ? 'all' : 'near')}
          className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold text-[#718096]">Proche péremption (&lt;7j)</span>
            <div className="text-xl font-bold font-mono text-orange-600 mt-1 tabular-nums">
              {nearExpiryItems.length} <span className="text-xs text-[#718096] font-sans">produits</span>
            </div>
            <span className="text-[11px] text-orange-600 font-medium">À consommer en priorité</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <IconClock stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Produits périmés */}
        <div
          onClick={() => setFilterAlert(filterAlert === 'expired' ? 'all' : 'expired')}
          className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold text-[#718096]">Produits périmés</span>
            <div className="text-xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
              {expiredItems.length} <span className="text-xs text-[#718096] font-sans">produit(s)</span>
            </div>
            <span className="text-[11px] text-rose-600 font-medium">À mettre au rebut</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <IconAlertCircle stroke={1.75} className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch stroke={1.75} className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit, ingrédient ou produit d'accueil..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Select */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445]"
          >
            <option value="all">Toutes les catégories</option>
            <option value="Boissons">Boissons & Vins</option>
            <option value="Produits frais">Produits frais (Viandes/Poissons)</option>
            <option value="Épicerie">Épicerie & Secs</option>
            <option value="Entretien & Hygiène">Entretien & Hygiène</option>
            <option value="Linge & Accueil">Linge & Produits d'Accueil</option>
          </select>

          {/* Location Filter */}
          <div className="flex items-center p-1 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-xs">
            <button
              onClick={() => setFilterLocation('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterLocation === 'all' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterLocation('warehouse')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterLocation === 'warehouse' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              Magasin
            </button>
            <button
              onClick={() => setFilterLocation('kitchen')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterLocation === 'kitchen' ? 'bg-white text-[#4C97DB] shadow-xs' : 'text-[#718096]'
              }`}
            >
              Cuisine
            </button>
          </div>

          {filterAlert !== 'all' && (
            <button
              onClick={() => setFilterAlert('all')}
              className="text-xs font-semibold text-[#4C97DB] bg-[#4C97DB]/10 px-2.5 py-1.5 rounded-xl hover:bg-[#4C97DB]/20"
            >
              Alerte: {filterAlert} ✕
            </button>
          )}
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Unité</th>
                <th className="py-3 px-4 text-center bg-blue-50/50">Qté Magasin</th>
                <th className="py-3 px-4 text-center bg-amber-50/50">Qté Cuisine</th>
                <th className="py-3 px-4 text-center font-bold">Qté Totale</th>
                <th className="py-3 px-4">Date de Péremption</th>
                <th className="py-3 px-4">Statut Stock</th>
                <th className="py-3 px-4 text-right">Actions rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
              {filteredItems.map((item) => {
                const totalQty = item.qtyWarehouse + item.qtyKitchen;
                const isLow = totalQty <= item.minThreshold;
                const exp = new Date(item.expiryDate);
                const isExpired = exp < now;
                const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isNearExpiry = diffDays >= 0 && diffDays <= 7;

                return (
                  <tr key={item.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#263445] text-xs">{item.name}</div>
                      <div className="text-[11px] text-[#718096]">Seuil alerte : {item.minThreshold} {item.unit}s</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#718096]">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm bg-blue-50/30">
                      {item.qtyWarehouse}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm bg-amber-50/30">
                      {item.qtyKitchen}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-[#263445]">
                      {totalQty}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={isExpired ? 'text-rose-600 font-bold' : isNearExpiry ? 'text-orange-600 font-semibold' : ''}>
                        {item.expiryDate}
                      </span>
                      {isExpired && (
                        <span className="block text-[10px] text-rose-600 font-semibold">Périmé</span>
                      )}
                      {isNearExpiry && (
                        <span className="block text-[10px] text-orange-600 font-semibold">Dans {diffDays}j</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Périmé
                        </span>
                      ) : isNearExpiry ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          Proche péremption
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Stock faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 shrink-0">
                      {/* Quick transfer button */}
                      <button
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setMovementQty(1);
                          setIsTransferModalOpen(true);
                        }}
                        className="px-2 py-1 bg-[#F5F8FC] hover:bg-blue-50 text-[#4C97DB] border border-[#E5EAF1] rounded-lg text-[11px] font-semibold transition-colors"
                        title="Transférer 1+ vers la cuisine"
                      >
                        Vers Cuisine
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Ajouter un Article */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-base font-bold text-[#263445]">
                Ajouter un article en stock
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Nom de l'article *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="ex: Sucre en morceaux (Paquets 1kg)"
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value as StockCategory)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Boissons">Boissons</option>
                    <option value="Produits frais">Produits frais</option>
                    <option value="Épicerie">Épicerie</option>
                    <option value="Entretien & Hygiène">Entretien & Hygiène</option>
                    <option value="Linge & Accueil">Linge & Accueil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Unité de mesure
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as StockUnit)}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Carton">Carton</option>
                    <option value="Bouteille">Bouteille</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Paquet">Paquet</option>
                    <option value="Pièce">Pièce</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Quantité en Magasin
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newWarehouseQty}
                    onChange={(e) => setNewWarehouseQty(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Quantité en Cuisine
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newKitchenQty}
                    onChange={(e) => setNewKitchenQty(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Seuil d'alerte faible
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Date de péremption
                  </label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    required
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
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#4C97DB] text-white"
                >
                  Créer l'article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Enregistrer une entrée */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-sm font-bold text-[#263445]">
                Enregistrer une entrée de stock
              </h3>
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEntrySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Article réceptionné *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (actuel: {s.qtyWarehouse} en magasin)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Quantité entrée (au Magasin) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Motif ou Réf Fournisseur
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="ex: Bon de livraison n° 88102"
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white"
                >
                  Valider l'entrée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Transférer vers la Cuisine */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <IconArrowsExchange stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
                <h3 className="text-sm font-bold text-[#263445]">
                  Transfert Magasin → Cuisine
                </h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Article à transférer *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Dispo magasin: {s.qtyWarehouse} {s.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Quantité à déplacer vers la cuisine *
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Motif / Service demandeur
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="ex: Réapprovisionnement service du midi"
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#4C97DB] text-white"
                >
                  Effectuer le transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Enregistrer une sortie */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-sm font-bold text-[#263445]">
                Enregistrer une sortie de stock
              </h3>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Article *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Emplacement de prélèvement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementSource('Magasin')}
                    className={`py-1.5 rounded-xl border text-center font-semibold ${
                      movementSource === 'Magasin' ? 'bg-[#4C97DB] text-white border-[#4C97DB]' : 'bg-[#F5F8FC]'
                    }`}
                  >
                    Magasin
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementSource('Cuisine')}
                    className={`py-1.5 rounded-xl border text-center font-semibold ${
                      movementSource === 'Cuisine' ? 'bg-[#4C97DB] text-white border-[#4C97DB]' : 'bg-[#F5F8FC]'
                    }`}
                  >
                    Cuisine
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Quantité sortie *
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Motif de la sortie
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="ex: Consommation banquet, dotation chambres..."
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white"
                >
                  Valider la sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Effectuer un Inventaire */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <IconClipboardCheck stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
                <h3 className="text-sm font-bold text-[#263445]">
                  Ajustement d'inventaire contradictoire
                </h3>
              </div>
              <button
                onClick={() => setIsInventoryModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInventorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Article contrôlé *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const item = stockItems.find((s) => s.id === e.target.value);
                    if (item) {
                      setInvCountedQty(invLocation === 'Magasin' ? item.qtyWarehouse : item.qtyKitchen);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Emplacement audité
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInvLocation('Magasin');
                      const item = stockItems.find((s) => s.id === selectedItemId);
                      if (item) setInvCountedQty(item.qtyWarehouse);
                    }}
                    className={`py-1.5 rounded-xl border text-center font-semibold ${
                      invLocation === 'Magasin' ? 'bg-[#4C97DB] text-white border-[#4C97DB]' : 'bg-[#F5F8FC]'
                    }`}
                  >
                    Magasin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvLocation('Cuisine');
                      const item = stockItems.find((s) => s.id === selectedItemId);
                      if (item) setInvCountedQty(item.qtyKitchen);
                    }}
                    className={`py-1.5 rounded-xl border text-center font-semibold ${
                      invLocation === 'Cuisine' ? 'bg-[#4C97DB] text-white border-[#4C97DB]' : 'bg-[#F5F8FC]'
                    }`}
                  >
                    Cuisine
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Quantité physique réellement comptée *
                </label>
                <input
                  type="number"
                  min="0"
                  value={invCountedQty}
                  onChange={(e) => setInvCountedQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Justification de l'ajustement
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="ex: Casse accidentelle ou régularisation inventaire fin de mois"
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#4C97DB] text-white"
                >
                  Enregistrer l'inventaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
