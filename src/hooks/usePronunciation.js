import { useState, useCallback } from 'react';

export function usePronunciation() {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);

  const startListening = useCallback(async (expectedText) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setResult({
        success: false,
        error: 'Speech recognition not supported',
        score: 0
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fi-FI';
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);
    setResult(null);

    recognition.onstart = () => setListening(true);
    
    recognition.onend = () => setListening(false);
    
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript.toLowerCase();
      const expected = expectedText.toLowerCase();
      
      // Calculate similarity score
      const score = calculateSimilarity(spoken, expected);
      
      setResult({
        success: true,
        spoken,
        expected,
        score: Math.round(score),
        feedback: getFeedback(score)
      });
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setResult({
        success: false,
        error: event.error,
        score: 0
      });
      setListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.warn('Failed to start recognition:', error);
      setListening(false);
      setResult({
        success: false,
        error: 'Failed to start',
        score: 0
      });
    }
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
    setListening(false);
  }, []);

  return {
    listening,
    result,
    startListening,
    resetResult
  };
}

// Calculate similarity between two strings (0-100)
function calculateSimilarity(str1, str2) {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  // Simple word-based comparison
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matches = 0;
  words1.forEach(w1 => {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matches++;
    }
  });
  
  const baseScore = (matches / Math.max(words1.length, words2.length)) * 100;
  
  // Bonus for length similarity
  const lengthDiff = Math.abs(s1.length - s2.length);
  const lengthBonus = Math.max(0, 20 - lengthDiff);
  
  return Math.min(100, baseScore + lengthBonus);
}

// Get feedback based on score
function getFeedback(score) {
  if (score >= 90) return { emoji: '🏆', text: 'Erinomainen!' };
  if (score >= 75) return { emoji: '👍', text: 'Hyvä!' };
  if (score >= 50) return { emoji: '😊', text: 'Kohtalainen' };
  return { emoji: '💪', text: 'Harjoittele lisää!' };
}
