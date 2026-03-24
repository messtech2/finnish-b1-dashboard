import { useState, useEffect, useCallback } from 'react';
import { useTTS } from '../hooks/useTTS';
import Card from './ui/Card';
import './WritingSession.css';

const STORAGE_KEY = 'writing-entries';

export default function WritingSession({ vocabulary }) {
  const { speak, isSpeaking } = useTTS();
  const [currentWords, setCurrentWords] = useState([]);
  const [writingText, setWritingText] = useState('');
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [view, setView] = useState('write'); // 'write' | 'list' | 'detail'
  const [correctedText, setCorrectedText] = useState('');

  // Generate writing words
  const generateWords = useCallback(() => {
    if (!vocabulary || vocabulary.length < 5) return;
    const selected = [...vocabulary]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6)
      .filter(w => w.word && w.meaning);
    setCurrentWords(selected);
  }, [vocabulary]);

  // Load entries on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.sort((a, b) => b.date - a.date));
      } catch (e) {
        console.warn('Failed to load entries:', e);
      }
    }
    generateWords();
  }, [generateWords]);

  // Save entries
  const saveEntries = (newEntries) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setEntries(newEntries.sort((a, b) => b.date - a.date));
  };

  // Handle speak word
  const handleSpeakWord = (word) => {
    speak(word.word, { sentence: word.example });
  };

  // Handle save session
  const handleSaveSession = () => {
    if (!writingText.trim()) {
      alert('Kirjoita jotain ensin!');
      return;
    }
    if (currentWords.length === 0) {
      alert('Ei sanoja valittuna!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: Date.now(),
      words: currentWords,
      originalText: writingText.trim(),
      correctedText: ''
    };

    saveEntries([...entries, newEntry]);
    setWritingText('');
    generateWords();
    alert('✅ Kirjoitus tallennettu!');
  };

  // Handle open entry
  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setCorrectedText(entry.correctedText || '');
    setView('detail');
  };

  // Handle save correction
  const handleSaveCorrection = () => {
    const updatedEntries = entries.map(entry =>
      entry.id === selectedEntry.id
        ? { ...entry, correctedText: correctedText.trim() }
        : entry
    );
    saveEntries(updatedEntries);
    setSelectedEntry({ ...selectedEntry, correctedText: correctedText.trim() });
    alert('✅ Korjaus tallennettu!');
  };

  // Handle delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Haluatko varmasti poistaa tämän kirjoituksen?')) {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      saveEntries(updatedEntries);
      if (selectedEntry?.id === id) {
        setView('write');
        setSelectedEntry(null);
      }
    }
  };

  // Handle new session
  const handleNewSession = () => {
    if (writingText.trim() && !window.confirm('Haluatko aloittaa uuden session? Nykyinen teksti katoaa.')) {
      return;
    }
    generateWords();
    setWritingText('');
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fi-FI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Preview text
  const previewText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Count words used from list
  const countWordsUsed = () => {
    let count = 0;
    currentWords.forEach(w => {
      if (writingText.toLowerCase().includes(w.word.toLowerCase())) {
        count++;
      }
    });
    return count;
  };

  return (
    <Card className="writing-session">
      <div className="session-header">
        <h3>✍️ Kirjoitusharjoitus</h3>
        <div className="header-actions">
          {view !== 'write' && (
            <button className="btn-back" onClick={() => setView('write')} type="button">
              ← Takaisin
            </button>
          )}
          <button className="btn-history" onClick={() => setView('list')} type="button">
            📚 Historia ({entries.length})
          </button>
        </div>
      </div>

      {/* VIEW: Write Session */}
      {view === 'write' && (
        <div className="write-session">
          {/* Words Section */}
          <div className="words-section">
            <div className="words-header">
              <h4>📦 Sanat tähän kirjoitukseen:</h4>
              <button className="btn-new-words" onClick={handleNewSession} type="button">
                🎲 Uudet sanat
              </button>
            </div>
            <div className="words-grid">
              {currentWords.map((word, index) => (
                <div key={`${word.id || index}-${index}`} className="word-item">
                  <div className="word-content">
                    <span className="word-finnish">{word.word}</span>
                    <span className="word-meaning">{word.meaning}</span>
                  </div>
                  <button 
                    className="btn-speak-word"
                    onClick={() => handleSpeakWord(word)}
                    disabled={isSpeaking}
                    title="Kuuntele"
                    type="button"
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Section */}
          <div className="writing-section">
            <div className="writing-header">
              <h4>✍️ Kirjoita kappale:</h4>
              <span className="words-used-indicator">
                Käytetty {countWordsUsed()}/{currentWords.length} sanaa
              </span>
            </div>
            <textarea
              className="writing-textarea"
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="Kirjoita kappale (3-5 lausetta) käyttäen yllä olevia sanoja..."
              rows={10}
            />
            <div className="writing-footer">
              <span className="word-count">
                {writingText.trim() ? writingText.trim().split(/\s+/).length : 0} sanaa
              </span>
              <button className="btn-save-session" onClick={handleSaveSession} type="button">
                💾 Tallenna kirjoitus
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="writing-tips">
            <h4>💡 Vinkkejä:</h4>
            <ul>
              <li>Yritä käyttää ainakin 3-5 sanaa yllä olevasta listasta</li>
              <li>Kirjoita 3-5 lausetta</li>
              <li>Älä huoli virheistä - tärkeintä on harjoitella!</li>
              <li>Kuuntele sanoja 🔊 painikkeesta</li>
            </ul>
          </div>
        </div>
      )}

      {/* VIEW: History List */}
      {view === 'list' && (
        <div className="history-list">
          <h4>📚 Kirjoitushistoria ({entries.length})</h4>
          {entries.length === 0 ? (
            <p className="empty-message">Ei kirjoituksia vielä. Aloita kirjoittamalla!</p>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="history-entry">
                <div className="entry-header">
                  <span className="entry-date">{formatDate(entry.date)}</span>
                  <span className={`entry-status ${entry.correctedText ? 'corrected' : 'pending'}`}>
                    {entry.correctedText ? '✅ Korjattu' : '⏳ Odottaa korjausta'}
                  </span>
                </div>
                <div className="entry-words">
                  <strong>Sanat:</strong> {entry.words.map(w => w.word).join(', ')}
                </div>
                <p className="entry-preview">{previewText(entry.originalText)}</p>
                <div className="entry-actions">
                  <button className="btn-open" onClick={() => handleOpenEntry(entry)} type="button">
                    📖 Avaa
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteEntry(entry.id)} type="button">
                    🗑️ Poista
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW: Entry Detail */}
      {view === 'detail' && selectedEntry && (
        <div className="entry-detail">
          <div className="detail-header">
            <span className="entry-date">{formatDate(selectedEntry.date)}</span>
          </div>

          {/* Words Used */}
          <div className="detail-words">
            <h4>📦 Käytetyt sanat:</h4>
            <div className="words-grid">
              {selectedEntry.words.map((word, index) => (
                <div key={`${word.id || index}-${index}`} className="word-item small">
                  <span className="word-finnish">{word.word}</span>
                  <span className="word-meaning">{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="comparison-container">
            <div className="comparison-column original">
              <h4>❌ Sinun versiosi</h4>
              <div className="text-display">{selectedEntry.originalText}</div>
            </div>

            <div className="comparison-column corrected">
              <h4>✅ Korjattu versio</h4>
              {selectedEntry.correctedText ? (
                <>
                  <div className="text-display">{selectedEntry.correctedText}</div>
                  <button 
                    className="btn-edit-correction" 
                    onClick={() => setCorrectedText(selectedEntry.correctedText)} 
                    type="button"
                  >
                    ✏️ Muokkaa korjausta
                  </button>
                </>
              ) : (
                <>
                  <textarea
                    className="correction-textarea"
                    value={correctedText}
                    onChange={(e) => setCorrectedText(e.target.value)}
                    placeholder="Liitä korjattu versio tähän (esim. ChatGPT:stä)..."
                    rows={8}
                  />
                  <button className="btn-save-correction" onClick={handleSaveCorrection} type="button">
                    💾 Tallenna korjaus
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn-back-list" onClick={() => setView('list')} type="button">
              ← Takaisin listaan
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
