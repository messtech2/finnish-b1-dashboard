import { useState, useMemo } from 'react';
import { useTTS } from '../hooks/useTTS';

// ✅ Pure, deterministic shuffle function (defined OUTSIDE component)
const deterministicShuffle = (array, seed) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const hash = (seed + i) * 9301 + 49297;
    const j = Math.abs(hash % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ✅ Pure function to generate options array (no side effects)
const generateOptionsArray = (correctWord, allWords) => {
  const otherWords = allWords.filter(w => w.id !== correctWord.id);
  const shuffledOthers = deterministicShuffle(otherWords, correctWord.id);
  const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.definition_fi);
  const allOptions = [...wrongOptions, correctWord.definition_fi];
  return deterministicShuffle(allOptions, correctWord.id + 1);
};

export default function VocabularyGame({ words, showEnglish = false }) {
  const { speak, isSpeaking } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [gameKey, setGameKey] = useState(0);

  // ✅ DERIVE gameWords (pure, no setState)
  const gameWords = useMemo(() => {
    if (words.length < 5) return [];
    const shuffled = deterministicShuffle(words, gameKey);
    return shuffled.slice(0, 5);
  }, [words, gameKey]);

  // ✅ DERIVE currentWord (pure, no setState)
  const currentWord = gameWords.length > 0 && currentIndex < gameWords.length
    ? gameWords[currentIndex]
    : null;

  // ✅ DERIVE options from gameWords + currentIndex (pure, NO setState!)
  const options = useMemo(() => {
    if (!currentWord || gameWords.length === 0) return [];
    return generateOptionsArray(currentWord, gameWords);
  }, [currentWord, gameWords]);

  // Guard: not enough words
  if (words.length < 5) {
    return (
      <div className="game-container">
        <h3>🎮 Sanavisailu</h3>
        <p className="game-message">⚠️ Lisää vähintään 5 sanaa aloittaaksesi!</p>
      </div>
    );
  }

  if (gameWords.length === 0 || !currentWord) return null;

  const handleSelectAnswer = (option) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
    const correct = option === currentWord.definition_fi;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setAnswers(prev => [...prev, { word: currentWord, selected: option, correct }]);
  };

  const handleNext = () => {
    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowTranslation(false);
      setShowExample(false);
    } else {
      setRoundComplete(true);
    }
  };

  const handleToggleTranslation = () => setShowTranslation(!showTranslation);
  const handleToggleExample = () => setShowExample(!showExample);
  const handleSpeak = () => speak(currentWord.word, { sentence: currentWord.example });

  const startNewRound = () => {
    setGameKey(k => k + 1);
    setCurrentIndex(0);
    setScore(0);
    setRoundComplete(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowTranslation(false);
    setShowExample(false);
    setAnswers([]);
  };

  // Round complete screen
  if (roundComplete) {
    return (
      <div className="game-container">
        <h3>🎮 Sanavisailu</h3>
        <div className="game-results">
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/ 5</span>
          </div>
          <p className="result-message">
            {score === 5 ? '🏆 Täydellinen! Perfect!' :
             score >= 3 ? '👍 Hyvä! Good job!' : '💪 Harjoittele lisää!'}
          </p>
          <div className="answers-review">
            <h4>📋 Your Answers:</h4>
            {answers.map((answer, index) => (
              <div key={index} className={`answer-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                <div className="answer-details">
                  <span className="answer-finnish">{answer.word.finnish}</span>
                  <span className="answer-definition">→ {answer.word.definition_fi}</span>
                  <span className="answer-english">= {answer.word.meaning}</span>
                </div>
                <span className="answer-result">{answer.correct ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
          <button onClick={startNewRound} className="game-btn">🔄 Play Again (New 5 Words)</button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="game-container">
      <div className="game-header">
        <h3>🎮 Sanavisailu</h3>
        <div className="game-progress">Sana {currentIndex + 1} / 5 | Pisteet: {score}</div>
      </div>
      <div className="game-card">
        <div className="question-section">
          <div className="game-word">
            <h2>{currentWord.finnish}</h2>
            <button className={`speaker-btn-game ${isSpeaking ? 'speaking' : ''}`} onClick={handleSpeak} disabled={isSpeaking} title="Kuuntele">
              {isSpeaking ? '🔊' : '🔈'}
            </button>
          </div>
          <p className="question-instruction">Valitse oikea määritelmä suomeksi:</p>
        </div>
        <div className="translation-section">
          <button onClick={handleToggleTranslation} className="toggle-btn">
            {showTranslation ? '🙈 Piilota käännös' : '👁️ Näytä käännös'}
          </button>
          {showTranslation && showEnglish && currentWord.exampleTranslation && (
            <div className="translation-content"><p className="translation-text"><strong>English:</strong> {currentWord.exampleTranslation}</p></div>
          )}
        </div>
        <div className="example-section">
          <button onClick={handleToggleExample} className="toggle-btn secondary">
            {showExample ? '📖 Piilota esimerkki' : '📖 Näytä esimerkki'}
          </button>
          {showExample && (
            <div className="example-content">
              <p className="example-finnish">"{currentWord.example}"</p>
              {showEnglish && <p className="example-english">{currentWord.exampleTranslation}</p>}
            </div>
          )}
        </div>
        <div className="options-container">
          <div className="options-grid">
            {options.map((option, index) => {
              let btnClass = 'option-btn';
              if (selectedAnswer !== null) {
                if (option === currentWord.definition_fi) btnClass += ' correct';
                else if (option === selectedAnswer) btnClass += ' incorrect';
              }
              return (
                <button key={index} className={btnClass} onClick={() => handleSelectAnswer(option)} disabled={selectedAnswer !== null}>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        {selectedAnswer !== null && (
          <div className={`game-result ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-icon">{isCorrect ? '✅' : '❌'}</div>
            <div className="result-text">
              <p className="result-status">{isCorrect ? 'Oikein! Correct!' : 'Väärin!'}</p>
              {!isCorrect && <p className="correct-answer"><strong>Oikea:</strong> {currentWord.definition_fi}</p>}
            </div>
          </div>
        )}
        <div className="game-actions">
          {selectedAnswer !== null && (
            <button onClick={handleNext} className="game-btn">
              {currentIndex < 4 ? 'Seuraava →' : 'Näytä tulokset 🏆'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
