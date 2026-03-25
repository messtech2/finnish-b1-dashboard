import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { enrichWord, copyVocabForGitHub } from '../../utils/enrichVocabulary';
import './ReadingModule.css';

const GITHUB_URL = 'https://raw.githubusercontent.com/messtech2/finnish-b1-dashboard/master/public/yki-reading-texts.json';

export default function ReadingModule({ mode }) {
  const [texts, setTexts] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wordPopup, setWordPopup] = useState(null);
  const [showFullText, setShowFullText] = useState(false);
  const [newText, setNewText] = useState({ title: '', text: '', level: 'B1' });
  const [pendingExport, setPendingExport] = useState(0);

  const currentText = texts[currentIdx];

  useEffect(() => {
    setCurrentIdx(0);
    setAnswers({});
    setShowResults(false);
    const pending = JSON.parse(localStorage.getItem('vocab-pending-commit') || '[]');
    setPendingExport(pending.length);
  }, [mode]);

  useEffect(() => {
    const loadTexts = async () => {
      setLoading(true);
      try {
        const res = await fetch(GITHUB_URL + '?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          const textsArray = data.texts || (data.texts?.texts) || [];
          setTexts(textsArray);
          localStorage.setItem('yki-reading-texts', JSON.stringify({ 
            lastUpdated: new Date().toISOString(), 
            texts: textsArray 
          }));
        }
      } catch (e) {
        console.warn('GitHub fetch failed');
        const local = localStorage.getItem('yki-reading-texts');
        if (local) {
          const data = JSON.parse(local);
          setTexts(data.texts || []);
        }
      }
      setLoading(false);
    };
    loadTexts();
  }, []);

  const handleWordClick = (e, word) => {
    e.stopPropagation();
    console.log('Word clicked:', word);
    
    const clean = word.replace(/[^a-zäöå]/gi, '');
    if (clean.length < 3) return;
    
    const localVocab = JSON.parse(localStorage.getItem('finnish-vocab-v3') || '[]');
    const exists = localVocab.some(w => w.word.toLowerCase() === clean.toLowerCase());
    
    const enriched = enrichWord(clean, currentText?.text);
    
    if (enriched) {
      setWordPopup({
        word: enriched.word,
        meaning: enriched.meaning,
        example: enriched.example,
        exampleTranslation: enriched.exampleTranslation,
        exists
      });
    }
  };

  const handleAddWord = async (enriched) => {
    const localVocab = JSON.parse(localStorage.getItem('finnish-vocab-v3') || '[]');
    const exists = localVocab.some(w => w.word.toLowerCase() === enriched.word.toLowerCase());
    
    if (!exists) {
      localVocab.unshift(enriched);
      localStorage.setItem('finnish-vocab-v3', JSON.stringify(localVocab));
      
      const pending = JSON.parse(localStorage.getItem('vocab-pending-commit') || '[]');
      if (!pending.some(w => w.word.toLowerCase() === enriched.word.toLowerCase())) {
        pending.unshift(enriched);
        localStorage.setItem('vocab-pending-commit', JSON.stringify(pending));
        setPendingExport(pending.length);
      }
    }
    
    setWordPopup({ ...wordPopup, exists: true });
    alert(exists 
      ? 'On jo sanastossa' 
      : 'Tallennettu! Klikkaa "Vie vocabularies.json" viedäksesi tiedostoon.'
    );
  };

  const handleExportVocab = async () => {
    try {
      const pending = JSON.parse(localStorage.getItem('vocab-pending-commit') || '[]');
      if (pending.length === 0) {
        alert('Ei uusia sanoja vietäväksi.');
        return;
      }
      
      const result = await copyVocabForGitHub(pending);
      
      localStorage.removeItem('vocab-pending-commit');
      setPendingExport(0);
      
      alert('Kopioitu ' + result.copied + ' sanaa!\n\n1. Avaa public/vocabularies.json\n2. Liitä (korvaa kaikki)\n3. git add → commit → push\n\nUusia sanoja: ' + result.new);
    } catch (e) {
      alert('Virhe: ' + e.message);
    }
  };

  const handleAnswer = (qid, index) => {
    console.log('Answer:', qid, index);
    setAnswers(prev => ({ ...prev, [qid]: index }));
  };

  const handleSubmit = () => {
    if (!currentText) return;
    
    let correct = 0;
    currentText.questions?.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    
    const score = currentText.questions?.length > 0 
      ? Math.round((correct / currentText.questions.length) * 100) 
      : 0;
    
    setShowResults(true);
    
    alert(mode === 'exam' 
      ? 'Koe lähetetty! Pisteet: ' + score + '%' 
      : 'Tarkistettu! Oikein: ' + correct + '/' + (currentText.questions?.length || 0)
    );
  };

  const handleNext = () => {
    if (currentIdx < texts.length - 1) {
      setCurrentIdx(i => i + 1);
      setAnswers({});
      setShowResults(false);
    }
  };
  
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setAnswers({});
      setShowResults(false);
    }
  };

  const handleAddText = () => {
    if (!newText.title.trim() || !newText.text.trim()) {
      alert('Anna otsikko ja teksti!');
      return;
    }
    
    const entry = {
      id: 'user-' + Date.now(),
      title: newText.title.trim(),
      level: newText.level,
      text: newText.text.trim(),
      keywords: [],
      questions: [],
      state: 'new',
      usedInExam: false,
      source: 'user',
      createdAt: new Date().toISOString()
    };
    
    const stored = localStorage.getItem('yki-reading-texts');
    const data = stored ? JSON.parse(stored) : { texts: [] };
    data.texts.unshift(entry);
    localStorage.setItem('yki-reading-texts', JSON.stringify(data));
    
    setTexts(prev => [entry, ...prev]);
    setNewText({ title: '', text: '', level: 'B1' });
    setShowForm(false);
    alert('Tallennettu!');
  };

  const handleSync = async () => {
    try {
      const res = await fetch(GITHUB_URL + '?t=' + Date.now());
      let github = [];
      if (res.ok) {
        const data = await res.json();
        github = data.texts || (data.texts?.texts) || [];
      }
      
      const local = JSON.parse(localStorage.getItem('yki-reading-texts') || '{"texts":[]}').texts || [];
      const ids = new Set(github.map(t => t.id));
      const merged = [...github, ...local.filter(t => !ids.has(t.id))];
      
      const json = JSON.stringify({ 
        lastUpdated: new Date().toISOString(), 
        texts: merged 
      }, null, 2);
      
      await navigator.clipboard.writeText(json);
      alert('Kopioitu ' + merged.length + ' tekstiä!\n\n1. Avaa public/yki-reading-texts.json\n2. Liitä (korvaa kaikki)\n3. git add → commit → push');
    } catch (e) {
      alert('Virhe: ' + e.message);
    }
  };

  if (loading) {
    return <Card className="yki-reading"><p className="loading-state">Ladataan tekstejä...</p></Card>;
  }
  
  if (texts.length === 0) {
    return (
      <Card className="yki-reading">
        <div className="empty-state">
          <h3>Ei tekstejä</h3>
          {mode === 'exam' && <p>Koe vaatii uusia tekstejä. Vaihda Harjoitus-tilaan.</p>}
          {mode === 'review' && <p>Ei arvosteltuja tekstejä vielä. Tee harjoituksia ensin.</p>}
          {mode === 'practice' && <p>Lisää tekstejä GitHubiin tai klikkaa "Lisää oma teksti".</p>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
            <button 
              className="btn-add-text-inline" 
              onClick={() => { console.log('Add text clicked'); setShowForm(true); }}
              style={{ cursor: 'pointer', padding: '10px 20px', background: '#003580', color: 'white', border: 'none', borderRadius: '8px' }}
            >
              Lisää oma teksti
            </button>
            <button 
              onClick={() => { console.log('Sync clicked'); handleSync(); }}
              style={{ cursor: 'pointer', padding: '10px 20px', background: '#24292e', color: 'white', border: 'none', borderRadius: '8px' }}
            >
              Sync GitHub
            </button>
          </div>
        </div>
      </Card>
    );
  }
  
  if (!currentText) {
    return <Card className="yki-reading"><p>Ladataan...</p></Card>;
  }

  return (
    <Card className="yki-reading" style={{ position: 'relative', zIndex: 1 }}>
      {/* Word Popup */}
      {wordPopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#003580' }}>{wordPopup.word}</h3>
            <button onClick={() => setWordPopup(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>X</button>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>Meaning:</p>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{wordPopup.meaning}</p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>Example:</p>
            <p style={{ margin: '0 0 4px 0', fontStyle: 'italic' }}>{wordPopup.example}</p>
            {wordPopup.exampleTranslation && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{wordPopup.exampleTranslation}</p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {!wordPopup.exists ? (
              <button 
                onClick={() => handleAddWord({ word: wordPopup.word, meaning: wordPopup.meaning, example: wordPopup.example, exampleTranslation: wordPopup.exampleTranslation })}
                style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Lisää sanastoon
              </button>
            ) : (
              <p style={{ margin: 0, color: '#28a745', fontWeight: '600' }}>On jo sanastossa</p>
            )}
            <button 
              onClick={() => setWordPopup(null)}
              style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Sulje
            </button>
          </div>
        </div>
      )}

      {/* Full Text Modal - Shows ENTIRE text */}
      {showFullText && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }} 
          onClick={() => setShowFullText(false)}
        >
          <div 
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '12px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowFullText(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >X</button>
            
            <h3 style={{ marginTop: 0, color: '#003580' }}>{currentText.title}</h3>
            <span style={{ background: '#e8f4fd', color: '#003580', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>{currentText.level}</span>
            
            <div style={{ marginTop: '20px', lineHeight: '1.8', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
              {currentText.text}
            </div>
            
            {currentText.translation && (
              <details style={{ marginTop: '20px' }}>
                <summary style={{ cursor: 'pointer', color: '#003580', fontWeight: '600' }}>
                  Näytä englanninkielinen käännös
                </summary>
                <p style={{ fontStyle: 'italic', color: '#666', marginTop: '10px', lineHeight: '1.6' }}>
                  {currentText.translation}
                </p>
              </details>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
        Debug: texts={texts.length}, idx={currentIdx}, mode={mode}
      </div>

      {showForm && (
        <Card className="add-text-form" style={{ marginBottom: '15px', padding: '15px', background: '#f0f4ff', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>Lisää uusi teksti</h4>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>X</button>
          </div>
          <input 
            id="new-title" 
            type="text" 
            placeholder="Otsikko" 
            value={newText.title} 
            onChange={(e) => setNewText(prev => ({ ...prev, title: e.target.value }))}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <select 
            value={newText.level} 
            onChange={(e) => setNewText(prev => ({ ...prev, level: e.target.value }))}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
          <textarea 
            id="new-text" 
            placeholder="Teksti (suomeksi)..." 
            rows={4} 
            value={newText.text} 
            onChange={(e) => setNewText(prev => ({ ...prev, text: e.target.value }))}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>Peruuta</button>
            <button onClick={handleAddText} style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#28a745', color: 'white' }}>Tallenna</button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {texts.map((t, i) => (
          <button
            key={t.id}
            onClick={(e) => { e.stopPropagation(); console.log('Nav clicked', i); setCurrentIdx(i); }}
            style={{
              padding: '8px 12px',
              background: currentIdx === i ? '#003580' : 'white',
              color: currentIdx === i ? 'white' : '#003580',
              border: '2px solid #003580',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {i + 1}. {t.title?.substring(0, 12)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>{currentText.title}</h3>
        <span style={{ background: '#e8f4fd', color: '#003580', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>{currentText.level}</span>
      </div>

      {/* FULL TEXT DISPLAY - No truncation */}
      <div 
        style={{ 
          margin: '20px 0', 
          lineHeight: '2', 
          fontSize: '1.05rem',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflow: 'visible',
          maxHeight: 'none'
        }}
      >
        {currentText.text?.split(' ').map((word, i) => {
          const clean = word.replace(/[^a-zäöå]/gi, '');
          return (
            <span
              key={i}
              onClick={(e) => handleWordClick(e, word)}
              style={{
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                position: 'relative',
                zIndex: 2
              }}
              onMouseOver={(e) => e.target.style.background = '#e8f4fd'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
              title="Klikkaa nähdäksesi merkityksen"
            >
              {word}{' '}
            </span>
          );
        })}
      </div>

      {/* View Full Text Button */}
      <button 
        onClick={() => setShowFullText(true)}
        style={{ 
          cursor: 'pointer', 
          padding: '10px 20px', 
          background: '#6c757d', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.95rem',
          fontWeight: '600'
        }}
      >
        📖 Lue koko teksti
      </button>

      {currentText.translation && (
        <details style={{ margin: '15px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
          <summary style={{ cursor: 'pointer', color: '#003580', fontWeight: '600' }}>Näytä käännös</summary>
          <p style={{ margin: '10px 0 0 0', fontStyle: 'italic', color: '#666' }}>{currentText.translation}</p>
        </details>
      )}

      {mode === 'practice' && !showResults && (
        <button 
          onClick={() => alert('Lue kysymys ensin, etsi avainsana tekstistä!')} 
          style={{ 
            cursor: 'pointer', 
            padding: '8px 16px', 
            background: '#fff3cd', 
            color: '#856404', 
            border: '1px solid #ffc107', 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontWeight: '600'
          }}
        >
          Lukuvinkki
        </button>
      )}

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '12px' }}>Kysymykset ({currentText.questions?.length || 0})</h4>
        {(currentText.questions || []).map((q, qi) => (
          <div key={q.id} style={{ marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>
              <span style={{ background: '#003580', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', marginRight: '8px' }}>{qi + 1}</span>
              {q.question}
              {q.type === 'true-false' && <span style={{ color: '#666', fontSize: '0.9rem', marginLeft: '8px' }}>(Tosi/Epätosi)</span>}
            </p>
            
            {q.type === 'multiple-choice' && q.options?.map((opt, oi) => (
              <label key={oi} style={{ display: 'block', margin: '6px 0', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e8f4fd'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <input 
                  type="radio" 
                  name={currentText.id + '-' + q.id} 
                  value={oi} 
                  checked={answers[q.id] === oi} 
                  onChange={() => handleAnswer(q.id, oi)} 
                  disabled={mode === 'exam' && showResults}
                  style={{ marginRight: '8px' }}
                />
                {opt}
              </label>
            ))}
            
            {q.type === 'true-false' && (
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name={currentText.id + '-' + q.id} 
                    value="true" 
                    checked={answers[q.id] === true} 
                    onChange={() => handleAnswer(q.id, true)} 
                    disabled={mode === 'exam' && showResults}
                    style={{ marginRight: '6px' }}
                  />
                  Tosi
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name={currentText.id + '-' + q.id} 
                    value="false" 
                    checked={answers[q.id] === false} 
                    onChange={() => handleAnswer(q.id, false)} 
                    disabled={mode === 'exam' && showResults}
                    style={{ marginRight: '6px' }}
                  />
                  Epätosi
                </label>
              </div>
            )}
            
            {showResults && (
              <p style={{ 
                margin: '10px 0 0 0', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                fontWeight: '600',
                background: answers[q.id] === q.correct ? '#d4edda' : '#f8d7da',
                color: answers[q.id] === q.correct ? '#155724' : '#721c24'
              }}>
                {answers[q.id] === q.correct ? 'Oikein!' : 'Väärin. Oikea: ' + (q.type === 'true-false' ? (q.correct ? 'Tosi' : 'Epätosi') : q.options?.[q.correct])}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!showResults && (
          <button 
            onClick={handleSubmit} 
            style={{ 
              cursor: 'pointer', 
              padding: '12px 24px', 
              background: mode === 'exam' ? '#dc3545' : '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600'
            }}
          >
            {mode === 'exam' ? 'Lähetä koe' : 'Tarkista vastaukset'}
          </button>
        )}
        {showResults && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handlePrev} 
              disabled={currentIdx === 0} 
              style={{ 
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', 
                padding: '10px 20px', 
                background: 'white', 
                color: '#003580', 
                border: '2px solid #003580', 
                borderRadius: '6px',
                opacity: currentIdx === 0 ? 0.5 : 1
              }}
            >
              Edellinen
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentIdx >= texts.length - 1} 
              style={{ 
                cursor: currentIdx >= texts.length - 1 ? 'not-allowed' : 'pointer', 
                padding: '10px 20px', 
                background: 'white', 
                color: '#003580', 
                border: '2px solid #003580', 
                borderRadius: '6px',
                opacity: currentIdx >= texts.length - 1 ? 0.5 : 1
              }}
            >
              Seuraava
            </button>
          </div>
        )}
      </div>

      {!showForm && (
        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed #ccc', textAlign: 'center' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); console.log('Add text clicked'); setShowForm(true); }} 
            style={{ 
              cursor: 'pointer', 
              padding: '10px 20px', 
              background: '#003580', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              marginRight: '10px'
            }}
          >
            Lisää oma teksti
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); console.log('Sync clicked'); handleSync(); }} 
            style={{ 
              cursor: 'pointer', 
              padding: '10px 20px', 
              background: '#24292e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              marginRight: '10px'
            }}
          >
            Sync tekstit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); console.log('Export vocab clicked'); handleExportVocab(); }} 
            style={{ 
              cursor: 'pointer', 
              padding: '10px 20px', 
              background: '#764ba2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px'
            }}
          >
            Vie vocabularies.json ({pendingExport})
          </button>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
            Sanoja odottaa vientiä: {pendingExport}
          </p>
        </div>
      )}
    </Card>
  );
}
