import { useState } from 'react';

export default function DifficultyRating({ wordId, difficulty, onChange }) {
  const [current, setCurrent] = useState(difficulty || 'medium');

  const difficulties = [
    { value: 'easy', emoji: '😎', label: 'Helppo' },
    { value: 'medium', emoji: '🙂', label: 'Keskitaso' },
    { value: 'hard', emoji: '🤔', label: 'Vaikea' },
    { value: 'very-hard', emoji: '😵', label: 'Erittäin vaikea' }
  ];

  const handleSelect = (value) => {
    setCurrent(value);
    if (onChange) onChange(value);
    
    // Save to LocalStorage
    const allDifficulties = JSON.parse(localStorage.getItem('finnish-word-difficulties') || '{}');
    allDifficulties[wordId] = value;
    localStorage.setItem('finnish-word-difficulties', JSON.stringify(allDifficulties));
  };

  return (
    <div className="difficulty-rating">
      <span className="difficulty-label">Vaikeus:</span>
      <div className="difficulty-buttons">
        {difficulties.map(diff => (
          <button
            key={diff.value}
            className={`difficulty-btn ${current === diff.value ? 'active' : ''}`}
            onClick={() => handleSelect(diff.value)}
            title={diff.label}
          >
            {diff.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}