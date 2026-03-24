import { useState } from 'react';
import { useTTS } from '../hooks/useTTS';
import { useSRS } from '../hooks/useSRS';
import Card from './ui/Card';
import './VocabularyList.css';

export default function VocabularyList({ 
  words, totalWords, onDelete, onEdit, editingId, baseIds,
  activeWordId, setActiveWordId, getProgress, completeStep
}) {
  const { speak, pause, resume, stop, isPlaying, isPaused } = useTTS();
  const { srsData } = useSRS();
  const [expandedCards, setExpandedCards] = useState({});
  const [showTranslation, setShowTranslation] = useState({});
  const [activeAudioWord, setActiveAudioWord] = useState(null);

  const toggleExpand = (wordId) => {
    setExpandedCards(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const toggleTranslation = (wordId) => {
    setShowTranslation(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const handlePlayPause = (word) => {
    const text = word.example || word.word;
    
    if (activeAudioWord === word.id) {
      // Toggle same word
      if (isPlaying) {
        pause();
      } else if (isPaused) {
        resume();
      } else {
        speak(text);
      }
    } else {
      // New word - stop old, start new
      stop();
      setActiveAudioWord(word.id);
      speak(text);
    }
  };

  const handleStop = () => {
    stop();
    setActiveAudioWord(null);
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
        {words.map((word, index) => {
          const isBaseWord = baseIds?.includes(word.id);
          const srs = srsData[word.id] || { strength: 0 };
          const progress = getProgress(word.id);
          const isExpanded = expandedCards[word.id];
          const showTrans = showTranslation[word.id];
          const isThisWordPlaying = activeAudioWord === word.id && (isPlaying || isPaused);

          return (
            <Card 
              key={`vocab-${word.id}-${index}`}
              className={`vocab-card ${isExpanded ? 'expanded' : ''} ${activeWordId === word.id ? 'active' : ''}`}
              onClick={() => toggleExpand(word.id)}
              hover={true}
            >
              <div className="card-progress-indicator" style={{
                background: progress.mastered ? 'var(--success)' : 
                           srs.strength > 0 ? 'var(--primary)' : '#e0e0e0'
              }} />

              <div className="vocab-sentence">
                {/* ✅ Audio Controls - visible when this word has audio active */}
                <div className="audio-controls">
                  <button 
                    className={`audio-btn ${isThisWordPlaying && isPlaying ? 'playing' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handlePlayPause(word); }}
                    title={isThisWordPlaying && isPlaying ? 'Tauko' : isThisWordPlaying && isPaused ? 'Jatka' : 'Kuuntele'}
                    type="button"
                  >
                    {isThisWordPlaying && isPlaying ? '⏸️' : isThisWordPlaying && isPaused ? '▶️' : '🔈'}
                  </button>
                  {isThisWordPlaying && (
                    <button 
                      className="audio-btn stop"
                      onClick={(e) => { e.stopPropagation(); handleStop(); }}
                      title="Pysäytä"
                      type="button"
                    >
                      ⏹️
                    </button>
                  )}
                </div>
                
                <div className="sentence-content">
                  <p className="sentence-text">{word.example}</p>
                  {showTrans && word.exampleTranslation && (
                    <p className="sentence-translation">{word.exampleTranslation}</p>
                  )}
                </div>
                <button 
                  className="translate-btn"
                  onClick={(e) => { e.stopPropagation(); toggleTranslation(word.id); }}
                  title={showTrans ? 'Piilota käännös' : 'Näytä käännös'}
                  type="button"
                >
                  {showTrans ? '🙈' : '👁️'}
                </button>
              </div>

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
                      {[1,2,3,4,5].map((i) => (
                        <span key={`dot-${word.id}-${i}`} className={`srs-dot ${i <= srs.strength ? 'filled' : ''}`} />
                      ))}
                    </div>
                  )}
                  {progress.mastered && <span className="mastered-badge" title="Hallittu">🏆</span>}
                </div>
              </div>

              {isExpanded && (
                <div className="vocab-actions">
                  <div className="practice-section">
                    <span className="section-label">Harjoittele:</span>
                    <div className="practice-buttons">
                      <button className="practice-btn read" onClick={(e) => { e.stopPropagation(); completeStep?.(word.id, 'read'); }} type="button">📖 Opiskele</button>
                      <button className="practice-btn speak" onClick={(e) => { e.stopPropagation(); completeStep?.(word.id, 'practice'); }} type="button">🗣️ Puhu</button>
                      <button className="practice-btn game" onClick={(e) => { e.stopPropagation(); completeStep?.(word.id, 'game'); }} type="button">🎮 Testaa</button>
                    </div>
                  </div>
                  {!isBaseWord && (
                    <div className="action-section">
                      <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(word); }} type="button">✏️ Muokkaa</button>
                      <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(word.id); }} type="button">🗑️ Poista</button>
                    </div>
                  )}
                </div>
              )}

              <div className="expand-indicator">{isExpanded ? '▲' : '▼'}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
