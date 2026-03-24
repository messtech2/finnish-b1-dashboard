import { useState } from 'react';
import { useTTS } from '../hooks/useTTS';
import { useSRS } from '../hooks/useSRS';
import Card from './ui/Card';
import './VocabularyList.css';

export default function VocabularyList({ 
  words, 
  totalWords, 
  onDelete, 
  onEdit, 
  baseIds,
  getProgress,
  completeStep
}) {
  const { speak, stop } = useTTS();
  const { srsData } = useSRS();
  
  // ✅ Track ONLY one open card (by index)
  const [openIndex, setOpenIndex] = useState(null);

  // ✅ Toggle: open this card, close others
  const toggleCard = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // ✅ Handle action buttons - CRITICAL: stop propagation
  const handleAction = (e, action, word, wordIndex) => {
    e.stopPropagation(); // 🔥 PREVENTS parent card click
    
    console.log(`[Action] ${action} for:`, word.word);

    if (action === 'study') {
      // 📖 Opiskele: Mark complete + play audio
      if (completeStep) completeStep(word.id, 'read');
      stop();
      speak(word.example || word.word);
    }
    if (action === 'speak') {
      // 🗣️ Puhu: Mark complete
      if (completeStep) completeStep(word.id, 'practice');
    }
    if (action === 'test') {
      // 🎮 Testaa: Mark complete
      if (completeStep) completeStep(word.id, 'game');
    }
  };

  // ✅ Handle edit/delete - ALSO stop propagation
  const handleEdit = (e, word) => {
    e.stopPropagation();
    if (onEdit) onEdit(word);
  };

  const handleDelete = (e, wordId) => {
    e.stopPropagation();
    if (onDelete) onDelete(wordId);
  };

  if (!words || words.length === 0) {
    return (
      <Card className="vocab-empty">
        <h3>Ei sanoja vielä</h3>
        <p>Lisää ensimmäinen sana aloittaaksesi!</p>
      </Card>
    );
  }

  return (
    <div className="vocab-list">
      <div className="vocab-header">
        <h2>Sanasto</h2>
        <span className="vocab-count">{totalWords} sanaa</span>
      </div>
      
      <div className="vocab-cards">
        {words.map((word, index) => {
          const isOpen = openIndex === index;
          const progress = getProgress(word.id);
          const srs = srsData[word.id] || { strength: 0 };
          const isBaseWord = baseIds?.includes(word.id);

          return (
            <Card
              key={word.id}
              className={`vocab-card ${isOpen ? 'open' : ''}`}
              onClick={() => toggleCard(index)}
            >
              {/* TOP: Word + Category */}
              <div className="vocab-header">
                <h3 className="word-finnish">{word.word}</h3>
                {word.category && (
                  <span className="category-badge">{word.category}</span>
                )}
              </div>

              {/* Sentence + Audio */}
              <div className="vocab-sentence">
                <button 
                  className="audio-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    stop();
                    speak(word.example || word.word);
                  }}
                  type="button"
                >
                  🔈
                </button>
                <p className="sentence-text">{word.example}</p>
              </div>

              {/* ACTION BUTTONS - Only show when card is open */}
              {isOpen && (
                <div className="actions">
                  <button 
                    className={`practice-btn read ${progress.read ? 'done' : ''}`}
                    onClick={(e) => handleAction(e, 'study', word, index)}
                    type="button"
                  >
                    📖 Opiskele
                  </button>

                  <button 
                    className={`practice-btn speak ${progress.practice ? 'done' : ''}`}
                    onClick={(e) => handleAction(e, 'speak', word, index)}
                    type="button"
                  >
                    🗣️ Puhu
                  </button>

                  <button 
                    className={`practice-btn game ${progress.game ? 'done' : ''}`}
                    onClick={(e) => handleAction(e, 'test', word, index)}
                    type="button"
                  >
                    🎮 Testaa
                  </button>

                  {!isBaseWord && (
                    <button
                      className="action-btn"
                      onClick={(e) => handleDelete(e, word.id)}
                      type="button"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
