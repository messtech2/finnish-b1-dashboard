import { useState, useCallback, useRef, useEffect } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordId, setCurrentWordId] = useState(null); // Track which word is playing
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const voicesRef = useRef([]);
  const voicesLoadedRef = useRef(false);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        voicesLoadedRef.current = true;
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      setTimeout(loadVoices, 200);
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getFinnishVoice = useCallback(() => {
    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;
    
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

  const speak = useCallback((text, options = {}, wordId = null) => {
    const textToSpeak = options.sentence || text;
    if (!textToSpeak) return;

    // Stop any current speech first
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!textToSpeak.trim()) {
      setIsSpeaking(false);
      setCurrentWordId(null);
      return;
    }

    setIsSpeaking(true);
    setCurrentWordId(wordId);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const finnishVoice = getFinnishVoice();
    if (finnishVoice) {
      utterance.voice = finnishVoice;
    }

    utterance.rate = 0.75;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentWordId(wordId);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWordId(null);
      utteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn("Speech error:", event.error);
      }
      setIsSpeaking(false);
      setCurrentWordId(null);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speak failed:", e);
        setIsSpeaking(false);
        setCurrentWordId(null);
      }
    }, 50);
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
    setCurrentWordId(null);
  }, []);

  return { 
    speak, 
    stop, 
    isSpeaking, 
    currentWordId,  // ✅ Expose which word is playing
    isWordPlaying: (wordId) => currentWordId === wordId  // ✅ Helper function
  };
}
