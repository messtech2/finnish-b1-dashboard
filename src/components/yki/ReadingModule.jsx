import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import './ReadingModule.css';

const GITHUB_URL = 'https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/master/public/yki-reading-texts.json';
const STORAGE_KEY = 'yki-reading-texts';
const COMMON_WORDS = new Set(['ja', 'on', 'ei', 'etta', 'mina', 'sina', 'han', 'me', 'te', 'he', 'tama', 'tuo', 'se', 'nyt', 'sitten', 'kun', 'jos', 'vaikka', 'mutta', 'olla', 'tehd', 'menn', 'tulla', 'hyv', 'huono']);

// ✅ Vocabulary extraction - works on the fly!
const extractVocab = (text) => {
  return text.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !COMMON_WORDS.has(w))
    .slice(0, 10);
};

// ✅ Auto-generate questions
const generateQs = (text, vocab) => {
  const qs = [];
  const count = text.split(/\s+/).length;
  if (vocab[0]) qs.push({ id: 'q1', type: 'true-false', question: 'Tekstissä mainitaan "' + vocab[0] + '".', correct: true });
  qs.push({ id: 'q2', type: 'multiple-choice', question: 'Montako sanaa tekstissä on?', options: ['<20', '20-50', '50-100', '>100'], correct: count < 20 ? 0 : count < 50 ? 1 : count < 100 ? 2 : 3 });
  return qs;
};

