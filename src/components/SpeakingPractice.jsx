import { useState } from 'react';
import { useTTS } from '../hooks/useTTS';

const B1_PROMPTS = [
  "Miksi opiskelet suomea?",
  "Kerro tärkeästä kokemuksesta viime vuonna.",
  "Mitä aiot tehdä seuraavien kuuden kuukauden aikana?",
  "Mitä teet vapaa-ajalla?",
  "Kerro päivästäsi eilen.",
  "Mikä on lempiruokasi ja miksi?",
  "Kuvaile asuinympäristöäsi.",
  "Mitä mieltä olet somesta?"
];

export default function SpeakingPractice() {
  const { speak, isSpeaking } = useTTS();
  const [currentPrompt, setCurrentPrompt] = useState(B1_PROMPTS[0]);

  const handleSpeak = () => {
    speak(currentPrompt, { rate: 0.8, pitch: 1.0 });
  };

  const generateNew = () => {
    const randomIndex = Math.floor(Math.random() * B1_PROMPTS.length);
    setCurrentPrompt(B1_PROMPTS[randomIndex]);
  };

  return (
    <div className="speaking-section">
      <h3>🗣️ Speaking Practice (B1 Level)</h3>
      <div className="prompt-box">
        <p>{currentPrompt}</p>
        <button 
          className={`speaker-btn-small ${isSpeaking ? 'speaking' : ''}`}
          onClick={handleSpeak}
          disabled={isSpeaking}
          title="Kuuntele kysymys"
        >
          {isSpeaking ? '🔊' : '🔈'}
        </button>
      </div>
      <button onClick={generateNew}>New Prompt</button>
      <p className="small-text">Record yourself answering this for 1-2 minutes.</p>
    </div>
  );
}