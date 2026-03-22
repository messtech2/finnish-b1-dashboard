import { useState, useCallback } from 'react';

export function useSRS() {
  const [srsData, setSrsData] = useState(() => {
    const stored = localStorage.getItem('finnish-srs-v1');
    return stored ? JSON.parse(stored) : {};
  });

  const saveSRS = useCallback((newData) => {
    setSrsData(newData);
    localStorage.setItem('finnish-srs-v1', JSON.stringify(newData));
  }, []);

  const updateStrength = useCallback((wordId, rating) => {
    const now = Date.now();
    
    // ✅ FIX: Removed unused 'current' variable
    const strengthMap = { forgot: 1, hard: 2, good: 3, easy: 5 };
    const newStrength = Math.min(5, Math.max(1, strengthMap[rating] || 3));
    
    const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    const daysUntilReview = intervals[newStrength] || 7;
    const nextReview = now + (daysUntilReview * 24 * 60 * 60 * 1000);

    const updated = {
      ...srsData,
      [wordId]: { strength: newStrength, lastReviewed: now, nextReview }
    };

    saveSRS(updated);
    return updated[wordId];
  }, [srsData, saveSRS]);

  const getDueWords = useCallback((allWords) => {
    if (!allWords || !Array.isArray(allWords)) return [];
    const now = Date.now();
    return allWords.filter(word => {
      if (!word?.id) return false;
      const srs = srsData[word.id];
      if (!srs) return true;
      if (!srs.nextReview) return true;
      return srs.nextReview <= now;
    });
  }, [srsData]);

  const getWordsByDifficulty = useCallback((allWords, difficulty) => {
    if (!allWords || !Array.isArray(allWords)) return [];
    return allWords.filter(word => word.difficulty === difficulty);
  }, []);

  const resetWord = useCallback((wordId) => {
    const updated = { ...srsData };
    delete updated[wordId];
    saveSRS(updated);
  }, [srsData, saveSRS]);

  return { srsData, updateStrength, getDueWords, getWordsByDifficulty, resetWord };
}
