import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTTS } from '../hooks/useTTS';
import Card from './ui/Card';
import './WritingChallenge.css';

const STORAGE_KEY = 'writing-challenge-words';
const STORAGE_DATE_KEY = 'writing-challenge-date';
const STORAGE_MODE_KEY = 'writing-challenge-mode';

export default function WritingChallenge({ vocabulary }) {
  const { speak, isSpeaking } = useTTS();
  const [mode, setMode] = useState('mixed');
  const [currentWords, setCurrentWords] = useState([]);
  const [completed, setCompleted] = useState(false);

  // ✅ Generate writing words (useCallback to prevent recreation)
  const generateWords = useCallback(() => {
    if (!vocabulary || vocabulary.length < 5) return;

    let selected = [];

    if (mode === 'easy' && vocabulary.length >= 8) {
      // 🔹 Helppo: Pick from same category
      const categories = [...new Set(vocabulary.map(w => w.category).filter(Boolean))];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categoryWords = vocabulary.filter(w => w.category === randomCategory);
      
      if (categoryWords.length >= 5) {
        selected = [...categoryWords].sort(() => 0.5 - Math.random()).slice(0, 6);
      } else {
        selected = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 6);
      }
    } else {
      // 🔸 Sekalainen: Fully random
      selected = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    selected = selected.filter(w => w.word && w.meaning);
    setCurrentWords(selected);
    setCompleted(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    localStorage.setItem(STORAGE_DATE_KEY, new Date().toDateString());
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  }, [vocabulary, mode]);

  // ✅ Load saved words on mount ONLY (no mode dependency)
  useEffect(() => {
    if (vocabulary.length === 0) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const savedDate = localStorage.getItem(STORAGE_DATE_KEY);
    const savedMode = localStorage.getItem(STORAGE_MODE_KEY);
    const today = new Date().toDateString();

    // Load saved mode
    if (savedMode) {
      setMode(savedMode);
    }

    // If saved words exist AND it's the same day, load them
    if (saved && savedDate === today) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCurrentWords(parsed);
          return;
        }
      } catch (e) {
        console.warn('Failed to load saved words:', e);
      }
    }

    // Otherwise generate new words (only on mount)
    generateWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabulary.length]); // Only depend on vocabulary length, not generateWords

  // ✅ Handle speak
  const handleSpeak = () => {
    const text = currentWords.map(w => `${w.word}. ${w.example || ''}`).join(' ');
    speak(text);
  };

  // ✅ Handle regenerate
  const handleRegenerate = () => {
    if (window.confirm('Haluatko varmasti uudet sanat?')) {
      generateWords();
    }
  };

  // ✅ Handle mode change - DIRECTLY generate new words
  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Small delay to ensure mode state updates first
    setTimeout(() => {
      generateWords();
    }, 50);
  };

  // ✅ Handle complete
  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      generateWords();
    }, 2000);
  };

  if (!vocabulary || vocabulary.length < 5) {
    return (
      <Card className="writing-challenge empty">
        <h3>✍️ Kirjoitushaaste</h3>
        <p>⚠️ Lisää vähintään 5 sanaa aloittaaksesi!</p>
      </Card>
    );
  }

  return (
    <Card className="writing-challenge">
      <div className="writing-header">
        <h3>✍️ Kirjoitushaaste</h3>
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${mode === 'easy' ? 'active' : ''}`}
            onClick={() => handleModeChange('easy')}
            type="button"
          >
            🔹 Helppo
          </button>
          <button 
            className={`mode-btn ${mode === 'mixed' ? 'active' : ''}`}
            onClick={() => handleModeChange('mixed')}
            type="button"
          >
            🔸 Sekalainen
          </button>
        </div>
      </div>

      <div className="writing-instruction">
        <p><strong>Tehtävä:</strong> Kirjoita lyhyt kappale (3–5 lausetta). Yritä käyttää ainakin 3–5 sanaa yllä olevasta listasta.</p>
      </div>

      <div className="words-section">
        <div className="words-header">
          <span className="words-label">📦 Sanasi:</span>
          <div className="words-actions">
            <button className="action-btn speak" onClick={handleSpeak} disabled={isSpeaking || currentWords.length === 0} type="button">
              {isSpeaking ? '🔊' : '🔈'} Kuuntele
            </button>
            <button className="action-btn regenerate" onClick={handleRegenerate} type="button">
              🎲 Uudet sanat
            </button>
          </div>
        </div>

        <div className="words-grid">
          {currentWords.map((word, index) => (
            <div key={`${word.id || index}-${index}`} className="word-card">
              <div className="word-finnish">{word.word}</div>
              <div className="word-meaning">{word.meaning}</div>
              {word.example && (
                <div className="word-example">{word.example}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="writing-tips">
        <h4>💡 Vinkkejä:</h4>
        <ul>
          <li>Käytä sanoja luonnollisissa lauseissa</li>
          <li>Älä huoli virheistä - tärkeintä on kirjoittaa!</li>
          <li>Yritä kirjoittaa 3–5 lausetta</li>
          <li>Lue teksti ääneen valmistuttua</li>
        </ul>
      </div>

      <div className="writing-actions">
        <button 
          className={`complete-btn ${completed ? 'done' : ''}`}
          onClick={handleComplete}
          disabled={completed}
          type="button"
        >
          {completed ? '✅ Suoritettu! Uudet sanat ladataan...' : '📝 Merkitse tehdyksi'}
        </button>
      </div>

      {completed && (
        <div className="success-message animate-fade-in">
          <span className="success-emoji">🎉</span>
          <p>Hieno työ! Uudet sanat ladataan...</p>
        </div>
      )}
    </Card>
  );
}
