import { useState, useCallback } from 'react';

export function useAchievements() {
  // Load achievements from LocalStorage
  const [achievements, setAchievements] = useState(() => {
    const stored = localStorage.getItem('finnish-achievements');
    return stored ? JSON.parse(stored) : {};
  });

  // Save to LocalStorage whenever achievements change
  const saveAchievements = useCallback((newAchievements) => {
    setAchievements(newAchievements);
    localStorage.setItem('finnish-achievements', JSON.stringify(newAchievements));
  }, []);

  // Mark a step as completed for a word
  const completeStep = useCallback((wordId, step) => {
    const now = Date.now();
    const current = achievements[wordId] || {
      steps: {},
      completed: false,
      masteredAt: null
    };

    const updated = {
      ...achievements,
      [wordId]: {
        ...current,
        steps: {
          ...current.steps,
          [step]: { completed: true, completedAt: now }
        },
        completed: current.steps.read && current.steps.practice && current.steps.game,
        masteredAt: (current.steps.read && current.steps.practice && current.steps.game) 
          ? now 
          : current.masteredAt
      }
    };

    saveAchievements(updated);
    return updated[wordId];
  }, [achievements, saveAchievements]);

  // Get progress for a word
  const getProgress = useCallback((wordId) => {
    const achievement = achievements[wordId];
    if (!achievement) return { read: false, practice: false, game: false, mastered: false, percent: 0 };
    
    const steps = achievement.steps || {};
    const read = !!steps.read;
    const practice = !!steps.practice;
    const game = !!steps.game;
    const mastered = achievement.completed || false;
    const percent = (read ? 33 : 0) + (practice ? 33 : 0) + (game ? 33 : 0);

    return { read, practice, game, mastered, percent };
  }, [achievements]);

  // ✅ FIX: Get all mastered words (clean, no unused var warnings)
  const getMasteredWords = useCallback(() => {
    if (!achievements || typeof achievements !== 'object') return [];
    
    return Object.keys(achievements)
      .filter((wordId) => {
        const data = achievements[wordId];
        return data && data.completed === true;
      })
      .map((wordId) => Number(wordId))
      .filter((id) => !Number.isNaN(id)); // Ensure valid numbers only
  }, [achievements]);

  // Reset progress for a word
  const resetWord = useCallback((wordId) => {
    const updated = { ...achievements };
    delete updated[wordId];
    saveAchievements(updated);
  }, [achievements, saveAchievements]);

  // Get total stats
  const getStats = useCallback(() => {
    if (!achievements || typeof achievements !== 'object') {
      return { total: 0, mastered: 0, inProgress: 0 };
    }
    
    const total = Object.keys(achievements).length;
    const mastered = Object.values(achievements).filter((a) => a && a.completed === true).length;
    const inProgress = total - mastered;
    
    return { total, mastered, inProgress };
  }, [achievements]);

  return {
    achievements,
    completeStep,
    getProgress,
    getMasteredWords,
    resetWord,
    getStats
  };
}
