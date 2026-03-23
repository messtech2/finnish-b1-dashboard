import { useState, useEffect } from 'react';
import VocabularyForm from '../components/VocabularyForm';
import VocabularyList from '../components/VocabularyList';
import Flashcards from '../components/Flashcards';
import SpeakingPractice from '../components/SpeakingPractice';
import ReadingPractice from '../components/ReadingPractice';
import VocabularyGame from '../components/VocabularyGame';
import DataManagement from '../components/DataManagement';
import DailyMission from '../components/DailyMission';
import { useTranslationToggle } from '../hooks/useTranslationToggle';
import { useAchievements } from '../hooks/useAchievements';
import { useVocabularyLoader } from '../hooks/useVocabularyLoader';
import TranslationToggle from '../components/TranslationToggle';

// ✅ YOUR GITHUB RAW URL (update this after pushing vocabularies.json)
const GITHUB_VOCAB_URL = 'https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/main/vocabularies.json';
const STORAGE_KEY = 'finnish-vocab-v3'; // Updated key for new system

export default function Dashboard() {
  const { showEnglish, toggle: toggleEnglish } = useTranslationToggle();
  const { getProgress, completeStep, getStats } = useAchievements();
  const { loading: vocabLoading, error: vocabError, loadFromGitHub, mergeVocabulary, checkForUpdates } = useVocabularyLoader();
  
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeWordId, setActiveWordId] = useState(null);
  const [githubUpdateAvailable, setGithubUpdateAvailable] = useState(false);
  const itemsPerPage = 10;

  // ✅ Load vocabulary from GitHub + LocalStorage on mount
  useEffect(() => {
    const loadAllVocabulary = async () => {
      try {
        // 1. Load from GitHub (master source)
        const githubVocab = await loadFromGitHub(GITHUB_VOCAB_URL);
        
        // 2. Load user vocab from LocalStorage
        let localStorageVocab = [];
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            localStorageVocab = JSON.parse(stored);
            console.log(`📦 Loaded ${localStorageVocab.length} user words from LocalStorage`);
          }
        } catch (storageError) {
          console.warn('LocalStorage load error:', storageError);
          localStorageVocab = [];
        }
        
        // 3. Merge (GitHub + user words, no duplicates by word)
        const merged = mergeVocabulary(githubVocab, localStorageVocab);
        
        // 4. Check for new words from GitHub
        const storedGithubVocab = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-github`) || '[]');
        if (storedGithubVocab.length > 0) {
          const newWords = checkForUpdates(storedGithubVocab, githubVocab);
          if (newWords.length > 0) {
            setGithubUpdateAvailable(true);
            console.log(`🆕 ${newWords.length} new words available from GitHub!`);
          }
        }
        
        // 5. Save GitHub vocab separately (for update detection)
        localStorage.setItem(`${STORAGE_KEY}-github`, JSON.stringify(githubVocab));
        
        setVocabulary(merged);
        console.log(`✅ Total vocabulary: ${merged.length} (GitHub: ${githubVocab.length}, User: ${localStorageVocab.length})`);
      } catch (error) {
        console.error('Failed to load vocabulary:', error);
        // Fallback: try LocalStorage only
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setVocabulary(JSON.parse(stored));
          }
        } catch (fallbackError) {
          setVocabulary([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadAllVocabulary();
  }, [loadFromGitHub, mergeVocabulary, checkForUpdates]);

  // ✅ Save user words to LocalStorage (not GitHub words)
  useEffect(() => {
    if (!loading && vocabulary.length > 0) {
      try {
        // Only save user-added words (source !== 'github')
        const userVocab = vocabulary.filter(w => w.source !== 'github');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userVocab));
        console.log(`💾 Saved ${userVocab.length} user words to LocalStorage`);
      } catch (error) {
        console.error('Failed to save vocabulary:', error);
        if (error.name === 'QuotaExceededError') {
          alert('⚠️ Storage full! Please delete some words.');
        }
      }
    }
  }, [vocabulary, loading]);

  // CRUD operations
  const addWord = ({ word, meaning, example, exampleTranslation, category }) => {
    // Check for duplicates by word (case-insensitive)
    const exists = vocabulary.some(
      w => w.word.toLowerCase().trim() === word.toLowerCase().trim()
    );
    
    if (exists) {
      alert(`⚠️ Word "${word}" already exists!`);
      return;
    }
    
    const newWord = {
      id: `user_${Date.now()}`,
      word,
      meaning,
      example: example || `Minä käytän sanaa "${word}".`,
      exampleTranslation: exampleTranslation || `I use the word "${word}".`,
      category: category || 'user',
      difficulty: 'medium',
      strength: 0,
      userExamples: [],
      addedAt: new Date().toISOString(),
      lastReviewed: null,
      nextReview: null,
      source: 'user'
    };
    
    setVocabulary(prev => [...prev, newWord]);
    setCurrentPage(1);
    setEditingWord(null);
  };

  const updateWord = (updatedWord) => {
    setVocabulary(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
    setEditingWord(null);
  };

  const deleteWord = (id) => {
    const wordToDelete = vocabulary.find(w => w.id === id);
    if (wordToDelete?.source === 'github') {
      alert('⚠️ Cannot delete GitHub vocabulary words. You can hide them or add your own.');
      return;
    }
    if (window.confirm('Haluatko varmasti poistaa tämän sanan?')) {
      setVocabulary(prev => prev.filter(w => w.id !== id));
      if (editingWord && editingWord.id === id) {
        setEditingWord(null);
      }
    }
  };

  const cancelEdit = () => setEditingWord(null);

  // Refresh from GitHub
  const refreshFromGitHub = async () => {
    setLoading(true);
    try {
      const githubVocab = await loadFromGitHub(GITHUB_VOCAB_URL);
      const stored = localStorage.getItem(STORAGE_KEY);
      const localStorageVocab = stored ? JSON.parse(stored) : [];
      const merged = mergeVocabulary(githubVocab, localStorageVocab);
      localStorage.setItem(`${STORAGE_KEY}-github`, JSON.stringify(githubVocab));
      setVocabulary(merged);
      setGithubUpdateAvailable(false);
      alert(`✅ Updated from GitHub! ${githubVocab.length} words loaded.`);
    } catch (error) {
      alert(`❌ Failed to refresh: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(vocabulary.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = vocabulary.slice(startIndex, endIndex);

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const userWordCount = vocabulary.filter(w => w.source === 'user').length;
  const githubWordCount = vocabulary.filter(w => w.source === 'github').length;
  const stats = getStats();

  if (loading || vocabLoading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner">🇫🇮</div>
          <p>Ladataan sanastoa GitHubista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>🇫🇮 Suomi B1 Dashboard</h1>
        <p>Omnia & YKI Preparation</p>
        
        <div className="header-actions">
          <TranslationToggle showEnglish={showEnglish} onToggle={toggleEnglish} />
          {githubUpdateAvailable && (
            <button onClick={refreshFromGitHub} className="github-update-btn">
              🆕 Päivitä GitHubista
            </button>
          )}
        </div>
        
        <div className="achievement-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.mastered}</span>
            <span className="stat-label">🏆 Hallitut</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.inProgress}</span>
            <span className="stat-label">📚 Opiskeltavat</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{vocabulary.length}</span>
            <span className="stat-label">📝 Yhteensä</span>
          </div>
        </div>

        <div className="vocab-stats">
          <span className="stat">📚 Yhteensä: {vocabulary.length}</span>
          <span className="stat">🌐 GitHub: {githubWordCount}</span>
          <span className="stat user">✏️ Omat: {userWordCount}</span>
        </div>
      </header>

      <main>
        <section className="grid-layout">
          <div className="column">
            <div className="card highlight-mission">
              <DailyMission allWords={vocabulary} />
            </div>

            <div className="card">
              <VocabularyForm 
                key={editingWord?.id || 'add-mode'}
                onAddWord={addWord} 
                onEditWord={updateWord} 
                editingWord={editingWord}
                onCancelEdit={cancelEdit}
              />
            </div>
            
            <div className="card">
              <VocabularyList 
                words={currentWords}
                totalWords={vocabulary.length}
                onDelete={deleteWord}
                onEdit={(w) => setEditingWord(w)}
                editingId={editingWord?.id}
                baseIds={[]}
                showEnglish={showEnglish}
                activeWordId={activeWordId}
                setActiveWordId={setActiveWordId}
                getProgress={getProgress}
                completeStep={completeStep}
              />
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={prevPage} disabled={currentPage === 1} className="page-btn">← Edellinen</button>
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => goToPage(page)} className={`page-number ${currentPage === page ? 'active' : ''}`}>{page}</button>
                    ))}
                  </div>
                  <button onClick={nextPage} disabled={currentPage === totalPages} className="page-btn">Seuraava →</button>
                </div>
              )}
              <div className="page-info">Näytetään {startIndex + 1}-{Math.min(endIndex, vocabulary.length)} / {vocabulary.length} sanaa</div>
            </div>

            <div className="card">
              <DataManagement 
                vocabulary={vocabulary} 
                onRefreshGitHub={refreshFromGitHub}
              />
            </div>
          </div>

          <div className="column">
            <div className="card highlight">
              <h2>🎮 Sanavisailu</h2>
              <VocabularyGame 
                words={vocabulary} 
                showEnglish={showEnglish}
                activeWordId={activeWordId}
                onCompleteGameStep={(wordId) => completeStep(wordId, 'game')}
              />
            </div>

            <div className="card">
              <h2>🎴 Flashcards</h2>
              <Flashcards 
                words={vocabulary} 
                showEnglish={showEnglish}
                activeWordId={activeWordId}
                setActiveWordId={setActiveWordId}
                onCompletePracticeStep={(wordId) => completeStep(wordId, 'practice')}
              />
            </div>

            <div className="card">
              <SpeakingPractice showEnglish={showEnglish} />
            </div>

            <div className="card">
              <ReadingPractice showEnglish={showEnglish} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
