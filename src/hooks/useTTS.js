import { useState, useCallback, useRef, useEffect } from 'react';

// ✅ Smart Finnish Voice Selector
const getBestFinnishVoice = (voices) => {
  if (!voices || voices.length === 0) return null;

  // Priority list: best Finnish voices by name
  const priorityVoices = [
    "Google suomi",
    "Google Suomi",
    "Microsoft Noora",
    "Microsoft Heidi", 
    "Microsoft Katri",
    "Suomi",
    "Finnish"
  ];

  // 1. Try priority voices first
  for (let priorityName of priorityVoices) {
    const found = voices.find(v => 
      v.name.toLowerCase().includes(priorityName.toLowerCase())
    );
    if (found) {
      console.log('🎤 [TTS] Selected priority voice:', found.name);
      return found;
    }
  }

  // 2. Fallback: any Finnish voice with female indicator
  const finnishFemale = voices.find(v =>
    v.lang?.toLowerCase().startsWith('fi') &&
    (v.name.toLowerCase().includes('female') ||
     v.name.toLowerCase().includes('nainen') ||
     v.name.toLowerCase().includes('noora') ||
     v.name.toLowerCase().includes('heidi'))
  );
  if (finnishFemale) {
    console.log('🎤 [TTS] Selected Finnish female voice:', finnishFemale.name);
    return finnishFemale;
  }

  // 3. Fallback: any Finnish voice
  const finnish = voices.find(v => v.lang?.toLowerCase().startsWith('fi'));
  if (finnish) {
    console.log('🎤 [TTS] Selected Finnish voice:', finnish.name);
    return finnish;
  }

  console.warn('⚠️ [TTS] No Finnish voice found, using default');
  return null;
};

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  // ✅ Load voices on mount
  useEffect(() => {
    console.log('🔊 [TTS] Initializing...');
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      const bestVoice = getBestFinnishVoice(availableVoices);
      setSelectedVoice(bestVoice);
      
      console.log('🎤 [TTS] Available Finnish voices:', 
        availableVoices.filter(v => v.lang?.startsWith('fi')).map(v => v.name)
      );
    };

    // Load immediately
    loadVoices();

    // Listen for voiceschanged event (Chrome)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Retry after delay (some browsers load voices async)
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 2000);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      // Stop any playing audio on unmount
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    };
  }, []);

  // ✅ Speak with sentence splitting for natural flow
  const speak = useCallback((text) => {
    if (!text?.trim() || !window.speechSynthesis) {
      console.warn('⚠️ [TTS] No text or speechSynthesis not available');
      return;
    }

    console.log('▶️ [TTS] Speaking:', text.substring(0, 50) + '...');

    // Stop any existing speech
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);

    // ✅ Split long text into sentences for natural pauses
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentSentenceIndex = 0;

    const speakNext = () => {
      if (currentSentenceIndex >= sentences.length) {
        console.log('⏹️ [TTS] All sentences spoken');
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const sentence = sentences[currentSentenceIndex].trim();
      if (!sentence) {
        currentSentenceIndex++;
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utteranceRef.current = utterance;

      // Use selected voice or best Finnish voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const bestVoice = getBestFinnishVoice(window.speechSynthesis.getVoices());
        if (bestVoice) utterance.voice = bestVoice;
      }

      // ✅ Optimized settings for natural Finnish
      utterance.lang = 'fi-FI';
      utterance.rate = 0.9;      // Natural speed (not too fast)
      utterance.pitch = 1.05;    // Slightly higher = more natural female tone
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('▶️ [TTS] Sentence', currentSentenceIndex + 1, 'started');
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        console.log('⏹️ [TTS] Sentence', currentSentenceIndex + 1, 'ended');
        currentSentenceIndex++;
        if (currentSentenceIndex < sentences.length) {
          // Small pause between sentences
          setTimeout(speakNext, 200);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          utteranceRef.current = null;
        }
      };

      utterance.onerror = (event) => {
        console.error('❌ [TTS] Error:', event.error);
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    };

    // Start speaking
    setIsPlaying(true);
    speakNext();

  }, [selectedVoice]);

  // ✅ Pause current speech
  const pause = useCallback(() => {
    console.log('⏸️ [TTS] Pause called');
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  // ✅ Resume paused speech
  const resume = useCallback(() => {
    console.log('▶️ [TTS] Resume called');
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, []);

  // ✅ Stop all speech
  const stop = useCallback(() => {
    console.log('🛑 [TTS] Stop called');
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // ✅ Toggle play/pause
  const toggle = useCallback((text) => {
    if (!text) return;
    
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  }, [isPlaying, isPaused, speak, pause, resume]);

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice
  };
}
