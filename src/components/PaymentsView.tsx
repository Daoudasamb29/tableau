import React, { useState } from 'react';
import { ClientPayment } from '../types';
import PaymentDetailModal from './PaymentDetailModal';
import { 
  TrendingUp, 
  Smartphone, 
  Wallet, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal, 
  MoreVertical,
  MapPin,
  Sparkles,
  Award,
  Download
} from 'lucide-react';

interface PaymentsViewProps {
  payments: ClientPayment[];
  formatCurrency: (amount: number) => string;
  googleUser?: any;
  onSendEmail?: (to: string, subject: string, htmlBody: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PaymentsView({
  payments,
  formatCurrency,
  googleUser,
  onSendEmail
}: PaymentsViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Payé' | 'En attente' | 'Échoué'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<ClientPayment | null>(null);

  // Dynamic calculations
  const totalReceivedToday = payments
    .filter(p => p.status === 'Payé')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingCount = payments.filter(p => p.status === 'En attente').length;
  const failedCount = payments.filter(p => p.status === 'Échoué').length;

  // Filter logic
  const filteredPayments = payments.filter(pay => {
    const matchesSearch = 
      pay.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.route.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || pay.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = [
      'ID de la transaction',
      'Nom du client',
      'Montant (FCFA)',
      'Trajet',
      'Méthode de paiement',
      'Date/Heure',
      'Statut'
    ];

    const rows = filteredPayments.map(p => [
      p.id,
      p.clientName,
      p.amount.toString(),
      p.route,
      p.paymentMethod,
      p.time,
      p.status
    ]);

    // Add BOM for correct French accent formatting in Excel/Numbers
    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(row => row.map(val => {
        const strVal = (val === undefined || val === null) ? '' : String(val);
        const cleanVal = strVal.replace(/"/g, '""');
        return `"${cleanVal}"`;
      }).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `paiements_clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top App bar title & active date */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Paiements clients</h1>
          <p className="text-xs text-on-surface-variant font-semibold">Mercredi 24 juin 2026</p>
        </div>

        {/* Filter selectors tags list */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white border border-border-subtle text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Tous les statuts
          </button>
          <button 
            onClick={() => setActiveFilter('Payé')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'Payé' 
                ? 'bg-primary text-white' 
                : 'bg-white border border-border-subtle text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Payé
          </button>
          <button 
            onClick={() => setActiveFilter('En attente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'En attente' 
                ? 'bg-primary text-white' 
                : 'bg-white border border-border-subtle text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            En attente
          </button>
          <button 
            onClick={() => setActiveFilter('Échoué')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'Échoué' 
                ? 'bg-primary text-white' 
                : 'bg-white border border-border-subtle text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Échoué
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Encaissé aujourd'hui */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm hover:border-primary/20 transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Encaissé aujourd&apos;hui</span>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-black text-on-surface tracking-tight mt-1">{formatCurrency(totalReceivedToday)}</p>
          <div className="mt-3 flex items-center gap-1 text-status-success-text text-[11px] font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12% vs hier</span>
          </div>
        </div>

        {/* En attente */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm hover:border-status-warning-text/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">En attente</span>
            <Clock className="h-5 w-5 text-status-warning-text" />
          </div>
          <p className="text-2xl font-black text-on-surface tracking-tight mt-1">{pendingCount}</p>
          <div className="mt-3 text-[11px] text-on-surface-variant font-medium">
            Transactions non confirmées
          </div>
        </div>

        {/* Échoués */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm hover:border-status-danger-text/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Échoués</span>
            <AlertTriangle className="h-5 w-5 text-status-danger-text" />
          </div>
          <p className="text-2xl font-black text-on-surface tracking-tight mt-1">{failedCount}</p>
          <div className="mt-3 text-status-danger-text text-[11px] font-bold">
            Action requise : Contacter client
          </div>
        </div>

      </div>

      {/* Transaction List Container */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle bg-surface-bright flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-on-surface">Transactions récentes</h3>
            <p className="text-xs text-on-surface-variant">Historique des ventes de billets par virement mobile ou espèces</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Rechercher client, billet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
              />
            </div>
            <button 
              onClick={handleExportCSV}
              title="Exporter au format CSV"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Transaction Items */}
        <div className="divide-y divide-border-subtle">
          {filteredPayments.map((pay) => (
            <div 
              key={pay.id} 
              onClick={() => setSelectedPayment(pay)}
              className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-surface-container cursor-pointer transition-all active:scale-[0.995] group"
            >
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border-subtle bg-surface-container">
                  <img 
                    src={pay.clientAvatar} 
                    alt={pay.clientName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{pay.clientName}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant mt-0.5">
                    <span className="font-semibold text-[11px] text-primary">{pay.id}</span>
                    <span className="w-1 h-1 bg-border-subtle rounded-full"></span>
                    <span>{pay.route}</span>
                    <span className="w-1 h-1 bg-border-subtle rounded-full"></span>
                    <span className="flex items-center gap-0.5">
                      <Smartphone className="h-3 w-3 text-primary shrink-0" />
                      <span>{pay.paymentMethod}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border-subtle/50">
                <span className="text-sm font-bold text-on-surface font-mono">{formatCurrency(pay.amount)}</span>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 min-w-[70px] text-center ${
                  pay.status === 'Payé' ? 'bg-status-success-bg text-status-success-text' :
                  pay.status === 'En attente' ? 'bg-status-warning-bg text-status-warning-text' :
                  'bg-status-danger-bg text-status-danger-text'
                }`}>
                  {pay.status}
                </span>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPayment(pay);
                  }}
                  className="p-1.5 hover:bg-surface-bright rounded-md text-on-surface-variant transition-colors shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredPayments.length === 0 && (
            <p className="p-10 text-center text-xs text-on-surface-variant bg-white">Aucun paiement trouvé pour ce filtre.</p>
          )}
        </div>
      </div>

      {/* Dakar Active Map & Dynamic report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Zones de paiements actifs */}
        <div className="bg-white rounded-xl border border-border-subtle h-64 relative overflow-hidden flex flex-col shadow-sm">
          <div className="p-3 flex items-center justify-between bg-white/90 border-b border-border-subtle/40 z-10 absolute top-0 left-0 right-0 backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold text-on-surface">Zones de paiements actifs</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider animate-pulse">Live</span>
          </div>
          
          {/* Simulated clean graphic map of Dakar routes */}
          <div className="w-full h-full flex items-center justify-center bg-slate-50 relative pt-10">
            {/* Background routes lines illustration */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="50" y1="50" x2="450" y2="250" stroke="#275300" strokeWidth="4" />
                <line x1="100" y1="200" x2="350" y2="80" stroke="#275300" strokeWidth="2" />
                <line x1="20" y1="180" x2="400" y2="180" stroke="#275300" strokeWidth="1.5" />
                <circle cx="150" cy="110" r="100" stroke="#275300" strokeWidth="1" strokeDasharray="5,5" fill="none" />
                <circle cx="300" cy="150" r="70" stroke="#275300" strokeWidth="1" strokeDasharray="3,3" fill="none" />
              </svg>
            </div>

            {/* Active hot spots representation */}
            <div className="absolute top-[35%] left-[25%] flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="bg-white px-1.5 py-0.5 rounded shadow text-[9px] font-bold border border-border-subtle mt-1">Dakar Plateau</span>
            </div>

            <div className="absolute top-[60%] left-[55%] flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="bg-white px-1.5 py-0.5 rounded shadow text-[9px] font-bold border border-border-subtle mt-1">Pikine</span>
            </div>

            <div className="absolute top-[25%] left-[75%] flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="bg-white px-1.5 py-0.5 rounded shadow text-[9px] font-bold border border-border-subtle mt-1">Guediawaye</span>
            </div>

            <div className="absolute bottom-[15%] left-[40%] flex flex-col items-center">
              <span className="relative flex h-2 w-2 bg-on-surface-variant/50 rounded-full"></span>
              <span className="text-[8px] text-on-surface-variant font-semibold mt-0.5">Yoff (Inactif)</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-white/95 border border-border-subtle px-2 py-1.5 rounded shadow-sm text-[10px] space-y-1">
              <p className="font-bold text-on-surface text-center">Légende</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                <span className="text-on-surface-variant font-medium">Forte activité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimisez vos encaissements green promo */}
        <div className="bg-primary text-white p-5 rounded-xl relative overflow-hidden flex flex-col justify-center shadow-md">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none">
            <Award className="h-32 w-32" />
          </div>

          <div className="relative z-10">
            <h4 className="text-xs font-bold text-on-primary-container mb-1 uppercase tracking-wider">Optimisez vos encaissements</h4>
            <p className="text-xs opacity-90 mb-4 max-w-sm leading-relaxed">
              Le volume de transactions via <span className="font-bold text-on-primary-container">Mobile Money (Orange Money, Wave)</span> a augmenté de 15% ce mois-ci. Assurez-vous que vos chauffeurs encouragent ces méthodes pour réduire le cash physique en circulation.
            </p>
            <button 
              onClick={() => alert('Ouverture du rapport de pénétration des paiements mobiles...')}
              className="px-4 py-2 bg-white text-primary rounded-lg text-xs font-bold hover:bg-surface-bright transition-all shadow-sm active:scale-95"
            >
              Consulter le rapport mensuel
            </button>
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
