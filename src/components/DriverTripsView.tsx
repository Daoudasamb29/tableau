import React, { useState } from 'react';
import { Trip, Driver } from '../types';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight, 
  User, 
  Phone, 
  Car,
  AlertTriangle,
  X,
  Sparkles,
  HelpCircle,
  Play,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface DriverTripsViewProps {
  trips: Trip[];
  drivers: Driver[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  formatCurrency: (amount: number) => string;
}

export default function DriverTripsView({
  trips,
  drivers,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  formatCurrency
}: DriverTripsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'running' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [boardingPlace, setBoardingPlace] = useState('');
  const [maxPassengers, setMaxPassengers] = useState(15);
  const [price, setPrice] = useState(5000);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Search/Filter logic
  const filteredTrips = trips.filter(trip => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      trip.from.toLowerCase().includes(query) ||
      trip.to.toLowerCase().includes(query) ||
      (trip.driverName || '').toLowerCase().includes(query) ||
      (trip.vehiclePlate || '').toLowerCase().includes(query);

    const tripDbStatus = trip.status === 'Terminé' || trip.status === 'completed' ? 'completed' :
                         trip.status === 'En cours' || trip.status === 'running' ? 'running' : 'pending';

    const matchesStatus = statusFilter === 'all' || tripDbStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Classer selon la date et l'heure en priorité (plus récent en haut).
  // Si disponible, on utilise aussi le timestamp createdAt de Supabase / local.
  const sortedFilteredTrips = [...filteredTrips].sort((a, b) => {
    // 1. Sort by date descending
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    
    // 2. Sort by time descending
    const timeComp = (b.time || '').localeCompare(a.time || '');
    if (timeComp !== 0) return timeComp;

    // 3. Fallback to createdAt timestamp descending if available
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  // Stats Calculations
  const totalTrips = trips.length;
  const activeTripsCount = trips.filter(t => t.status === 'En cours' || t.status === 'running').length;
  
  const totalOccupiedSeats = trips.reduce((acc, t) => acc + (t.passengerCount || 0), 0);
  const totalMaxCapacity = trips.reduce((acc, t) => acc + (t.maxPassengers || 15), 0);
  const occupancyRate = totalMaxCapacity > 0 ? Math.round((totalOccupiedSeats / totalMaxCapacity) * 100) : 0;

  const potentialRevenue = trips.reduce((acc, t) => acc + ((t.price || 5000) * (t.passengerCount || 0)), 0);

  const handleIncrementPassengers = (trip: Trip) => {
    const currentMax = trip.maxPassengers || 15;
    const currentCount = trip.passengerCount || 0;
    if (currentCount < currentMax) {
      const updatedTrip: Trip = {
        ...trip,
        passengerCount: currentCount + 1
      };
      onUpdateTrip(updatedTrip);
    }
  };

  const handleDecrementPassengers = (trip: Trip) => {
    const currentCount = trip.passengerCount || 0;
    if (currentCount > 0) {
      const updatedTrip: Trip = {
        ...trip,
        passengerCount: currentCount - 1
      };
      onUpdateTrip(updatedTrip);
    }
  };

  const handleAdvanceStatus = (trip: Trip) => {
    let nextStatus: 'pending' | 'running' | 'completed' = 'pending';
    
    const currentDbStatus = trip.status === 'Terminé' || trip.status === 'completed' ? 'completed' :
                            trip.status === 'En cours' || trip.status === 'running' ? 'running' : 'pending';

    if (currentDbStatus === 'pending') {
      nextStatus = 'running';
    } else if (currentDbStatus === 'running') {
      nextStatus = 'completed';
    } else {
      return; // Already completed
    }

    const updatedTrip: Trip = {
      ...trip,
      status: nextStatus
    };
    onUpdateTrip(updatedTrip);
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim() || !toCity.trim()) {
      alert('Veuillez remplir les villes de départ et d\'arrivée.');
      return;
    }

    const driver = drivers.find(d => d.id === selectedDriverId);

    const newTrip: Trip = {
      id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      route: `${fromCity} - ${toCity}`,
      from: fromCity,
      to: toCity,
      date,
      time,
      passengerCount: 0,
      maxPassengers,
      status: 'pending',
      boardingPlace: boardingPlace || undefined,
      driverId: driver?.id || undefined,
      driverName: driver?.name || undefined,
      driverPhone: driver?.phone || undefined,
      driverAvatar: driver?.avatar || undefined,
      vehicleName: driver?.vehicle || undefined,
      vehiclePlate: driver?.plate || undefined,
      price,
      createdAt: new Date().toISOString()
    };

    onAddTrip(newTrip);
    
    // Reset Form
    setFromCity('');
    setToCity('');
    setBoardingPlace('');
    setSelectedDriverId('');
    setIsAddModalOpen(false);
  };

  const popularCities = ['Dakar', 'Touba', 'Saint-Louis', 'Thiès', 'Mbour', 'Kaolack', 'Ziguinchor'];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span>Trajets disponibles (driver_trips)</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Suivi en temps réel des lignes interurbaines, de la capacité de chargement et des chauffeurs affectés.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>Publier un trajet</span>
        </button>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Trips */}
        <div className="bg-white border border-border-subtle rounded-xl p-4.5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Total Trajets</span>
            <span className="text-2xl font-bold text-primary mt-1 block">{totalTrips}</span>
          </div>
          <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-2 border-t border-border-subtle/50 pt-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <span>Enregistrés sur la base</span>
          </div>
          <Compass className="absolute right-3.5 top-3.5 h-10 w-10 text-primary/10" />
        </div>

        {/* Active Trips */}
        <div className="bg-white border border-border-subtle rounded-xl p-4.5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">En Cours de Route</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{activeTripsCount}</span>
          </div>
          <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-2 border-t border-border-subtle/50 pt-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Chauffeurs actuellement en voyage</span>
          </div>
          <Clock className="absolute right-3.5 top-3.5 h-10 w-10 text-amber-500/10" />
        </div>

        {/* Occupancy Utilization */}
        <div className="bg-white border border-border-subtle rounded-xl p-4.5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Taux d&apos;Occupation</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{occupancyRate}%</span>
          </div>
          <div className="space-y-1 mt-1">
            <div className="w-full bg-surface-secondary rounded-full h-1.5">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-on-surface-variant">
              <span>{totalOccupiedSeats} réservés</span>
              <span>{totalMaxCapacity} places max</span>
            </div>
          </div>
          <Users className="absolute right-3.5 top-3.5 h-10 w-10 text-emerald-500/10" />
        </div>

        {/* Potential Revenue */}
        <div className="bg-white border border-border-subtle rounded-xl p-4.5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Chiffre d&apos;Affaires Estimé</span>
            <span className="text-2xl font-bold text-cyan-700 mt-1 block">{formatCurrency(potentialRevenue)}</span>
          </div>
          <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-2 border-t border-border-subtle/50 pt-1.5">
            <DollarSign className="h-3.5 w-3.5 text-cyan-600" />
            <span>Basé sur le nombre de passagers</span>
          </div>
          <DollarSign className="absolute right-3.5 top-3.5 h-10 w-10 text-cyan-700/10" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher trajet, chauffeur, plaque..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 self-start md:self-center overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'pending', label: 'En attente' },
            { id: 'running', label: 'En cours' },
            { id: 'completed', label: 'Terminés' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-surface-secondary text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid list */}
      {sortedFilteredTrips.length === 0 ? (
        <div className="bg-white border border-border-subtle rounded-xl p-10 text-center space-y-2">
          <Compass className="h-12 w-12 text-on-surface-variant/40 mx-auto" />
          <h3 className="font-bold text-sm text-on-surface">Aucun trajet trouvé</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-normal">
            Il n&apos;y a aucun trajet correspondant à vos critères de recherche. Publiez-en un nouveau ou modifiez les filtres de recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedFilteredTrips.map(trip => {
            const tripDbStatus = trip.status === 'Terminé' || trip.status === 'completed' ? 'completed' :
                                 trip.status === 'En cours' || trip.status === 'running' ? 'running' : 'pending';

            const capacityPercentage = Math.round(((trip.passengerCount || 0) / (trip.maxPassengers || 15)) * 100);

            return (
              <div 
                key={trip.id} 
                className="bg-white border border-border-subtle rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                
                {/* Upper Route Display */}
                <div className="p-4 border-b border-border-subtle/60 bg-surface-bright/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono tracking-wider">
                      ID : {trip.id}
                    </span>
                    
                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tripDbStatus === 'completed' 
                        ? 'bg-status-success-bg/25 text-status-success-text border border-status-success-bg/40' 
                        : tripDbStatus === 'running' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                    }`}>
                      {tripDbStatus === 'completed' ? 'Terminé' : tripDbStatus === 'running' ? 'En cours' : 'En attente'}
                    </span>
                  </div>

                  {/* Cities Transition */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 shrink-0"></span>
                        <span className="font-bold text-xs text-on-surface truncate">{trip.from}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-on-surface-variant/50 shrink-0 group-hover:translate-x-1 transition-transform" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-xs text-on-surface truncate">{trip.to}</span>
                      </div>
                    </div>
                  </div>

                  {/* Boarding place */}
                  {trip.boardingPlace && (
                    <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">Embarquement : {trip.boardingPlace}</span>
                    </p>
                  )}

                  {/* Date/Time Row */}
                  <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{trip.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{trip.time}</span>
                    </span>
                  </div>
                </div>

                {/* Driver & Vehicle assigned info */}
                <div className="p-4 bg-surface-bright/20 border-b border-border-subtle/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-border-subtle/50 flex items-center justify-center shrink-0">
                    {trip.driverAvatar ? (
                      <img 
                        src={trip.driverAvatar} 
                        alt={trip.driverName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-on-surface truncate">{trip.driverName || 'Chauffeur non affecté'}</p>
                    {trip.driverPhone && (
                      <p className="text-[9px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Phone className="h-2.5 w-2.5" />
                        <span>{trip.driverPhone}</span>
                      </p>
                    )}
                    {trip.vehiclePlate && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold bg-surface-secondary border border-border-subtle px-1.5 py-0.5 rounded font-mono text-primary">
                          {trip.vehiclePlate}
                        </span>
                        <span className="text-[9px] text-on-surface-variant truncate">{trip.vehicleName || 'Toyota Hiace'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Seat occupancy manager */}
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Tarif Voyage</span>
                    <span className="font-bold text-sm text-cyan-700">{formatCurrency(trip.price || 5000)}</span>
                  </div>

                  {/* Seat booking control */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Places ({trip.passengerCount || 0} / {trip.maxPassengers || 15})</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">{capacityPercentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          capacityPercentage >= 90 ? 'bg-status-danger-text' : 
                          capacityPercentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                      />
                    </div>

                    {/* Simulation buttons to change seat bookings in place */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-on-surface-variant italic">Simuler réservations :</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleDecrementPassengers(trip)}
                          disabled={!trip.passengerCount}
                          className="w-6 h-6 rounded bg-surface-secondary hover:bg-surface-container border border-border-subtle flex items-center justify-center text-xs font-bold text-on-surface transition-colors cursor-pointer disabled:opacity-40"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIncrementPassengers(trip)}
                          disabled={(trip.passengerCount || 0) >= (trip.maxPassengers || 15)}
                          className="w-6 h-6 rounded bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary transition-colors cursor-pointer disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer status changer & delete actions */}
                <div className="p-3 bg-surface-bright/50 border-t border-border-subtle/60 flex items-center justify-between gap-2 text-xs">
                  
                  {/* Status update action */}
                  {tripDbStatus === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(trip)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>Démarrer le trajet</span>
                    </button>
                  ) : tripDbStatus === 'running' ? (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(trip)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Terminer le trajet</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-status-success-text font-bold flex items-center gap-1 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Trajet Terminé</span>
                    </span>
                  )}

                  {/* Delete trip action */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Voulez-vous vraiment supprimer ce trajet de la base ?')) {
                        onDeleteTrip(trip.id);
                      }
                    }}
                    className="p-1.5 text-on-surface-variant hover:text-status-danger-text hover:bg-status-danger-bg/20 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer le trajet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over/Modal Form to publish a trip */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl border border-border-subtle max-w-lg w-full shadow-2xl relative overflow-hidden">
            
            {/* Top border strip */}
            <div className="h-1.5 bg-primary w-full" />

            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border-subtle bg-surface-bright">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary animate-spin-slow" />
                <h3 className="font-bold text-sm text-on-surface">Publier un nouveau trajet interurbain</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-surface-secondary rounded-full text-on-surface-variant transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateTrip} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-left">
              
              {/* Route row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Ville de Départ *</label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    required
                  >
                    <option value="">-- Choisir --</option>
                    {popularCities.map(city => (
                      <option key={`from-${city}`} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Ville d&apos;Arrivée *</label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    required
                  >
                    <option value="">-- Choisir --</option>
                    {popularCities.map(city => (
                      <option key={`to-${city}`} value={city} disabled={city === fromCity}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date/Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Date de Départ *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Heure de Départ *</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Price & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Prix du Ticket (FCFA) *</label>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Capacité Voyageurs *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={maxPassengers}
                    onChange={(e) => setMaxPassengers(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Boarding place */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Lieu d&apos;Embarquement / Gare</label>
                <input
                  type="text"
                  placeholder="Ex: Gare Routière des Baux Maraîchers"
                  value={boardingPlace}
                  onChange={(e) => setBoardingPlace(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs focus:outline-none focus:bg-white"
                />
              </div>

              {/* Chauffeur Dropdown selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Chauffeur Assigné *</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">-- Sélectionner un chauffeur --</option>
                  {drivers.map(drv => (
                    <option key={drv.id} value={drv.id}>
                      {drv.name} ({drv.vehicle} - {drv.plate}) {drv.status === 'inactive' ? '🔴 Hors service' : '🟢 En service'}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-on-surface-variant leading-normal">
                  Le choix d&apos;un chauffeur affectera automatiquement ses coordonnées et les informations de son véhicule à la fiche du trajet.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-border-subtle/50">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border-subtle hover:bg-surface-secondary text-on-surface text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 cursor-pointer text-center"
                >
                  Créer et publier
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
