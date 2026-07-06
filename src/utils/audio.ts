/**
 * Audio synthesizer for DEM Transports reservations using the browser's Web Audio API.
 * This provides a self-contained, offline-first, loud alert sound when a new reservation arrives.
 */
export const playLoudReservationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("L'API Web Audio n'est pas supportée sur ce navigateur.");
      return;
    }
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // We will generate a loud, dual-tone ring/chime sequence (3 pulses of double frequencies)
    // to ensure high audibility and grab immediate attention.
    const playPulse = (startTime: number, duration: number, freq1: number, freq2: number) => {
      // Create primary and secondary oscillators for a richer, louder chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      const gainNode = ctx.createGain();
      
      // Combine a triangle wave (for warm base) and a sine wave (for clean pitch)
      osc1.type = 'triangle';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(freq1, startTime);
      osc2.frequency.setValueAtTime(freq2, startTime);
      
      // Set volume envelope: fast attack, exponential decay for chime sensation
      gainNode.gain.setValueAtTime(0.01, startTime);
      gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.03); // Quick swell to loud level
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      // Route audio graph
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start and schedule stop
      osc1.start(startTime);
      osc2.start(startTime);
      
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    // A fast, loud, high-attention triple-chime arpeggio:
    // Chime 1 (High attention)
    playPulse(now, 0.25, 987.77, 1975.53); // B5 and B6
    
    // Chime 2 (Upwards major third)
    playPulse(now + 0.20, 0.25, 1318.51, 2637.02); // E6 and E7
    
    // Chime 3 (Dominant resolution - loudest and longest)
    playPulse(now + 0.40, 0.60, 1567.98, 3135.96); // G6 and G7
    
    console.log("🔊 Son fort de réservation joué avec succès !");
  } catch (err) {
    console.warn("Échec de la lecture du son de notification de réservation :", err);
  }
};
