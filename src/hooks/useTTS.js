import { useState, useCallback, useRef, useEffect } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const voicesRef = useRef([]);
  const voicesLoadedRef = useRef(false);

  // Load voices on mount (Chrome/Edge need this)
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        voicesLoadedRef.current = true;
      }
    };

    // Load immediately
    loadVoices();

    // Listen for async voice loading (Chrome/Edge)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      // Chrome sometimes needs a delay
      setTimeout(loadVoices, 200);
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Get best Finnish voice from cached list
  const getFinnishVoice = useCallback(() => {
    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;
    
    // Priority: Google > Microsoft > Any Finnish
    return voices.find(v => 
      v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith('fi')
    ) || voices.find(v => 
      v.name.toLowerCase().includes('microsoft') && v.lang.toLowerCase().startsWith('fi')
    ) || voices.find(v => 
      v.lang === 'fi-FI'
    ) || voices.find(v => 
      v.lang.toLowerCase().startsWith('fi')
    ) || null;
  }, []);

  const speak = useCallback((text, options = {}) => {
    const textToSpeak = options.sentence || text;
    if (!textToSpeak) return;

    // Stop any current speech cleanly
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Don't speak empty strings
    if (!textToSpeak.trim()) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // Use browser SpeechSynthesis (reliable, works offline)
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Wait a bit for voices to load if needed
    const speakAfterLoad = () => {
      const finnishVoice = getFinnishVoice();
      if (finnishVoice) {
        utterance.voice = finnishVoice;
      }

      // Optimized for Finnish pronunciation
      utterance.rate = 0.75;    // Slower for long vowels
      utterance.pitch = 1.0;    // Natural pitch
      utterance.volume = 1.0;   // Full volume

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = (event) => {
        // Only log actual errors, not "canceled"
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.warn("Speech synthesis error:", event.error);
        }
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // If voices loaded, speak immediately; otherwise wait briefly
    if (voicesLoadedRef.current) {
      speakAfterLoad();
    } else {
      // Wait up to 500ms for voices, then speak anyway
      const checkInterval = setInterval(() => {
        if (voicesLoadedRef.current) {
          clearInterval(checkInterval);
          speakAfterLoad();
        }
      }, 100);
      
      // Fallback: speak after 500ms even if voices not loaded
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!utteranceRef.current) {
          speakAfterLoad();
        }
      }, 500);
    }
  }, [getFinnishVoice]);

  const stop = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
