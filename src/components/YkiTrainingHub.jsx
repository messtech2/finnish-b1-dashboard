import { useState } from 'react';
import Card from './ui/Card';
import ReadingModule from './yki/ReadingModule';
import './YkiTrainingHub.css';

export default function YkiTrainingHub() {
  const [mode, setMode] = useState('practice');

  const modes = [
    { id: 'practice', label: '🟢 Harjoitus' },
    { id: 'exam', label: '🔴 Koe' },
    { id: 'review', label: '🔵 Kertaus' }
  ];

  return (
    <Card className="yki-hub">
      <div className="yki-header">
        <h2>📘 YKI B1 Lukeminen</h2>
        <p className="yki-subtitle">Valitse tila ja harjoittele</p>
      </div>

      {/* ✅ MODE BUTTONS - Now Working */}
      <div className="yki-modes">
        {modes.map(m => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => {
              console.log('🔘 Mode changed to:', m.id);
              setMode(m.id);
            }}
            type="button"
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ✅ Pass mode to ReadingModule */}
      <ReadingModule mode={mode} />

      <div className="yki-info">
        <h4>📖 Tilojen erot:</h4>
        <ul>
          <li><strong>🟢 Harjoitus:</strong> Vinkkejä, sanasto klikattavissa, ei ajastinta</li>
          <li><strong>🔴 Koe:</strong> Ei vinkkejä, 30 min ajastin, tekstit kertakäyttöisiä</li>
          <li><strong>🔵 Kertaus:</strong> Tee uudelleen harjoitellut tekstit</li>
        </ul>
      </div>
    </Card>
  );
}
