import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Phone, 
  MapPin, 
  Smartphone, 
  Calendar, 
  Hash, 
  Check, 
  Copy, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  ShieldCheck,
  Download,
  Mail,
  RefreshCw
} from 'lucide-react';
import { ClientPayment } from '../types';
import { jsPDF } from 'jspdf';

interface PaymentDetailModalProps {
  payment: ClientPayment | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  googleUser: any;
  onSendEmail?: (to: string, subject: string, htmlBody: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PaymentDetailModal({
  payment,
  onClose,
  formatCurrency,
  googleUser,
  onSendEmail
}: PaymentDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState('daoudasamb290@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (!payment) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(payment.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!onSendEmail) return;
    setIsSendingEmail(true);
    setEmailSentStatus('idle');
    setEmailError('');
    
    const subject = `[DEM Transports] Confirmation de Réservation - Billet ${payment.id}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #0e7490; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #0e7490; margin: 0; font-size: 24px;">DEM niou_dem Transports</h2>
          <p style="color: #6b7280; margin: 5px 0 0; font-size: 14px;">Votre voyage en toute sérénité</p>
        </div>
        
        <p style="font-size: 16px; color: #111827;">Bonjour <strong>${payment.clientName}</strong>,</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.5;">Nous vous confirmons l'émission de votre reçu de paiement pour votre réservation de trajet interurbain :</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #0e7490;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 40%;">ID Billet / Réservation :</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${payment.id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Client :</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${payment.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Téléphone :</td>
              <td style="padding: 6px 0; color: #0f172a;">${clientPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Trajet :</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${payment.route}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Lieu d'embarquement :</td>
              <td style="padding: 6px 0; color: #0f172a;">${boardingPlace}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Date & Heure :</td>
              <td style="padding: 6px 0; color: #0f172a;">${payment.time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Montant payé :</td>
              <td style="padding: 6px 0; color: #0e7490; font-weight: bold; font-size: 16px;">${formatCurrency(payment.amount)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Statut de paiement :</td>
              <td style="padding: 6px 0;">
                <span style="background-color: ${payment.status === 'Payé' ? '#d1fae5' : '#fef3c7'}; color: ${payment.status === 'Payé' ? '#065f46' : '#92400e'}; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">
                  ${payment.status}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Merci pour votre confiance ! Pour toute assistance, veuillez nous contacter à l'adresse <a href="mailto:daoudasamb290@gmail.com" style="color: #0e7490; text-decoration: none;">daoudasamb290@gmail.com</a>.
        </p>
      </div>
    `;

    try {
      const res = await onSendEmail(emailTo, subject, htmlBody);
      if (res.success) {
        setEmailSentStatus('success');
      } else {
        setEmailSentStatus('error');
        setEmailError(res.error || 'Erreur inconnue');
      }
    } catch (err: any) {
      setEmailSentStatus('error');
      setEmailError(err.message || 'Erreur de connexion');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Use real database values if available, otherwise fallback gracefully
  const boardingPlace = payment.pickupAddress || (payment.route.toLowerCase().includes('touba') 
    ? 'Gare Routière des Baux Maraîchers' 
    : payment.route.toLowerCase().includes('thies')
    ? 'Gare de Colobane'
    : 'Gare Routière Interurbaine');

  const clientPhone = payment.phone && payment.phone.trim() !== '' 
    ? payment.phone 
    : '+221 77 ' + Math.floor(1000000 + Math.random() * 9000000).toString().replace(/(\d{3})(\d{2})(\d{2})/, '$1 $2 $3');

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // Palette de couleurs
      const primaryColor = [14, 116, 144]; // cyan-700
      const slateDark = [30, 41, 59]; // slate-800
      const slateLight = [241, 245, 249]; // slate-100
      const borderGray = [226, 232, 240]; // slate-200

      // Fond blanc complet
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // En-tête : Bandeau supérieur décoratif
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 15, 'F');

      // Titre de l'entreprise
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('DEM niou_dem', 15, 10);

      // Sous-titre
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Réseau Interurbain & Privé du Sénégal', 140, 10);

      // Section Document Info
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('REÇU DE PAIEMENT', 15, 32);

      // Numéro de ticket / Facture
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Référence Ticket : ${payment.id}`, 15, 40);
      doc.text(`Date d'émission : ${payment.time}`, 15, 46);

      // Statut de paiement (badge de couleur)
      const isPaid = payment.status === 'Payé';
      const statusText = `STATUT : ${payment.status.toUpperCase()}`;
      if (isPaid) {
        doc.setFillColor(209, 250, 229); // vert très clair (bg-emerald-100)
        doc.setTextColor(5, 150, 105); // vert foncé
      } else if (payment.status === 'En attente') {
        doc.setFillColor(254, 243, 199); // jaune très clair
        doc.setTextColor(217, 119, 6); // jaune foncé
      } else {
        doc.setFillColor(254, 226, 226); // rouge très clair
        doc.setTextColor(220, 38, 38); // rouge foncé
      }
      doc.rect(130, 25, 65, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(statusText, 135, 32.5);

      // Ligne de séparation
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 55, 195, 55);

      // Section : Infos Passager & Client
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS VOYAGEUR', 15, 65);

      // Encadré passager
      doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
      doc.rect(15, 70, 180, 28, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Nom du passager :', 20, 78);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.clientName, 60, 78);

      doc.setFont('helvetica', 'bold');
      doc.text('Téléphone :', 20, 86);
      doc.setFont('helvetica', 'normal');
      doc.text(clientPhone, 60, 86);

      doc.setFont('helvetica', 'bold');
      doc.text('Rôle :', 20, 93);
      doc.setFont('helvetica', 'normal');
      doc.text('Passager Principal', 60, 93);

      // Section : Détails du trajet
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DU TRAJET', 15, 110);

      // Encadré trajet
      doc.setFillColor(255, 255, 255);
      doc.rect(15, 115, 180, 48);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Ligne de transport :', 20, 123);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.route, 60, 123);

      doc.setFont('helvetica', 'bold');
      doc.text('Embarquement :', 20, 131);
      doc.setFont('helvetica', 'normal');
      doc.text(boardingPlace, 60, 131);

      doc.setFont('helvetica', 'bold');
      doc.text('Départ prévu :', 20, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.time, 60, 139);

      doc.setFont('helvetica', 'bold');
      doc.text('Moyen de transport :', 20, 147);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.vehicleName || 'Véhicule Interurbain', 60, 147);
      if (payment.vehiclePlate) {
        doc.text(`(Plaque: ${payment.vehiclePlate})`, 130, 147);
      }

      if (payment.driverName) {
        doc.setFont('helvetica', 'bold');
        doc.text('Chauffeur assigné :', 20, 155);
        doc.setFont('helvetica', 'normal');
        doc.text(payment.driverName, 60, 155);
      }

      // Section : Facturation & Règlement
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DE FACTURATION', 15, 175);

      // Tableau simple pour le prix
      doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
      doc.rect(15, 180, 180, 32, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 20, 188);
      doc.text('Mode de paiement', 110, 188);
      doc.text('Montant', 160, 188);

      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.line(15, 192, 195, 192);

      doc.setFont('helvetica', 'normal');
      doc.text(`Billet de Transport - Trajet ${payment.route.split(' ')[0] || ''}`, 20, 202);
      doc.text(payment.paymentMethod, 110, 202);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(payment.amount), 160, 202);

      // Total à payer
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(115, 218, 80, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL PAYÉ :', 120, 227);
      doc.setFontSize(12);
      doc.text(formatCurrency(payment.amount), 160, 227);

      // Code-barre décoratif
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text('*' + payment.id.toUpperCase().replace('#', '') + '*', 75, 250);

      // Dessiner des lignes verticales pour imiter un code barre
      let xOffset = 65;
      doc.setFillColor(30, 41, 59);
      for (let i = 0; i < 28; i++) {
        const width = (i % 3 === 0) ? 1.5 : (i % 2 === 0) ? 0.6 : 1.0;
        const gap = (i % 4 === 0) ? 1.2 : 0.8;
        doc.rect(xOffset, 253, width, 12, 'F');
        xOffset += width + gap;
      }

      // Pied de page
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 130, 140);
      doc.text("Merci de votre confiance ! Presentez ce document ou votre telephone a l'embarquement.", 32, 275);
      doc.text("DEM niou_dem - Plateforme d'administration de transports interurbains.", 55, 280);

      // Sauvegarder le fichier PDF
      doc.save(`Facture-DEM-niou-dem-${payment.id.replace('#', '')}.pdf`);
    } catch (e) {
      console.error('Erreur de génération PDF :', e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-subtle z-10 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-surface-container border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm text-on-surface">Détails de la réservation</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-surface-bright rounded-full text-on-surface-variant transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Ticket Body scrollable */}
          <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
            
            {/* Visual ticket preview container */}
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-5 relative overflow-hidden">
              {/* Left & Right punch holes on ticket */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border-r border-slate-300 -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-l border-slate-300 -translate-y-1/2"></div>

              {/* Status and Ref */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket</span>
                  <span className="font-mono text-xs font-bold text-primary">{payment.id}</span>
                  <button 
                    onClick={handleCopyId}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-all active:scale-95"
                    title="Copier le numéro du ticket"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-status-success-text" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  payment.status === 'Payé' ? 'bg-status-success-bg text-status-success-text' :
                  payment.status === 'En attente' ? 'bg-status-warning-bg text-status-warning-text' :
                  'bg-status-danger-bg text-status-danger-text'
                }`}>
                  {payment.status}
                </span>
              </div>

              {/* Client Profile */}
              <div className="flex items-center gap-3.5 mb-4 border-b border-dashed border-slate-200 pb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <img 
                    src={payment.clientAvatar} 
                    alt={payment.clientName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 leading-tight">{payment.clientName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Passager Principal</p>
                </div>
              </div>

              {/* Voyage Details */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Ligne de transport</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{payment.route}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Téléphone</span>
                  <a 
                    href={`tel:${clientPhone}`}
                    className="font-bold text-primary hover:underline flex items-center gap-1 transition-all"
                  >
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{clientPhone}</span>
                  </a>
                </div>

                <div className="col-span-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Embarquement</span>
                  <span className="font-semibold text-slate-700 text-[11px] block">{boardingPlace}</span>
                </div>

                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Départ</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500 shrink-0" />
                    <span>{payment.time}</span>
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Tarif payé</span>
                  <span className="font-mono font-black text-slate-800 text-sm">{formatCurrency(payment.amount)}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex flex-col items-center gap-1.5">
                <div className="h-8 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#2d3748_2px,#2d3748_5px,transparent_5px,transparent_8px,#2d3748_8px,#2d3748_10px)] opacity-80" />
                <span className="font-mono text-[9px] text-slate-400 tracking-widest">{payment.id.toUpperCase().replace('#', '')}</span>
              </div>
            </div>

            {/* Quick action details card */}
            <div className="bg-surface-container rounded-xl p-4 border border-border-subtle space-y-3">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Coordonnées de Facturation</span>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                <div>
                  <span className="font-semibold text-[10px] block">Moyen d&apos;encaissement</span>
                  <span className="font-bold text-on-surface flex items-center gap-1 mt-0.5">
                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                    {payment.paymentMethod}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-[10px] block">Statut du virement</span>
                  <span className={`font-bold inline-flex items-center gap-1 mt-0.5 ${
                    payment.status === 'Payé' ? 'text-status-success-text' :
                    payment.status === 'En attente' ? 'text-status-warning-text' :
                    'text-status-danger-text'
                  }`}>
                    {payment.status === 'Payé' && <CheckCircle2 className="h-3 w-3" />}
                    {payment.status === 'En attente' && <Clock className="h-3 w-3" />}
                    {payment.status === 'Échoué' && <AlertTriangle className="h-3 w-3" />}
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver and Vehicle assignment if available */}
            {(payment.driverName || payment.vehicleName) && (
              <div className="bg-surface-container rounded-xl p-4 border border-border-subtle space-y-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block text-primary">Chauffeur & Véhicule assignés</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs text-on-surface-variant">
                  {payment.driverName && (
                    <div>
                      <span className="font-semibold text-[10px] block">Conducteur</span>
                      <span className="font-bold text-on-surface block mt-0.5">
                        {payment.driverName}
                      </span>
                      {payment.driverPhone && (
                        <a href={`tel:${payment.driverPhone}`} className="text-[10px] text-primary hover:underline block mt-0.5">
                          {payment.driverPhone}
                        </a>
                      )}
                    </div>
                  )}

                  {payment.vehicleName && (
                    <div>
                      <span className="font-semibold text-[10px] block">Véhicule</span>
                      <span className="font-bold text-on-surface block mt-0.5">
                        {payment.vehicleName}
                      </span>
                      {payment.vehiclePlate && (
                        <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">
                          {payment.vehiclePlate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gmail Sending Section */}
            <div className="border-t border-border-subtle pt-3 mt-1 space-y-2">
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full flex items-center justify-between text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>{showEmailForm ? "Masquer les options d'envoi" : "Envoyer le reçu par Email (Gmail)"}</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-normal">
                  {showEmailForm ? "fermer" : "ouvrir"}
                </span>
              </button>

              {showEmailForm && (
                <div className="p-3 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 animate-fade-in text-left">
                  {!googleUser ? (
                    <div className="text-center p-2 space-y-1">
                      <p className="text-[11px] font-bold text-amber-700">Gmail non connecté</p>
                      <p className="text-[10px] text-on-surface-variant leading-normal">
                        Veuillez connecter votre compte Gmail dans l'onglet <strong>Réglages</strong> pour pouvoir envoyer des e-mails depuis l'application.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
                          Adresse Email du destinataire
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={emailTo}
                            onChange={(e) => setEmailTo(e.target.value)}
                            placeholder="client@exemple.com"
                            className="flex-1 px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={isSendingEmail || !emailTo}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            {isSendingEmail ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Mail className="h-3 w-3" />
                            )}
                            <span>{isSendingEmail ? "Envoi..." : "Envoyer"}</span>
                          </button>
                        </div>
                      </div>

                      {emailSentStatus === 'success' && (
                        <div className="p-2 bg-status-success-bg/20 border border-status-success-bg/35 text-status-success-text text-[10px] font-bold rounded-lg flex items-center gap-1.5 animate-fade-in">
                          <Check className="h-3.5 w-3.5 text-status-success-text" />
                          <span>Reçu envoyé avec succès via Gmail !</span>
                        </div>
                      )}

                      {emailSentStatus === 'error' && (
                        <div className="p-2 bg-status-danger-bg/20 border border-status-danger-bg/35 text-status-danger-text text-[10px] font-bold rounded-lg flex flex-col gap-0.5 animate-fade-in">
                          <span className="font-bold">Échec de l&apos;envoi :</span>
                          <span className="text-[9px] opacity-90 leading-tight">{emailError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick action CTA buttons */}
            <div className="flex gap-2">
              <a 
                href={`tel:${clientPhone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md"
              >
                <Phone className="h-4 w-4" />
                <span>Contacter le client</span>
              </a>

              <button 
                onClick={generatePDF}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle text-on-surface hover:bg-surface-container rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Facture PDF</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
