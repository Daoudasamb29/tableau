import React, { useState } from 'react';
import { Commission, Trip, ClientPayment } from '../types';
import { 
  Download, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle, 
  CircleDot, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  Search,
  Check,
  Building,
  User,
  Users,
  MapPin,
  CreditCard,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';

interface CommissionsViewProps {
  commissions: Commission[];
  onMarkPaid: (commissionId: string) => void;
  formatCurrency: (amount: number) => string;
  trips?: Trip[];
  payments?: ClientPayment[];
}

export default function CommissionsView({
  commissions,
  onMarkPaid,
  formatCurrency,
  trips = [],
  payments = []
}: CommissionsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'drivers' | 'clients'>('drivers');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Cette semaine');

  // Helper: calculate total passengers accepted by a specific driver
  const getDriverPassengersCount = (driverId: string) => {
    return trips
      .filter(t => t.driverId === driverId)
      .reduce((sum, t) => sum + (t.passengerCount || 0), 0);
  };

  // Helper: calculate dynamic chauffeur commission (50 FCFA per client accepted)
  const getDynamicChauffeurCommission = (driverId: string) => {
    const passengers = getDriverPassengersCount(driverId);
    return passengers * 50;
  };

  // Client Commissions Calculations: 100 FCFA per place (each payment is for 1 place/seat)
  const paidPayments = payments.filter(p => p.status === 'Payé');
  const totalClientCommissions = paidPayments.length * 100;

  // Driver Commissions Calculations (based on actual passengers accepted)
  const totalDriverPassengers = trips.reduce((sum, t) => sum + (t.passengerCount || 0), 0);
  const totalDriverCommissionsDynamic = totalDriverPassengers * 50;

  // Let's also keep track of unpaid / paid drivers commissions based on our commissions array but computed dynamically
  const computedCommissions = commissions.map(com => {
    const passengers = getDriverPassengersCount(com.driverId);
    // Use dynamic calculation (passengers * 50) if trips exist, otherwise fallback to standard amount
    const dynamicAmount = passengers > 0 ? (passengers * 50) : (com.amount > 0 ? com.amount : 2500);
    return {
      ...com,
      amount: dynamicAmount,
      passengersCount: passengers
    };
  });

  const unpaidSum = computedCommissions
    .filter(c => c.status === 'Non payée')
    .reduce((acc, c) => acc + c.amount, 0);

  const paidSumThisMonth = computedCommissions
    .filter(c => c.status === 'Payée')
    .reduce((acc, c) => acc + c.amount, 0) + 42000; // Simulated historic base

  const unpaidDriversCount = computedCommissions.filter(c => c.status === 'Non payée').length;

  // Filter lists
  const filteredCommissions = computedCommissions.filter(c => 
    c.driverName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.driverId.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredClientPayments = paidPayments.filter(p =>
    p.clientName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.driverName || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.route.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // CSV Export for both types
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (activeSubTab === 'drivers') {
      headers = [
        'ID Commission',
        'ID Chauffeur',
        'Nom du Chauffeur',
        'Clients Acceptés',
        'Commission Chauffeur (50 FCFA/client)',
        'Statut'
      ];
      rows = filteredCommissions.map(c => [
        c.id,
        c.driverId,
        c.driverName,
        c.passengersCount.toString(),
        c.amount.toString(),
        c.status
      ]);
      filename = `commissions_chauffeurs_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = [
        'ID Transaction',
        'Client',
        'Route',
        'Montant Payé (FCFA)',
        'Commission Récupérée (100 FCFA)',
        'Part Chauffeur Nette (FCFA)'
      ];
      rows = filteredClientPayments.map(p => [
        p.id,
        p.clientName,
        p.route,
        p.amount.toString(),
        '100',
        (p.amount - 100).toString()
      ]);
      filename = `commissions_clients_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="commissions-view-container" className="space-y-6 animate-fade-in duration-300">
      
      {/* Header section with Dropdown and Export actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
              <Building className="h-6 w-6 text-primary animate-pulse" />
              <span>Gestion des Commissions</span>
            </h1>
            <span className="hidden sm:inline-block bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Système Double Commission
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-on-surface-variant">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Suivi en direct des prélèvements d&apos;exploitation</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="flex-grow md:flex-grow-0 px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option>Cette semaine</option>
            <option>Ce mois</option>
            <option>Trimestre</option>
          </select>
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Commission Rules Info Banner */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4.5 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider">Règles des commissions applicables</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            1. <strong className="text-on-surface font-bold">Du côté Chauffeur :</strong> Pour chaque passager/client accepté sur un trajet, le chauffeur est commissionné de <strong className="text-primary font-bold">50 FCFA</strong>.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            2. <strong className="text-on-surface font-bold">Du côté Client :</strong> Pour chaque place achetée, une commission de <strong className="text-cyan-700 font-bold">100 FCFA</strong> est incluse. Ce montant est directement récupéré de la transaction globale du client.
          </p>
        </div>
      </div>

      {/* KPI Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total dû Chauffeurs */}
        <div className="bg-white p-5 rounded-xl border border-border-subtle flex flex-col justify-between hover:border-primary/30 transition-all shadow-sm group relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-surface-secondary rounded-xl text-primary group-hover:bg-primary/10 transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Chauffeurs
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Dû par les Chauffeurs</p>
            <p className="text-2xl font-black text-primary tracking-tight mt-1">{formatCurrency(unpaidSum)}</p>
            <p className="text-[10px] text-on-surface-variant mt-1.5 border-t border-border-subtle/50 pt-1.5">
              Frais de {totalDriverPassengers} passagers acceptés ({formatCurrency(totalDriverCommissionsDynamic)} au total)
            </p>
          </div>
        </div>

        {/* Commissions Clients Récupérées */}
        <div className="bg-white p-5 rounded-xl border border-border-subtle flex flex-col justify-between hover:border-cyan-600/30 transition-all shadow-sm group relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-cyan-50 rounded-xl text-cyan-600 group-hover:bg-cyan-100 transition-colors">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Clients
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Commissions Clients Récupérées</p>
            <p className="text-2xl font-black text-cyan-700 tracking-tight mt-1">{formatCurrency(totalClientCommissions)}</p>
            <p className="text-[10px] text-on-surface-variant mt-1.5 border-t border-border-subtle/50 pt-1.5">
              Retirées de {paidPayments.length} places vendues (100 FCFA par place)
            </p>
          </div>
        </div>

        {/* Total commissions collectées */}
        <div className="bg-gradient-to-br from-primary to-primary-hover text-white p-5 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none transition-transform group-hover:scale-110 duration-500">
            <Sparkles className="h-32 w-32" />
          </div>
          <div className="flex justify-between items-start mb-3 z-10">
            <div className="p-2 bg-white/10 rounded-xl text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-extrabold text-white bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Global
            </span>
          </div>
          <div className="z-10">
            <p className="text-[10px] font-bold text-white/85 uppercase tracking-wider">Chiffre d&apos;Affaires Commissions</p>
            <p className="text-2xl font-black text-white tracking-tight mt-1">
              {formatCurrency(paidSumThisMonth + totalClientCommissions)}
            </p>
            <p className="text-[10px] text-white/70 mt-1.5 border-t border-white/10 pt-1.5">
              Encaissé total (Chauffeurs réglés + Clients prélevés)
            </p>
          </div>
        </div>

      </div>

      {/* Main Data Table & Tab Switcher */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        
        {/* Sub tabs and Search Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright">
          
          {/* Sub tab buttons */}
          <div className="flex bg-surface-secondary p-1 rounded-lg border border-border-subtle">
            <button
              onClick={() => { setActiveSubTab('drivers'); setFilterQuery(''); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'drivers'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Côté Chauffeur (50 FCFA)</span>
            </button>
            <button
              onClick={() => { setActiveSubTab('clients'); setFilterQuery(''); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'clients'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Côté Client (100 FCFA)</span>
            </button>
          </div>
          
          {/* Search input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
            <input
              type="text"
              placeholder={activeSubTab === 'drivers' ? "Rechercher par chauffeur..." : "Rechercher par client/chauffeur..."}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Dynamic header for the table list */}
        <div className="px-5 py-3.5 bg-surface-secondary/50 border-b border-border-subtle/80 flex items-center justify-between">
          <h3 className="font-bold text-xs text-on-surface uppercase tracking-wider">
            {activeSubTab === 'drivers' ? 'Prélèvements sur les clients acceptés' : 'Commissions collectées sur les ventes de billets'}
          </h3>
          <span className="text-[10px] font-bold text-on-surface-variant">
            {activeSubTab === 'drivers' ? `${filteredCommissions.length} chauffeurs listés` : `${filteredClientPayments.length} ventes payées`}
          </span>
        </div>

        {/* Table/List View */}
        <div className="overflow-x-auto">
          <div className="min-w-[650px] divide-y divide-border-subtle">
            
            {/* DRIVERS COMMISSIONS TAB */}
            {activeSubTab === 'drivers' && filteredCommissions.map((com, index) => {
              const initials = com.driverName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2);

              return (
                <div 
                  key={com.id} 
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/50 transition-all ${
                    index === 0 ? 'bg-primary/5/30 border-l-4 border-primary' : ''
                  }`}
                >
                  {/* Initials placeholder */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xs shrink-0 border border-primary/10">
                    {initials}
                  </div>

                  {/* Driver details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-on-surface truncate">{com.driverName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5 font-mono">
                      <span>ID: {com.driverId}</span>
                      <span>•</span>
                      <span className="font-bold text-primary">{com.passengersCount} clients acceptés</span>
                    </div>
                  </div>

                  {/* Calculation Details */}
                  <div className="px-4 text-center shrink-0">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Calcul</span>
                    <span className="text-xs font-mono text-on-surface mt-0.5 block">{com.passengersCount} x 50 FCFA</span>
                  </div>

                  {/* Amount Due */}
                  <div className="text-right px-4 shrink-0">
                    <p className="font-extrabold text-xs text-primary font-mono">{formatCurrency(com.amount)}</p>
                    <p className="text-[10px] text-on-surface-variant">Dû le {com.dueDate}</p>
                  </div>

                  {/* Payment Status badge */}
                  <div className="w-32 shrink-0">
                    <span className={`font-bold text-[10px] px-2.5 py-1 rounded-md flex items-center justify-center gap-1.5 ${
                      com.status === 'Payée' 
                        ? 'bg-status-success-bg/25 text-status-success-text border border-status-success-bg/40' 
                        : 'bg-status-warning-bg/25 text-status-warning-text border border-status-warning-bg/40'
                    }`}>
                      {com.status === 'Payée' ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Payée</span>
                        </>
                      ) : (
                        <>
                          <CircleDot className="h-3 w-3 animate-pulse text-amber-500" />
                          <span>Non payée</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Action button */}
                  <div className="w-36 flex justify-end shrink-0">
                    {com.status === 'Non payée' ? (
                      <button 
                        onClick={() => onMarkPaid(com.id)}
                        className="bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
                      >
                        Marquer payé
                      </button>
                    ) : (
                      <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg font-bold select-none flex items-center gap-1 border border-border-subtle/50">
                        <Check className="h-3.5 w-3.5 text-status-success-text font-black" />
                        Solder complet
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* CLIENTS COMMISSIONS TAB */}
            {activeSubTab === 'clients' && filteredClientPayments.map((p) => {
              const clientInitials = p.clientName.split(' ').map(n => n[0]).join('').slice(0, 2);
              const retrievedCommission = 100;
              const netDriverShare = p.amount - retrievedCommission;

              return (
                <div 
                  key={p.id} 
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/50 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-extrabold text-xs shrink-0 border border-cyan-200">
                    {clientInitials}
                  </div>

                  {/* Client & Route info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-on-surface truncate">{p.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                      <span className="font-semibold text-primary">{p.route}</span>
                      <span>•</span>
                      <span>Chauffeur : {p.driverName || 'Non assigné'}</span>
                    </div>
                  </div>

                  {/* Ticket Amount */}
                  <div className="px-4 text-right shrink-0">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Billet payé</span>
                    <span className="text-xs font-mono font-bold text-on-surface mt-0.5 block">{formatCurrency(p.amount)}</span>
                  </div>

                  {/* Operator Action */}
                  <div className="px-4 shrink-0 text-center flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-on-surface-variant/50" />
                  </div>

                  {/* Commission Retrieved */}
                  <div className="px-4 text-center shrink-0">
                    <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">Frais prélevés</span>
                    <span className="text-xs font-mono font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 mt-0.5 block">
                      - {formatCurrency(retrievedCommission)}
                    </span>
                  </div>

                  {/* Net Share */}
                  <div className="w-36 text-right shrink-0">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Reste Chauffeur (Net)</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-600 mt-0.5 block">
                      {formatCurrency(netDriverShare)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Empty States */}
            {activeSubTab === 'drivers' && filteredCommissions.length === 0 && (
              <div className="p-12 text-center text-xs text-on-surface-variant bg-white space-y-1">
                <p className="font-bold text-sm text-on-surface">Aucun chauffeur trouvé</p>
                <p>Aucun chauffeur ne correspond à vos critères de recherche.</p>
              </div>
            )}

            {activeSubTab === 'clients' && filteredClientPayments.length === 0 && (
              <div className="p-12 text-center text-xs text-on-surface-variant bg-white space-y-1">
                <p className="font-bold text-sm text-on-surface">Aucune commission client</p>
                <p>Aucun billet vendu payé n&apos;est enregistré dans l&apos;historique des paiements.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Dynamic Graph Analysis and Green Summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Analyse des flux */}
        <div className="bg-white p-5 rounded-xl border border-border-subtle shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-on-surface">Répartition de l&apos;Exploitation</h4>
            <p className="text-xs text-on-surface-variant mb-4">Volume comparatif de commissions perçues sur la plateforme.</p>
            
            {/* Visual breakdown progress bars */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-on-surface">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    <span>Commissions Chauffeurs (50 FCFA / passager)</span>
                  </span>
                  <span>{formatCurrency(totalDriverCommissionsDynamic)}</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ 
                      width: `${(totalDriverCommissionsDynamic + totalClientCommissions) > 0 
                        ? (totalDriverCommissionsDynamic / (totalDriverCommissionsDynamic + totalClientCommissions)) * 100 
                        : 50}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-on-surface">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-cyan-600 rounded-full"></span>
                    <span>Prélèvements Clients (100 FCFA / billet)</span>
                  </span>
                  <span>{formatCurrency(totalClientCommissions)}</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(totalDriverCommissionsDynamic + totalClientCommissions) > 0 
                        ? (totalClientCommissions / (totalDriverCommissionsDynamic + totalClientCommissions)) * 100 
                        : 50}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Synthèse panel */}
        <div className="bg-primary text-white p-5 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none">
            <TrendingUp className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-2 text-white/85 uppercase tracking-wider">Rapport de Synthèse</h4>
            <h3 className="text-lg font-black mb-2">Double Prélèvement d&apos;Exploitation</h3>
            <p className="text-xs opacity-90 max-w-sm leading-relaxed mb-4 font-semibold">
              Ce tableau comptabilise distinctement les {formatCurrency(50)} perçus par passager accepté par les chauffeurs ainsi que les {formatCurrency(100)} récupérés d&apos;office sur chaque billet vendu.
            </p>
          </div>
          
          <div className="relative z-10 mt-auto">
            <button 
              onClick={() => alert('Le rapport mensuel détaillé est en cours de compilation pour téléchargement.')}
              className="bg-white text-primary font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-surface-bright transition-all active:scale-95 shadow cursor-pointer"
            >
              Télécharger la Synthèse Hebdomadaire
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
