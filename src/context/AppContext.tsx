import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenId,
  Room,
  Reservation,
  MenuItem,
  RestaurantSale,
  CashRegisterClosure,
  FinancialTransaction,
  StockItem,
  StockMovement,
  ToastMessage,
  RoomStatus,
  Employee,
} from '../types';
import {
  initialRooms,
  initialReservations,
  initialMenuItems,
  initialRestaurantSales,
  initialCashClosures,
  initialTransactions,
  initialStockItems,
  initialStockMovements,
  initialEmployees,
} from '../data/seedData';

interface AppContextType {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Data collections
  rooms: Room[];
  reservations: Reservation[];
  menuItems: MenuItem[];
  restaurantSales: RestaurantSale[];
  cashClosures: CashRegisterClosure[];
  transactions: FinancialTransaction[];
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  employees: Employee[];

  // Data operations
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  updateRoomStatus: (id: string, status: RoomStatus, notes?: string) => void;

  addReservation: (reservation: Omit<Reservation, 'id' | 'ref' | 'createdAt'>) => string;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string, reason?: string) => void;
  checkInReservation: (id: string) => void;
  checkOutReservation: (id: string) => void;

  createRestaurantSale: (sale: Omit<RestaurantSale, 'id' | 'receiptNumber' | 'date' | 'time'>) => RestaurantSale;
  closeCashRegister: (closure: Omit<CashRegisterClosure, 'id' | 'date' | 'time' | 'validated'>) => CashRegisterClosure;

  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'transactionNumber' | 'date' | 'time'>) => void;

  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'ref' | 'dateTime'>) => void;
  performInventoryAdjustment: (itemId: string, location: 'Magasin' | 'Cuisine', countedQty: number, reason: string) => void;

  // HR Operations
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateEmployeeStatus: (id: string, status: Employee['status']) => void;

  // Active Business Date
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Feedback
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Reset
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-10');

  // Local state initialized with seed or localStorage
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('galaxy_rooms_70');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 70) return parsed;
      } catch (e) {}
    }
    return initialRooms;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('galaxy_reservations_1to10');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialReservations;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('galaxy_menu_items_v2');
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const [restaurantSales, setRestaurantSales] = useState<RestaurantSale[]>(() => {
    const saved = localStorage.getItem('galaxy_restaurant_sales_v2');
    return saved ? JSON.parse(saved) : initialRestaurantSales;
  });

  const [cashClosures, setCashClosures] = useState<CashRegisterClosure[]>(() => {
    const saved = localStorage.getItem('galaxy_cash_closures');
    return saved ? JSON.parse(saved) : initialCashClosures;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('galaxy_transactions_v2');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('galaxy_stock_items');
    return saved ? JSON.parse(saved) : initialStockItems;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('galaxy_stock_movements');
    return saved ? JSON.parse(saved) : initialStockMovements;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('galaxy_employees_v1');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('galaxy_employees_v1', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('galaxy_rooms_70', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('galaxy_reservations_1to10', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('galaxy_restaurant_sales_v2', JSON.stringify(restaurantSales));
  }, [restaurantSales]);

  useEffect(() => {
    localStorage.setItem('galaxy_cash_closures', JSON.stringify(cashClosures));
  }, [cashClosures]);

  useEffect(() => {
    localStorage.setItem('galaxy_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);


  useEffect(() => {
    localStorage.setItem('galaxy_stock_items', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('galaxy_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (email: string) => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    addToast('success', 'Connexion réussie', `Bienvenue Administrateur (${email || 'admin@galaxyhotel.com'})`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    addToast('info', 'Déconnexion effectuée', 'À bientôt sur Galaxy Hôtel.');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // ROOM ACTIONS
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${roomData.number}`,
    };
    setRooms((prev) => [...prev, newRoom]);
    addToast('success', 'Chambre ajoutée', `Chambre n° ${roomData.number} enregistrée avec succès.`);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    addToast('success', 'Chambre mise à jour', 'Les modifications ont été appliquées.');
  };

  const updateRoomStatus = (id: string, status: RoomStatus, notes?: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            notes: notes !== undefined ? notes : r.notes,
            lastCleaned: status === 'Disponible' ? 'Aujourd’hui ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : r.lastCleaned,
          };
        }
        return r;
      })
    );
    addToast('info', 'Statut chambre actualisé', `Statut passé à : ${status}`);
  };

  // RESERVATION ACTIONS
  const addReservation = (resData: Omit<Reservation, 'id' | 'ref' | 'createdAt'>) => {
    const ref = `RES-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      ref,
      createdAt: '2026-11-10',
    };

    setReservations((prev) => [newRes, ...prev]);

    // Update room status
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === resData.roomId) {
          return {
            ...r,
            status: resData.status === 'En cours' ? 'Occupée' : 'Réservée',
            currentGuest:
              resData.status === 'En cours'
                ? {
                    name: resData.guestName,
                    phone: resData.guestPhone,
                    checkIn: resData.checkIn,
                    checkOut: resData.checkOut,
                    reservationRef: ref,
                    folioBalance: 0,
                  }
                : undefined,
          };
        }
        return r;
      })
    );

    // If deposit paid, create transaction
    if (resData.deposit > 0) {
      addTransaction({
        description: `Acompte réservation ${resData.guestName} (Ch. ${resData.roomNumber})`,
        department: 'Hébergement',
        type: 'Recette',
        paymentMethod: 'Carte bancaire',
        amount: resData.deposit,
        status: 'Validé',
        reference: ref,
        author: 'Réceptionniste',
      });
    }

    addToast('success', 'Réservation créée', `Dossier ${ref} enregistré pour ${resData.guestName}.`);
    return ref;
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations((prev) => prev.map((res) => (res.id === id ? { ...res, ...updates } : res)));
    addToast('success', 'Réservation modifiée', 'Détails de la réservation mis à jour.');
  };

  const cancelReservation = (id: string, reason?: string) => {
    const target = reservations.find((r) => r.id === id);
    if (!target) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Annulée', notes: reason || 'Annulation manuelle' } : r))
    );

    // Free the room
    setRooms((prev) =>
      prev.map((r) => (r.id === target.roomId ? { ...r, status: 'Disponible', currentGuest: undefined } : r))
    );

    addToast('warning', 'Réservation annulée', `La réservation ${target.ref} a été annulée et la chambre ${target.roomNumber} libérée.`);
  };

  const checkInReservation = (id: string) => {
    const target = reservations.find((r) => r.id === id);
    if (!target) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'En cours' } : r))
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.id === target.roomId
          ? {
              ...r,
              status: 'Occupée',
              currentGuest: {
                name: target.guestName,
                phone: target.guestPhone,
                checkIn: target.checkIn,
                checkOut: target.checkOut,
                reservationRef: target.ref,
                folioBalance: target.balance,
              },
            }
          : r
      )
    );

    addToast('success', 'Check-in validé', `${target.guestName} a été installé(e) en chambre ${target.roomNumber}.`);
  };

  const checkOutReservation = (id: string) => {
    const target = reservations.find((r) => r.id === id);
    if (!target) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Terminée' } : r))
    );

    // Mark room as "En nettoyage"
    setRooms((prev) =>
      prev.map((r) =>
        r.id === target.roomId
          ? {
              ...r,
              status: 'En nettoyage',
              currentGuest: undefined,
              notes: `Départ client ${target.guestName}. Nettoyage et remise en état requis.`,
            }
          : r
      )
    );

    addToast('info', 'Check-out effectué', `Chambre ${target.roomNumber} libérée et mise en statut 'En nettoyage'.`);
  };

  // RESTAURANT ACTIONS
  const createRestaurantSale = (
    saleData: Omit<RestaurantSale, 'id' | 'receiptNumber' | 'date' | 'time'>
  ): RestaurantSale => {
    const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const date = '2026-11-10';
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newSale: RestaurantSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      receiptNumber,
      date,
      time,
    };

    setRestaurantSales((prev) => [newSale, ...prev]);

    // If direct payment, add transaction
    if (saleData.paymentMode === 'Paiement direct') {
      addTransaction({
        description: `Vente restaurant direct (Ticket ${receiptNumber})`,
        department: 'Restaurant',
        type: 'Recette',
        paymentMethod: saleData.paymentMethod || 'Espèces',
        amount: saleData.totalAmount,
        status: 'Validé',
        reference: receiptNumber,
        author: saleData.serverName,
      });
    } else if (saleData.paymentMode === 'Affectation chambre' && saleData.roomId) {
      // Add amount to room guest folio balance
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === saleData.roomId && r.currentGuest) {
            return {
              ...r,
              currentGuest: {
                ...r.currentGuest,
                folioBalance: (r.currentGuest.folioBalance || 0) + saleData.totalAmount,
              },
            };
          }
          return r;
        })
      );
    }

    addToast('success', 'Vente restaurant validée', `Ticket ${receiptNumber} de ${saleData.totalAmount.toLocaleString('fr-FR')} FCFA enregistré.`);
    return newSale;
  };

  const closeCashRegister = (
    closureData: Omit<CashRegisterClosure, 'id' | 'date' | 'time' | 'validated'>
  ): CashRegisterClosure => {
    const now = new Date();
    const date = '2026-11-10';
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newClosure: CashRegisterClosure = {
      ...closureData,
      id: `close-${Date.now()}`,
      date,
      time,
      validated: true,
    };

    setCashClosures((prev) => [newClosure, ...prev]);
    addToast('success', 'Caisse clôturée avec succès', `Montant compté : ${closureData.actualAmount.toLocaleString('fr-FR')} FCFA (Écart : ${closureData.discrepancy >= 0 ? '+' : ''}${closureData.discrepancy.toLocaleString('fr-FR')} FCFA)`);
    return newClosure;
  };

  // FINANCIAL ACTIONS
  const addTransaction = (txData: Omit<FinancialTransaction, 'id' | 'transactionNumber' | 'date' | 'time'>) => {
    const transactionNumber = `TRX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const date = '2026-11-10';
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      transactionNumber,
      date,
      time,
    };

    setTransactions((prev) => [newTx, ...prev]);
    addToast('success', 'Transaction enregistrée', `${newTx.type} de ${newTx.amount.toLocaleString('fr-FR')} FCFA (${newTx.department}) ajoutée.`);
  };

  // STOCK ACTIONS
  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stock-${Date.now()}`,
      status:
        itemData.qtyWarehouse + itemData.qtyKitchen <= itemData.minThreshold
          ? 'Faible'
          : 'Normal',
    };
    setStockItems((prev) => [...prev, newItem]);
    addToast('success', 'Article de stock ajouté', `${itemData.name} enregistré.`);
  };

  const addStockMovement = (movementData: Omit<StockMovement, 'id' | 'ref' | 'dateTime'>) => {
    const ref = `MV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateTime = '2026-11-10 ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newMv: StockMovement = {
      ...movementData,
      id: `mv-${Date.now()}`,
      ref,
      dateTime,
    };

    setStockMovements((prev) => [newMv, ...prev]);

    // Adjust quantities in stock items
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === movementData.itemId) {
          let warehouse = item.qtyWarehouse;
          let kitchen = item.qtyKitchen;

          if (movementData.type === 'Entrée') {
            warehouse += movementData.quantity;
          } else if (movementData.type === 'Sortie') {
            if (movementData.sourceLocation === 'Magasin') {
              warehouse = Math.max(0, warehouse - movementData.quantity);
            } else {
              kitchen = Math.max(0, kitchen - movementData.quantity);
            }
          } else if (movementData.type === 'Transfert') {
            if (movementData.sourceLocation === 'Magasin' && movementData.destinationLocation === 'Cuisine') {
              warehouse = Math.max(0, warehouse - movementData.quantity);
              kitchen += movementData.quantity;
            } else if (movementData.sourceLocation === 'Cuisine' && movementData.destinationLocation === 'Magasin') {
              kitchen = Math.max(0, kitchen - movementData.quantity);
              warehouse += movementData.quantity;
            }
          } else if (movementData.type === 'Perte') {
            if (movementData.sourceLocation === 'Cuisine') {
              kitchen = Math.max(0, kitchen - movementData.quantity);
            } else {
              warehouse = Math.max(0, warehouse - movementData.quantity);
            }
          }

          const total = warehouse + kitchen;
          const status = total <= item.minThreshold ? 'Faible' : 'Normal';

          return {
            ...item,
            qtyWarehouse: warehouse,
            qtyKitchen: kitchen,
            status,
          };
        }
        return item;
      })
    );

    addToast('success', 'Mouvement enregistré', `${movementData.type} de ${movementData.quantity} ${movementData.unit} (${movementData.itemName}) validée.`);
  };

  const performInventoryAdjustment = (
    itemId: string,
    location: 'Magasin' | 'Cuisine',
    countedQty: number,
    reason: string
  ) => {
    const item = stockItems.find((s) => s.id === itemId);
    if (!item) return;

    const currentQty = location === 'Magasin' ? item.qtyWarehouse : item.qtyKitchen;
    const diff = countedQty - currentQty;

    // Movement
    addStockMovement({
      itemId,
      itemName: item.name,
      type: 'Correction',
      quantity: Math.abs(diff),
      unit: item.unit,
      sourceLocation: diff < 0 ? location : 'Ajustement',
      destinationLocation: diff >= 0 ? location : 'Ajustement',
      responsibleUser: 'Responsable Inventaire',
      reason: `Inventaire physique [${location}]: compté ${countedQty} vs système ${currentQty} (${reason})`,
    });

    addToast('info', 'Inventaire mis à jour', `Quantité ${location} ajustée à ${countedQty} ${item.unit}.`);
  };

  const addEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    setEmployees((prev) => [...prev, { ...newEmp, id }]);
    addToast('success', 'Employé ajouté', `${newEmp.name} a été enregistré dans le registre RH.`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );
    addToast('success', 'Fiche RH mise à jour', 'Les informations ont été enregistrées.');
  };

  const updateEmployeeStatus = (id: string, status: Employee['status']) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, status } : emp))
    );
    addToast('info', 'Statut RH modifié', `Le statut a été passé à : ${status}`);
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setRooms(initialRooms);
    setReservations(initialReservations);
    setMenuItems(initialMenuItems);
    setRestaurantSales(initialRestaurantSales);
    setCashClosures(initialCashClosures);
    setTransactions(initialTransactions);
    setStockItems(initialStockItems);
    setStockMovements(initialStockMovements);
    setEmployees(initialEmployees);
    addToast('info', 'Données réinitialisées', 'Toutes les données de démonstration ont été restaurées.');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        isAuthenticated,
        login,
        logout,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        rooms,
        reservations,
        menuItems,
        restaurantSales,
        cashClosures,
        transactions,
        stockItems,
        stockMovements,
        employees,
        addRoom,
        updateRoom,
        updateRoomStatus,
        addReservation,
        updateReservation,
        cancelReservation,
        checkInReservation,
        checkOutReservation,
        createRestaurantSale,
        closeCashRegister,
        addTransaction,
        addStockItem,
        addStockMovement,
        performInventoryAdjustment,
        addEmployee,
        updateEmployee,
        updateEmployeeStatus,
        selectedDate,
        setSelectedDate,
        toasts,
        addToast,
        removeToast,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
