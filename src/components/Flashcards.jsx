import { useState } from 'react';
import { useTTS } from '../hooks/useTTS';

export default function Flashcards({ words }) {
  const { speak, isSpeaking } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (words.length === 0) return <div className="card-placeholder">Add words to practice!</div>;

  const currentWord = words[currentIndex];

  const handleSpeak = () => {
    speak(currentWord.finnish, { rate: 0.85, pitch: 1.1 });
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  return (
    <div className="flashcard-container">
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-front">
          <h2>{currentWord.finnish}</h2>
          <button 
            className={`speaker-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak();
            }}
            disabled={isSpeaking}
            title="Kuuntele ääntämys"
          >
            {isSpeaking ? '🔊' : '🔈'}
          </button>
          <p className="hint">(Click card to reveal)</p>
        </div>
        <div className="card-back">
          <h2>{currentWord.meaning}</h2>
        </div>
      </div>
      
      <div className="controls">
        <button onClick={handlePrev}>Previous</button>
        <span>{currentIndex + 1} / {words.length}</span>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}