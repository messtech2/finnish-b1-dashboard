import { useState, useCallback, useRef } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // ✅ FIX: Use ref for mutable audio element (not state)
  const audioRef = useRef(null);

  const fallbackSpeak = useCallback((text) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    const finnishVoice = voices.find(v => 
      v.name.includes('Google') && v.lang.startsWith('fi')
    ) || voices.find(v => 
      v.name.includes('Microsoft') && v.lang.startsWith('fi')
    ) || voices.find(v => v.lang === 'fi-FI') || voices.find(v => v.lang.startsWith('fi'));

    if (finnishVoice) utterance.voice = finnishVoice;

    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text, options = {}) => {
    const textToSpeak = options.sentence || text;
    if (!textToSpeak) return;

    setIsSpeaking(true);

    try {
      if (navigator.onLine) {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSpeak }),
          timeout: 5000
        });

        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          
          // ✅ FIX: Stop and cleanup previous audio via ref
          if (audioRef.current) {
            audioRef.current.pause();
            if (audioRef.current.src) {
              URL.revokeObjectURL(audioRef.current.src);
            }
          }

          const newAudio = new Audio(audioUrl);
          audioRef.current = newAudio; // Store in ref

          newAudio.onended = () => {
            setIsSpeaking(false);
            if (newAudio.src) URL.revokeObjectURL(newAudio.src);
          };

          newAudio.onerror = () => {
            console.warn("Audio failed, using fallback");
            fallbackSpeak(textToSpeak);
          };

          await newAudio.play();
          return;
        }
      }
      fallbackSpeak(textToSpeak);
    } catch (error) {
      console.warn("TTS error, using fallback:", error);
      fallbackSpeak(textToSpeak);
    }
  }, [fallbackSpeak]);

  const stop = useCallback(() => {
    // ✅ FIX: Modify ref value (not state) - this is allowed
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
