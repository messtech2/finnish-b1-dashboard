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

// English translations for prompts (optional hints)
const PROMPT_TRANSLATIONS = {
  "Miksi opiskelet suomea?": "Why are you studying Finnish?",
  "Kerro tärkeästä kokemuksesta viime vuonna.": "Tell about an important experience last year.",
  "Mitä aiot tehdä seuraavien kuuden kuukauden aikana?": "What are you going to do in the next six months?",
  "Mitä teet vapaa-ajalla?": "What do you do in your free time?",
  "Kerro päivästäsi eilen.": "Tell about your day yesterday.",
  "Mikä on lempiruokasi ja miksi?": "What is your favorite food and why?",
  "Kuvaile asuinympäristöäsi.": "Describe your living environment.",
  "Mitä mieltä olet somesta?": "What do you think about social media?"
};

export default function SpeakingPractice({ showEnglish = false }) {
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
        <p className="prompt-finnish">{currentPrompt}</p>
        
        {/* English translation - TOGGLEABLE */}
        {showEnglish && PROMPT_TRANSLATIONS[currentPrompt] && (
          <p className="prompt-translation">{PROMPT_TRANSLATIONS[currentPrompt]}</p>
        )}
        
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