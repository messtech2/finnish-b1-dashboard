import { useState } from 'react';
import Card from './ui/Card';
import ReadingModule from './yki/ReadingModule';

export default function YkiTrainingHub() {
  const [mode, setMode] = useState('practice');

  return (
    <Card>
      <h2>📘 YKI B1 Lukeminen</h2>
      
      {/* Mode buttons - simple and working */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
        {['practice', 'exam', 'review'].map(m => (
          <button
            key={m}
            onClick={() => {
              console.log('Mode:', m);
              setMode(m);
            }}
            style={{
              padding: '10px 20px',
              border: '2px solid ' + (mode === m ? '#003580' : '#ccc'),
              background: mode === m ? '#003580' : 'white',
              color: mode === m ? 'white' : '#003580',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: mode === m ? 'bold' : 'normal'
            }}
          >
            {m === 'practice' ? '🟢 Harjoitus' : m === 'exam' ? '🔴 Koe' : '🔵 Kertaus'}
          </button>
        ))}
      </div>

      {/* Pass mode to ReadingModule */}
      <ReadingModule mode={mode} />
    </Card>
  );
}
