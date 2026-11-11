export type RoomCategory = 'Standard' | 'Mini Suite (VIP)';
export type RoomFloor = 'Rez-de-chaussée' | '1er Étage';
export type RoomStatus = 'Disponible' | 'Occupée' | 'Réservée' | 'Hors service' | 'En nettoyage';

export interface RoomGuest {
  name: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  reservationRef: string;
  folioBalance?: number;
}

export interface Room {
  id: string;
  number: string;
  category: RoomCategory;
  floor: RoomFloor;
  price: number;
  capacity: number;
  status: RoomStatus;
  features: string[];
  currentGuest?: RoomGuest;
  lastCleaned?: string;
  notes?: string;
}

export type ReservationStatus = 'Confirmée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Reservation {
  id: string;
  ref: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdNumber: string;
  roomId: string;
  roomNumber: string;
  roomCategory: RoomCategory;
  checkIn: string;
  checkOut: string;
  occupants: number;
  totalAmount: number;
  deposit: number;
  balance: number;
  status: ReservationStatus;
  extras: string[];
  createdAt: string;
  notes?: string;
}

export type MenuItemCategory = 'Boissons' | 'Plats chauds' | 'Desserts' | 'Petit-déjeuner' | 'Snacks';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  description: string;
  available: boolean;
}

export type MealType = 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Autre';
export type PaymentMode = 'Paiement direct' | 'Affectation chambre';
export type DirectPaymentMethod = 'Espèces' | 'Carte bancaire' | 'Mobile Money' | 'Virement';

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RestaurantSale {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  serverName: string;
  items: SaleItem[];
  totalAmount: number;
  mealType: MealType;
  paymentMode: PaymentMode;
  paymentMethod?: DirectPaymentMethod;
  roomId?: string;
  roomNumber?: string;
  guestName?: string;
  status: 'Payé direct' | 'Affecté chambre';
}

export interface CashRegisterClosure {
  id: string;
  date: string;
  time: string;
  theoreticalAmount: number;
  actualAmount: number;
  discrepancy: number;
  cashierName: string;
  supervisorName: string;
  notes?: string;
  validated: boolean;
}

export type Department = 'Hébergement' | 'Restaurant' | 'Approvisionnement' | 'Maintenance' | 'Charges générales';
export type TransactionType = 'Recette' | 'Dépense';
export type TransactionStatus = 'Validé' | 'En attente' | 'Annulé';

export interface FinancialTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  time: string;
  description: string;
  department: Department;
  type: TransactionType;
  paymentMethod: DirectPaymentMethod;
  amount: number;
  status: TransactionStatus;
  reference?: string;
  author: string;
}

export type StockCategory = 'Boissons' | 'Produits frais' | 'Épicerie' | 'Entretien & Hygiène' | 'Linge & Accueil';
export type StockUnit = 'Bouteille' | 'Kg' | 'Carton' | 'Litre' | 'Paquet' | 'Pièce';
export type StockStatus = 'Normal' | 'Faible' | 'Proche péremption' | 'Périmé';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  unit: StockUnit;
  qtyWarehouse: number; // Magasin
  qtyKitchen: number;   // Cuisine
  minThreshold: number;
  expiryDate: string;
  costPrice: number;
  status?: StockStatus;
}

export type MovementType = 'Entrée' | 'Sortie' | 'Transfert' | 'Perte' | 'Correction';
export type StockLocation = 'Fournisseur' | 'Magasin' | 'Cuisine' | 'Pertes' | 'Ajustement' | 'Client';

export interface StockMovement {
  id: string;
  ref: string;
  dateTime: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  unit: StockUnit;
  sourceLocation: StockLocation;
  destinationLocation: StockLocation;
  responsibleUser: string;
  reason: string;
}

export type ScreenId =
  | 'login'
  | 'dashboard'
  | 'rooms'
  | 'reservations'
  | 'restaurant-pos'
  | 'restaurant-history'
  | 'finances-transactions'
  | 'finances-reports'
  | 'stock-status'
  | 'stock-movements';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
