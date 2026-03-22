import { useTTS } from '../hooks/useTTS';
import { useSRS } from '../hooks/useSRS';
import SentenceInput from './SentenceInput';
import DifficultyRating from './DifficultyRating';
import StrengthTracker from './StrengthTracker';

export default function VocabularyList({ 
  words, 
  totalWords, 
  onDelete, 
  onEdit, 
  editingId, 
  baseIds,
  showEnglish = false
}) {
  const { speak, isSpeaking } = useTTS();
  // ✅ FIX: Only import what we actually use (NO getDueWords)
  const { updateStrength, srsData } = useSRS();

  const handleSpeak = (word) => {
    speak(word.word, { sentence: word.example });
  };

  const handleStrengthUpdate = (wordId, rating) => {
    updateStrength(wordId, rating);
  };

  if (words.length === 0) {
    return (
      <div className="vocab-list">
        <h3>📚 Sanastoni ({totalWords})</h3>
        <p className="empty-state">Ei sanoja vielä. Lisää ensimmäinen sana!</p>
      </div>
    );
  }

  return (
    <div className="vocab-list">
      <h3>📚 Sanastoni ({totalWords})</h3>
      <ul>
        {words.map((word) => {
          const isBaseWord = baseIds?.includes(word.id);
          const srs = srsData[word.id] || { strength: 0 };
          
          return (
            <li key={word.id} className={`vocab-item ${editingId === word.id ? 'editing' : ''}`}>
              {/* PRIMARY: Finnish Example Sentence */}
              <div className="sentence-section">
                <p className="example-sentence">
                  {highlightWord(word.example, word.word)}
                  <button 
                    className={`speaker-btn-sentence ${isSpeaking ? 'speaking' : ''}`}
                    onClick={() => handleSpeak(word)}
                    disabled={isSpeaking}
                    title="Kuuntele lause"
                  >
                    {isSpeaking ? '🔊' : '🔈'}
                  </button>
                </p>
                
                {/* English translation - TOGGLEABLE */}
                {showEnglish && word.exampleTranslation && (
                  <p className="example-translation">{word.exampleTranslation}</p>
                )}
              </div>

              {/* SECONDARY: Word + Meaning */}
              <div className="word-section">
                <div className="word-info">
                  <strong className="word-finnish">{word.word}</strong>
                  
                  {/* English meaning - TOGGLEABLE */}
                  {showEnglish && (
                    <span className="word-meaning">= {word.meaning}</span>
                  )}
                </div>
                <div className="word-meta">
                  {word.category && (
                    <span className="category-badge">{word.category}</span>
                  )}
                  {srs.strength > 0 && (
                    <StrengthTracker strength={srs.strength} />
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="word-actions">
                {!isBaseWord && (
                  <button 
                    className="edit-btn-small" 
                    onClick={() => onEdit(word)}
                    title="Muokkaa"
                  >
                    ✏️
                  </button>
                )}
                {!isBaseWord && (
                  <button 
                    className="delete-btn" 
                    onClick={() => onDelete(word.id)}
                    title="Poista"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* EXPANDABLE: User Sentences + Difficulty + SRS */}
              <div className="word-details">
                <DifficultyRating 
                  wordId={word.id} 
                  difficulty={word.difficulty || 'medium'}
                />
                <StrengthTracker 
                  strength={srs.strength}
                  onUpdate={(rating) => handleStrengthUpdate(word.id, rating)}
                />
                <SentenceInput 
                  wordId={word.id}
                  word={word.word}
                  userExamples={word.userExamples || []}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Helper: Highlight target word in sentence
function highlightWord(sentence, word) {
  if (!sentence || !word) return sentence;
  const regex = new RegExp(`(${word})`, 'gi');
  const parts = sentence.split(regex);
  return parts.map((part, i) => 
    part.toLowerCase() === word.toLowerCase() ? (
      <mark key={i} className="word-highlight">{part}</mark>
    ) : part
  );
}
