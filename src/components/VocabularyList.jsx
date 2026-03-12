import { useTTS } from '../hooks/useTTS';

export default function VocabularyList({ words, totalWords, onDelete, onEdit, editingId, baseIds }) {
  const { speak, isSpeaking } = useTTS();

  const handleSpeak = (text) => {
    speak(text, { rate: 0.9, pitch: 1.0 });
  };

  if (words.length === 0) {
    return (
      <div className="vocab-list">
        <h3>📚 My Vocabulary ({totalWords})</h3>
        <p className="empty-state">No words added yet.</p>
      </div>
    );
  }

  return (
    <div className="vocab-list">
      <h3>📚 My Vocabulary ({totalWords})</h3>
      <ul>
        {words.map((word) => {
          const isBaseWord = baseIds?.includes(word.id);
          return (
            <li key={word.id} className={editingId === word.id ? 'editing' : ''}>
              <div className="word-content">
                <strong>{word.finnish}</strong> - {word.meaning}
                {isBaseWord && <span className="base-badge">📄 Base</span>}
              </div>
              <div className="word-actions">
                <button 
                  className={`speaker-btn-small ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => handleSpeak(word.finnish)}
                  disabled={isSpeaking}
                  title="Kuuntele ääntämys"
                >
                  {isSpeaking ? '🔊' : '🔈'}
                </button>
                {!isBaseWord && (
                  <button 
                    className="edit-btn-small" 
                    onClick={() => onEdit(word)}
                    title="Edit word"
                  >
                    ✏️
                  </button>
                )}
                {!isBaseWord && (
                  <button 
                    className="delete-btn" 
                    onClick={() => onDelete(word.id)}
                    title="Delete word"
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}