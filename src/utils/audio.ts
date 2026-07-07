/**
 * Audio synthesizer for DEM Transports reservations using the browser's Web Audio API.
 * This provides a self-contained, offline-first, loud alert sound when a new reservation arrives.
 */

let sharedAudioContext: AudioContext | null = null;

/**
 * Initialise ou réactive l'AudioContext dès le premier clic ou interaction de l'utilisateur.
 * C'est indispensable pour contourner les restrictions d'Autoplay des navigateurs modernes (Chrome, Safari, Firefox).
 * Une fois que l'utilisateur clique n'importe où sur l'application, le navigateur autorise les sons
 * asynchrones même s'ils viennent d'événements réseau en arrière-plan (comme Supabase).
 */
export const initAudioOnFirstInteraction = () => {
  if (typeof window === 'undefined') return;

  const handleInteraction = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!sharedAudioContext) {
          sharedAudioContext = new AudioContextClass();
        }
        if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
          sharedAudioContext.resume().then(() => {
            console.log("🔊 AudioContext déverrouillé avec succès via interaction !");
          });
        }
      }
      // On retire les écouteurs une fois débloqué
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    } catch (e) {
      console.warn("Échec du déverrouillage de l'AudioContext :", e);
    }
  };

  document.addEventListener('click', handleInteraction);
  document.addEventListener('touchstart', handleInteraction);
  document.addEventListener('keydown', handleInteraction);
};

export const playLoudReservationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("L'API Web Audio n'est pas supportée sur ce navigateur.");
      return;
    }
    
    // Utiliser le contexte partagé ou en créer un nouveau
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContextClass();
    }
    
    const ctx = sharedAudioContext;
    
    // Si suspendu (bloqué par le navigateur), on tente de le réactiver
    if (ctx.state === 'suspended') {
      ctx.resume().catch(err => console.warn("Impossible de résumer le contexte audio :", err));
    }
    
    const now = ctx.currentTime;

    // Génération d'un carillon à double tonalité puissant (3 impulsions) pour une visibilité sonore maximale
    const playPulse = (startTime: number, duration: number, freq1: number, freq2: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'triangle';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(freq1, startTime);
      osc2.frequency.setValueAtTime(freq2, startTime);
      
      gainNode.gain.setValueAtTime(0.01, startTime);
      gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.03); // Montée rapide et forte
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(startTime);
      osc2.start(startTime);
      
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    // Arpège puissant de 3 notes de carillon à haute attention :
    playPulse(now, 0.25, 987.77, 1975.53); // Si5 & Si6
    playPulse(now + 0.20, 0.25, 1318.51, 2637.02); // Mi6 & Mi7
    playPulse(now + 0.40, 0.60, 1567.98, 3135.96); // Sol6 & Sol7
    
    console.log("🔊 Son fort de réservation joué avec succès !");
  } catch (err) {
    console.warn("Échec de la lecture du son de notification de réservation :", err);
  }
};
