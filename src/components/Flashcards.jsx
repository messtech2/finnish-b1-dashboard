import { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import { usePronunciation } from '../hooks/usePronunciation';
import Card from './ui/Card';
import './Flashcards.css';

export default function Flashcards({ words, activeWordId, setActiveWordId, onCompletePracticeStep }) {
  const { speak, isSpeaking } = useTTS();
  const { startListening, listening, result, resetResult } = usePronunciation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hideWord, setHideWord] = useState(true);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => { currentWord?.id && setActiveWordId?.(currentWord.id); }, [currentWord, setActiveWordId]);

  const handleNext = () => {
    if (practiceCompleted && currentWord?.id) onCompletePracticeStep?.(currentWord.id);
    setIsFlipped(false);
    resetResult();
    setHideWord(true);
    setPracticeCompleted(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % words.length), 200);
  };

  const createBlank = (sentence, word) => sentence?.replace(new RegExp(word, 'gi'), '______');

  if (!words.length) return <Card className="flashcards-empty"><p>Lisää sanoja harjoitteluun!</p></Card>;

  return (
    <div className="flashcards-container">
      <div className="flashcard-controls">
        <button className={`mode-btn ${hideWord ? 'active' : ''}`} onClick={() => setHideWord(true)} type="button">🧠 Piilota</button>
        <button className={`mode-btn ${!hideWord ? 'active' : ''}`} onClick={() => setHideWord(false)} type="button">👁️ Näytä</button>
      </div>

      <div className="flashcard-wrapper">
        <Card className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          <div className="card-inner">
            <div className="card-front">
              <p className="sentence-text">{hideWord ? createBlank(currentWord.example, currentWord.word) : currentWord.example}</p>
              <button className="audio-btn-small" onClick={(e) => { e.stopPropagation(); speak(currentWord.word, { sentence: currentWord.example }); }} disabled={isSpeaking} type="button">
                {isSpeaking ? '🔊' : '🔈'}
              </button>
              {currentWord.exampleTranslation && <p className="sentence-translation">{currentWord.exampleTranslation}</p>}
              <p className="flip-hint">Napauta kääntääksesi</p>
            </div>
            <div className="card-back">
              <h2 className="word-text">{currentWord.word}</h2>
              <p className="meaning-text">{currentWord.meaning}</p>
              <button className="mic-btn" onClick={(e) => { e.stopPropagation(); startListening(currentWord.example || currentWord.word); }} disabled={listening} type="button">
                {listening ? '🎤' : '🎙️'} Harjoittele
              </button>
            </div>
          </div>
        </Card>
      </div>

      {result && <div className="pronunciation-result"><PronunciationFeedback result={result} onRetry={() => startListening(currentWord.example || currentWord.word)} /></div>}

      <div className="practice-complete">
        <button className={`complete-btn ${practiceCompleted ? 'done' : ''}`} onClick={() => setPracticeCompleted(true)} disabled={practiceCompleted} type="button">
          {practiceCompleted ? '✅ Harjoiteltu' : '📝 Merkitse tehdyksi'}
        </button>
      </div>

      <div className="card-navigation">
        <button onClick={() => { setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + words.length) % words.length); }} className="nav-btn" type="button">← Edellinen</button>
        <span className="card-counter">{currentIndex + 1} / {words.length}</span>
        <button onClick={handleNext} className="nav-btn primary" type="button">Seuraava →</button>
      </div>
    </div>
  );
}
