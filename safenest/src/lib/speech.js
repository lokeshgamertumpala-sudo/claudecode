// Speech utility for SafeNest alerts
// Uses Web Speech API

let isMuted = false;

export const setMute = (muted) => {
  isMuted = muted;
};

export const speakAlert = (alertType) => {
  if (isMuted) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  let message = '';
  switch (alertType) {
    case 'flood':
      message = 'SafeNest alert. Flood warning for Hyderabad. Stay inside. Do not walk in water. I can help you call your family or official helpline 1 1 2.';
      break;
    case 'heat':
      message = 'SafeNest alert. Heat warning for Hyderabad. Stay hydrated. Avoid direct sunlight. I can help you find cooling centers or medical assistance.';
      break;
    default:
      message = 'SafeNest alert. Please check your surroundings and follow safety instructions.';
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.volume = 1.0;

  // Optional: set voice to a specific one if available
  // utterance.voice = speechSynthesis.getVoices().find(v => v.lang === 'en-US');

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

export default {
  speakAlert,
  stopSpeaking,
  setMute
};
