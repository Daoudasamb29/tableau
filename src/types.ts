export interface Driver {
  id: string; // e.g., "DRV-9012"
  name: string;
  avatar: string;
  vehicle: string;
  plate: string;
  status: 'active' | 'inactive'; // 'active' = En service, 'inactive' = Hors service
  adminLocked?: boolean;
  rating: number;
  tripsCount: number;
  revenue: string;
  phone: string;
  hireDate: string;
}

export interface Activity {
  id: string;
  type: 'reservation' | 'trip_published' | 'confirmed' | 'alert' | 'login';
  title: string;
  description: string;
  time: string;
  amount?: string;
  status: 'normal' | 'urgent';
}

export interface ClientPayment {
  id: string; // e.g., "Billet #TK-4412"
  clientName: string;
  clientAvatar: string;
  route: string;
  paymentMethod: 'Orange Money' | 'Wave' | 'Espèces';
  time: string;
  amount: number; // in FCFA
  status: 'Payé' | 'En attente' | 'Échoué';
  phone?: string;
  pickupAddress?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleName?: string;
  vehiclePlate?: string;
}

export interface Commission {
  id: string;
  driverId: string;
  driverName: string;
  amount: number; // in FCFA
  dueDate: string;
  status: 'Payée' | 'Non payée';
  week: string;
}

export interface Trip {
  id: string;
  route: string;
  from: string;
  to: string;
  date: string;
  time: string;
  passengerCount: number;
  maxPassengers: number;
  status: 'Publié' | 'Terminé' | 'En cours' | 'pending' | 'completed' | 'running';
  boardingPlace?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  vehicleName?: string;
  vehiclePlate?: string;
  price?: number;
  createdAt?: string;
}

export type TabType = 'dashboard' | 'drivers' | 'commissions' | 'payments' | 'settings' | 'driver_trips';

export interface PortalSettings {
  adminName: string;
  adminRole: string;
  adminEmail?: string;
  commissionRate: number;
  defaultCurrency: string;
  adminAvatar?: string;
  autoSendEmail?: boolean;
  playReservationSound?: boolean;
}

