import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import './ReadingModule.css';

export default function ReadingModule({ mode }) {
  const [showForm, setShowForm] = useState(false);
  const [texts, setTexts] = useState([]);

  // Load texts
  useEffect(() => {
    const stored = localStorage.getItem('yki-reading-texts');
    if (stored) setTexts(JSON.parse(stored).texts || []);
  }, []);

  // ✅ SIMPLE ADD FUNCTION
  const addText = () => {
    console.log('✅ ADD BUTTON CLICKED!');
    setShowForm(true);
  };

  const saveText = () => {
    const title = document.getElementById('new-title').value;
    const text = document.getElementById('new-text').value;
    
    if (!title || !text) { alert('Anna otsikko ja teksti!'); return; }
    
    const entry = {
      id: 'user-' + Date.now(),
      title,
      text,
      level: 'B1',
      keywords: [],
      questions: [],
      state: 'new',
      usedInExam: false
    };
    
    const stored = localStorage.getItem('yki-reading-texts') || '{"texts":[]}';
    const data = JSON.parse(stored);
    data.texts.unshift(entry);
    localStorage.setItem('yki-reading-texts', JSON.stringify(data));
    setTexts(data.texts);
    setShowForm(false);
    alert('✅ Tallennettu!');
  };

  return (
    <Card className="yki-reading">
      <h2>📖 Lukeminen</h2>
      
      {/* ✅ ADD BUTTON - SUPER SIMPLE */}
      <button 
        id="test-add-button"
        onClick={() => {
          console.log('🔘 BUTTON CLICKED!');
          setShowForm(true);
        }}
        style={{
          padding: '12px 24px',
          background: '#003580',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        ✍️ Lisää oma teksti
      </button>

      {/* ✅ FORM */}
      {showForm && (
        <div style={{
          background: '#f0f4ff',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>Uusi teksti</h3>
          <input 
            id="new-title"
            type="text" 
            placeholder="Otsikko" 
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
          <textarea 
            id="new-text"
            placeholder="Teksti" 
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
          <button 
            onClick={saveText}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            💾 Tallenna
          </button>
          <button 
            onClick={() => setShowForm(false)}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Peruuta
          </button>
        </div>
      )}

      {/* ✅ TEXT LIST */}
      <div>
        <h3>Tekstit ({texts.length})</h3>
        {texts.length === 0 ? (
          <p>Ei tekstejä vielä.</p>
        ) : (
          texts.map(t => (
            <div key={t.id} style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #ddd'
            }}>
              <strong>{t.title}</strong>
              <p>{t.text?.substring(0, 100)}...</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
