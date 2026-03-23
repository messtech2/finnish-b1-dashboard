import { useState, useCallback } from 'react';

// Generate unique ID based on word + timestamp
const generateId = (word, prefix = 'base') => {
  const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `${prefix}_${hash}_${Date.now()}`;
};

// Check if two words are duplicates (case-insensitive)
const isDuplicate = (newWord, existingWords) => {
  const newWordNormalized = newWord.word.toLowerCase().trim();
  return existingWords.some(
    existing => existing.word.toLowerCase().trim() === newWordNormalized
  );
};

export function useVocabularyLoader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load vocabulary from GitHub JSON
  const loadFromGitHub = useCallback(async (githubUrl) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(githubUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rawVocab = await response.json();
      
      if (!Array.isArray(rawVocab)) {
        throw new Error('GitHub JSON must be an array');
      }

      // Transform: add auto-generated IDs + defaults
      const timestamp = Date.now();
      const transformed = rawVocab.map((item, index) => ({
        id: generateId(item.word, 'gh'),
        word: item.word?.trim() || '',
        meaning: item.meaning?.trim() || '',
        example: item.example?.trim() || `Minä käytän sanaa "${item.word}".`,
        exampleTranslation: item.exampleTranslation?.trim() || `I use the word "${item.word}".`,
        category: item.category || 'general',
        difficulty: item.difficulty || 'medium',
        strength: 0,
        userExamples: [],
        addedAt: new Date().toISOString(),
        lastReviewed: null,
        nextReview: null,
        source: 'github',
        sourceIndex: index
      }));

      return transformed;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge GitHub vocab with LocalStorage (no duplicates by word)
  const mergeVocabulary = useCallback((githubVocab, localStorageVocab) => {
    // Start with GitHub vocab (master source)
    const merged = [...githubVocab];
    
    // Add LocalStorage words that don't exist in GitHub (by word comparison)
    const githubWords = new Set(githubVocab.map(w => w.word.toLowerCase().trim()));
    
    const newUserWords = localStorageVocab.filter(
      userWord => !githubWords.has(userWord.word.toLowerCase().trim())
    );
    
    merged.push(...newUserWords);
    
    // Sort by word for consistency
    return merged.sort((a, b) => a.word.localeCompare(b.word));
  }, []);

  // Check for new words from GitHub (for update notification)
  const checkForUpdates = useCallback((currentVocab, newGithubVocab) => {
    const currentWords = new Set(currentVocab.map(w => w.word.toLowerCase().trim()));
    const newWords = newGithubVocab.filter(
      w => !currentWords.has(w.word.toLowerCase().trim())
    );
    return newWords;
  }, []);

  return {
    loading,
    error,
    loadFromGitHub,
    mergeVocabulary,
    checkForUpdates,
    generateId,
    isDuplicate
  };
}
