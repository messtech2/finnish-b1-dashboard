import { useState, useMemo } from 'react';
import { useTTS } from '../hooks/useTTS';
import Card from './ui/Card';
import './VocabularyGame.css';

const generateOptions = (currentWord, allWords) => {
  if (!currentWord || !allWords?.length) return [];
  const correct = currentWord.meaning;
  let pool = allWords.filter(w => w.meaning && w.meaning !== correct).map(w => w.meaning);
  pool = [...new Set(pool)];
  pool.sort(() => 0.5 - Math.random());
  let wrong = pool.slice(0, 3);
  while (wrong.length < 3) wrong.push(`Vaihtoehto ${wrong.length + 1}`);
  return [correct, ...wrong].filter(Boolean).slice(0, 4).sort(() => 0.5 - Math.random());
};

export default function VocabularyGame({ words, activeWordId, setActiveWordId, onCompleteGameStep }) {
  const { speak, isSpeaking } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const gameWords = useMemo(() => {
    if (!words || words.length < 5) return [];
    return [...words].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [words, gameKey]);

  const currentWord = gameWords[currentIndex];
  const options = useMemo(() => generateOptions(currentWord, words), [currentWord, words]);

  useMemo(() => { currentWord?.id && setActiveWordId?.(currentWord.id); }, [currentWord, setActiveWordId]);

  if (!words || words.length < 5) {
    return <Card className="game-empty"><p>⚠️ Lisää 5 sanaa aloittaaksesi!</p></Card>;
  }

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === currentWord.meaning;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < 4) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowExample(false);
      onCompleteGameStep?.(currentWord.id);
    } else {
      onCompleteGameStep?.(currentWord.id);
      setRoundComplete(true);
    }
  };

  const startNewRound = () => {
    setGameKey(k => k + 1);
    setCurrentIndex(0);
    setScore(0);
    setRoundComplete(false);
    setSelected(null);
    setIsCorrect(null);
    setShowExample(false);
  };

  if (roundComplete) {
    return (
      <Card className="game-results">
        <h2>🎮 Tulos</h2>
        <div className="score-display">
          <span className="score-number">{score}</span>
          <span className="score-total">/ 5</span>
        </div>
        <p className="result-message">
          {score === 5 ? '🏆 Täydellinen!' : score >= 3 ? '👍 Hyvä!' : '💪 Harjoittele lisää!'}
        </p>
        <button onClick={startNewRound} className="restart-btn">🔄 Pelaa uudelleen</button>
      </Card>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <span className="game-progress">Sana {currentIndex + 1} / 5</span>
        <span className="game-score">Pisteet: {score}</span>
      </div>

      <Card className="game-card">
        <div className="question-section">
          <h2 className="question-word">{currentWord?.word}</h2>
          <button className="audio-btn" onClick={() => speak(currentWord?.word)} disabled={isSpeaking} type="button">
            {isSpeaking ? '🔊' : '🔈'}
          </button>
        </div>
        <p className="question-instruction">Valitse oikea merkitys:</p>

        {showExample && currentWord?.example && (
          <div className="example-box">
            <p>"{currentWord.example}"</p>
            {currentWord.exampleTranslation && <p className="example-translation">{currentWord.exampleTranslation}</p>}
          </div>
        )}

        <div className="options-grid">
          {options.map((option, i) => {
            let btnClass = 'option-btn';
            if (selected !== null) {
              if (option === currentWord.meaning) btnClass += ' correct';
              else if (option === selected) btnClass += ' incorrect';
            }
            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleSelect(option)}
                disabled={selected !== null}
                type="button"
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'} ${isCorrect ? 'animate-success' : 'animate-shake'}`}>
            <span>{isCorrect ? '✅ Oikein!' : '❌ Väärin!'}</span>
            {!isCorrect && <span>Oikea: {currentWord.meaning}</span>}
          </div>
        )}

        <div className="game-actions">
          <button className="toggle-example-btn" onClick={() => setShowExample(!showExample)} type="button">
            {showExample ? '📖 Piilota esimerkki' : '📖 Näytä esimerkki'}
          </button>
          {selected !== null && (
            <button className="next-btn" onClick={handleNext} type="button">
              {currentIndex < 4 ? 'Seuraava →' : 'Näytä tulos 🏆'}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
