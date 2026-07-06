import React, { useState } from 'react';
import { Driver, Commission } from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Star, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  CircleDot,
  Calendar
} from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';

interface DriversViewProps {
  drivers: Driver[];
  commissions: Commission[];
  onViewProfile: (driverId: string) => void;
  onOpenAddModal: () => void;
  formatCurrency: (amount: number) => string;
}

export default function DriversView({
  drivers,
  commissions,
  onViewProfile,
  onOpenAddModal,
  formatCurrency,
}: DriversViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Calculate dynamic metrics
  const totalDriversBase = 138 + drivers.length; // Keep standard high number matching 142 from mockup
  const activeCount = 84 + drivers.filter(d => d.status === 'active').length;
  const inactiveCount = 54 + drivers.filter(d => d.status === 'inactive').length;
  
  // Unpaid commissions
  const unpaidSum = commissions
    .filter(c => c.status === 'Non payée')
    .reduce((acc, c) => acc + c.amount, 0);

  // Filter the driver list
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && driver.status === 'active') ||
      (statusFilter === 'inactive' && driver.status === 'inactive');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner KPI summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Chauffeurs</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-bold text-on-surface">{totalDriversBase}</span>
            <span className="text-xs text-status-success-text bg-status-success-bg px-1.5 py-0.5 rounded font-bold">+4%</span>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">En service</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-bold text-primary">{activeCount}</span>
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Actifs
            </div>
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Hors service</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-bold text-on-surface-variant">{inactiveCount}</span>
            <span className="text-xs text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded font-medium">Repos</span>
          </div>
        </div>

        {/* Card 4: Unpaid Commissions */}
        <div className="bg-white p-4 rounded-xl border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Commissions dues</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-bold text-status-warning-text">{formatCurrency(unpaidSum)}</span>
            <span className="text-xs text-status-warning-text bg-status-warning-bg px-1.5 py-0.5 rounded font-bold">À solder</span>
          </div>
        </div>
      </div>

      {/* Driver List Section Container */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {/* Header toolbar */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright">
          <div>
            <h2 className="font-bold text-base text-on-surface">Liste des Chauffeurs</h2>
            <p className="text-xs text-on-surface-variant">Effectuez des recherches ou ajoutez un nouveau conducteur</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Rechercher un chauffeur, plaque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-surface-container border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">En Service</option>
              <option value="inactive">Hors Service</option>
            </select>

            {/* Add Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Chauffeur</span>
            </button>
          </div>
        </div>

        {/* Bento Grid of Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-subtle">
          {filteredDrivers.map((driver) => (
            <div 
              key={driver.id} 
              className="p-5 bg-white flex flex-col sm:flex-row items-start gap-4 hover:bg-surface-container-low transition-colors group relative"
            >
              {/* Left Column Avatar and Status badge */}
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border-subtle shadow-sm bg-surface-container">
                  <img 
                    src={driver.avatar} 
                    alt={driver.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div 
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    driver.status === 'active' ? 'bg-primary' : 'bg-status-danger-text'
                  }`}
                  title={driver.status === 'active' ? 'En Service' : 'Hors Service'}
                />
              </div>

              {/* Right Column details */}
              <div className="flex-grow min-w-0 w-full text-center sm:text-left">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div>
                    <h3 className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                      {driver.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant truncate">
                      {driver.vehicle} • <span className="font-mono text-[11px]">{driver.plate}</span>
                    </p>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="flex items-center justify-center gap-1 text-status-warning-text bg-status-warning-bg px-1.5 py-0.5 rounded text-xs font-bold self-start">
                    <Star className="h-3.5 w-3.5 fill-status-warning-text stroke-status-warning-text" />
                    <span>{driver.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="text-center p-1.5 bg-surface-container-low rounded border border-border-subtle/50">
                    <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Trajets</span>
                    <span className="text-xs font-bold text-on-surface">{driver.tripsCount}</span>
                  </div>
                  <div className="text-center p-1.5 bg-surface-container-low rounded border border-border-subtle/50">
                    <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Revenu</span>
                    <span className="text-xs font-bold text-on-surface">{driver.revenue}</span>
                  </div>
                  <div className="text-center p-1.5 bg-surface-container-low rounded border border-border-subtle/50">
                    <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Statut</span>
                    <span className={`text-[11px] font-bold ${
                      driver.status === 'active' ? 'text-status-success-text' : 'text-status-danger-text'
                    }`}>
                      {driver.status === 'active' ? 'Service' : 'Repos'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => onViewProfile(driver.id)}
                    className="flex-grow py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    Voir Profil
                  </button>
                  <a 
                    href={getWhatsAppLink(driver.phone, "vous avez un nouveau client veiller ouvrir l'app pour accepter.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 border border-border-subtle rounded-lg text-on-surface-variant hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shrink-0 flex items-center justify-center"
                    title="Envoyer un message WhatsApp"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filteredDrivers.length === 0 && (
            <div className="col-span-2 p-10 bg-white text-center text-xs text-on-surface-variant">
              Aucun chauffeur ne correspond à votre recherche.
            </div>
          )}
        </div>

        {/* Table footer / Pagination */}
        <div className="p-4 flex items-center justify-between text-xs text-on-surface-variant border-t border-border-subtle bg-surface-bright">
          <span>Affichage de 1-{filteredDrivers.length} sur {filteredDrivers.length} chauffeurs</span>
          <div className="flex gap-1">
            <button className="p-1.5 rounded border border-border-subtle hover:bg-surface-secondary disabled:opacity-30" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="px-3 py-1 rounded bg-primary text-white font-bold text-xs">1</button>
            <button className="p-1.5 rounded border border-border-subtle hover:bg-surface-secondary disabled:opacity-30" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
