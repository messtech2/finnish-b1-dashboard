import { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import Card from './ui/Card';
import './WritingSession.css';

const STORAGE_KEY = 'writing-entries-local';

export default function WritingSession({ vocabulary }) {
  const { speak, isSpeaking } = useTTS();
  const [currentWords, setCurrentWords] = useState([]);
  const [writingText, setWritingText] = useState('');
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [view, setView] = useState('write');
  const [correctedText, setCorrectedText] = useState('');

  // Generate words
  const generateWords = () => {
    if (!vocabulary || vocabulary.length < 5) return;
    const selected = [...vocabulary]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6)
      .filter(w => w.word && w.meaning);
    setCurrentWords(selected);
  };

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load entries:', e);
      }
    }
    generateWords();
  }, [vocabulary]);

  // Save entries to localStorage
  const saveEntries = (newEntries) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  // Save session
  const handleSaveSession = () => {
    if (!writingText.trim() || currentWords.length === 0) {
      alert('Kirjoita jotain ensin!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      words: currentWords,
      originalText: writingText.trim(),
      correctedText: ''
    };

    saveEntries([newEntry, ...entries]);
    setWritingText('');
    generateWords();
    alert('✅ Tallennettu! (Local only)');
  };

  // Open entry
  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setCorrectedText(entry.correctedText || '');
    setView('detail');
  };

  // Save correction
  const handleSaveCorrection = () => {
    if (!selectedEntry) return;
    
    const updated = entries.map(e => 
      e.id === selectedEntry.id 
        ? { ...e, correctedText: correctedText.trim(), updatedAt: new Date().toISOString() }
        : e
    );
    
    saveEntries(updated);
    setSelectedEntry({ ...selectedEntry, correctedText: correctedText.trim() });
    alert('✅ Korjaus tallennettu!');
  };

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Poistetaanko tämä kirjoitus?')) {
      const filtered = entries.filter(e => e.id !== id);
      saveEntries(filtered);
      if (selectedEntry?.id === id) {
        setView('write');
        setSelectedEntry(null);
      }
    }
  };

  // Format date
  const formatDate = (iso) => new Date(iso).toLocaleDateString('fi-FI', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const previewText = (text, max = 50) => 
    text.length <= max ? text : text.substring(0, max) + '...';

  const countWordsUsed = () => 
    currentWords.filter(w => writingText.toLowerCase().includes(w.word.toLowerCase())).length;

  // ✅ Manual GitHub Sync: Copy JSON to clipboard
  const handleCopyForGitHub = () => {
    const data = {
      lastUpdated: new Date().toISOString(),
      entries: entries
    };
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('✅ Kopioitu!\n\nNow:\n1. Open public/user-writing.json\n2. Paste\n3. git add → commit → push');
    }).catch(() => {
      alert('❌ Copy failed. Select and copy manually:\n\n' + json);
    });
  };

  return (
    <Card className="writing-session">
      <div className="session-header">
        <h3>✍️ Kirjoitusharjoitus</h3>
        <div className="header-actions">
          {view !== 'write' && (
            <button className="btn-back" onClick={() => setView('write')} type="button">← Takaisin</button>
          )}
          <button className="btn-history" onClick={() => setView('list')} type="button">
            📚 Historia ({entries.length})
          </button>
          {/* ✅ GitHub Sync Button */}
          <button className="btn-github" onClick={handleCopyForGitHub} type="button">
            📤 GitHub
          </button>
        </div>
      </div>

      {/* VIEW: Write */}
      {view === 'write' && (
        <div className="write-session">
          <div className="words-section">
            <div className="words-header">
              <h4>📦 Sanat:</h4>
              <button className="btn-new-words" onClick={generateWords} type="button">🎲 Uudet</button>
            </div>
            <div className="words-grid">
              {currentWords.map((word, i) => (
                <div key={`${word.id}-${i}`} className="word-item">
                  <span className="word-finnish">{word.word}</span>
                  <span className="word-meaning">{word.meaning}</span>
                  <button className="btn-speak-word" onClick={() => speak(word.word)} type="button">🔊</button>
                </div>
              ))}
            </div>
          </div>

          <div className="writing-section">
            <h4>✍️ Kirjoita:</h4>
            <textarea
              className="writing-textarea"
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="Kirjoita 3-5 lausetta käyttäen yllä olevia sanoja..."
              rows={10}
            />
            <div className="writing-footer">
              <span>{writingText.trim().split(/\s+/).filter(w=>w).length} sanaa</span>
              <button className="btn-save-session" onClick={handleSaveSession} type="button">
                💾 Tallenna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: History */}
      {view === 'list' && (
        <div className="history-list">
          <h4>📚 Kirjoitukset ({entries.length})</h4>
          {entries.length === 0 ? (
            <p className="empty-message">Ei kirjoituksia vielä.</p>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="history-entry">
                <div className="entry-header">
                  <span className="entry-date">{formatDate(entry.createdAt)}</span>
                  <span className={`entry-status ${entry.correctedText ? 'corrected' : 'pending'}`}>
                    {entry.correctedText ? '✅ Korjattu' : '⏳ Odottaa'}
                  </span>
                </div>
                <div className="entry-words">
                  <strong>Sanat:</strong> {entry.words.map(w => w.word).slice(0,4).join(', ')}
                  {entry.words.length > 4 && '...'}
                </div>
                <p className="entry-preview">{previewText(entry.originalText)}</p>
                <div className="entry-actions">
                  <button className="btn-open" onClick={() => handleOpenEntry(entry)} type="button">📖 Avaa</button>
                  <button className="btn-delete" onClick={() => handleDeleteEntry(entry.id)} type="button">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW: Detail */}
      {view === 'detail' && selectedEntry && (
        <div className="entry-detail">
          <div className="detail-header">
            <span className="entry-date">{formatDate(selectedEntry.createdAt)}</span>
          </div>

          <div className="detail-words">
            <h4>📦 Käytetyt sanat:</h4>
            <div className="words-grid">
              {selectedEntry.words.map((word, i) => (
                <div key={`${word.id}-${i}`} className="word-item small">
                  <span className="word-finnish">{word.word}</span>
                  <span className="word-meaning">{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>

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
                  <button className="btn-edit-correction" onClick={() => setCorrectedText(selectedEntry.correctedText)} type="button">
                    ✏️ Muokkaa
                  </button>
                </>
              ) : (
                <>
                  <textarea
                    className="correction-textarea"
                    value={correctedText}
                    onChange={(e) => setCorrectedText(e.target.value)}
                    placeholder="Liitä ChatGPT:n korjaus tähän..."
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
            <button className="btn-back-list" onClick={() => setView('list')} type="button">← Takaisin</button>
          </div>
        </div>
      )}
    </Card>
  );
}
