import { supabase, isSupabaseConfigured } from './supabase';
import { Driver, Activity, ClientPayment, Commission, Trip, PortalSettings } from './types';

// ==========================================
// MAPPERS BETWEEN REACT STATE & USER'S SUPABASE TABLES
// ==========================================

export const mapDriverToDb = (d: Driver) => ({
  id: d.id,
  name: d.name,
  avatar: d.avatar || null,
  rating: d.rating,
  trips_count: d.tripsCount,
  vehicle_name: d.vehicle,
  vehicle_plate: d.plate,
  departure_time: d.hireDate,
  terminus: d.revenue, // Storing revenue string here
  verified: d.adminLocked ? 'inactive_locked' : d.status, // Storing 'active' | 'inactive' | 'inactive_locked' in verified
  phone: d.phone,
  is_online: d.status === 'active',
  seats_available: 4,
  price: 0
});

export const mapDriverFromDb = (d: any): Driver => {
  let status: 'active' | 'inactive' = 'inactive';
  if (d.is_online !== undefined && d.is_online !== null) {
    status = d.is_online ? 'active' : 'inactive';
  } else {
    status = (d.verified === 'inactive' || d.verified === 'inactive_locked') ? 'inactive' : 'active';
  }

  return {
    id: d.id,
    name: d.name,
    avatar: d.avatar || undefined,
    vehicle: d.vehicle_name || 'Véhicule standard',
    plate: d.vehicle_plate || 'Inconnu',
    status,
    adminLocked: d.verified === 'inactive_locked',
    rating: Number(d.rating || 5.0),
    tripsCount: Number(d.trips_count || 0),
    revenue: d.terminus || '0 FCFA',
    phone: d.phone || '',
    hireDate: d.departure_time || 'Aujourd\'hui'
  };
};

export const mapTripToDb = (t: Trip) => {
  const parts = t.route ? t.route.split(' - ') : [];
  const fromVal = t.from || parts[0] || 'Dakar';
  const toVal = t.to || parts[1] || 'Saint-Louis';
  
  return {
    id: t.id,
    "from": fromVal,
    "to": toVal,
    date: t.date || 'Aujourd\'hui',
    time: t.time,
    passenger_count: t.passengerCount ?? 0,
    max_passengers: t.maxPassengers ?? 15,
    status: t.status === 'Terminé' || t.status === 'completed' ? 'completed' : 
            t.status === 'En cours' || t.status === 'running' ? 'running' : 'pending',
    boarding_place: t.boardingPlace || null,
    driver_id: t.driverId || null,
    driver_name: t.driverName || null,
    driver_phone: t.driverPhone || null,
    driver_avatar: t.driverAvatar || null,
    vehicle_name: t.vehicleName || null,
    vehicle_plate: t.vehiclePlate || null,
    price: t.price || null
  };
};

export const mapTripFromDb = (t: any): Trip => {
  const fromVal = t.from || 'Dakar';
  const toVal = t.to || 'Saint-Louis';
  const statusMap: Record<string, 'Publié' | 'Terminé' | 'En cours'> = {
    'completed': 'Terminé',
    'running': 'En cours',
    'pending': 'Publié'
  };
  
  return {
    id: t.id,
    from: fromVal,
    to: toVal,
    route: `${fromVal} - ${toVal}`,
    date: t.date || 'Aujourd\'hui',
    time: t.time || '08:00',
    passengerCount: Number(t.passenger_count || 0),
    maxPassengers: Number(t.max_passengers || 15),
    status: (statusMap[t.status] || t.status || 'Publié') as any,
    boardingPlace: t.boarding_place || undefined,
    driverId: t.driver_id || undefined,
    driverName: t.driver_name || undefined,
    driverPhone: t.driver_phone || undefined,
    driverAvatar: t.driver_avatar || undefined,
    vehicleName: t.vehicle_name || undefined,
    vehiclePlate: t.vehicle_plate || undefined,
    price: t.price ? Number(t.price) : undefined,
    createdAt: t.created_at || undefined
  };
};

