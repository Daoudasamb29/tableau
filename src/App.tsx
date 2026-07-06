import React, { useState, useEffect, useRef } from 'react';
import { 
  Driver, 
  Activity, 
  ClientPayment, 
  Commission, 
  Trip, 
  TabType,
  PortalSettings
} from './types';
import { 
  initialDrivers, 
  initialActivities, 
  initialPayments, 
  initialCommissions, 
  initialTrips 
} from './data';
import DashboardView from './components/DashboardView';
import DriversView from './components/DriversView';
import CommissionsView from './components/CommissionsView';
import PaymentsView from './components/PaymentsView';
import DriverProfileView from './components/DriverProfileView';
import NewDriverModal from './components/NewDriverModal';
import SettingsView from './components/SettingsView';
import DriverTripsView from './components/DriverTripsView';
import { isSupabaseConfigured, supabase } from './supabase';
import { 
  loadAllData, 
  seedDatabase, 
  syncDriver, 
  syncActivity, 
  syncPayment, 
  syncCommission, 
  syncTrip, 
  syncSettings,
  mapDriverFromDb,
  mapPaymentFromDb
} from './supabaseSync';
import { playLoudReservationSound } from './utils/audio';
import { initAuth, googleSignIn, googleSignOut, sendGmailEmail } from './gmail';
import { 
  TrafficCone, 
  Users, 
  CreditCard, 
  Receipt, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  Search, 
  HelpCircle,
  Sparkles,
  Zap,
  Compass
} from 'lucide-react';

const MOCK_IDS = new Set([
  'DRV-9012', 'DRV-1234', 'DRV-5678', 'DRV-9900', 'DRV-8842',
  'ACT-001', 'ACT-002', 'ACT-003', 'ACT-004', 'ACT-005',
  'Billet #TK-4412', 'Billet #TK-4413', 'Billet #TK-4414', 'Billet #TK-4415', 'Billet #TK-4416',
  'COM-001', 'COM-002', 'COM-003', 'COM-004', 'COM-005',
  'TRP-001', 'TRP-002', 'TRP-003'
]);

