import { useState, useCallback } from "react";

export  function useTTS() {

  const [isSpeaking, setIsSpeaking] = useState(false);

  const fallbackSpeak = (text) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const finnishVoice = voices.find(v => v.lang === "fi-FI");

    if (finnishVoice) {
      utterance.voice = finnishVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const speak = useCallback(async (text) => {

    if (!text) return;

    setIsSpeaking(true);

    try {

      // If offline → fallback immediately
      if (!navigator.onLine) {
        fallbackSpeak(text);
        return;
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.warn("Audio failed, using fallback");
        fallbackSpeak(text);
      };

      await audio.play();

    } catch (error) {

      console.warn("TTS error, using fallback:", error);
      fallbackSpeak(text);

    }

  }, []);

  return {
    speak,
    isSpeaking
  };

}