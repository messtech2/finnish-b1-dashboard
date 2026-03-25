import { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import { usePronunciation } from '../hooks/usePronunciation';
import Card from './ui/Card';
import './Flashcards.css';

export default function Flashcards({ words, activeWordId, setActiveWordId, onCompletePracticeStep }) {
  const { speak, pause, resume, stop, isPlaying, isPaused } = useTTS();
  const { startListening, listening, result, resetResult } = usePronunciation();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hideWord, setHideWord] = useState(true);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [audioActive, setAudioActive] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord?.id && setActiveWordId) {
      setActiveWordId(currentWord.id);
    }
  }, [currentWord, setActiveWordId]);
  // In your Quiz/Flashcard components, load vocabulary like this:

useEffect(() => {
  const loadVocab = async () => {
    try {
      const res = await fetch('/vocabularies.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setVocabulary(data.vocabulary || []);
      }
    } catch (e) {
      console.warn('Vocab load failed:', e);
    }
  };
  loadVocab();
}, []);

  const handlePlayPause = () => {
    if (!currentWord) return;
    const text = currentWord.example || currentWord.word;
    
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      setAudioActive(true);
      speak(text);
    }
  };

  const handleStop = () => {
    stop();
    setAudioActive(false);
  };

  const handlePronunciation = () => {
    if (!currentWord) return;
    startListening(currentWord.example || currentWord.word);
  };

  const handleNext = () => {
    stop();
    setAudioActive(false);
    if (practiceCompleted && currentWord?.id && onCompletePracticeStep) {
      onCompletePracticeStep(currentWord.id);
    }
    setIsFlipped(false);
    resetResult();
    setHideWord(true);
    setPracticeCompleted(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  };

  const handlePrev = () => {
    stop();
    setAudioActive(false);
    setIsFlipped(false);
    resetResult();
    setHideWord(true);
    setPracticeCompleted(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const createBlankSentence = (sentence, word) => {
    if (!sentence || !word) return sentence;
    return sentence.replace(new RegExp(word, 'gi'), '______');
  };

  if (words.length === 0) {
    return <Card className="flashcards-empty"><p>Lisää sanoja harjoitteluun!</p></Card>;
  }

  if (!currentWord) return null;

  // ✅ Controls visible when audio has been activated for this card
  const showControls = audioActive || isPlaying || isPaused;

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
              <p className="sentence-text">{hideWord ? createBlankSentence(currentWord.example, currentWord.word) : currentWord.example}</p>
              
              {/* ✅ Audio Controls */}
              <div className="audio-controls">
                <button 
                  className={`audio-btn-small ${isPlaying ? 'playing' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                  title={isPlaying ? 'Tauko' : isPaused ? 'Jatka' : 'Kuuntele'}
                  type="button"
                >
                  {isPlaying ? '⏸️' : isPaused ? '▶️' : '🔈'}
                </button>
                {showControls && (
                  <button 
                    className="audio-btn-small stop"
                    onClick={(e) => { e.stopPropagation(); handleStop(); }}
                    title="Pysäytä"
                    type="button"
                  >
                    ⏹️
                  </button>
                )}
              </div>
              
              {currentWord.exampleTranslation && <p className="sentence-translation">{currentWord.exampleTranslation}</p>}
              <p className="flip-hint">Napauta kääntääksesi</p>
            </div>

            <div className="card-back">
              <h2 className="word-text">{currentWord.word}</h2>
              <p className="meaning-text">{currentWord.meaning}</p>
              <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={(e) => { e.stopPropagation(); handlePronunciation(); }} disabled={listening} type="button">
                {listening ? '🎤' : '🎙️'} Harjoittele
              </button>
            </div>
          </div>
        </Card>
      </div>

      {result && <div className="pronunciation-result"><PronunciationFeedback result={result} onRetry={handlePronunciation} /></div>}

      <div className="practice-complete">
        <button className={`complete-btn ${practiceCompleted ? 'done' : ''}`} onClick={() => setPracticeCompleted(true)} disabled={practiceCompleted} type="button">
          {practiceCompleted ? '✅ Harjoiteltu' : '📝 Merkitse tehdyksi'}
        </button>
      </div>

      <div className="card-navigation">
        <button onClick={handlePrev} className="nav-btn" type="button">← Edellinen</button>
        <span className="card-counter">{currentIndex + 1} / {words.length}</span>
        <button onClick={handleNext} className="nav-btn primary" type="button">Seuraava →</button>
      </div>
    </div>
  );
}
