import { useState } from 'react';
import { useTTS } from '../hooks/useTTS';
import { readingTexts } from '../data/readingData';

export default function ReadingPractice() {
  const { speak, stop, isSpeaking } = useTTS();
  const [activeTextId, setActiveTextId] = useState(readingTexts[0].id);

  const activeText = readingTexts.find(t => t.id === activeTextId);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(activeText.text, { rate: 0.85, pitch: 1.0 });
    }
  };

  return (
    <div className="reading-section">
      <h3>📖 Reading Comprehension</h3>
      
      <div className="text-selector">
        {readingTexts.map(text => (
          <button 
            key={text.id} 
            className={activeTextId === text.id ? 'active' : ''}
            onClick={() => {
              setActiveTextId(text.id);
              stop();
            }}
          >
            {text.title}
          </button>
        ))}
      </div>

      <div className="reading-content">
        <div className="text-header">
          <p className="text-body">{activeText.text}</p>
          <button 
            className={`speaker-btn-small ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleSpeak}
            disabled={isSpeaking}
            title={isSpeaking ? 'Stop' : 'Kuuntele teksti'}
          >
            {isSpeaking ? '⏹️' : '🔈'}
          </button>
        </div>
        
        <div className="questions">
          <h4>Questions:</h4>
          <ul>
            {activeText.questions.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}