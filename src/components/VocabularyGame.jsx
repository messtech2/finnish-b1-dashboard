import { useState, useEffect, useCallback } from 'react';
import { useTTS } from '../hooks/useTTS';

export default function VocabularyGame({ words }) {
  const { speak, isSpeaking } = useTTS();
  const [gameWords, setGameWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [answers, setAnswers] = useState([]);

  const startNewRound = useCallback(() => {
    if (words.length < 5) return;
    
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    setGameWords(selected);
    setCurrentIndex(0);
    setScore(0);
    setRoundComplete(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowTranslation(false);
    setShowExample(false);
    setAnswers([]);
    
    if (selected.length > 0) {
      generateOptions(selected[0], selected);
    }
  }, [words]);

  const generateOptions = (correctWord, allWords) => {
    const otherWords = allWords.filter(w => w.id !== correctWord.id);
    const shuffledOthers = otherWords.sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.definition_fi);
    
    const allOptions = [...wrongOptions, correctWord.definition_fi];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    setOptions(shuffledOptions);
  };

  useEffect(() => {
    if (words.length >= 5) {
      startNewRound();
    }
  }, [words, startNewRound]);

  if (words.length < 5) {
    return (
      <div className="game-container">
        <h3>🎮 Vocabulary Challenge</h3>
        <p className="game-message">
          ⚠️ Add at least 5 words to start the game!
        </p>
      </div>
    );
  }

  if (gameWords.length === 0) return null;

  const currentWord = gameWords[currentIndex];

  const handleSelectAnswer = (option) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    const correct = option === currentWord.definition_fi;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    setAnswers(prev => [...prev, {
      word: currentWord,
      selected: option,
      correct: correct
    }]);
  };

  const handleNext = () => {
    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowTranslation(false);
      setShowExample(false);
      generateOptions(gameWords[currentIndex + 1], gameWords);
    } else {
      setRoundComplete(true);
    }
  };

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const handleToggleExample = () => {
    setShowExample(!showExample);
  };

  const handleSpeak = () => {
    speak(currentWord.finnish, { rate: 0.85, pitch: 1.1 });
  };

  if (roundComplete) {
    return (
      <div className="game-container">
        <h3>🎮 Vocabulary Challenge</h3>
        <div className="game-results">
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/ 5</span>
          </div>
          <p className="result-message">
            {score === 5 ? '🏆 Täydellinen! Perfect!' :
             score >= 3 ? '👍 Hyvä! Good job!' :
             '💪 Harjoittele lisää! Keep practicing!'}
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
                <span className="answer-result">
                  {answer.correct ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>

          <button onClick={startNewRound} className="game-btn">
            🔄 Play Again (New 5 Words)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h3>🎮 Vocabulary Challenge</h3>
        <div className="game-progress">
          Word {currentIndex + 1} of 5 | Score: {score}
        </div>
      </div>

      <div className="game-card">
        <div className="question-section">
          <div className="game-word">
            <h2>{currentWord.finnish}</h2>
            <button 
              className={`speaker-btn-game ${isSpeaking ? 'speaking' : ''}`} 
              onClick={handleSpeak}
              disabled={isSpeaking}
              title="Kuuntele ääntämys"
            >
              {isSpeaking ? '🔊' : '🔈'}
            </button>
          </div>
          <p className="question-instruction">
            Valitse oikea määritelmä suomeksi:
          </p>
        </div>

        <div className="translation-section">
          <button onClick={handleToggleTranslation} className="toggle-btn">
            {showTranslation ? '🙈 Piilota käännös' : '👁️ Näytä käännös'}
          </button>
          {showTranslation && (
            <div className="translation-content">
              <p className="translation-text"><strong>English:</strong> {currentWord.meaning}</p>
            </div>
          )}
        </div>

        <div className="example-section">
          <button onClick={handleToggleExample} className="toggle-btn secondary">
            {showExample ? '📖 Piilota esimerkki' : '📖 Näytä esimerkki'}
          </button>
          {showExample && (
            <div className="example-content">
              <p className="example-finnish">"{currentWord.example}"</p>
              <p className="example-english">{currentWord.exampleTranslation}</p>
            </div>
          )}
        </div>

        <div className="options-container">
          <div className="options-grid">
            {options.map((option, index) => {
              let buttonClass = 'option-btn';
              if (selectedAnswer !== null) {
                if (option === currentWord.definition_fi) {
                  buttonClass += ' correct';
                } else if (option === selectedAnswer) {
                  buttonClass += ' incorrect';
                }
              }
              
              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {selectedAnswer !== null && (
          <div className={`game-result ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-icon">
              {isCorrect ? '✅' : '❌'}
            </div>
            <div className="result-text">
              <p className="result-status">
                {isCorrect ? 'Oikein! Correct!' : 'Väärin! Not quite...'}
              </p>
              {!isCorrect && (
                <p className="correct-answer">
                  <strong>Oikea vastaus:</strong> {currentWord.definition_fi}
                </p>
              )}
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