import { useTTS } from '../hooks/useTTS';
import { useSRS } from '../hooks/useSRS';
import AchievementBadge from './AchievementBadge';
import StrengthTracker from './StrengthTracker';

export default function VocabularyList({ 
  words, 
  totalWords, 
  onDelete, 
  onEdit, 
  editingId, 
  baseIds,
  showEnglish = false,
  activeWordId,
  setActiveWordId,
  getProgress,
  completeStep
}) {
  const { speak, isSpeaking } = useTTS();
  const { srsData, updateStrength } = useSRS();

  const handleSpeak = (word) => {
    speak(word.word, { sentence: word.example });
    if (activeWordId !== word.id) {
      setActiveWordId(word.id);
      completeStep(word.id, 'read');
    }
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
        {words.map((word, index) => {
          const isBaseWord = baseIds?.includes(word.id);
          const srs = srsData[word.id] || { strength: 0 };
          const progress = getProgress(word.id);
          
          // ✅ FIX: Include index in key for extra uniqueness
          return (
            <li key={`vocab-${word.id}-idx${index}`} className={`vocab-item ${editingId === word.id ? 'editing' : ''} ${activeWordId === word.id ? 'active-learning' : ''}`}>
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
                {showEnglish && word.exampleTranslation && (
                  <p className="example-translation">{word.exampleTranslation}</p>
                )}
              </div>

              <div className="word-section">
                <div className="word-info">
                  <strong className="word-finnish">{word.word}</strong>
                  {showEnglish && <span className="word-meaning">= {word.meaning}</span>}
                </div>
                <div className="word-meta">
                  {word.category && <span className="category-badge">{word.category}</span>}
                  {srs.strength > 0 && <StrengthTracker strength={srs.strength} />}
                  {progress.mastered && <span className="mastered-badge-small">🏆</span>}
                </div>
              </div>

              <div className="word-actions">
                {!isBaseWord && (
                  <button className="edit-btn-small" onClick={() => onEdit(word)} title="Muokkaa">✏️</button>
                )}
                {!isBaseWord && (
                  <button className="delete-btn" onClick={() => onDelete(word.id)} title="Poista">×</button>
                )}
              </div>

              <div className="word-achievement">
                <AchievementBadge 
                  progress={progress}
                  wordId={word.id}
                  onCompleteStep={(step) => completeStep(word.id, step)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function highlightWord(sentence, word) {
  if (!sentence || !word) return sentence;
  const regex = new RegExp(`(${word})`, 'gi');
  const parts = sentence.split(regex);
  return parts.map((part, i) => 
    part.toLowerCase() === word.toLowerCase() ? (
      <span key={`hl-${i}-${Date.now()}`} className="word-highlight">{part}</span>
    ) : part
  );
}
