import { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import Card from '../ui/Card';
import './ReadingModule.css';

const GITHUB_URL = 'https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/master/public/yki-reading-texts.json';
const STORAGE_KEY = 'yki-reading-texts';
const COMMON_WORDS = new Set(['ja', 'on', 'ei', 'etta', 'mina', 'sina', 'han', 'me', 'te', 'he', 'tama', 'tuo', 'se', 'nyt', 'sitten', 'kun', 'jos', 'vaikka', 'mutta', 'olla', 'tehd', 'menn', 'tulla', 'hyv', 'huono']);

const extractVocab = (text) => {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 4 && !COMMON_WORDS.has(w)).slice(0, 10);
};

const generateQs = (text, vocab) => {
  const qs = [];
  const count = text.split(/\s+/).length;
  if (vocab[0]) qs.push({ id: 'q1', type: 'true-false', question: 'Tekstissa mainitaan "' + vocab[0] + '".', correct: true });
  qs.push({ id: 'q2', type: 'multiple-choice', question: 'Montako sanaa tekstissa on?', options: ['<20', '20-50', '50-100', '>100'], correct: count < 20 ? 0 : count < 50 ? 1 : count < 100 ? 2 : 3 });
  return qs;
};

const saveWord = (word) => {
  const vocab = JSON.parse(localStorage.getItem('finnish-vocab-v3') || '[]');
  if (!vocab.some(w => w.word.toLowerCase() === word.toLowerCase()) && word.length > 2) {
    vocab.push({ id: Date.now(), word, meaning: '', example: '', category: 'yki-reading', difficulty: 'medium', addedAt: new Date().toISOString() });
    localStorage.setItem('finnish-vocab-v3', JSON.stringify(vocab));
    return true;
  }
  return false;
};