export const mapPaymentToDb = (p: ClientPayment) => {
  const parts = p.route.split(' - ');
  const fromVal = parts[0] || 'Dakar';
  const toVal = parts[1] || 'Saint-Louis';
  
  return {
    id: p.id,
    reference: p.id,
    "from": fromVal,
    "to": toVal,
    date: 'Aujourd\'hui',
    time: p.time,
    passenger_name: p.clientName,
    phone: p.phone || '',
    status: p.status === 'Payé' ? 'active' : p.status === 'En attente' ? 'pending' : 'failed',
    price: p.amount,
    driver_name: p.driverName || p.paymentMethod || 'Non assigné',
    driver_avatar: p.clientAvatar || null,
    driver_phone: p.driverPhone || null,
    vehicle_name: p.vehicleName || null,
    vehicle_plate: p.vehiclePlate || null,
    pickup_address: p.pickupAddress || null
  };
};

export const mapPaymentFromDb = (p: any): ClientPayment => {
  const fromVal = p.from || 'Dakar';
  const toVal = p.to || 'Saint-Louis';
  const statusMap: Record<string, 'Payé' | 'En attente' | 'Échoué'> = {
    'active': 'Payé',
    'completed': 'Payé',
    'confirmed': 'Payé',
    'pending': 'En attente',
    'failed': 'Échoué'
  };
  
  const dbDriverName = p.driver_name || 'Non assigné';
  const isPaymentMethod = ['Wave', 'Orange Money', 'Espèces', 'OrangeMoney', 'OM'].includes(dbDriverName);
  
  return {
    id: p.reference || p.id,
    clientName: p.passenger_name || 'Passager anonyme',
    clientAvatar: p.driver_avatar || undefined,
    route: `${fromVal} - ${toVal}`,
    paymentMethod: (isPaymentMethod ? dbDriverName : 'Wave') as 'Wave' | 'Orange Money' | 'Espèces',
    time: p.time || 'À l\'instant',
    amount: Number(p.price || 0),
    status: statusMap[p.status] || 'Payé',
    phone: p.phone || '',
    pickupAddress: p.pickup_address || undefined,
    driverName: !isPaymentMethod ? dbDriverName : undefined,
    driverPhone: p.driver_phone || undefined,
    vehicleName: p.vehicle_name || undefined,
    vehiclePlate: p.vehicle_plate || undefined
  };
};


// ==========================================
// SQL SCHEMA DIRECTLY MATCHING USER'S TABLES
// ==========================================

export const SQL_SCHEMA_INSTRUCTIONS = `-- Vos tables Supabase existantes sont utilisées :
-- 1. drivers (Chauffeurs)
-- 2. driver_trips (Trajets)
-- 3. bookings (Réservations/Paiements)

-- Si vous avez besoin de recréer ou vérifier vos tables, voici la structure de référence :

CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    rating NUMERIC DEFAULT 5.0,
    trips_count INT DEFAULT 0,
    vehicle_name TEXT,
    vehicle_plate TEXT,
    departure_time TEXT,
    terminus TEXT,
    seats_available INT DEFAULT 0,
    price NUMERIC DEFAULT 0,
    verified TEXT,
    phone TEXT,
    is_online BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS driver_trips (
    id TEXT PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    passenger_count INT DEFAULT 0,
    max_passengers INT DEFAULT 15,
    status TEXT DEFAULT 'pending',
    boarding_place TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    price NUMERIC DEFAULT 0,
    driver_name TEXT,
    driver_avatar TEXT,
    driver_phone TEXT,
    vehicle_name TEXT,
    vehicle_plate TEXT,
    pickup_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
`;


// ==========================================
// REUSABLE SAFELY SYNC DATABASE LOGIC
// ==========================================

export interface SupabaseData {
  drivers: Driver[];
  activities: Activity[];
  payments: ClientPayment[];
  commissions: Commission[];
  trips: Trip[];
  settings: PortalSettings;
}

