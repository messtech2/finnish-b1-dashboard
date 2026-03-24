import { useState, useEffect } from 'react';
import VocabularyForm from '../components/VocabularyForm';
import VocabularyList from '../components/VocabularyList';
import Flashcards from '../components/Flashcards';
import SpeakingPractice from '../components/SpeakingPractice';
import ReadingPractice from '../components/ReadingPractice';
import VocabularyGame from '../components/VocabularyGame';
import DataManagement from '../components/DataManagement';
import DailyMission from '../components/DailyMission';
import { useAchievements } from '../hooks/useAchievements';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import AudioStopButton from '../components/AudioStopButton';
import WritingSession from '../components/WritingSession';

import './Dashboard.css';

const BASE_VOCAB_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const STORAGE_KEY = 'finnish-vocab-v3';

export default function Dashboard() {
  const { getProgress, completeStep, getStats } = useAchievements();
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeWordId, setActiveWordId] = useState(null);
  const itemsPerPage = 10;

  // Load vocabularies from GitHub
  useEffect(() => {
    const loadVocabularies = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/master/vocabularies.json');
        if (!response.ok) throw new Error('Failed to load');
        const baseVocab = await response.json();
        
        let userVocab = [];
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) userVocab = JSON.parse(stored);
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        
        const baseIds = new Set(baseVocab.map(w => w.id));
        const filteredUserVocab = userVocab.filter(w => !baseIds.has(w.id));
        
        const allVocab = [...baseVocab, ...filteredUserVocab].map(w => ({
          difficulty: w.difficulty || 'medium',
          strength: w.strength || 0,
          userExamples: w.userExamples || [],
          category: w.category || 'general',
          ...w
        })).sort((a, b) => a.id - b.id);
        
        setVocabulary(allVocab);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVocabularies();
  }, []);

  // Save user words
  useEffect(() => {
    if (!loading) {
      const userVocab = vocabulary.filter(w => !BASE_VOCAB_IDS.includes(w.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userVocab));
    }
  }, [vocabulary, loading]);

  // CRUD
  const addWord = ({ word, meaning, example, exampleTranslation, category }) => {
    const exists = vocabulary.some(w => w.word.toLowerCase() === word.toLowerCase());
    if (exists) {
      alert('⚠️ Sana on jo listalla!');
      return;
    }
    
    const newWord = {
      id: Date.now(),
      word,
      meaning,
      example: example || `Minä käytän sanaa "${word}".`,
      exampleTranslation: exampleTranslation || `I use the word "${word}".`,
      category: category || 'user',
      difficulty: 'medium',
      strength: 0,
      userExamples: [],
      addedAt: new Date().toISOString(),
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
    if (BASE_VOCAB_IDS.includes(id)) {
      alert('⚠️ Perussanoja ei voi poistaa.');
      return;
    }
    if (window.confirm('Poistetaanko tämä sana?')) {
      setVocabulary(prev => prev.filter(w => w.id !== id));
      if (editingWord?.id === id) setEditingWord(null);
    }
  };

  const stats = getStats();
  const userWordCount = vocabulary.filter(w => w.source === 'user').length;
  const githubWordCount = vocabulary.filter(w => w.source === 'github').length;

  // Pagination
  const totalPages = Math.ceil(vocabulary.length / itemsPerPage);
  const currentWords = vocabulary.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="dashboard dashboard-loading">
        <div className="loading-state">
          <div className="loading-spinner">🇫🇮</div>
          <p>Ladataan...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'vocab', label: 'Sanasto', icon: '📚' },
    { id: 'game', label: 'Peli', icon: '🎮' },
    { id: 'cards', label: 'Kortit', icon: '🎴' },
    { id: 'speaking', label: 'Puhuminen', icon: '🗣️' },
    { id: 'reading', label: 'Lukeminen', icon: '📖' },
    { id: 'writing', label: 'Kirjoitus', icon: '✍️' },  // ← ADD THIS
    



  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <h1>🇫🇮 Suomi B1</h1>
          <p className="header-subtitle">Omnia & YKI Preparation</p>
        </div>
        
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-item">
            <span className="stat-value">{stats.mastered}</span>
            <span className="stat-label">Hallitut</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">Opiskeltavat</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{vocabulary.length}</span>
            <span className="stat-label">Yhteensä</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Left Column: Mission + Form */}
        <div className="dashboard-left">
          <Card className="mission-card">
            <DailyMission allWords={vocabulary} />
          </Card>
          
          <Card className="form-card">
            <VocabularyForm 
              key={editingWord?.id || 'add'}
              onAddWord={addWord} 
              onEditWord={updateWord} 
              editingWord={editingWord}
              onCancelEdit={() => setEditingWord(null)}
            />
          </Card>
          
          <Card className="data-card">
            <DataManagement vocabulary={vocabulary} />
          </Card>
        </div>

        {/* Right Column: Tabbed Learning */}
        <div className="dashboard-right">
          <Tabs tabs={tabs} defaultTab={0}>
            {/* Tab 1: Vocabulary List */}
            <Card className="tab-card">
              <VocabularyList 
                words={currentWords}
                totalWords={vocabulary.length}
                onDelete={deleteWord}
                onEdit={(w) => setEditingWord(w)}
                editingId={editingWord?.id}
                baseIds={BASE_VOCAB_IDS}
                activeWordId={activeWordId}
                setActiveWordId={setActiveWordId}
                getProgress={getProgress}
                completeStep={completeStep}
              />
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    ← Edellinen
                  </button>
                  <span className="page-info">{currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Seuraava →
                  </button>
                </div>
              )}
            </Card>

            {/* Tab 2: Game */}
            <Card className="tab-card">
              <VocabularyGame 
                words={vocabulary} 
                activeWordId={activeWordId}
                onCompleteGameStep={(wordId) => completeStep(wordId, 'game')}
              />
            </Card>

            {/* Tab 3: Flashcards */}
            <Card className="tab-card">
              <Flashcards 
                words={vocabulary} 
                activeWordId={activeWordId}
                setActiveWordId={setActiveWordId}
                onCompletePracticeStep={(wordId) => completeStep(wordId, 'practice')}
              />
            </Card>

            {/* Tab 4: Speaking */}
            <Card className="tab-card">
              <SpeakingPractice />
            </Card>

            {/* Tab 5: Reading */}
            <Card className="tab-card">
              <ReadingPractice />
            </Card>

           
           <Card className="tab-card">
          <WritingSession vocabulary={vocabulary} />
          </Card>
          </Tabs>
        </div>
      </main>

      {/* Global Audio Stop */}
      <AudioStopButton />
    </div>
  );
}