// ✅ Save word to main vocabulary
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
  const [texts, setTexts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(1800);
  const [timerActive, setTimerActive] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState({ title: '', text: '', level: 'B1' });

  const currentText = texts[currentIndex];

  console.log('📖 ReadingModule loaded, mode:', mode, 'texts:', texts.length);

  // Load texts from GitHub
  useEffect(() => {
    loadTexts();
  }, [mode]);

  const loadTexts = async () => {
    setLoading(true);
    try {
      const res = await fetch(GITHUB_URL + '?t=' + Date.now());
      let data = { texts: [] };
      if (res.ok) data = await res.json();
      
      // Auto-extract vocab + generate questions for all texts
      const processed = (data.texts || []).map(t => ({
        ...t,
        keywords: t.keywords || extractVocab(t.text),
        questions: t.questions || generateQs(t.text, extractVocab(t.text))
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastUpdated: new Date().toISOString(), texts: processed }));
      
      // Filter by mode
      let filtered = processed;
      if (mode === 'exam') {
        filtered = processed.filter(t => t.state === 'new' && !t.usedInExam);
        console.log('🔴 Exam mode: ' + filtered.length + ' available texts');
      } else if (mode === 'review') {
        filtered = processed.filter(t => t.state === 'practiced' || t.state === 'mastered');
        console.log('🔵 Review mode: ' + filtered.length + ' texts');
      } else {
        console.log('🟢 Practice mode: ' + filtered.length + ' texts');
      }
      
      setTexts(filtered);
    } catch (e) {
      console.warn('GitHub fetch failed, using localStorage');
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

  // ✅ Click word - save to vocabulary
  const handleWordClick = (word) => {
    if (mode === 'exam') return;
    const clean = word.replace(/[^a-z]/gi, '');
    if (clean.length < 3) return;
    const saved = saveWord(clean);
    setHighlightedWord(clean);
    alert(saved ? '✅ "' + clean + '" tallennettu sanastoon!' : 'ℹ️ On jo sanastossa');
  };

  // ✅ Answer questions
  const handleAnswer = (qid, ans) => {
    if (mode === 'exam' && showResults) return;
    setAnswers(prev => ({ ...prev, [qid]: ans }));
  };

  // ✅ Submit answers
  const handleSubmit = () => {
    if (!currentText) return;
    let correct = 0;
    currentText.questions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    const score = Math.round((correct / currentText.questions.length) * 100);
    let newState = score >= 80 ? 'mastered' : 'practiced';
    
    // Update state
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const idx = data.texts.findIndex(t => t.id === currentText.id);
      if (idx !== -1) {
        data.texts[idx] = { ...data.texts[idx], state: newState, score };
        if (mode === 'exam') data.texts[idx].usedInExam = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
    
    setShowResults(true); setTimerActive(false);
    alert(mode === 'exam' ? '📤 Koe lähetetty! Pisteet: ' + score + '%' : '✅ Tarkistettu! Oikein: ' + correct + '/' + currentText.questions.length);
  };

  const handleNext = () => { if (currentIndex < texts.length - 1) { setCurrentIndex(i => i + 1); setAnswers({}); setShowResults(false); } };
  const handlePrev = () => { if (currentIndex > 0) { setCurrentIndex(i => i - 1); setAnswers({}); setShowResults(false); } };
  const formatTimer = (s) => Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');

  // ✅ Add new text
  const handleAddText = () => {
    if (!newText.title.trim() || !newText.text.trim()) { alert('Anna otsikko ja teksti!'); return; }
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
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : { texts: [] };
    data.texts.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTexts(prev => [entry, ...prev]);
    setNewText({ title: '', text: '', level: 'B1' });
    setShowAddForm(false);
    alert('✅ Tallennettu! Klikkaa "📤 Sync" viedäksesi GitHubiin.');
  };

  // ✅ Sync to GitHub
  const handleSync = async () => {
    try {
      const res = await fetch(GITHUB_URL + '?t=' + Date.now());
      let githubTexts = [];
      if (res.ok) { const data = await res.json(); githubTexts = data.texts || []; }
      const stored = localStorage.getItem(STORAGE_KEY);
      const localTexts = stored ? JSON.parse(stored).texts : [];
      const githubIds = new Set(githubTexts.map(t => t.id));
      const newTexts = localTexts.filter(t => !githubIds.has(t.id));
      const merged = [...githubTexts, ...newTexts];
      const json = JSON.stringify({ lastUpdated: new Date().toISOString(), texts: merged }, null, 2);
      await navigator.clipboard.writeText(json);
      alert('✅ Kopioitu!\n\n📁 Avaa: public/yki-reading-texts.json\n📋 Liitä\n🚀 git add → commit → push\n\n' + merged.length + ' tekstiä');
    } catch (e) { alert('❌ Virhe: ' + e.message); }
  };

  if (loading) return <Card className="yki-reading"><p className="loading-state">📥 Ladataan tekstejä GitHubista...</p></Card>;
  
  if (texts.length === 0) {
    return (
      <Card className="yki-reading">
        <div className="empty-state">
          <h3>😕 Ei tekstejä</h3>
          {mode === 'exam' && <p>🔴 Koe vaatii uusia tekstejä. Vaihda Harjoitus-tilaan.</p>}
          {mode === 'review' && <p>🔵 Ei arvosteltuja tekstejä vielä. Tee harjoituksia ensin.</p>}
          {mode === 'practice' && <p>🟢 Lisää tekstejä!</p>}
          <button className="btn-add-text-inline" onClick={() => setShowAddForm(true)} type="button">✍️ Lisää oma teksti</button>
          <button className="btn-add-text-inline" onClick={handleSync} type="button" style={{marginLeft: '10px', background: '#24292e'}}>📤 Sync GitHub</button>
        </div>
      </Card>
    );
  }
  
  if (!currentText) return <Card className="yki-reading"><p>Ladataan...</p></Card>;

  return (
    <Card className="yki-reading">
      {/* Progress + Sync */}
      <div className="progress-bar">
        <span>📊 {texts.length} tekstiä | {currentIndex + 1}/{texts.length}</span>
        <button className="btn-sync" onClick={handleSync} type="button">📤 Sync GitHub</button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="add-text-form">
          <div className="form-header"><h4>✍️ Lisää uusi teksti</h4><button className="btn-close" onClick={() => setShowAddForm(false)} type="button">✕</button></div>
          <div className="form-group"><label>Otsikko *</label><input type="text" placeholder="Otsikko" value={newText.title} onChange={(e) => setNewText(prev => ({ ...prev, title: e.target.value }))} /></div>
          <div className="form-group"><label>Taso</label><select value={newText.level} onChange={(e) => setNewText(prev => ({ ...prev, level: e.target.value }))}><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option></select></div>
          <div className="form-group"><label>Teksti *</label><textarea placeholder="Kirjoita teksti..." rows={4} value={newText.text} onChange={(e) => setNewText(prev => ({ ...prev, text: e.target.value }))} /></div>
          {newText.text && (<div className="auto-extract-preview"><p><strong>🔍 Sanat:</strong> {extractVocab(newText.text).join(', ')}</p><p><strong>❓ Kysymyksiä:</strong> {generateQs(newText.text, extractVocab(newText.text)).length}</p></div>)}
          <div className="form-actions"><button className="btn-cancel" onClick={() => setShowAddForm(false)} type="button">Peruuta</button><button className="btn-save" onClick={handleAddText} type="button">💾 Tallenna</button></div>
        </Card>
      )}

      {/* Exam Timer */}
      {mode === 'exam' && timerActive && <div className={`exam-timer ${timer < 300 ? 'warning' : ''}`}>⏱️ {formatTimer(timer)}</div>}

      {/* Text Header */}
      <div className="reading-header">
        <h3>{currentText.title}</h3>
        <span className="level-badge">{currentText.level}</span>
      </div>

      {/* ✅ CLICKABLE TEXT - Vocabulary extraction on the fly! */}
      <div className="reading-text">
        {currentText.text.split(' ').map((word, i) => {
          const clean = word.replace(/[^a-z]/gi, '');
          return (
            <span
              key={i}
              className={`word ${highlightedWord === clean ? 'highlighted' : ''} ${mode !== 'exam' ? 'clickable' : ''}`}
              onClick={() => handleWordClick(word)}
              title={mode !== 'exam' ? 'Tallenna sanastoon' : ''}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>

      {/* Translation */}
      {mode !== 'exam' && currentText.translation && (
        <details className="translation-details">
          <summary>👁️ Näytä käännös</summary>
          <p className="translation">{currentText.translation}</p>
        </details>
      )}

      {/* Hint */}
      {mode === 'practice' && !showResults && (
        <button className="hint-btn" onClick={() => alert('💡 Lue kysymys ensin, etsi avainsana tekstistä!')} type="button">💡 Lukuvinkki</button>
      )}

      {/* ✅ QUESTIONS - Now Working */}
      <div className="reading-questions">
        <h4>❓ Kysymykset ({currentText.questions.length})</h4>
        {currentText.questions.map((q, qi) => (
          <div key={q.id} className="question-card">
            <p className="question-text">
              <span className="question-number">{qi + 1}.</span> {q.question}
              {q.type === 'true-false' && <span className="question-type"> (Tosi/Epätosi)</span>}
            </p>
            
            {q.type === 'multiple-choice' && (
              <div className="options">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`option ${answers[q.id] === oi ? 'selected' : ''} ${showResults && oi === q.correct ? 'correct' : ''} ${showResults && answers[q.id] === oi && oi !== q.correct ? 'wrong' : ''}`}>
                    <input type="radio" name={`${currentText.id}-${q.id}`} value={oi} checked={answers[q.id] === oi} onChange={() => handleAnswer(q.id, oi)} disabled={mode === 'exam' && showResults} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            
            {q.type === 'true-false' && (
              <div className="true-false">
                <label className={`option ${answers[q.id] === true ? 'selected' : ''} ${showResults && q.correct === true ? 'correct' : ''}`}>
                  <input type="radio" name={`${currentText.id}-${q.id}`} value="true" checked={answers[q.id] === true} onChange={() => handleAnswer(q.id, true)} disabled={mode === 'exam' && showResults} />
                  ✅ Tosi
                </label>
                <label className={`option ${answers[q.id] === false ? 'selected' : ''} ${showResults && q.correct === false ? 'correct' : ''}`}>
                  <input type="radio" name={`${currentText.id}-${q.id}`} value="false" checked={answers[q.id] === false} onChange={() => handleAnswer(q.id, false)} disabled={mode === 'exam' && showResults} />
                  ❌ Epätosi
                </label>
              </div>
            )}
            
            {showResults && (
              <div className={`feedback ${answers[q.id] === q.correct ? 'correct' : 'wrong'}`}>
                {answers[q.id] === q.correct ? '✅ Oikein!' : `❌ Väärin. Oikea: ${q.type === 'true-false' ? (q.correct ? 'Tosi' : 'Epätosi') : q.options[q.correct]}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="reading-actions">
        {!showResults && (
          <button className="btn-submit" onClick={handleSubmit} type="button">
            {mode === 'exam' ? '📤 Lähetä koe' : '✅ Tarkista vastaukset'}
          </button>
        )}
        {showResults && (
          <div className="review-actions">
            <button className="btn-nav" onClick={handlePrev} disabled={currentIndex === 0} type="button">← Edellinen</button>
            <button className="btn-nav" onClick={handleNext} disabled={currentIndex >= texts.length - 1} type="button">Seuraava →</button>
          </div>
        )}
      </div>

      {/* Add Text Button */}
      {!showAddForm && (
        <div className="add-text-section">
          <button className="btn-add-text" onClick={() => setShowAddForm(true)} type="button">✍️ Lisää oma teksti</button>
          <p className="hint">Lisää → Sync → git push</p>
        </div>
      )}
    </Card>
  );
}
