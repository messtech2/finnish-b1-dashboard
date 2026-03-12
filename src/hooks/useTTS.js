import { useState, useEffect } from 'react';

export function useTTS() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Find best Finnish voice (prefer female, natural)
      const finnishVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('fi')
      );
      
      // Priority: Google Finnish > Female > Any Finnish
      const bestVoice = finnishVoices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Female') ||
        voice.name.includes('Nainen')
      ) || finnishVoices[0];
      
      if (bestVoice) {
        setSelectedVoice(bestVoice);
      }
    };

    loadVoices();
    
    // Voices load asynchronously in some browsers
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech');
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use selected Finnish voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Finnish language
    utterance.lang = 'fi-FI';
    
    // Natural speech settings
    utterance.rate = options.rate || 0.85;  // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.1; // Slightly higher for natural sound
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking, voices, selectedVoice, setSelectedVoice };
}