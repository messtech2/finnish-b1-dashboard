import { useState } from "react";

export default function usePronunciation() {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ Improved comparison - more forgiving for Finnish
  const compareWords = (target, spoken) => {
    if (!target || !spoken) return 0;
    
    // Normalize both strings
    target = target.toLowerCase().trim().replace(/[.,!?]/g, '');
    spoken = spoken.toLowerCase().trim().replace(/[.,!?]/g, '');
    
    // Remove common Finnish filler words
    const fillers = ['niin', 'no', 'öö', 'äh', 'siis', 'niinku'];
    fillers.forEach(f => {
      spoken = spoken.replace(new RegExp(`\\b${f}\\b`, 'g'), '');
    });
    
    // Check for partial match (word contains target or vice versa)
    if (spoken.includes(target) || target.includes(spoken)) {
      return 100;
    }
    
    // Check for character similarity (Levenshtein-like)
    let match = 0;
    const minLength = Math.min(target.length, spoken.length);
    
    for (let i = 0; i < minLength; i++) {
      if (target[i] === spoken[i]) {
        match++;
      }
    }
    
    // Boost score if first 3 characters match (important for Finnish)
    if (target.slice(0, 3) === spoken.slice(0, 3)) {
      match += 3;
    }
    
    const baseScore = Math.round((match / target.length) * 100);
    
    // Cap at 100, minimum 20 if some match
    return Math.min(100, Math.max(20, baseScore));
  };

  const startListening = (targetWord) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("🎤 Puheentunnistus ei ole tuettu tässä selaimessa.\n\nKäytä Chromea tai Edgeä parhaan tuloksen saavuttamiseksi.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "fi-FI";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3; // Get multiple alternatives
    recognition.continuous = false;

    setListening(true);
    setResult(null);

    recognition.start();

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      
      // Try all alternatives and pick best score
      let bestScore = 0;
      let bestSpoken = spoken;
      
      for (let i = 0; i < event.results[0].length; i++) {
        const alternative = event.results[0][i].transcript;
        const score = compareWords(targetWord, alternative);
        if (score > bestScore) {
          bestScore = score;
          bestSpoken = alternative;
        }
      }

      setResult({
        spoken: bestSpoken,
        target: targetWord,
        score: bestScore,
        feedback: getFeedback(bestScore)
      });

      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setResult({
        spoken: '',
        target: targetWord,
        score: 0,
        feedback: getFeedback(0),
        error: true,
        errorMessage: event.error
      });
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const getFeedback = (score) => {
    if (score >= 90) return '🏆 Täydellinen! Erinomainen!';
    if (score >= 75) return '👍 Hyvä! Melkein oikein!';
    if (score >= 50) return '💪 Koita uudelleen! Pääset jo lähelle!';
    if (score >= 20) return '🎯 Kuuntele mallia ja yritä uudelleen!';
    return '🎤 En kuullut selkeästi. Yritä hitaammin!';
  };

  const resetResult = () => setResult(null);

  return { startListening, listening, result, resetResult };
}