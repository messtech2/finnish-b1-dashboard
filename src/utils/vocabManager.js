// 📘 Vocabulary Manager - Persistence + Mastery Tracking
// localStorage = primary database, GitHub = read-only content source

const STORAGE_KEY = 'finnish-vocab-v3';

// ✅ Load all vocabulary from localStorage
export const getAllVocabulary = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load vocabulary:', e);
    return [];
  }
};

// ✅ Save vocabulary to localStorage
const saveVocabulary = (vocab) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocab));
};

// ✅ Add or update word (merge system - no duplicates)
export const saveWord = (enrichedWord) => {
  if (!enrichedWord) return false;
  
  const existing = getAllVocabulary();
  const existingIndex = existing.findIndex(w => w.word.toLowerCase() === enrichedWord.word.toLowerCase());
  
  if (existingIndex !== -1) {
    // Word exists - KEEP existing progress, update example if better
    if (!existing[existingIndex].example && enrichedWord.example) {
      existing[existingIndex].example = enrichedWord.example;
      existing[existingIndex].exampleTranslation = enrichedWord.exampleTranslation;
      saveVocabulary(existing);
      console.log(`🔄 Updated example for: ${enrichedWord.word}`);
    }
    return false; // Not new
  }
  
  // New word - add with default learning state
  const newWord = {
    ...enrichedWord,
    status: 'new',
    correctCount: 0,
    wrongCount: 0,
    lastSeen: new Date().toISOString()
  };
  
  existing.unshift(newWord); // Add to top
  saveVocabulary(existing);
  console.log(`💾 Added new word: ${enrichedWord.word}`);
  return true;
};

// ✅ Save multiple words (batch)
export const saveWords = (enrichedWords) => {
  let added = 0;
  enrichedWords.forEach(word => {
    if (saveWord(word)) added++;
  });
  return added;
};

// ✅ Check if word exists
export const wordExists = (word) => {
  const existing = getAllVocabulary();
  return existing.some(w => w.word.toLowerCase() === word.toLowerCase());
};

// ✅ Get word by word string
export const getWord = (word) => {
  const existing = getAllVocabulary();
  return existing.find(w => w.word.toLowerCase() === word.toLowerCase());
};

// ✅ Update word progress after quiz
export const updateWordProgress = (word, isCorrect) => {
  const existing = getAllVocabulary();
  const index = existing.findIndex(w => w.word.toLowerCase() === word.toLowerCase());
  
  if (index === -1) return false;
  
  // Update counts
  if (isCorrect) {
    existing[index].correctCount = (existing[index].correctCount || 0) + 1;
  } else {
    existing[index].wrongCount = (existing[index].wrongCount || 0) + 1;
  }
  
  // Update last seen
  existing[index].lastSeen = new Date().toISOString();
  
  // Update status based on mastery logic
  const { correctCount, wrongCount } = existing[index];
  if (correctCount >= 3 && wrongCount === 0) {
    existing[index].status = 'mastered';
  } else if (correctCount >= 2) {
    existing[index].status = 'learning';
  } else {
    existing[index].status = 'new';
  }
  
  saveVocabulary(existing);
  return true;
};

// ✅ Get words by status
export const getWordsByStatus = (status) => {
  const all = getAllVocabulary();
  return all.filter(w => w.status === status);
};

// ✅ Get weak words (for review)
export const getWeakWords = () => {
  const all = getAllVocabulary();
  return all.filter(w => (w.wrongCount || 0) > (w.correctCount || 0));
};

// ✅ Get words for quiz (weighted random selection)
export const getWordsForQuiz = (count = 10) => {
  const all = getAllVocabulary();
  if (all.length === 0) return [];
  
  // Separate by status
  const newWords = all.filter(w => w.status === 'new');
  const learningWords = all.filter(w => w.status === 'learning');
  const masteredWords = all.filter(w => w.status === 'mastered');
  
  // Weighted selection: 60% new, 30% learning, 10% mastered
  const selected = [];
  
  // Helper: pick random from array
  const pickRandom = (arr, n) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(n, arr.length));
  };
  
  // Calculate counts
  const newCount = Math.round(count * 0.6);
  const learningCount = Math.round(count * 0.3);
  const masteredCount = count - newCount - learningCount;
  
  // Pick from each group
  selected.push(...pickRandom(newWords, newCount));
  selected.push(...pickRandom(learningWords, learningCount));
  selected.push(...pickRandom(masteredWords, masteredCount));
  
  // Shuffle final result
  return selected.sort(() => 0.5 - Math.random()).slice(0, count);
};

// ✅ Get words for writing practice (exclude mastered)
export const getWordsForWriting = (count = 6) => {
  const all = getAllVocabulary();
  const available = all.filter(w => w.status !== 'mastered');
  
  if (available.length === 0) return [];
  
  // Shuffle and pick
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, available.length));
};

// ✅ Get words for flashcards (prioritize low correctCount)
export const getWordsForFlashcards = (count = 10) => {
  const all = getAllVocabulary();
  if (all.length === 0) return [];
  
  // Sort by correctCount ascending (weakest first)
  const sorted = [...all].sort((a, b) => 
    (a.correctCount || 0) - (b.correctCount || 0)
  );
  
  return sorted.slice(0, count);
};

// ✅ Get progress summary
export const getProgressSummary = () => {
  const all = getAllVocabulary();
  return {
    total: all.length,
    mastered: all.filter(w => w.status === 'mastered').length,
    learning: all.filter(w => w.status === 'learning').length,
    new: all.filter(w => w.status === 'new').length,
    weak: getWeakWords().length
  };
};

// ✅ Delete word (for testing/debugging)
export const deleteWord = (word) => {
  const existing = getAllVocabulary();
  const filtered = existing.filter(w => w.word.toLowerCase() !== word.toLowerCase());
  saveVocabulary(filtered);
  return filtered.length < existing.length;
};

// ✅ Clear all vocabulary (for testing)
export const clearVocabulary = () => {
  localStorage.removeItem(STORAGE_KEY);
  return true;
};