export default function ReadingModule({ mode }) {
  const { speak } = useTTS();
  const [texts, setTexts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(1800);
  const [timerActive, setTimerActive] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ State for add-text form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState({ title: '', text: '', level: 'B1' });

  const currentText = texts[currentIndex];

  // Load texts
  useEffect(() => { loadTexts(); }, [mode]);

  const loadTexts = async () => {
  setLoading(true);
  try {
    const res = await fetch(GITHUB_URL + '?t=' + Date.now());
    let data = { texts: [] };
    
    if (res.ok) {
      data = await res.json();
    } else if (res.status === 404) {
      // File doesn't exist yet - that's ok, use empty array
      console.log('📝 No yki-reading-texts.json yet - using empty list');
    }
    
    const processed = (data.texts || []).map(t => ({ 
      ...t, 
      keywords: t.keywords || extractVocab(t.text), 
      questions: t.questions || generateQs(t.text, extractVocab(t.text)) 
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastUpdated: new Date().toISOString(), texts: processed }));
    
    let filtered = processed;
    if (mode === 'exam') filtered = processed.filter(t => t.state === 'new' && !t.usedInExam);
    else if (mode === 'review') filtered = processed.filter(t => t.state === 'practiced' || t.state === 'mastered');
    
    setTexts(filtered);
  } catch (e) {
    // Silent fail - use localStorage fallback
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const data = JSON.parse(local);
      let filtered = data.texts || [];
      if (mode === 'exam') filtered = filtered.filter(t => t.state === 'new' && !t.usedInExam);
      else if (mode === 'review') filtered = filtered.filter(t => t.state === 'practiced' || t.state === 'mastered');
      setTexts(filtered);
    }
  }
  
  setAnswers({}); setShowResults(false); setHighlightedWord(null); setCurrentIndex(0);
  if (mode === 'exam') { setTimer(1800); setTimerActive(true); } else { setTimerActive(false); }
  setLoading(false);
};

  // Timer
  useEffect(() => { 
    if (!timerActive || timer <= 0) return; 
    const id = setInterval(() => setTimer(t => t - 1), 1000); 
    return () => clearInterval(id); 
  }, [timerActive, timer]);

  // ✅ Handle word click - save to vocab
  const handleWordClick = (word) => {
    if (mode === 'exam') return;
    const clean = word.replace(/[^a-z]/gi, '');
    if (clean.length < 3) return;
    const saved = saveWord(clean);
    setHighlightedWord(clean);
    alert(saved ? '✅ "' + clean + '" tallennettu!' : 'ℹ️ On jo sanastossa');
  };

  // ✅ Handle answer selection
  const handleAnswer = (qid, ans) => { 
    if (mode === 'exam' && showResults) return; 
    setAnswers(prev => ({ ...prev, [qid]: ans })); 
  };

  // ✅ Handle submit answers
  const handleSubmit = () => {
    if (!currentText) return;
    let correct = 0;
    currentText.questions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    const score = Math.round((correct / currentText.questions.length) * 100);
    setShowResults(true); setTimerActive(false);
    alert(mode === 'exam' ? '📤 Koe lhetetty! Pisteet: ' + score + '%' : '✅ Tarkistettu! Oikein: ' + correct + '/' + currentText.questions.length);
  };

  // ✅ Navigate texts
  const handleNext = () => { 
    if (currentIndex < texts.length - 1) { 
      setCurrentIndex(i => i + 1); setAnswers({}); setShowResults(false); 
    } 
  };
  const handlePrev = () => { 
    if (currentIndex > 0) { 
      setCurrentIndex(i => i - 1); setAnswers({}); setShowResults(false); 
    } 
  };

  // ✅ Format timer
  const formatTimer = (s) => Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');

  // ✅ Handle add new text - THIS IS THE KEY FUNCTION
  const handleAddText = () => {
    // Validate
    if (!newText.title.trim() || !newText.text.trim()) { 
      alert('Anna otsikko ja teksti!'); 
      return; 
    }
    
    // Create new entry
    const entry = { 
      id: 'user-' + Date.now(), 
      title: newText.title.trim(), 
      level: newText.level, 
      text: newText.text.trim(), 
      keywords: extractVocab(newText.text), 
      questions: generateQs(newText.text, extractVocab(newText.text)), 
      state: 'new', 
      usedInExam: false, 
      source: 'user', 
      createdAt: new Date().toISOString() 
    };
    
    // Save to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : { texts: [] };
    data.texts.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Update state
    setTexts(prev => [entry, ...prev]);
    
    // Reset form and close
    setNewText({ title: '', text: '', level: 'B1' });
    setShowAddForm(false);
    
    // Confirm
    alert('✅ "' + entry.title + '" tallennettu!');
  };

  // ✅ Sync to GitHub
  const handleSync = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : { texts: [] };
    const json = JSON.stringify({ lastUpdated: new Date().toISOString(), texts: data.texts }, null, 2);
    navigator.clipboard.writeText(json).then(() => { 
      alert('✅ Kopioitu!\n\n1. Avaa public/yki-reading-texts.json\n2. Korvaa sisältö\n3. git add → commit → push'); 
    });
  };

  // Loading state
  if (loading) return <Card className="yki-reading"><p className="loading-state">📥 Ladataan...</p></Card>;
  
  // Empty state
  if (texts.length === 0) {
    return (
      <Card className="yki-reading">
        <div className="empty-state">
          <h3>😕 Ei tekstejä</h3>
          {/* ✅ THIS BUTTON NOW HAS PROPER HANDLER */}
          <button 
            className="btn-add-text-inline" 
            onClick={() => setShowAddForm(true)} 
            type="button"
          >
            ✍️ Lisää oma teksti
          </button>
        </div>
      </Card>
    );
  }
  
  if (!currentText) return <Card className="yki-reading"><p>Ladataan...</p></Card>;

  return (
    <Card className="yki-reading">
      {/* Progress + Sync */}
      <div className="progress-bar">
        <span>📊 Reading Practice</span>
        <button className="btn-sync" onClick={handleSync} type="button">📤 Sync</button>
      </div>

      {/* ✅ ADD TEXT FORM - Conditionally rendered */}
      {showAddForm && (
        <Card className="add-text-form">
          <div className="form-header">
            <h4>✍️ Lisää uusi teksti</h4>
            {/* ✅ Close button */}
            <button 
              className="btn-close" 
              onClick={() => setShowAddForm(false)} 
              type="button"
            >
              ✕
            </button>
          </div>
          
          {/* Title input */}
          <div className="form-group">
            <label>Otsikko *</label>
            <input 
              type="text" 
              placeholder="Esimerkiksi: Minun päiväni" 
              value={newText.title} 
              onChange={(e) => setNewText(prev => ({ ...prev, title: e.target.value }))} 
            />
          </div>
          
          {/* Level select */}
          <div className="form-group">
            <label>Taso</label>
            <select 
              value={newText.level} 
              onChange={(e) => setNewText(prev => ({ ...prev, level: e.target.value }))}
            >
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </div>
          
          {/* Text textarea */}
          <div className="form-group">
            <label>Teksti (suomeksi) *</label>
            <textarea 
              placeholder="Kirjoita tai liitä tekstisi tähän..." 
              rows={4} 
              value={newText.text} 
              onChange={(e) => setNewText(prev => ({ ...prev, text: e.target.value }))} 
            />
          </div>
          
          {/* Auto-preview */}
          {newText.text && (
            <div className="auto-extract-preview">
              <p><strong>🔍 Esikatselu:</strong> {extractVocab(newText.text).slice(0, 5).join(', ')}...</p>
              <p><strong>❓ Kysymyksiä:</strong> {generateQs(newText.text, extractVocab(newText.text)).length} kpl</p>
            </div>
          )}
          
          {/* Form actions */}
          <div className="form-actions">
            <button 
              className="btn-cancel" 
              onClick={() => setShowAddForm(false)} 
              type="button"
            >
              Peruuta
            </button>
            {/* ✅ Save button calls handleAddText */}
            <button 
              className="btn-save" 
              onClick={handleAddText} 
              type="button"
            >
              💾 Tallenna
            </button>
          </div>
        </Card>
      )}

      {/* Exam Timer */}
      {mode === 'exam' && timerActive && (
        <div className={`exam-timer ${timer < 300 ? 'warning' : ''}`}>
          ⏱️ {formatTimer(timer)}
        </div>
      )}

      {/* Header */}
      <div className="reading-header">
        <h3>{currentText.title}</h3>
        <span className="level-badge">{currentText.level}</span>
      </div>

      {/* Clickable Text */}
      <div className="reading-text">
        {currentText.text.split(' ').map((word, i) => { 
          const clean = word.replace(/[^a-z]/gi, ''); 
          return (
            <span 
              key={i} 
              className={`word ${highlightedWord === clean ? 'highlighted' : ''} ${mode !== 'exam' ? 'clickable' : ''}`}
              onClick={() => handleWordClick(word)}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>

      {/* Translation (not in exam) */}
      {mode !== 'exam' && (
        <details className="translation-details">
          <summary>👁️ Näytä käännös</summary>
          <p className="translation">{currentText.translation}</p>
        </details>
      )}

      {/* Hint (practice only) */}
      {mode === 'practice' && !showResults && (
        <button className="hint-btn" onClick={() => alert('💡 Lue kysymys ensin!')} type="button">
          💡 Vinkki
        </button>
      )}

      {/* Questions */}
      <div className="reading-questions">
        <h4>❓ Kysymykset</h4>
        {currentText.questions.map((q, qi) => (
          <div key={q.id} className="question-card">
            <p><strong>{qi + 1}.</strong> {q.question}</p>
            
            {q.type === 'multiple-choice' && (
              <div className="options">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`option ${answers[q.id] === oi ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={q.id} 
                      checked={answers[q.id] === oi} 
                      onChange={() => handleAnswer(q.id, oi)} 
                      disabled={mode === 'exam' && showResults} 
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            
            {q.type === 'true-false' && (
              <div className="true-false">
                <label className={`option ${answers[q.id] === true ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name={q.id} 
                    checked={answers[q.id] === true} 
                    onChange={() => handleAnswer(q.id, true)} 
                    disabled={mode === 'exam' && showResults} 
                  />
                  ✅ Tosi
                </label>
                <label className={`option ${answers[q.id] === false ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name={q.id} 
                    checked={answers[q.id] === false} 
                    onChange={() => handleAnswer(q.id, false)} 
                    disabled={mode === 'exam' && showResults} 
                  />
                  ❌ Epätosi
                </label>
              </div>
            )}
            
            {showResults && (
              <p className={`feedback ${answers[q.id] === q.correct ? 'correct' : 'wrong'}`}>
                {answers[q.id] === q.correct ? '✅ Oikein!' : '❌ Väärin'}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="reading-actions">
        {!showResults && mode !== 'exam' && (
          <button className="btn-submit" onClick={handleSubmit} type="button">✅ Tarkista</button>
        )}
        {mode === 'exam' && !showResults && (
          <button className="btn-submit exam" onClick={handleSubmit} type="button">📤 Lähetä</button>
        )}
        {showResults && (
          <div className="review-actions">
            <button className="btn-nav" onClick={handlePrev} disabled={currentIndex === 0} type="button">←</button>
            <button className="btn-nav" onClick={handleNext} disabled={currentIndex >= texts.length - 1} type="button">→</button>
          </div>
        )}
      </div>

      {/* ✅ ADD TEXT BUTTON - Main trigger */}
      {!showAddForm && (
        <div className="add-text-section">
          {/* ✅ THIS BUTTON NOW HAS PROPER HANDLER */}
          <button 
            className="btn-add-text" 
            onClick={() => setShowAddForm(true)} 
            type="button"
          >
            ✍️ Lisää oma teksti
          </button>
          <p className="hint">Lisää teksti → saa automaattisesti sanaston + kysymykset</p>
        </div>
      )}
    </Card>
  );
}
