import { useState, useEffect } from 'react';
import Card from './ui/Card';
import { getWordsForQuiz, updateWordProgress } from '../utils/vocabManager';
import './Quiz.css';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const words = getWordsForQuiz(10);
    if (words.length > 0) {
      const quizQuestions = words.map((word) => ({
        id: word.id,
        word: word.word,
        meaning: word.meaning,
        question: `Mitä "${word.word}" tarkoittaa?`,
        options: generateOptions(word.meaning),
        correct: 0,
        wordData: word
      }));
      setQuestions(quizQuestions);
    }
    setLoading(false);
  }, []);

  const generateOptions = (correctMeaning) => {
    const allMeanings = ['to write', 'to speak', 'to listen', 'to read', 'book', 'library', 'school', 'home', 'good', 'bad', 'big', 'small', 'new', 'old'];
    const wrong = allMeanings.filter(m => m !== correctMeaning).sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correctMeaning, ...wrong].sort(() => 0.5 - Math.random());
  };

  const handleAnswer = (selectedIndex) => {
    if (answered || currentIndex >= questions.length) return;
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedIndex === currentQuestion.correct;
    
    updateWordProgress(currentQuestion.wordData.word, isCorrect);
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setSelected(selectedIndex);
    setAnswered(true);
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) return <Card className="quiz"><p className="loading">🎲 Ladataan...</p></Card>;
  if (questions.length === 0) return <Card className="quiz"><h3>😕 Ei kysymyksiä</h3><button onClick={() => window.location.reload()} className="btn-primary">🔄 Lataa uudelleen</button></Card>;

  if (currentIndex >= questions.length) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <Card className="quiz quiz-complete">
        <h2>🎉 Valmis!</h2>
        <div className="score-display">
          <span className="score-number">{score.correct}/{score.total}</span>
          <span className="score-percent">{percentage}%</span>
        </div>
        <button onClick={() => window.location.reload()} className="btn-primary">🔄 Uusi koe</button>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <Card className="quiz">
      <div className="quiz-progress">
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        <span className="progress-text">{currentIndex + 1} / {questions.length}</span>
      </div>
      <div className="quiz-score">✅ {score.correct} | ❌ {score.total - score.correct}</div>
      <h3 className="quiz-question">{currentQuestion.question}</h3>
      <div className="quiz-options">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correct;
          const isSelected = index === selected;
          let className = 'quiz-option';
          if (answered) {
            if (isCorrect) className += ' correct';
            else if (isSelected) className += ' wrong';
          }
          return (
            <button key={index} className={className} onClick={() => handleAnswer(index)} disabled={answered} type="button">
              {option}
              {answered && isCorrect && ' ✅'}
              {answered && isSelected && !isCorrect && ' ❌'}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`quiz-feedback ${selected === currentQuestion.correct ? 'correct' : 'wrong'}`}>
          {selected === currentQuestion.correct ? '✅ Oikein!' : '❌ Väärin!'}
        </div>
      )}
      {/* ✅ NEXT BUTTON - Always visible */}
      {answered && (
        <button onClick={goToNext} className="btn-next" type="button">
          {currentIndex < questions.length - 1 ? 'Seuraava →' : '🏆 Näytä tulos'}
        </button>
      )}
    </Card>
  );
}