// Check if a table exists and is readable
async function checkTableExists(tableName: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true }).limit(1);
    if (error) {
      console.warn(`Vérification table '${tableName}' retournée : ${error.message}`);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

let tablesVerifiedSuccessfully = false;

// Fetch all data from Supabase using user's 3 tables
export async function loadAllData(): Promise<SupabaseData | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    // Optimisation majeure : On ne vérifie l'existence des tables qu'une seule fois au démarrage, en parallèle.
    // Cela évite de faire 3 requêtes HTTP séquentielles de vérification à chaque appel de loadAllData.
    if (!tablesVerifiedSuccessfully) {
      const requiredTables = ['drivers', 'driver_trips', 'bookings'];
      const checks = await Promise.all(requiredTables.map(checkTableExists));
      
      if (checks.includes(false)) {
        console.warn("Certaines tables requises n'existent pas ou ne sont pas accessibles.");
        return null;
      }
      tablesVerifiedSuccessfully = true;
    }

    const [
      driversRes,
      tripsRes,
      bookingsRes
    ] = await Promise.all([
      supabase.from('drivers').select('*'),
      supabase.from('driver_trips').select('*'),
      supabase.from('bookings').select('*')
    ]);

    if (driversRes.error) throw driversRes.error;
    if (tripsRes.error) throw tripsRes.error;
    if (bookingsRes.error) throw bookingsRes.error;

    // Convert to application model and strictly deduplicate to avoid key collision warnings in React
    const rawDrivers = (driversRes.data || []).map(mapDriverFromDb);
    const drivers: Driver[] = [];
    const seenDrivers = new Set<string>();
    for (const d of rawDrivers) {
      if (d && d.id && !seenDrivers.has(d.id)) {
        seenDrivers.add(d.id);
        drivers.push(d);
      }
    }

    const rawTrips = (tripsRes.data || []).map(mapTripFromDb);
    const trips: Trip[] = [];
    const seenTrips = new Set<string>();
    for (const t of rawTrips) {
      if (t && t.id && !seenTrips.has(t.id)) {
        seenTrips.add(t.id);
        trips.push(t);
      }
    }

    const rawPayments = (bookingsRes.data || []).map(mapPaymentFromDb);
    const payments: ClientPayment[] = [];
    const seenPayments = new Set<string>();
    for (const p of rawPayments) {
      if (p && p.id && !seenPayments.has(p.id)) {
        seenPayments.add(p.id);
        payments.push(p);
      }
    }

    // Derived Commissions from bookings data
    const rawCommissions: Commission[] = payments.map((p, index) => {
      // Find driver related to this route or give a mock driver link
      const driver = drivers[index % drivers.length] || drivers[0];
      const amount = Math.round(p.amount * 0.1); // 10% commission rate
      return {
        id: `com-${p.id}`,
        driverId: driver ? driver.id : 'unknown',
        driverName: driver ? driver.name : 'Chauffeur',
        amount,
        dueDate: p.time,
        status: p.status === 'Payé' ? 'Payée' : 'Non payée',
        week: 'Semaine en cours'
      };
    });
    const commissions: Commission[] = [];
    const seenCommissions = new Set<string>();
    for (const c of rawCommissions) {
      if (c && c.id && !seenCommissions.has(c.id)) {
        seenCommissions.add(c.id);
        commissions.push(c);
      }
    }

    // Generate fresh activities based on the loaded database state
    const rawActivities: Activity[] = [];
    payments.forEach(p => {
      rawActivities.push({
        id: `act-p-${p.id}`,
        type: 'reservation',
        title: 'Réservation Enregistrée',
        description: `${p.clientName} a réservé un trajet (${p.route}) via ${p.paymentMethod}`,
        time: p.time,
        status: p.status === 'Payé' ? 'normal' : 'urgent',
        amount: `${p.amount} FCFA`
      });
    });
    trips.forEach(t => {
      rawActivities.push({
        id: `act-t-${t.id}`,
        type: 'trip_published',
        title: 'Trajet Publié',
        description: `Nouveau départ publié pour la ligne ${t.route}`,
        time: t.time,
        status: 'normal'
      });
    });
    drivers.forEach(d => {
      rawActivities.push({
        id: `act-d-${d.id}`,
        type: 'confirmed',
        title: 'Chauffeur Activé',
        description: `Le profil de ${d.name} est en ligne sur l'application`,
        time: 'Aujourd\'hui',
        status: 'normal'
      });
    });

    const activities: Activity[] = [];
    const seenActivities = new Set<string>();
    for (const a of rawActivities) {
      if (a && a.id && !seenActivities.has(a.id)) {
        seenActivities.add(a.id);
        activities.push(a);
      }
    }

    // Fallback settings stored in localStorage
    let settings: PortalSettings = {
      adminName: 'Admin DEM',
      adminRole: "Superviseur d'exploitation",
      adminEmail: 'daoudasamb290@gmail.com',
      commissionRate: 10,
      defaultCurrency: 'FCFA',
      adminAvatar: '',
      autoSendEmail: true
    };
    try {
      const localSettings = localStorage.getItem('dem_settings');
      if (localSettings) {
        settings = JSON.parse(localSettings);
      }
    } catch {}

    return {
      drivers,
      activities: activities.slice(0, 30), // Max 30 activities
      payments,
      commissions,
      trips,
      settings
    };
  } catch (err) {
    console.warn("Information: Les données de Supabase n'ont pas pu être chargées.", err);
    return null;
  }
}

