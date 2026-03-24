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
        <p className="yki-subtitle">Harjoittele YKI-lukukoetta</p>
      </div>

      <div className="yki-modes">
        {modes.map(m => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
            type="button"
          >
            {m.label}
          </button>
        ))}
      </div>

      <ReadingModule mode={mode} />

      <div className="yki-info">
        <h4>📖 Miten harjoitella?</h4>
        <ol>
          <li><strong>🟢 Harjoitus:</strong> Lue teksti, vastaa, klikkaa tuntemattomia sanoja</li>
          <li><strong>🔴 Koe:</strong> Ajastettu koe ilman vihjeitä (30 min)</li>
          <li><strong>🔵 Kertaus:</strong> Tee uudelleen harjoitellut tekstit</li>
        </ol>
      </div>
    </Card>
  );
}
