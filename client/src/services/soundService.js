/**
 * Web Audio API synthesizer for reliable audio alarms & chimes
 * Zero external mp3 dependencies, works immediately on any browser.
 */

let audioCtx = null;
let currentAlarmInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a gentle musical chime
 */
export function playChimeNote(freq = 523.25, type = 'sine', duration = 0.4) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

/**
 * Play Pleasant Repeating Alarm for Scheduled Medicine
 */
export function startMedicineAlarmSound() {
  stopAlarmSound();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 pleasant arpeggio
  let idx = 0;

  const playSequence = () => {
    playChimeNote(notes[idx % notes.length], 'sine', 0.35);
    idx++;
  };

  playSequence();
  currentAlarmInterval = setInterval(playSequence, 400);
}

/**
 * Play Alert sound for Missed Dose (Elderly warning sound)
 */
export function playMissedDoseSound() {
  stopAlarmSound();
  // Urgent 2-tone alert
  playChimeNote(440, 'triangle', 0.3);
  setTimeout(() => playChimeNote(349.23, 'sawtooth', 0.5), 250);
}

/**
 * Play distinctive Caretaker Missed Alert sound
 */
export function playCaretakerAlertSound() {
  stopAlarmSound();
  // Triple alert tone for Caretaker attention
  playChimeNote(784, 'square', 0.2);
  setTimeout(() => playChimeNote(880, 'square', 0.2), 180);
  setTimeout(() => playChimeNote(1046.5, 'square', 0.35), 360);
}

/**
 * Play happy success sound when medicine is taken
 */
export function playTakenSuccessSound() {
  playChimeNote(523.25, 'sine', 0.2);
  setTimeout(() => playChimeNote(659.25, 'sine', 0.2), 150);
  setTimeout(() => playChimeNote(783.99, 'sine', 0.4), 300);
}

/**
 * Emergency SOS Siren
 */
export function startSirenSound() {
  stopAlarmSound();
  let high = true;
  const toggleSiren = () => {
    playChimeNote(high ? 880 : 587, 'sawtooth', 0.4);
    high = !high;
  };
  toggleSiren();
  currentAlarmInterval = setInterval(toggleSiren, 450);
}

/**
 * Stop any looping alarm sound
 */
export function stopAlarmSound() {
  if (currentAlarmInterval) {
    clearInterval(currentAlarmInterval);
    currentAlarmInterval = null;
  }
}
