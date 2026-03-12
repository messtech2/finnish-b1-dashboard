import { useState, useEffect } from 'react';
import VocabularyForm from '../components/VocabularyForm';
import VocabularyList from '../components/VocabularyList';
import Flashcards from '../components/Flashcards';
import SpeakingPractice from '../components/SpeakingPractice';
import ReadingPractice from '../components/ReadingPractice';
import VocabularyGame from '../components/VocabularyGame';
import DataManagement from '../components/DataManagement';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Base vocabulary IDs (from JSON file) - CANNOT be deleted
const BASE_VOCAB_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export default function Dashboard() {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load vocabularies from JSON file + LocalStorage on mount
  useEffect(() => {
    const loadVocabularies = async () => {
      try {
        // 1. Load base vocabularies from JSON file
        const response = await fetch('/vocabularies.json');
        const baseVocab = await response.json();
        
        // 2. Get user-added vocabularies from LocalStorage
        const stored = localStorage.getItem('finnish-vocab-v1');
        const userVocab = stored ? JSON.parse(stored) : [];
        
        // 3. Merge both (avoid duplicates by ID)
        const baseIds = new Set(baseVocab.map(w => w.id));
        const newUserVocab = userVocab.filter(w => !baseIds.has(w.id));
        
        // 4. Combine and sort
        const allVocab = [...baseVocab, ...newUserVocab].sort((a, b) => a.id - b.id);
        
        setVocabulary(allVocab);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vocabularies:', error);
        setLoading(false);
      }
    };

    loadVocabularies();
  }, []);

  // Save to LocalStorage whenever vocabulary changes (only user words)
  useEffect(() => {
    if (!loading) {
      // Only save user-added words (not base vocab)
      const userVocab = vocabulary.filter(w => !BASE_VOCAB_IDS.includes(w.id));
      localStorage.setItem('finnish-vocab-v1', JSON.stringify(userVocab));
    }
  }, [vocabulary, loading]);

  const addWord = ({ finnish, meaning }) => {
    const newWord = {
      id: Date.now(),
      finnish,
      meaning,
      addedAt: new Date().toISOString(),
      category: 'user'
    };
    setVocabulary([...vocabulary, newWord]);
    setCurrentPage(1);
  };

  const editWord = (word) => {
    setEditingWord(word);
  };

  const updateWord = (updatedWord) => {
    setVocabulary(vocabulary.map(word => 
      word.id === updatedWord.id ? updatedWord : word
    ));
    setEditingWord(null);
  };

  const deleteWord = (id) => {
    // Prevent deleting base vocabularies
    if (BASE_VOCAB_IDS.includes(id)) {
      alert('⚠️ Cannot delete base vocabulary words. These are permanent.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this word?')) {
      setVocabulary(vocabulary.filter(word => word.id !== id));
      if (editingWord && editingWord.id === id) {
        setEditingWord(null);
      }
      const remainingItems = vocabulary.filter(word => word.id !== id).length;
      const maxPage = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    }
  };

  const cancelEdit = () => {
    setEditingWord(null);
  };

  const importVocabulary = (importedData) => {
    const existingIds = new Set(vocabulary.map(w => w.id));
    const newWords = importedData.filter(w => !existingIds.has(w.id));
    setVocabulary([...vocabulary, ...newWords]);
    setCurrentPage(1);
    alert(`✅ Imported ${newWords.length} new words!`);
  };

  // Pagination Logic
  const totalPages = Math.ceil(vocabulary.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = vocabulary.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const userWordCount = vocabulary.filter(w => !BASE_VOCAB_IDS.includes(w.id)).length;

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner">🇫🇮</div>
          <p>Loading vocabularies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
  <h1>🇫🇮 Suomi B1 Dashboard</h1>
  <p>Omnia & YKI Preparation</p>
  <div className="vocab-stats">
    <span className="stat">📚 Total: {vocabulary.length}</span>
    <span className="stat">📄 Base: {BASE_VOCAB_IDS.length}</span>
    <span className="stat user">✏️ Yours: {userWordCount}</span>
  </div>
  {/* Show install hint on first visit */}
  {!localStorage.getItem('install-hint-shown') && (
    <p className="install-hint">
      💡 Tap <button className="install-hint-btn">📲</button> to install this app!
      <button 
        className="hint-dismiss" 
        onClick={() => localStorage.setItem('install-hint-shown', 'true')}
      >
        ×
      </button>
    </p>
  )}
</header>

      <main>
        <section className="grid-layout">
          <div className="column">
            <div className="card">
              <VocabularyForm 
                key={editingWord?.id || 'add'}
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
                onEdit={editWord}
                editingId={editingWord?.id}
                baseIds={BASE_VOCAB_IDS}
              />
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    ← Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
              
              <div className="page-info">
                Showing {startIndex + 1}-{Math.min(endIndex, vocabulary.length)} of {vocabulary.length} words
              </div>
            </div>

            <div className="card">
              <DataManagement 
                vocabulary={vocabulary} 
                onImport={importVocabulary} 
              />
            </div>
          </div>

          <div className="column">
            <div className="card highlight">
              <h2>🎮 Vocabulary Game</h2>
              <VocabularyGame words={vocabulary} />
            </div>

            <div className="card">
              <h2>🎴 Flashcards</h2>
              <Flashcards words={vocabulary} />
            </div>

            <div className="card">
              <SpeakingPractice />
            </div>

            <div className="card">
              <ReadingPractice />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}