import React, { useState } from 'react';
import { Driver, Activity, ClientPayment, Commission } from '../types';
import RevenueChart from './RevenueChart';
import PaymentDetailModal from './PaymentDetailModal';
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  DollarSign, 
  Route, 
  MapPin, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  User, 
  ArrowRight,
  Sparkles,
  Search,
  Bell,
  CalendarDays
} from 'lucide-react';

interface DashboardViewProps {
  drivers: Driver[];
  activities: Activity[];
  payments: ClientPayment[];
  commissions: Commission[];
  onToggleStatus: (driverId: string) => void;
  onViewProfile: (driverId: string) => void;
  onSimulateActivity: () => void;
  formatCurrency: (amount: number) => string;
  googleUser?: any;
  onSendEmail?: (to: string, subject: string, htmlBody: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DashboardView({
  drivers,
  activities,
  payments,
  commissions,
  onToggleStatus,
  onViewProfile,
  onSimulateActivity,
  formatCurrency,
  googleUser,
  onSendEmail
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<ClientPayment | null>(null);

  // Calculations for KPI Cards
  const totalTrips = drivers.reduce((acc, d) => acc + (d.status === 'active' ? 2 : 0), 0) + 7; // dynamic simulation
  const pendingReservations = activities.filter(a => a.type === 'reservation').length + 3;
  
  // Commissions impayées total
  const unpaidCommissionsSum = commissions
    .filter(c => c.status === 'Non payée')
    .reduce((acc, c) => acc + c.amount, 0);

  // Paiements reçus total (Paid client tickets)
  const paidTicketsSum = payments
    .filter(p => p.status === 'Payé')
    .reduce((acc, p) => acc + p.amount, 0);

  // Filter drivers for the search bar
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Alert simulator bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Mode Démo Interactif</h3>
            <p className="text-xs text-on-surface-variant">Simulez de nouvelles activités de transport en temps réel.</p>
          </div>
        </div>
        <button
          onClick={onSimulateActivity}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          Simuler une nouvelle réservation
        </button>
      </div>

      {/* Revenue Chart */}
      <RevenueChart payments={payments} formatCurrency={formatCurrency} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between transition-colors hover:bg-surface-secondary shadow-sm group">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trajets publiés</span>
            <p className="text-2xl font-bold text-primary mt-1">{totalTrips}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[11px] text-status-success-text bg-status-success-bg px-2 py-0.5 rounded-full font-medium">En direct</span>
            <Route className="h-7 w-7 text-primary/20 group-hover:text-primary/40 transition-colors" />
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between transition-colors hover:bg-surface-secondary shadow-sm group">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Commandes en attente</span>
            <p className="text-2xl font-bold text-on-surface mt-1">{pendingReservations}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[11px] text-status-warning-text bg-status-warning-bg px-2 py-0.5 rounded-full font-medium">À traiter</span>
            <Clock className="h-7 w-7 text-status-warning-text/20 group-hover:text-status-warning-text/40 transition-colors" />
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between transition-colors hover:bg-surface-secondary shadow-sm group">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Commissions impayées</span>
            <p className="text-2xl font-bold text-status-danger-text mt-1">{formatCurrency(unpaidCommissionsSum)}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[11px] text-status-danger-text bg-status-danger-bg px-2 py-0.5 rounded-full font-medium">Dû chauffeurs</span>
            <Wallet className="h-7 w-7 text-status-danger-text/20 group-hover:text-status-danger-text/40 transition-colors" />
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between transition-colors hover:bg-surface-secondary shadow-sm group">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Paiements reçus</span>
            <p className="text-2xl font-bold text-status-success-text mt-1">{formatCurrency(paidTicketsSum)}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[11px] text-status-success-text bg-status-success-bg px-2 py-0.5 rounded-full font-medium">+12% vs hier</span>
            <DollarSign className="h-7 w-7 text-status-success-text/20 group-hover:text-status-success-text/40 transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Section Grid (Bento Style Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (Drivers & Recent Activities) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Gestion des Chauffeurs */}
          <div className="bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-bright rounded-t-xl">
              <div>
                <h2 className="font-bold text-base text-on-surface">Gestion des Chauffeurs</h2>
                <p className="text-xs text-on-surface-variant">Statut d&apos;activité des chauffeurs de la flotte active</p>
              </div>
              <div className="relative max-w-xs hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-surface-container border border-border-subtle rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-primary w-40 focus:w-56 transition-all"
                />
              </div>
            </div>
            
            <div className="divide-y divide-border-subtle overflow-hidden">
              {filteredDrivers.slice(0, 4).map((driver) => (
                <div 
                  key={driver.id} 
                  className="p-3 flex items-center justify-between gap-4 hover:bg-surface-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border-subtle shrink-0">
                      <img 
                        src={driver.avatar} 
                        alt={driver.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate text-on-surface">{driver.name}</h4>
                      <p className="text-xs text-on-surface-variant truncate">{driver.vehicle} • <span className="font-mono text-[11px]">{driver.plate}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                      driver.status === 'active' 
                        ? 'bg-status-success-bg text-status-success-text' 
                        : 'bg-status-danger-bg text-status-danger-text'
                    }`}>
                      {driver.status === 'active' ? 'En service' : 'Hors service'}
                    </span>

                    {/* Toggle Switch Button */}
                    <button 
                      onClick={() => onToggleStatus(driver.id)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        driver.status === 'active' ? 'bg-primary' : 'bg-on-surface-variant/30'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        driver.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>

                    {/* Profile Link Button */}
                    <button 
                      onClick={() => onViewProfile(driver.id)}
                      className="px-3 py-1 text-xs border border-border-subtle rounded-md hover:bg-surface-container transition-colors font-medium whitespace-nowrap"
                    >
                      Profil
                    </button>
                  </div>
                </div>
              ))}
              {filteredDrivers.length === 0 && (
                <p className="p-6 text-center text-xs text-on-surface-variant">Aucun chauffeur trouvé pour votre recherche.</p>
              )}
            </div>
          </div>

          {/* Activités Récentes */}
          <div className="bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col flex-grow">
            <div className="p-4 border-b border-border-subtle bg-surface-bright rounded-t-xl">
              <h2 className="font-bold text-base text-on-surface">Activités Récentes</h2>
              <p className="text-xs text-on-surface-variant">Journal opérationnel de la flotte en temps réel</p>
            </div>
            
            <div className="p-2 divide-y divide-border-subtle overflow-y-auto max-h-[350px]">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`p-3 flex items-start gap-3 rounded-lg transition-colors hover:bg-surface-secondary ${
                    activity.status === 'urgent' ? 'bg-status-danger-bg/20' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    activity.type === 'reservation' ? 'bg-primary/10 text-primary' :
                    activity.type === 'trip_published' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'confirmed' ? 'bg-status-success-bg text-status-success-text' :
                    activity.type === 'alert' ? 'bg-status-danger-bg text-status-danger-text' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {activity.type === 'reservation' ? <MapPin className="h-4 w-4" /> :
                     activity.type === 'trip_published' ? <Route className="h-4 w-4" /> :
                     activity.type === 'confirmed' ? <CheckCircle className="h-4 w-4" /> :
                     activity.type === 'alert' ? <AlertCircle className="h-4 w-4" /> :
                     <User className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`font-bold text-xs truncate ${
                        activity.status === 'urgent' ? 'text-status-danger-text' : 'text-on-surface'
                      }`}>
                        {activity.title}
                      </span>
                      <span className="text-[10px] text-on-surface-variant whitespace-nowrap shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{activity.description}</p>
                    {activity.amount && (
                      <span className="inline-block mt-1 font-bold text-xs text-primary">{activity.amount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Payments & Commissions) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Suivi des Commissions */}
          <div className="bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col">
            <div className="p-4 border-b border-border-subtle bg-surface-bright rounded-t-xl">
              <h2 className="font-bold text-sm text-on-surface">Suivi des Commissions</h2>
              <p className="text-[11px] text-on-surface-variant">Statut des cotisations de la semaine</p>
            </div>
            
            <div className="divide-y divide-border-subtle">
              {commissions.slice(0, 4).map((com) => (
                <div key={com.id} className="p-3 flex justify-between items-center hover:bg-surface-secondary transition-colors">
                  <div className="min-w-0">
                    <span className="font-semibold text-xs truncate block text-on-surface">{com.driverName}</span>
                    <span className="text-[10px] text-on-surface-variant">Échéance : {com.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">{formatCurrency(com.amount)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      com.status === 'Payée' 
                        ? 'bg-status-success-bg text-status-success-text' 
                        : 'bg-status-warning-bg text-status-warning-text'
                    }`}>
                      {com.status === 'Payée' ? 'Payé' : 'Non payé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paiements Clients */}
          <div className="bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col flex-grow">
            <div className="p-4 border-b border-border-subtle bg-surface-bright rounded-t-xl">
              <h2 className="font-bold text-sm text-on-surface">Paiements Clients</h2>
              <p className="text-[11px] text-on-surface-variant">Derniers tickets de transport vendus (cliquez pour les détails)</p>
            </div>
            
            <div className="p-3 space-y-3 overflow-y-auto max-h-[350px]">
              {payments.slice(0, 3).map((pay) => (
                <div 
                  key={pay.id} 
                  onClick={() => setSelectedPayment(pay)}
                  className="p-3 bg-surface-container-low rounded-lg border border-border-subtle flex flex-col gap-2 transition-all hover:border-primary/30 cursor-pointer hover:shadow-sm active:scale-[0.98] group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">{pay.id}</div>
                      <div className="text-[10px] text-on-surface-variant">{pay.time}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pay.status === 'Payé' ? 'bg-status-success-bg text-status-success-text' :
                      pay.status === 'En attente' ? 'bg-status-warning-bg text-status-warning-text' :
                      'bg-status-danger-bg text-status-danger-text'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-semibold text-on-surface-variant">Client : <span className="text-on-surface font-bold">{pay.clientName}</span></div>
                    <div className="text-xs font-bold text-primary font-mono">{formatCurrency(pay.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Detail Modal for Selected Client Payment */}
      <PaymentDetailModal 
        payment={selectedPayment} 
        onClose={() => setSelectedPayment(null)} 
        formatCurrency={formatCurrency} 
        googleUser={googleUser}
        onSendEmail={onSendEmail}
      />
    </div>
  );
}
