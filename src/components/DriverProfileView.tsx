import React from 'react';
import { Driver, Trip, Commission } from '../types';
import { 
  ArrowLeft, 
  Phone, 
  Car, 
  Route, 
  Camera, 
  Check, 
  CircleDot, 
  CheckCircle,
  CalendarDays,
  User,
  MapPin,
  Lock,
  Unlock,
  Smartphone,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';

interface DriverProfileViewProps {
  driver: Driver;
  trips: Trip[];
  commissions: Commission[];
  onBack: () => void;
  onToggleStatus: (driverId: string) => void;
  onToggleAdminLock: (driverId: string) => void;
  onMarkCommissionPaid: (commissionId: string) => void;
  formatCurrency: (amount: number) => string;
}

export default function DriverProfileView({
  driver,
  trips,
  commissions,
  onBack,
  onToggleStatus,
  onToggleAdminLock,
  onMarkCommissionPaid,
  formatCurrency,
}: DriverProfileViewProps) {
  // Get commissions for this specific driver
  const driverCommissions = commissions.filter(c => c.driverId === driver.id);
  
  // Total commissions due for this driver
  const driverDueCommissionsSum = driverCommissions
    .filter(c => c.status === 'Non payée')
    .reduce((acc, c) => acc + c.amount, 0);

  // Get trips for this specific driver
  const driverTrips = trips.filter(t => t.driverId === driver.id);

  return (
    <div className="space-y-6">
      
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-on-surface-variant">
        <button 
          onClick={onBack}
          className="flex items-center justify-center p-1.5 hover:bg-surface-secondary rounded-full transition-colors border border-border-subtle bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold">Chauffeurs / {driver.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* Left Column: Profile details & Stats */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* Profile Header card */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-border-subtle bg-surface-container shrink-0">
                <img 
                  src={driver.avatar} 
                  alt={driver.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg text-primary">{driver.name}</h1>
                <p className="text-xs text-on-surface-variant">Conducteur DEM • Recruté en {driver.hireDate}</p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2 bg-surface-container/40 px-2 py-1 rounded-lg border border-border-subtle/40">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{driver.phone}</span>
                    <a 
                      href={getWhatsAppLink(driver.phone, "vous avez un nouveau client veiller ouvrir l'app pour accepter.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1 text-[10px] font-bold"
                      title="Envoyer un message WhatsApp"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-container/40 px-2 py-1 rounded-lg border border-border-subtle/40">
                    <Car className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono font-bold">{driver.plate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Status Switch & Admin Lock Switch */}
            <div className="flex flex-col gap-2 self-start md:self-auto">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Switch */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg shadow-sm">
                  <button 
                    onClick={() => {
                      // If admin locked, toggle status is allowed by ADMIN, but it also prompts/reminds them
                      onToggleStatus(driver.id);
                    }}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      driver.status === 'active' ? 'bg-primary' : 'bg-on-surface-variant/30'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      driver.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  
                  <span className={`text-xs font-bold ${
                    driver.status === 'active' ? 'text-status-success-text' : 'text-on-surface-variant'
                  }`}>
                    {driver.status === 'active' ? 'En service' : 'Hors service'}
                  </span>
                </div>

                {/* Admin Lock Switch */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg shadow-sm">
                  <button 
                    onClick={() => onToggleAdminLock(driver.id)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      driver.adminLocked ? 'bg-status-danger-text' : 'bg-on-surface-variant/30'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      driver.adminLocked ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  
                  <span className={`text-xs font-bold flex items-center gap-1 ${
                    driver.adminLocked ? 'text-status-danger-text' : 'text-on-surface-variant'
                  }`}>
                    {driver.adminLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    <span>{driver.adminLocked ? 'Verrouillé' : 'Déverrouillé'}</span>
                  </span>
                </div>
              </div>

              {driver.adminLocked && (
                <div className="bg-status-danger-bg/20 text-status-danger-text border border-status-danger-border px-2.5 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1.5 max-w-[280px]">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-status-danger-text" />
                  <span>Chauffeur bloqué. Il ne peut pas s'activer lui-même.</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Trajets publiés</span>
              <span className="text-xl font-bold text-primary mt-1 block">{driver.tripsCount}</span>
            </div>
            <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Réservations</span>
              <span className="text-xl font-bold text-primary mt-1 block">187</span>
            </div>
            <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Taux acceptation</span>
              <span className="text-xl font-bold text-primary mt-1 block">92%</span>
            </div>
            <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Commissions dues</span>
              <span className="text-xl font-bold text-status-warning-text mt-1 block">{formatCurrency(driverDueCommissionsSum)}</span>
            </div>
          </div>

          {/* Trip History Section */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-base text-on-surface mb-4 flex items-center gap-1.5">
              <Route className="h-5 w-5 text-primary" />
              <span>Historique des trajets récents</span>
            </h3>

            <div className="flex flex-col gap-2">
              {driverTrips.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border-subtle rounded-lg bg-surface-bright/50">
                  <p className="text-xs font-semibold text-on-surface-variant">Aucun trajet enregistré pour ce chauffeur.</p>
                  <p className="text-[10px] text-on-surface-variant/70 mt-1">Les trajets créés et assignés à ce chauffeur s&apos;afficheront ici.</p>
                </div>
              ) : (
                driverTrips.map((trip) => {
                  const isCompleted = trip.status === 'Terminé' || trip.status === 'completed';
                  const isRunning = trip.status === 'En cours' || trip.status === 'running';
                  const isPending = trip.status === 'Publié' || trip.status === 'pending';

                  let statusText = 'En attente';
                  if (isCompleted) statusText = 'Terminé';
                  else if (isRunning) statusText = 'En cours';

                  return (
                    <div 
                      key={trip.id} 
                      className="flex items-center justify-between p-3 border-b border-border-subtle last:border-0 hover:bg-surface-secondary transition-colors rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary border border-border-subtle/50">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-on-surface">{trip.route}</p>
                          {trip.boardingPlace && (
                            <p className="text-[10px] text-primary font-medium">Lieu d&apos;embarquement : {trip.boardingPlace}</p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              <span>{trip.date || 'Aujourd&apos;hui'}</span>
                            </span>
                            <span>•</span>
                            <span>{trip.time}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isCompleted 
                          ? 'bg-status-success-bg/25 text-status-success-text border border-status-success-bg/40' 
                          : isRunning 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Vehicle & Commissions */}
        <div className="w-full lg:w-80 flex flex-col gap-5">
          
          {/* Photo du véhicule section */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-sm">
            <span className="text-xs font-bold text-on-surface-variant mb-3 block">Photo du véhicule assigné</span>
            <div className="relative h-40 rounded-lg overflow-hidden bg-surface-secondary group border border-border-subtle">
              <img 
                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80" 
                alt="Toyota Hiace" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Car className="h-10 w-10 text-white/70 group-hover:text-white/100 transition-colors" />
              </div>
              <button 
                onClick={() => alert('Modification de l\'immatriculation ou de la photo du véhicule...')}
                className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-white border border-border-subtle rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container shadow-sm transition-all"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">
              <p className="font-bold text-sm text-on-surface">{driver.vehicle}</p>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5">Immatriculation : <span className="font-bold text-primary">{driver.plate}</span></p>
            </div>
          </div>

          {/* Recent commissions list specific to this driver */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-1.5">
              <span>Commissions récentes</span>
            </h3>

            <div className="flex flex-col gap-3">
              {driverCommissions.map((com) => (
                <div key={com.id} className="p-3 border border-border-subtle rounded-lg bg-surface-container-low flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-semibold">Semaine du {com.dueDate}</p>
                      <p className="text-sm font-bold text-on-surface font-mono">{formatCurrency(com.amount)}</p>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      com.status === 'Payée' 
                        ? 'bg-status-success-bg text-status-success-text' 
                        : 'bg-status-warning-bg text-status-warning-text'
                    }`}>
                      {com.status === 'Payée' ? 'Payée' : 'Non payée'}
                    </span>
                  </div>

                  {com.status === 'Non payée' ? (
                    <button 
                      onClick={() => onMarkCommissionPaid(com.id)}
                      className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      Solder la commission
                    </button>
                  ) : (
                    <span className="text-[11px] text-status-success-text font-bold flex items-center gap-1 mt-1 justify-center bg-status-success-bg/30 py-1 rounded">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Solder complet</span>
                    </span>
                  )}
                </div>
              ))}

              {driverCommissions.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-4 bg-slate-50 rounded-lg">Aucune commission enregistrée pour ce chauffeur.</p>
              )}
            </div>
          </div>

          {/* Driver Mobile App Simulator Card */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-850 flex flex-col relative overflow-hidden">
            {/* Phone Notch visual details */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-lg z-10 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium mb-3 mt-1.5">
              <span>09:41</span>
              <div className="flex items-center gap-1">
                <Smartphone className="h-2.5 w-2.5 text-slate-400" />
                <span className="font-mono">DEM CHAUFFEUR</span>
              </div>
            </div>

            <div className="border-b border-slate-850 pb-2 mb-3">
              <h4 className="font-bold text-[11px] text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-primary" />
                <span>Simulateur Chauffeur</span>
              </h4>
              <p className="text-[9px] text-slate-500">Voyez en direct ce que le chauffeur voit</p>
            </div>

            {/* Simulated Phone Content */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 flex flex-col gap-3 min-h-[170px] relative justify-between">
              
              {/* Profile Bar in mobile app */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                  <img src={driver.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h5 className="font-bold text-[11px] text-slate-200">{driver.name}</h5>
                  <p className="text-[9px] text-slate-500">{driver.vehicle}</p>
                </div>
              </div>

              {/* Status switch inside simulated phone */}
              <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold block">Mon Statut</span>
                  <span className={`text-[10px] font-bold ${
                    driver.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {driver.status === 'active' ? '● En service' : '○ Hors service'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (driver.adminLocked) {
                      alert(`🔒 Action impossible !\nL'administrateur a verrouillé votre compte. Tant qu'il ne vous a pas remis en service ou déverrouillé, vous ne pouvez pas activer votre service vous-même.`);
                    } else {
                      onToggleStatus(driver.id);
                    }
                  }}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    driver.status === 'active' ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${driver.adminLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    driver.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Error warning if locked, or success banner if normal */}
              {driver.adminLocked ? (
                <div className="bg-red-950/50 border border-red-900/40 rounded-lg p-2 text-[9px] text-red-300 flex items-start gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <p className="font-bold">Accès Suspendu</p>
                    <p className="text-[8px] text-red-400 mt-0.5">Statut gelé par l'administration. Vos modifications sont rejetées.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2 text-[9px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>Vous pouvez changer votre statut librement</span>
                </div>
              )}

              {/* Action Button to simulate physical interaction */}
              <button
                onClick={() => {
                  if (driver.adminLocked) {
                    alert("🚫 Tentative rejetée par la centrale d'administration : votre statut est bloqué.");
                  } else {
                    onToggleStatus(driver.id);
                  }
                }}
                className={`w-full py-1.5 rounded-lg text-center font-bold text-[10px] transition-all active:scale-[0.98] ${
                  driver.adminLocked 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : driver.status === 'active' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {driver.adminLocked ? '🔒 Bloqué par l\'admin' : driver.status === 'active' ? 'Prendre mon repos' : 'Prendre mon service'}
              </button>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
