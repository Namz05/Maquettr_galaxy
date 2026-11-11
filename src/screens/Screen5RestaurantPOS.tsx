import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MenuItem,
  MenuItemCategory,
  MealType,
  PaymentMode,
  DirectPaymentMethod,
  SaleItem,
  RestaurantSale
} from '../types';
import {
  IconToolsKitchen2,
  IconSearch,
  IconPlus,
  IconMinus,
  IconTrash,
  IconPrinter,
  IconCreditCard,
  IconCash,
  IconDeviceMobile,
  IconBed,
  IconReceipt,
  IconCircleCheck,
  IconX,
  IconFilePlus,
  IconCoffee,
  IconBeer,
  IconSparkles
} from '@tabler/icons-react';

export const Screen5RestaurantPOS: React.FC = () => {
  const { menuItems, rooms, createRestaurantSale, setCurrentScreen } = useApp();

  // POS State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [mealType, setMealType] = useState<MealType>('Déjeuner');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Paiement direct');
  const [directMethod, setDirectMethod] = useState<DirectPaymentMethod>('Espèces');
  const [selectedOccupiedRoomId, setSelectedOccupiedRoomId] = useState<string>('');
  const [serverName, setServerName] = useState('Mamadou Koné');

  // Custom Item Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(3000);

  // Receipt Modal
  const [generatedSale, setGeneratedSale] = useState<RestaurantSale | null>(null);

  // Occupied rooms only
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupée' && r.currentGuest);

  // Filtered menu
  const filteredMenuItems = menuItems.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          total: item.price,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0
              ? { ...i, quantity: newQty, total: newQty * i.unitPrice }
              : null;
          }
          return i;
        })
        .filter((i): i is SaleItem => i !== null)
    );
  };

  const updateUnitPrice = (itemId: string, newPrice: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, unitPrice: newPrice, total: i.quantity * newPrice }
          : i
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || customPrice <= 0) return;

    const newItem: SaleItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      quantity: 1,
      unitPrice: customPrice,
      total: customPrice,
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsCustomModalOpen(false);
    setCustomName('');
    setCustomPrice(3000);
  };

  // Cart Total
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  // Validate Sale
  const handleValidateSale = () => {
    if (cartItems.length === 0) {
      alert('Veuillez ajouter au moins un article à la commande.');
      return;
    }

    if (paymentMode === 'Affectation chambre' && !selectedOccupiedRoomId) {
      alert('Veuillez sélectionner la chambre occupée à imputer.');
      return;
    }

    const occupiedRoom = occupiedRooms.find((r) => r.id === selectedOccupiedRoomId);

    const sale = createRestaurantSale({
      serverName,
      items: cartItems,
      totalAmount: cartSubtotal,
      mealType,
      paymentMode,
      paymentMethod: paymentMode === 'Paiement direct' ? directMethod : undefined,
      roomId: paymentMode === 'Affectation chambre' ? occupiedRoom?.id : undefined,
      roomNumber: paymentMode === 'Affectation chambre' ? occupiedRoom?.number : undefined,
      guestName: paymentMode === 'Affectation chambre' ? occupiedRoom?.currentGuest?.name : undefined,
      status: paymentMode === 'Paiement direct' ? 'Payé direct' : 'Affecté chambre',
    });

    setGeneratedSale(sale);
    setCartItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Restaurant & Bar – Point de Vente (POS)
          </h2>
          <p className="text-xs text-[#718096]">
            Saisie rapide des commandes, imputation sur chambre ou règlement direct
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('restaurant-history')}
            className="flex items-center gap-2 px-3 py-2 bg-[#F5F8FC] hover:bg-[#E5EAF1] text-[#263445] text-xs font-semibold rounded-xl border border-[#E5EAF1] transition-colors"
          >
            <IconReceipt stroke={1.75} className="w-4 h-4 text-[#4C97DB]" />
            <span>Historique & Caisse</span>
          </button>
        </div>
      </div>

      {/* POS Layout: 2 Columns (Menu on Left, Ticket on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Article Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Custom Item bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <IconSearch stroke={1.75} className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un plat, boisson ou dessert..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
              />
            </div>

            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F8FC] hover:bg-[#E5EAF1] text-[#263445] text-xs font-semibold rounded-xl border border-[#E5EAF1] shrink-0"
            >
              <IconPlus stroke={1.75} className="w-3.5 h-3.5 text-[#4C97DB]" />
              <span>Article sur-mesure</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Tout le menu' },
              { id: 'Plats chauds', label: 'Plats chauds' },
              { id: 'Boissons', label: 'Boissons & Vins' },
              { id: 'Petit-déjeuner', label: 'Petit-déjeuner' },
              { id: 'Snacks', label: 'Snacks & Entrées' },
              { id: 'Desserts', label: 'Desserts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                  activeCategory === tab.id
                    ? 'bg-[#4C97DB] text-white shadow-xs'
                    : 'bg-white text-[#718096] border border-[#E5EAF1] hover:text-[#263445]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-3.5 rounded-2xl border border-[#E5EAF1] shadow-xs hover:border-[#4C97DB] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h4 className="font-bold text-xs text-[#263445] group-hover:text-[#4C97DB] transition-colors leading-tight">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F5F8FC] text-[#718096] shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#718096] line-clamp-2 mb-2 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5EAF1]/60">
                  <span className="font-mono font-bold text-xs text-[#263445]">
                    {item.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center group-hover:bg-[#4C97DB] group-hover:text-white transition-colors">
                    <IconPlus stroke={1.75} className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Ticket & Settlement (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
            <div className="flex items-center gap-2">
              <IconReceipt stroke={1.75} className="w-5 h-5 text-[#4C97DB]" />
              <h3 className="font-bold text-sm text-[#263445]">
                Ticket de commande en cours
              </h3>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1"
              >
                <IconTrash stroke={1.75} className="w-3.5 h-3.5" />
                <span>Vider</span>
              </button>
            )}
          </div>

          {/* Serveur & Repas Type */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                Serveur responsable
              </label>
              <select
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445]"
              >
                <option value="Mamadou Koné">Mamadou Koné</option>
                <option value="Awa Sanogo">Awa Sanogo</option>
                <option value="Jean-Baptiste Kouassi">Jean-Baptiste Kouassi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                Type de service
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445]"
              >
                <option value="Petit-déjeuner">Petit-déjeuner</option>
                <option value="Déjeuner">Déjeuner</option>
                <option value="Dîner">Dîner</option>
                <option value="Autre">Autre / Room service</option>
              </select>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-[#718096] text-xs">
                <IconToolsKitchen2 stroke={1.75} className="w-8 h-8 mx-auto text-[#718096]/40 mb-2" />
                <p>Aucun article sélectionné.</p>
                <p className="text-[11px] text-[#718096]/70 mt-0.5">
                  Cliquez sur un produit du menu pour l'ajouter.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex flex-col gap-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#263445] truncate pr-2">
                      {item.name}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#718096] hover:text-rose-500"
                    >
                      <IconX stroke={1.75} className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-[#E5EAF1] flex items-center justify-center text-[#263445] hover:bg-slate-50"
                      >
                        <IconMinus stroke={1.75} className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-[#E5EAF1] flex items-center justify-center text-[#263445] hover:bg-slate-50"
                      >
                        <IconPlus stroke={1.75} className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Modifiable unit price */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#718096]">PU :</span>
                      <input
                        type="number"
                        step="500"
                        value={item.unitPrice}
                        onChange={(e) => updateUnitPrice(item.id, Number(e.target.value))}
                        className="w-20 px-1.5 py-0.5 text-right font-mono font-semibold bg-white border border-[#E5EAF1] rounded text-xs"
                        title="Prix unitaire modifiable"
                      />
                    </div>

                    {/* Subtotal */}
                    <span className="font-mono font-bold text-[#263445] w-24 text-right">
                      {item.total.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total calculation */}
          <div className="pt-3 border-t border-[#E5EAF1] space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-[#263445]">Total à payer :</span>
              <span className="font-mono text-lg text-[#4C97DB]">
                {cartSubtotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Mode de règlement */}
          <div className="pt-3 border-t border-[#E5EAF1] space-y-3">
            <label className="block text-xs font-bold text-[#263445]">
              Mode de règlement
            </label>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode('Paiement direct')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  paymentMode === 'Paiement direct'
                    ? 'border-[#4C97DB] bg-[#4C97DB]/10 text-[#4C97DB]'
                    : 'border-[#E5EAF1] bg-[#F5F8FC] text-[#263445]'
                }`}
              >
                1. Paiement direct
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Affectation chambre')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  paymentMode === 'Affectation chambre'
                    ? 'border-[#4C97DB] bg-[#4C97DB]/10 text-[#4C97DB]'
                    : 'border-[#E5EAF1] bg-[#F5F8FC] text-[#263445]'
                }`}
              >
                2. Affectation chambre
              </button>
            </div>

            {/* Direct Payment sub-options */}
            {paymentMode === 'Paiement direct' ? (
              <div className="space-y-1.5 text-xs pt-1">
                <span className="text-[11px] font-semibold text-[#718096]">
                  Moyen de paiement direct :
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Espèces', 'Carte bancaire', 'Mobile Money', 'Virement'] as DirectPaymentMethod[]).map(
                    (m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setDirectMethod(m)}
                        className={`p-2 rounded-lg border text-center text-[11px] font-medium transition-all ${
                          directMethod === m
                            ? 'bg-[#4C97DB] text-white border-[#4C97DB]'
                            : 'bg-[#F5F8FC] border-[#E5EAF1] text-[#263445] hover:border-[#4C97DB]'
                        }`}
                      >
                        {m === 'Carte bancaire' ? 'Carte' : m}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* Affectation chambre sub-options: ONLY OCCUPIED ROOMS */
              <div className="space-y-1.5 text-xs pt-1">
                <span className="text-[11px] font-semibold text-[#718096]">
                  Chambre occupée recevant la note :
                </span>
                <select
                  value={selectedOccupiedRoomId}
                  onChange={(e) => setSelectedOccupiedRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-semibold"
                >
                  <option value="">-- Choisir une chambre occupée --</option>
                  {occupiedRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Ch. {r.number} ({r.category}) – {r.currentGuest?.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#718096]">
                  {occupiedRooms.length} chambre(s) actuellement occupée(s) et éligible(s).
                </p>
              </div>
            )}
          </div>

          {/* Validation Button */}
          <button
            onClick={handleValidateSale}
            disabled={cartItems.length === 0}
            className="w-full py-3 px-4 bg-[#4C97DB] hover:bg-[#58A2F7] active:bg-[#4C97DB] text-white text-xs font-bold rounded-xl shadow-md shadow-[#4C97DB]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <IconCircleCheck stroke={1.75} className="w-4 h-4" />
            <span>Valider la vente et Générer le reçu</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: Ajouter un Article Sur-Mesure */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-sm font-bold text-[#263445]">
                Ajouter un article spécial
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Désignation de l'article *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="ex: Bouteille Champagne Réserve"
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Prix unitaire (FCFA) *
                </label>
                <input
                  type="number"
                  step="500"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445] font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#4C97DB] text-white"
                >
                  Insérer dans le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reçu de caisse généré */}
      {generatedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Printable Receipt Container */}
            <div id="printable-content" className="p-4 bg-white border border-dashed border-[#E5EAF1] rounded-2xl font-mono text-xs text-[#263445] space-y-3">
              <div className="text-center border-b border-[#E5EAF1] pb-3">
                <h2 className="font-bold text-sm tracking-widest text-[#263445]">GALAXY HÔTEL</h2>
                <p className="text-[10px] text-[#718096]">RESTAURANT & BAR LOUNGE</p>
                <p className="text-[10px] text-[#718096]">Tél: +225 27 22 00 11 22</p>
              </div>

              <div className="space-y-1 text-[11px] text-[#718096]">
                <div className="flex justify-between">
                  <span>Reçu N° :</span>
                  <span className="font-bold text-[#263445]">{generatedSale.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Heure :</span>
                  <span>{generatedSale.date} {generatedSale.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serveur :</span>
                  <span>{generatedSale.serverName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service :</span>
                  <span>{generatedSale.mealType}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border-y border-[#E5EAF1] py-2 space-y-1 text-xs">
                {generatedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="truncate pr-2">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-bold shrink-0">{it.total.toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-sm font-bold">
                  <span>TOTAL :</span>
                  <span className="text-[#4C97DB]">{generatedSale.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#718096] pt-1">
                  <span>Mode de paiement :</span>
                  <span className="font-semibold text-[#263445]">
                    {generatedSale.paymentMode === 'Paiement direct'
                      ? `Direct (${generatedSale.paymentMethod})`
                      : `Chambre ${generatedSale.roomNumber} (${generatedSale.guestName})`}
                  </span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-[#E5EAF1] text-[10px] text-[#718096]">
                <p>Merci pour votre visite !</p>
                <p>Galaxy Hôtel vous souhaite un excellent séjour.</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => setGeneratedSale(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
              >
                Fermer
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <IconPrinter stroke={1.75} className="w-4 h-4" />
                <span>Imprimer le ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
