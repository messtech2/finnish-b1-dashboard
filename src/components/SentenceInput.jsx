import { useState } from 'react';

export default function SentenceInput({ wordId, word, userExamples = [], onSave }) {
  const [examples, setExamples] = useState(userExamples);
  const [newExample, setNewExample] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAdd = () => {
    if (!newExample.trim()) return;
    
    const updated = [...examples, newExample.trim()];
    setExamples(updated);
    setNewExample('');
    
    // Save to LocalStorage
    const allUserExamples = JSON.parse(localStorage.getItem('finnish-user-examples') || '{}');
    allUserExamples[wordId] = updated;
    localStorage.setItem('finnish-user-examples', JSON.stringify(allUserExamples));
    
    if (onSave) onSave(wordId, updated);
  };

  const handleDelete = (index) => {
    const updated = examples.filter((_, i) => i !== index);
    setExamples(updated);
    
    const allUserExamples = JSON.parse(localStorage.getItem('finnish-user-examples') || '{}');
    allUserExamples[wordId] = updated;
    localStorage.setItem('finnish-user-examples', JSON.stringify(allUserExamples));
  };

  return (
    <div className="sentence-input">
      <button 
        className="expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '🔽 Piilota' : '🔽 Oma lause'}
      </button>

      {isExpanded && (
        <div className="sentence-input-content">
          <div className="existing-examples">
            {examples.length > 0 && (
              <ul>
                {examples.map((example, index) => (
                  <li key={index} className="user-example">
                    <span>{highlightWord(example, word)}</span>
                    <button 
                      className="delete-example-btn"
                      onClick={() => handleDelete(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="add-example">
            <input
              type="text"
              placeholder={`Kirjoita lause sanalla "${word}"...`}
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="add-btn">Lisää</button>
          </div>
        </div>
      )}
    </div>
  );
}

function highlightWord(sentence, word) {
  const regex = new RegExp(`(${word})`, 'gi');
  const parts = sentence.split(regex);
  return parts.map((part, i) => 
    part.toLowerCase() === word.toLowerCase() ? (
      <mark key={i}>{part}</mark>
    ) : part
  );
}