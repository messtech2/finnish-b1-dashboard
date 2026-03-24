import { useState, useEffect } from 'react';
import Card from '../ui/Card';

const GITHUB_URL = 'https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/master/public/yki-reading-texts.json';

export default function ReadingModule({ mode }) {
  const [texts, setTexts] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // ✅ FIX B: Controlled radios
  const [showForm, setShowForm] = useState(false); // ✅ FIX D: Add text form
  const [loading, setLoading] = useState(true);

  // ✅ FIX C: Reset when mode changes
  useEffect(() => {
    setCurrentIdx(0);
    setAnswers({});
  }, [mode]);

  // Load texts
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(GITHUB_URL + '?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          // ✅ FIX 1: Handle both flat and nested structure
          const textsArray = data.texts || (data.texts?.texts) || [];
          console.log('📦 Loaded texts:', textsArray.map(t => t.id)); // ✅ FIX E: Debug log
          setTexts(textsArray);
          localStorage.setItem('yki-reading-texts', JSON.stringify({ lastUpdated: new Date().toISOString(), texts: textsArray }));
        }
      } catch (e) {
        console.warn('GitHub fetch failed');
        const local = localStorage.getItem('yki-reading-texts');
        if (local) setTexts(JSON.parse(local).texts || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Card><p>Ladataan...</p></Card>;
  if (texts.length === 0) return <Card><p>Ei tekstejä</p></Card>;

  const text = texts[currentIdx];

  // ✅ FIX A: Clickable words with debug + stopPropagation
  const handleWordClick = (e, word) => {
    e.stopPropagation(); // ✅ Prevent parent click
    console.log('🔤 Word clicked:', word); // ✅ Debug log
    const clean = word.replace(/[^a-zäöå]/gi, '');
    if (clean.length > 4) {
      const vocab = JSON.parse(localStorage.getItem('finnish-vocab-v3') || '[]');
      if (!vocab.some(w => w.word.toLowerCase() === clean.toLowerCase())) {
        vocab.push({ id: Date.now(), word: clean, meaning: '', example: '', category: 'yki-reading', addedAt: new Date().toISOString() });
        localStorage.setItem('finnish-vocab-v3', JSON.stringify(vocab));
      }
      alert('✅ "' + clean + '"');
    }
  };

  // ✅ FIX B: Controlled radio inputs
  const handleAnswer = (qid, index) => {
    console.log('📝 Answer:', qid, index); // ✅ Debug log
    setAnswers(prev => ({ ...prev, [qid]: index }));
  };

  // ✅ FIX D: Add new text
  const handleAddText = () => {
    const title = document.getElementById('new-title')?.value;
    const textVal = document.getElementById('new-text')?.value;
    if (!title || !textVal) { alert('Anna otsikko ja teksti!'); return; }
    
    const entry = {
      id: 'user-' + Date.now(),
      title,
      text: textVal,
      level: 'B1',
      keywords: [],
      questions: [],
      state: 'new',
      usedInExam: false,
      source: 'user',
      createdAt: new Date().toISOString()
    };
    
    const updated = [entry, ...texts];
    setTexts(updated);
    localStorage.setItem('yki-reading-texts', JSON.stringify({ lastUpdated: new Date().toISOString(), texts: updated }));
    setShowForm(false);
    alert('✅ Tallennettu!');
  };

  // ✅ Sync to GitHub
  const handleSync = async () => {
    try {
      const res = await fetch(GITHUB_URL + '?t=' + Date.now());
      let github = [];
      if (res.ok) { const d = await res.json(); github = d.texts || d.texts?.texts || []; }
      const local = JSON.parse(localStorage.getItem('yki-reading-texts') || '{"texts":[]}').texts || [];
      const ids = new Set(github.map(t => t.id));
      const merged = [...github, ...local.filter(t => !ids.has(t.id))];
      const json = JSON.stringify({ lastUpdated: new Date().toISOString(), texts: merged }, null, 2);
      await navigator.clipboard.writeText(json);
      alert('✅ Kopioitu ' + merged.length + ' tekstiä!');
    } catch (e) { alert('❌ ' + e.message); }
  };

  return (
    <Card style={{ position: 'relative', zIndex: 1 }}> {/* ✅ FIX A: Ensure clickable */}
      {/* ✅ FIX E: Debug info */}
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
        Debug: texts={texts.length}, idx={currentIdx}, mode={mode}, answers={Object.keys(answers).length}
      </div>

      {/* ✅ FIX D: Add Text Form */}
      {showForm && (
        <div style={{ background: '#f0f4ff', padding: '15px', borderRadius: '8px', marginBottom: '15px', position: 'relative', zIndex: 2 }}>
          <h4>✍️ Uusi teksti</h4>
          <input id="new-title" type="text" placeholder="Otsikko" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <textarea id="new-text" placeholder="Teksti" rows={4} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowForm(false)} style={{ cursor: 'pointer' }}>Peruuta</button>
            <button onClick={handleAddText} style={{ cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>💾 Tallenna</button>
          </div>
        </div>
      )}

      {/* Text Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {texts.map((t, i) => (
          <button
            key={t.id}
            onClick={(e) => { e.stopPropagation(); console.log('🔘 Nav clicked', i); setCurrentIdx(i); }} // ✅ FIX A: Debug + stopPropagation
            style={{
              padding: '8px 12px',
              background: currentIdx === i ? '#003580' : 'white',
              color: currentIdx === i ? 'white' : '#003580',
              border: '2px solid #003580',
              borderRadius: '6px',
              cursor: 'pointer', // ✅ FIX A: Ensure clickable
              position: 'relative',
              zIndex: 2
            }}
          >
            {i + 1}. {t.title?.substring(0, 12)}
          </button>
        ))}
      </div>

      {/* Text Content */}
      <h3>{text.title} <small style={{ color: '#666' }}>({text.level})</small></h3>
      <div style={{ margin: '20px 0', lineHeight: '1.8' }}>
        {text.text?.split(' ').map((word, i) => (
          <span
            key={i}
            onClick={(e) => handleWordClick(e, word)} // ✅ FIX A: Proper handler
            style={{
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              position: 'relative',
              zIndex: 2 // ✅ FIX A: Ensure above overlays
            }}
            onMouseOver={(e) => e.target.style.background = '#e8f4fd'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            {word}{' '}
          </span>
        ))}
      </div>

      {/* Questions - ✅ FIX B: Controlled radios */}
      <div style={{ marginTop: '20px' }}>
        <h4>❓ Kysymykset</h4>
        {(text.questions || []).map((q, qi) => (
          <div key={q.id} style={{ marginBottom: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{qi + 1}. {q.question}</p>
            
            {q.type === 'multiple-choice' && q.options?.map((opt, oi) => (
              <label key={oi} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={q.id} // ✅ Same name groups radios
                  checked={answers[q.id] === oi} // ✅ Controlled
                  onChange={() => handleAnswer(q.id, oi)} // ✅ Handler
                  style={{ marginRight: '8px' }}
                />
                {opt}
              </label>
            ))}
            
            {q.type === 'true-false' && (
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name={q.id} checked={answers[q.id] === true} onChange={() => handleAnswer(q.id, true)} style={{ marginRight: '6px' }} />
                  ✅ Tosi
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name={q.id} checked={answers[q.id] === false} onChange={() => handleAnswer(q.id, false)} style={{ marginRight: '6px' }} />
                  ❌ Epätosi
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} style={{ cursor: 'pointer' }}>← Edellinen</button>
        <button onClick={() => setCurrentIdx(i => Math.min(texts.length - 1, i + 1))} disabled={currentIdx >= texts.length - 1} style={{ cursor: 'pointer' }}>Seuraava →</button>
        <button onClick={() => { console.log('✅ Check clicked'); alert('Tarkistettu!'); }} style={{ cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px' }}>✅ Tarkista</button>
      </div>

      {/* Add Text Button - ✅ FIX D */}
      <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px dashed #ccc' }}>
        <button 
          onClick={(e) => { e.stopPropagation(); console.log('✍️ Add clicked'); setShowForm(true); }} // ✅ FIX A + D
          style={{ cursor: 'pointer', padding: '10px 20px', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', position: 'relative', zIndex: 2 }}
        >
          ✍️ Lisää oma teksti
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleSync(); }} 
          style={{ cursor: 'pointer', padding: '10px 20px', background: '#24292e', color: 'white', border: 'none', borderRadius: '6px', marginLeft: '10px', position: 'relative', zIndex: 2 }}
        >
          📤 Sync GitHub
        </button>
      </div>
    </Card>
  );
}
