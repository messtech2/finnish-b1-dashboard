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
  editingId, 
  baseIds,
  activeWordId,
  setActiveWordId,
  getProgress,
  completeStep
}) {
  const { speak, stop, isSpeaking, isWordPlaying } = useTTS();
  const { srsData } = useSRS();
  const [expandedCards, setExpandedCards] = useState({});
  const [showTranslation, setShowTranslation] = useState({});

  const toggleExpand = (wordId) => {
    setExpandedCards(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const toggleTranslation = (wordId) => {
    setShowTranslation(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const handleSpeak = (word, e) => {
    e.stopPropagation();
    if (isWordPlaying(word.id)) stop();
    else {
      speak(word.word, { sentence: word.example }, word.id);
      setActiveWordId?.(word.id);
      completeStep?.(word.id, 'read');
    }
  };

  if (words.length === 0) {
    return (
      <Card className="vocab-empty">
        <span className="empty-emoji">📚</span>
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
        {words.map((word) => {
          const isBaseWord = baseIds?.includes(word.id);
          const srs = srsData[word.id] || { strength: 0 };
          const progress = getProgress(word.id);
          const isPlaying = isWordPlaying(word.id);
          const isExpanded = expandedCards[word.id];
          const showTrans = showTranslation[word.id];

          return (
            <Card 
              key={word.id}
              className={`vocab-card ${isExpanded ? 'expanded' : ''} ${activeWordId === word.id ? 'active' : ''}`}
              onClick={() => toggleExpand(word.id)}
              hover={true}
            >
              {/* Left Border Progress Indicator */}
              <div className="card-progress-indicator" style={{
                background: progress.mastered ? 'var(--success)' : 
                           srs.strength > 0 ? 'var(--primary)' : '#e0e0e0'
              }} />

              {/* Sentence (Primary - Large) */}
              <div className="vocab-sentence">
                <button 
                  className={`audio-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={(e) => handleSpeak(word, e)}
                  type="button"
                >
                  {isPlaying ? '⏹️' : '🔊'}
                </button>
                <div className="sentence-content">
                  <p className="sentence-text">{word.example}</p>
                  {showTrans && word.exampleTranslation && (
                    <p className="sentence-translation">{word.exampleTranslation}</p>
                  )}
                </div>
                <button 
                  className="translate-btn"
                  onClick={(e) => { e.stopPropagation(); toggleTranslation(word.id); }}
                  type="button"
                >
                  {showTrans ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Word + Meaning (Secondary) */}
              <div className="vocab-word">
                <div className="word-main">
                  <span className="word-finnish">{word.word}</span>
                  {showTrans && word.meaning && (
                    <span className="word-meaning">= {word.meaning}</span>
                  )}
                </div>
                <div className="word-meta">
                  {word.category && <span className="category-badge">{word.category}</span>}
                  {srs.strength > 0 && (
                    <div className="srs-dots">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`srs-dot ${i <= srs.strength ? 'filled' : ''}`} />
                      ))}
                    </div>
                  )}
                  {progress.mastered && <span className="mastered-badge" title="Hallittu">🏆</span>}
                </div>
              </div>

              {/* Expanded Actions */}
              {isExpanded && (
                <div className="vocab-actions">
                  <div className="practice-section">
                    <span className="section-label">Harjoittele:</span>
                    <div className="practice-buttons">
                      <button className="practice-btn read" onClick={(e) => { e.stopPropagation(); completeStep?.(word.id, 'read'); }} type="button">
                        📖 Opiskele
                      </button>
                      <button className="practice-btn speak" onClick={(e) => { e.stopPropagation(); completeStep?.(word.id, 'practice'); }} type="button">
                        🗣️ Puhu
                      </button>
                      <button className="practice-btn game" onClick={(e) => { e.stopPropagation(); completeStep?.(word.id, 'game'); }} type="button">
                        🎮 Testaa
                      </button>
                    </div>
                  </div>
                  {!isBaseWord && (
                    <div className="action-section">
                      <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(word); }} type="button">
                        ✏️ Muokkaa
                      </button>
                      <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(word.id); }} type="button">
                        🗑️ Poista
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Expand Indicator */}
              <div className="expand-indicator">{isExpanded ? '▲' : '▼'}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