export default function App() {
  // State variables with localStorage persistence
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('dem_drivers');
    const parsed: Driver[] = saved ? JSON.parse(saved) : initialDrivers;
    const unique: Driver[] = [];
    const seen = new Set<string>();
    for (const d of parsed) {
      if (d && d.id && !seen.has(d.id) && !MOCK_IDS.has(d.id)) {
        seen.add(d.id);
        unique.push(d);
      }
    }
    return unique;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('dem_activities');
    const parsed: Activity[] = saved ? JSON.parse(saved) : initialActivities;
    const unique: Activity[] = [];
    const seen = new Set<string>();
    for (const act of parsed) {
      if (act && act.id && !seen.has(act.id) && !MOCK_IDS.has(act.id)) {
        seen.add(act.id);
        unique.push(act);
      }
    }
    return unique;
  });

  const [payments, setPayments] = useState<ClientPayment[]>(() => {
    const saved = localStorage.getItem('dem_payments');
    const parsed: ClientPayment[] = saved ? JSON.parse(saved) : initialPayments;
    const unique: ClientPayment[] = [];
    const seen = new Set<string>();
    for (const p of parsed) {
      if (p && p.id && !seen.has(p.id) && !MOCK_IDS.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
    }
    return unique;
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    const saved = localStorage.getItem('dem_commissions');
    const parsed: Commission[] = saved ? JSON.parse(saved) : initialCommissions;
    const unique: Commission[] = [];
    const seen = new Set<string>();
    for (const c of parsed) {
      if (c && c.id && !seen.has(c.id) && !MOCK_IDS.has(c.id)) {
        seen.add(c.id);
        unique.push(c);
      }
    }
    return unique;
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('dem_trips');
    const parsed: Trip[] = saved ? JSON.parse(saved) : initialTrips;
    const unique: Trip[] = [];
    const seen = new Set<string>();
    for (const t of parsed) {
      if (t && t.id && !seen.has(t.id) && !MOCK_IDS.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }
    return unique;
  });

  const [settings, setSettings] = useState<PortalSettings>(() => {
    const saved = localStorage.getItem('dem_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      adminName: 'Admin DEM',
      adminRole: "Superviseur d'exploitation",
      adminEmail: 'daoudasamb290@gmail.com',
      commissionRate: 10,
      defaultCurrency: 'FCFA',
      adminAvatar: '',
      autoSendEmail: true,
      playReservationSound: true,
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const settingsRef = useRef<PortalSettings>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);

  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'loading' | 'connected' | 'error' | 'not_configured'>('idle');

  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsGoogleLoading(false);
      },
      () => {
        setGoogleUser(null);
        setIsGoogleLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setIsGoogleLoading(true);
    try {
      await googleSignOut();
      setGoogleUser(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Automatic connection and loading from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus('not_configured');
      return;
    }

    let channel: any = null;

    const initSupabase = async () => {
      setSupabaseStatus('loading');
      try {
        const dbData = await loadAllData();
        if (dbData) {
          setDrivers(dbData.drivers);
          setActivities(dbData.activities);
          setPayments(dbData.payments);
          setCommissions(dbData.commissions);
          setTrips(dbData.trips);
          setSettings(dbData.settings);
          setSupabaseStatus('connected');

          // Écoute en temps réel des changements dans Supabase
          if (supabase) {
            channel = supabase
              .channel('drivers-realtime')
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'drivers' },
                (payload) => {
                  console.log('Changement Supabase en direct :', payload);
                  if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    const mapped = mapDriverFromDb(payload.new);
                    setDrivers(prev => {
                      const index = prev.findIndex(d => d.id === mapped.id);
                      if (index !== -1) {
                        return prev.map(d => d.id === mapped.id ? { ...d, ...mapped } : d);
                      } else {
                        return [...prev, mapped];
                      }
                    });
                  } else if (payload.eventType === 'DELETE') {
                    setDrivers(prev => prev.filter(d => d.id !== payload.old.id));
                  }
                }
              )
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                  console.log('Changement Réservation en direct (Supabase) :', payload);
                  if (payload.eventType === 'INSERT') {
                    const mapped = mapPaymentFromDb(payload.new);
                    
                    // Add only if not already exists to avoid duplicates
                    setPayments(prev => {
                      if (prev.some(p => p.id === mapped.id)) return prev;
                      return [mapped, ...prev];
                    });

                    // Log activity
                    const newAct: Activity = {
                      id: `ACT-realtime-${Date.now()}`,
                      type: 'reservation',
                      title: 'Nouvelle Réservation (Direct)',
                      description: `${mapped.clientName} - Trajet ${mapped.route} via ${mapped.paymentMethod}`,
                      time: 'À l\'instant',
                      status: 'normal',
                      amount: mapped.amount.toLocaleString('fr-FR') + ' FCFA'
                    };
                    setActivities(prev => [newAct, ...prev]);
                    setNotificationCount(n => n + 1);

                    // PLAY THE LOUD RESERVATION SOUND if enabled in settings
                    if (settingsRef.current.playReservationSound !== false) {
                      playLoudReservationSound();
                    }
                  } else if (payload.eventType === 'UPDATE') {
                    const mapped = mapPaymentFromDb(payload.new);
                    setPayments(prev => prev.map(p => p.id === mapped.id ? { ...p, ...mapped } : p));
                  } else if (payload.eventType === 'DELETE') {
                    setPayments(prev => prev.filter(p => p.id !== payload.old.id));
                  }
                }
              )
              .subscribe();
          }
        } else {
          setSupabaseStatus('error');
        }
      } catch (err) {
        setSupabaseStatus('error');
      }
    };

    initSupabase();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Handlers for manual sync controls inside Settings tab
  const handleSeedSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    const res = await seedDatabase({
      drivers,
      activities,
      payments,
      commissions,
      trips,
      settings
    });
    if (res.success) {
      setSupabaseStatus('connected');
    }
    return res;
  };

  const handleLoadSupabase = async () => {
    const dbData = await loadAllData();
    if (dbData) {
      setDrivers(dbData.drivers);
      setActivities(dbData.activities);
      setPayments(dbData.payments);
      setCommissions(dbData.commissions);
      setTrips(dbData.trips);
      setSettings(dbData.settings);
      setSupabaseStatus('connected');
    } else {
      throw new Error('Impossible de charger les données. Veuillez vous assurer que les tables ont été créées via le script SQL dans votre console Supabase.');
    }
  };

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('dem_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('dem_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('dem_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('dem_commissions', JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem('dem_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('dem_settings', JSON.stringify(settings));
  }, [settings]);

  // French Date Formatting
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    // Capitalize first letter of the day
    const formatted = now.toLocaleDateString('fr-FR', options);
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    setCurrentDateFormatted(capitalized);
  }, []);

  // Format currency dynamically based on settings
  const formatCurrency = (amount: number) => {
    const symbol = settings.defaultCurrency === 'EUR' ? ' €' : settings.defaultCurrency === 'USD' ? ' $' : ' FCFA';
    return amount.toLocaleString('fr-FR') + symbol;
  };

  // Switch Driver Status 'En service' / 'Hors service'
  const handleToggleDriverStatus = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const newStatus = driver.status === 'active' ? 'inactive' : 'active';
    
    // Log Activity of status change
    const newActivity: Activity = {
      id: `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newStatus === 'active' ? 'login' : 'alert',
      title: newStatus === 'active' 
        ? `${driver.name} s'est connecté` 
        : `${driver.name} est hors service`,
      description: newStatus === 'active' 
        ? `Prise de poste immédiate avec le véhicule ${driver.vehicle}` 
        : `A quitté son service actif. Véhicule garé.`,
      time: 'À l\'instant',
      status: 'normal'
    };

    const updatedDriver = { ...driver, status: newStatus };

    setDrivers(prevDrivers => 
      prevDrivers.map(d => d.id === driverId ? updatedDriver : d)
    );
    setActivities(prevAct => [newActivity, ...prevAct]);

    // Async sync to Supabase if configured
    syncDriver(updatedDriver);
    syncActivity(newActivity);
  };

  // Switch administrative lock status (blocking/allowing the driver to self-activate)
  const handleToggleDriverAdminLock = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const newLockState = !driver.adminLocked;
    
    // Log Activity of status lock change
    const newActivity: Activity = {
      id: `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'alert',
      title: newLockState
        ? `Statut Verrouillé : ${driver.name}`
        : `Statut Déverrouillé : ${driver.name}`,
      description: newLockState
        ? `L'administrateur a bloqué l'accès au service pour ce chauffeur.`
        : `L'administrateur a autorisé à nouveau le chauffeur à activer son service.`,
      time: 'À l\'instant',
      status: 'normal'
    };

    const updatedDriver = { ...driver, adminLocked: newLockState };

    // If the admin locks the driver, automatically set them 'inactive' (hors service)
    if (newLockState && driver.status === 'active') {
      updatedDriver.status = 'inactive';
    }

    setDrivers(prevDrivers => 
      prevDrivers.map(d => d.id === driverId ? updatedDriver : d)
    );
    setActivities(prevAct => [newActivity, ...prevAct]);

    // Async sync to Supabase if configured
    syncDriver(updatedDriver);
    syncActivity(newActivity);
  };

  // Mark commission as paid
  const handleMarkCommissionPaid = (commissionId: string) => {
    const com = commissions.find(c => c.id === commissionId);
    if (!com) return;

    // Add Activity Log
    const newActivity: Activity = {
      id: `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'confirmed',
      title: `Commission Solder : ${com.driverName}`,
      description: `Paiement validé pour la semaine du ${com.dueDate} - ${formatCurrency(com.amount)}`,
      time: 'À l\'instant',
      status: 'normal'
    };

    const updatedCommission: Commission = { ...com, status: 'Payée' };

    setCommissions(prevCom => 
      prevCom.map(c => c.id === commissionId ? updatedCommission : c)
    );
    setActivities(prevAct => [newActivity, ...prevAct]);

    // Async sync to Supabase if configured
    syncCommission(updatedCommission);
    syncActivity(newActivity);
  };

  // Add a new driver dynamically
  const handleAddDriver = (newDriverData: Omit<Driver, 'id' | 'avatar' | 'tripsCount' | 'revenue' | 'rating' | 'hireDate'>) => {
    const generatedId = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Choose a high-quality African profile picture randomly for variety
    const randomAvatars = [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ];
    const randomAvatar = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

    const newDriver: Driver = {
      ...newDriverData,
      id: generatedId,
      avatar: randomAvatar,
      tripsCount: 0,
      revenue: '0 FCFA',
      rating: 5.0,
      hireDate: 'Juin 2026'
    };

    setDrivers(prev => [newDriver, ...prev]);

    // Create a commission slot for this driver
    const newCommission: Commission = {
      id: `COM-${Math.floor(100 + Math.random() * 900)}`,
      driverId: generatedId,
      driverName: newDriver.name,
      amount: 12000,
      dueDate: 'Fin de semaine',
      status: 'Non payée',
      week: 'Semaine du 16 au 22 juin 2026'
    };
    setCommissions(prevCom => [newCommission, ...prevCom]);

    // Log Activity
    const newAct: Activity = {
      id: `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'login',
      title: 'Nouveau Chauffeur Enregistré',
      description: `${newDriver.name} a été recruté sur le véhicule ${newDriver.vehicle} (${newDriver.plate})`,
      time: 'À l\'instant',
      status: 'normal'
    };
    setActivities(prevAct => [newAct, ...prevAct]);

    // Automatically navigate to view this new driver in the list
    setActiveTab('drivers');

    // Async sync to Supabase if configured
    syncDriver(newDriver);
    syncCommission(newCommission);
    syncActivity(newAct);
  };

  // View Specific Driver Profile
  const handleViewDriverProfile = (driverId: string) => {
    setSelectedDriverId(driverId);
    setActiveTab('drivers'); // We display profile as part of drivers tab context
  };

  // Simulation: Add random customer reservation or alert
  const handleSimulateActivity = () => {
    const clients = [
      { name: 'Samba Ndiaye', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
      { name: 'Mariama Diallo', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { name: 'Boubacar Sarr', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { name: 'Aminata Diop', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
    ];
    const routes = [
      'Dakar to Saint-Louis',
      'Dakar to Thiès',
      'Thiès to Touba',
      'Dakar to Touba',
      'Dakar to AIBD'
    ];
    const paymentMethods: ('Orange Money' | 'Wave' | 'Espèces')[] = ['Orange Money', 'Wave', 'Espèces'];
    const amounts = [12000, 8500, 15000, 2000, 9500];

    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

    // Create random ticket payment
    const ticketId = `Billet #TK-${Math.floor(4410 + Math.random() * 500)}`;
    const newPayment: ClientPayment = {
      id: ticketId,
      clientName: randomClient.name,
      clientAvatar: randomClient.avatar,
      route: randomRoute,
      paymentMethod: randomMethod,
      time: 'À l\'instant',
      amount: randomAmount,
      status: Math.random() > 0.15 ? 'Payé' : 'En attente'
    };

    setPayments(prevPay => [newPayment, ...prevPay]);

    // Create recent activity
    const newAct: Activity = {
      id: `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newPayment.status === 'Payé' ? 'confirmed' : 'reservation',
      title: newPayment.status === 'Payé' ? 'Paiement Client Reçu' : 'Nouvelle Réservation',
      description: `${randomClient.name} - Trajet ${randomRoute} via ${randomMethod}`,
      time: 'À l\'instant',
      amount: formatCurrency(randomAmount),
      status: 'normal'
    };

    setActivities(prevAct => [newAct, ...prevAct]);
    setNotificationCount(n => n + 1);

    // PLAY THE LOUD RESERVATION SOUND if enabled in settings
    if (settings.playReservationSound !== false) {
      playLoudReservationSound();
    }

    // Async sync to Supabase if configured
    syncPayment(newPayment);
    syncActivity(newAct);

    // Auto-trigger email send if enabled and Gmail is connected
    triggerAutoReservationEmail(newPayment);
  };

  const handleSendEmail = async (to: string, subject: string, htmlBody: string) => {
    return await sendGmailEmail(to, subject, htmlBody);
  };

  // Send automatic email when a reservation is made / simulated
  const triggerAutoReservationEmail = async (payment: ClientPayment) => {
    if (!settings.autoSendEmail || !googleUser) return;
    
    const targetEmail = settings.adminEmail || 'daoudasamb290@gmail.com';
    const subject = `[DEM Transports] Nouvelle Réservation Reçue - ${payment.id}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #0e7490; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #0e7490; margin: 0; font-size: 24px;">DEM niou_dem Transports</h2>
          <p style="color: #6b7280; margin: 5px 0 0; font-size: 14px;">Notification de Réservation Automatique</p>
        </div>
        
        <p style="font-size: 15px; color: #111827;">Une nouvelle réservation de voyage interurbain a été enregistrée sur votre portail.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #0e7490;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 45%;">Numéro de Réservation :</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${payment.id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Nom du Client :</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${payment.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Trajet demandé :</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${payment.route}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Montant de la course :</td>
              <td style="padding: 6px 0; color: #0e7490; font-weight: bold; font-size: 15px;">${formatCurrency(payment.amount)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Méthode de paiement :</td>
              <td style="padding: 6px 0; color: #0f172a;">${payment.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Statut du Paiement :</td>
              <td style="padding: 6px 0;">
                <span style="background-color: ${payment.status === 'Payé' ? '#d1fae5' : '#fef3c7'}; color: ${payment.status === 'Payé' ? '#065f46' : '#92400e'}; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">
                  ${payment.status}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Heure d&apos;enregistrement :</td>
              <td style="padding: 6px 0; color: #0f172a;">${payment.time}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Cet e-mail automatique a été envoyé depuis votre portail DEM niou_dem Transports configuré avec Gmail.
        </p>
      </div>
    `;

    try {
      await sendGmailEmail(targetEmail, subject, htmlBody);
      console.log('Auto email notification sent successfully via Gmail API.');
    } catch (err) {
      console.error('Failed to auto-send email notification:', err);
    }
  };

  // Hard reset simulation state back to default seeded data
  const handleResetData = () => {
    localStorage.removeItem('dem_drivers');
    localStorage.removeItem('dem_activities');
    localStorage.removeItem('dem_payments');
    localStorage.removeItem('dem_commissions');
    localStorage.removeItem('dem_trips');
    localStorage.removeItem('dem_settings');

    setDrivers(initialDrivers);
    setActivities(initialActivities);
    setPayments(initialPayments);
    setCommissions(initialCommissions);
    setTrips(initialTrips);
    setSettings({
      adminName: 'Admin DEM',
      adminRole: "Superviseur d'exploitation",
      adminEmail: 'daoudasamb290@gmail.com',
      commissionRate: 10,
      defaultCurrency: 'FCFA',
      adminAvatar: '',
      autoSendEmail: true,
    });
    setSelectedDriverId(null);
    setActiveTab('dashboard');
  };

  // Sync settings modifications to Supabase in background
  const handleUpdateSettings = (newSettings: PortalSettings) => {
    setSettings(newSettings);
    syncSettings(newSettings);
  };

  const handleAddTrip = (newTrip: Trip) => {
    setTrips(prev => [...prev, newTrip]);

    const newAct: Activity = {
      id: `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'trip_published',
      title: 'Nouveau Trajet Publié',
      description: `Ligne ${newTrip.from} - ${newTrip.to} programmée à ${newTrip.time}`,
      time: 'À l\'instant',
      status: 'normal'
    };
    setActivities(prevAct => [newAct, ...prevAct]);

    // Async sync to Supabase
    syncTrip(newTrip);
    syncActivity(newAct);
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));

    // Async sync to Supabase
    syncTrip(updatedTrip);
  };

  const handleDeleteTrip = async (tripId: string) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));

    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('driver_trips').delete().eq('id', tripId);
        if (error) {
          console.error('Erreur lors de la suppression du trajet de Supabase:', error.message);
        }
      } catch (err) {
        console.error('Exception lors de la suppression du trajet:', err);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* 1. Sidebar Navigation (Left-Side persistent drawer on Desktop) */}
      <aside className="hidden md:flex flex-col items-center py-6 w-16 lg:w-64 bg-white border-r border-border-subtle shrink-0 z-50">
        
        {/* Brand Icon Header */}
        <div className="px-4 mb-8 flex items-center gap-3 w-full justify-center lg:justify-start">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
            <span>DEM</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-sm text-primary tracking-tight">DEM Operations</h1>
            <p className="text-[10px] text-on-surface-variant font-medium">Portail Logistique</p>
          </div>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex-1 flex flex-col gap-1.5 w-full">
          
          {/* Dashboard Tab */}
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedDriverId(null); }}
            className={`flex items-center justify-center lg:justify-start px-4 py-3 gap-3 w-full transition-all text-left ${
              activeTab === 'dashboard'
                ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary'
                : 'text-on-surface-variant hover:bg-surface-secondary'
            }`}
            title="Tableau de bord - Surveillance"
          >
            <Zap className="h-5 w-5" />
            <span className="hidden lg:block text-xs font-semibold">Surveillance</span>
          </button>

          {/* Drivers Tab */}
          <button 
            onClick={() => { setActiveTab('drivers'); }}
            className={`flex items-center justify-center lg:justify-start px-4 py-3 gap-3 w-full transition-all text-left ${
              activeTab === 'drivers' && selectedDriverId === null
                ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary'
                : 'text-on-surface-variant hover:bg-surface-secondary'
            }`}
            title="Gestion des Chauffeurs"
          >
            <Users className="h-5 w-5" />
            <span className="hidden lg:block text-xs font-semibold">Chauffeurs</span>
          </button>

          {/* Commissions Tab */}
          <button 
            onClick={() => { setActiveTab('commissions'); setSelectedDriverId(null); }}
            className={`flex items-center justify-center lg:justify-start px-4 py-3 gap-3 w-full transition-all text-left ${
              activeTab === 'commissions'
                ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary'
                : 'text-on-surface-variant hover:bg-surface-secondary'
            }`}
            title="Gestion des Commissions"
          >
            <CreditCard className="h-5 w-5" />
            <span className="hidden lg:block text-xs font-semibold">Commissions</span>
          </button>

          {/* Client Payments Tab */}
          <button 
            onClick={() => { setActiveTab('payments'); setSelectedDriverId(null); }}
            className={`flex items-center justify-center lg:justify-start px-4 py-3 gap-3 w-full transition-all text-left ${
              activeTab === 'payments'
                ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary'
                : 'text-on-surface-variant hover:bg-surface-secondary'
            }`}
            title="Paiements clients"
          >
            <Receipt className="h-5 w-5" />
            <span className="hidden lg:block text-xs font-semibold">Paiements clients</span>
          </button>

          {/* Driver Trips Tab */}
          <button 
            onClick={() => { setActiveTab('driver_trips'); setSelectedDriverId(null); }}
            className={`flex items-center justify-center lg:justify-start px-4 py-3 gap-3 w-full transition-all text-left ${
              activeTab === 'driver_trips'
                ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary'
                : 'text-on-surface-variant hover:bg-surface-secondary'
            }`}
            title="Trajets Disponibles"
          >
            <Compass className="h-5 w-5" />
            <span className="hidden lg:block text-xs font-semibold">Trajets</span>
          </button>

          {/* Settings Tab */}
          <button 
            onClick={() => { setActiveTab('settings'); setSelectedDriverId(null); }}
            className={`flex items-center justify-center lg:justify-start px-4 py-3 gap-3 w-full transition-all text-left mt-auto ${
              activeTab === 'settings'
                ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary'
                : 'text-on-surface-variant hover:bg-surface-secondary'
            }`}
            title="Réglages du portail"
          >
            <Settings className="h-5 w-5" />
            <span className="hidden lg:block text-xs font-semibold">Réglages</span>
          </button>
        </nav>

        {/* Bottom Profile Details */}
        <div className="mt-4 px-4 pt-4 border-t border-border-subtle w-full flex items-center gap-3 justify-center lg:justify-start">
          <button 
            onClick={handleResetData}
            className="flex items-center gap-3 text-on-surface-variant hover:text-status-danger-text transition-colors text-left"
            title="Réinitialiser"
          >
            <LogOut className="h-5 w-5 text-status-danger-text" />
            <span className="hidden lg:block text-xs font-semibold">Réinitialiser</span>
          </button>
        </div>
      </aside>

      {/* 2. Main content and Top Header Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header App Bar */}
        <header className="h-16 shrink-0 bg-white border-b border-border-subtle flex items-center justify-between px-6 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-base text-primary md:hidden">DEM Transport</h1>
            <div className="hidden md:flex flex-col">
              <h2 className="font-bold text-sm text-on-surface">Portail de Gestion & Surveillance</h2>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">{currentDateFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Button with badge trigger */}
            <button 
              onClick={() => {
                setNotificationCount(0);
                alert('Toutes les notifications de transport récentes ont été marquées comme lues.');
              }}
              className="relative p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-secondary rounded-full"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger-text rounded-full ring-2 ring-white animate-bounce"></span>
              )}
            </button>

            <div className="h-6 w-px bg-border-subtle"></div>

            {/* Admin supervisor header details badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle bg-surface-container">
                <img 
                  src={settings.adminAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt="Admin User" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none">{settings.adminName}</p>
                <div className="flex flex-col mt-0.5">
                  <p className="text-[10px] text-on-surface-variant font-medium leading-none">{settings.adminRole}</p>
                  {settings.adminEmail && (
                    <p className="text-[9px] text-primary font-mono leading-none mt-0.5 truncate max-w-[150px]" title={settings.adminEmail}>
                      {settings.adminEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 3. Core dynamic tabs render container with overflow management */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {selectedDriverId ? (
              // Deep-dive Driver profile view
              <DriverProfileView
                driver={drivers.find(d => d.id === selectedDriverId)!}
                trips={trips}
                commissions={commissions}
                onBack={() => setSelectedDriverId(null)}
                onToggleStatus={handleToggleDriverStatus}
                onToggleAdminLock={handleToggleDriverAdminLock}
                onMarkCommissionPaid={handleMarkCommissionPaid}
                formatCurrency={formatCurrency}
              />
            ) : (
              // Standard primary nav tabs
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    drivers={drivers}
                    activities={activities}
                    payments={payments}
                    commissions={commissions}
                    onToggleStatus={handleToggleDriverStatus}
                    onViewProfile={handleViewDriverProfile}
                    onSimulateActivity={handleSimulateActivity}
                    formatCurrency={formatCurrency}
                    googleUser={googleUser}
                    onSendEmail={handleSendEmail}
                  />
                )}

                {activeTab === 'drivers' && (
                  <DriversView
                    drivers={drivers}
                    commissions={commissions}
                    onViewProfile={handleViewDriverProfile}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    formatCurrency={formatCurrency}
                  />
                )}

                {activeTab === 'commissions' && (
                  <CommissionsView
                    commissions={commissions}
                    onMarkPaid={handleMarkCommissionPaid}
                    formatCurrency={formatCurrency}
                    trips={trips}
                    payments={payments}
                  />
                )}

                {activeTab === 'payments' && (
                  <PaymentsView
                    payments={payments}
                    formatCurrency={formatCurrency}
                    googleUser={googleUser}
                    onSendEmail={handleSendEmail}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onResetData={handleResetData}
                    supabaseStatus={supabaseStatus}
                    onSeedSupabase={handleSeedSupabase}
                    onLoadSupabase={handleLoadSupabase}
                    googleUser={googleUser}
                    onGoogleSignIn={handleGoogleSignIn}
                    onGoogleSignOut={handleGoogleSignOut}
                    isGoogleLoading={isGoogleLoading}
                  />
                )}

                {activeTab === 'driver_trips' && (
                  <DriverTripsView
                    trips={trips}
                    drivers={drivers}
                    onAddTrip={handleAddTrip}
                    onUpdateTrip={handleUpdateTrip}
                    onDeleteTrip={handleDeleteTrip}
                    formatCurrency={formatCurrency}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* 4. Sticky Mobile Nav Bar (Visible only on screens below MD breakpoint) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-subtle flex items-center justify-around z-50 px-2 shadow-lg">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedDriverId(null); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span className="text-[10px] font-bold">Surveillance</span>
          </button>

          <button 
            onClick={() => { setActiveTab('drivers'); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === 'drivers' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-bold">Chauffeurs</span>
          </button>

          <button 
            onClick={() => { setActiveTab('commissions'); setSelectedDriverId(null); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === 'commissions' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] font-bold">Commissions</span>
          </button>

          <button 
            onClick={() => { setActiveTab('payments'); setSelectedDriverId(null); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === 'payments' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-[10px] font-bold">Paiements</span>
          </button>

          <button 
            onClick={() => { setActiveTab('driver_trips'); setSelectedDriverId(null); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === 'driver_trips' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Compass className="h-5 w-5" />
            <span className="text-[10px] font-bold">Trajets</span>
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setSelectedDriverId(null); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === 'settings' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-bold">Réglages</span>
          </button>
        </nav>

      </main>

      {/* 5. Nouveau Chauffeur Dialog Form Modal Overlay */}
      <NewDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDriver={handleAddDriver}
      />

    </div>
  );
}