// Seed complete database with current state
export async function seedDatabase(data: SupabaseData): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Supabase n\'est pas configuré' };
  }

  try {
    const dbDrivers = data.drivers.map(mapDriverToDb);
    const dbTrips = data.trips.map(mapTripToDb);
    const dbPayments = data.payments.map(mapPaymentToDb);

    // Upsert everything to the user's 3 tables
    const [
      driversErr,
      tripsErr,
      paymentsErr
    ] = await Promise.all([
      dbDrivers.length > 0 ? supabase.from('drivers').upsert(dbDrivers) : Promise.resolve({ error: null }),
      dbTrips.length > 0 ? supabase.from('driver_trips').upsert(dbTrips) : Promise.resolve({ error: null }),
      dbPayments.length > 0 ? supabase.from('bookings').upsert(dbPayments) : Promise.resolve({ error: null })
    ]);

    if (driversErr.error) throw driversErr.error;
    if (tripsErr.error) throw tripsErr.error;
    if (paymentsErr.error) throw paymentsErr.error;

    return { success: true };
  } catch (err: any) {
    console.error("Erreur lors de la synchronisation Supabase :", err);
    return { success: false, error: err.message || 'Erreur inconnue' };
  }
}

// Individual entity synchronization helpers

export async function syncDriver(driver: Driver): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('drivers').upsert([mapDriverToDb(driver)]);
    if (error) {
      console.error("Erreur de synchronisation du chauffeur (Supabase) :", error.message, error.details, error.hint);
    } else {
      console.log(`Synchronisation réussie pour le chauffeur ${driver.name} (is_online: ${driver.status === 'active'}).`);
    }
  } catch (err) {
    console.error("Erreur d'exception de synchronisation du chauffeur :", err);
  }
}

export async function syncTrip(trip: Trip): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('driver_trips').upsert([mapTripToDb(trip)]);
    if (error) {
      console.error("Erreur de synchronisation du trajet (Supabase) :", error.message, error.details, error.hint);
    } else {
      console.log(`Synchronisation réussie pour le trajet ${trip.id}.`);
    }
  } catch (err) {
    console.error("Erreur d'exception de synchronisation du trajet :", err);
  }
}

export async function syncPayment(payment: ClientPayment): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('bookings').upsert([mapPaymentToDb(payment)]);
    if (error) {
      console.error("Erreur de synchronisation du paiement (Supabase) :", error.message, error.details, error.hint);
    } else {
      console.log(`Synchronisation réussie pour le paiement ${payment.id}.`);
    }
  } catch (err) {
    console.error("Erreur d'exception de synchronisation du paiement :", err);
  }
}

// Dummy sync helpers to keep App.tsx imports working perfectly
export async function syncActivity(activity: Activity): Promise<void> {}
export async function syncCommission(commission: Commission): Promise<void> {}
export async function syncSettings(settings: PortalSettings): Promise<void> {}
