import React, { useState } from 'react';
import { X, User, Phone, Car, Sparkles } from 'lucide-react';
import { Driver } from '../types';

interface NewDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driver: Omit<Driver, 'id' | 'avatar' | 'tripsCount' | 'revenue' | 'rating' | 'hireDate'>) => void;
}

export default function NewDriverModal({
  isOpen,
  onClose,
  onAddDriver,
}: NewDriverModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('Toyota Hiace');
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !plate.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    onAddDriver({
      name,
      phone,
      vehicle,
      plate,
      status,
    });

    // Reset fields
    setName('');
    setPhone('');
    setPlate('');
    setVehicle('Toyota Hiace');
    setStatus('active');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl border border-border-subtle max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Line */}
        <div className="h-1.5 bg-primary w-full" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-subtle bg-surface-bright">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-bold text-sm text-on-surface">Ajouter un nouveau chauffeur</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-secondary rounded-full text-on-surface-variant transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Driver Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Nom complet *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Ex: Babacar Ndiaye"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Numéro de téléphone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <input
                type="tel"
                placeholder="Ex: +221 77 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Vehicle Selection & Plate Number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Véhicule</label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
              >
                <option value="Toyota Hiace">Toyota Hiace</option>
                <option value="Sprinter MB">Sprinter MB</option>
                <option value="Hyundai H1">Hyundai H1</option>
                <option value="Renault Master">Renault Master</option>
                <option value="Citroën Jumper">Citroën Jumper</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Plaque d&apos;immat. *</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Ex: DK-1234-AB"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Init Status */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Prise de poste immédiate ?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modalStatus"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded-full"
                />
                <span className="text-xs font-semibold text-on-surface">Oui (En service)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modalStatus"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded-full"
                />
                <span className="text-xs font-semibold text-on-surface">Non (Hors service)</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t border-border-subtle bg-surface-bright -mx-5 -mb-5 p-4 justify-end rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors border border-border-subtle"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-sm active:scale-95"
            >
              Ajouter Chauffeur
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
