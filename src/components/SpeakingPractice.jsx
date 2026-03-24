import { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import { usePronunciation } from '../hooks/usePronunciation';
import Card from './ui/Card';
import PronunciationFeedback from './PronunciationFeedback';
import './SpeakingPractice.css';

const SPEAKING_PROMPTS = [
  {
    id: 1,
    main: "Kerro kokemuksesta, joka oli sinulle tärkeä.",
    followUps: ["Miksi tämä kokemus oli merkittävä?", "Miten se vaikutti elämääsi?"],
    timeGuidance: "Yritä puhua 1–2 minuuttia. Käytä esimerkkejä ja mielipiteitä."
  },
  {
    id: 2,
    main: "Kuvaile tavallinen päiväsi.",
    followUps: ["Mikä on päivän paras hetki?", "Mitä haluaisit muuttaa rutiineissasi?"],
    timeGuidance: "Yritä puhua 1–2 minuuttia. Käytä esimerkkejä ja mielipiteitä."
  },
  {
    id: 3,
    main: "Mitä aiot tehdä seuraavien kuuden kuukauden aikana?",
    followUps: ["Mitkä ovat tärkeimmät tavoitteesi?", "Miten aiot saavuttaa ne?"],
    timeGuidance: "Yritä puhua 1–2 minuuttia. Käytä esimerkkejä ja mielipiteitä."
  },
  {
    id: 4,
    main: "Miksi suomen kieli on tärkeä sinulle?",
    followUps: ["Miten kielen oppiminen on muuttanut elämääsi?", "Mitä haasteita olet kohdannut?"],
    timeGuidance: "Yritä puhua 1–2 minuuttia. Käytä esimerkkejä ja mielipiteitä."
  },
  {
    id: 5,
    main: "Kerro työstäsi tai opinnoistasi.",
    followUps: ["Mikä on mielenkiintoisinta työssäsi/opinnoissasi?", "Mitä haluat tehdä tulevaisuudessa?"],
    timeGuidance: "Yritä puhua 2–3 minuuttia. Käytä esimerkkejä ja mielipiteitä."
  }
];

export default function SpeakingPractice() {
  const { speak, pause, resume, stop, isPlaying, isPaused } = useTTS();
  const { startListening, listening, result, resetResult } = usePronunciation();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [audioActive, setAudioActive] = useState(false);

  const currentPrompt = SPEAKING_PROMPTS[currentPromptIndex];

  const handlePlayPause = () => {
    if (!currentPrompt?.main) return;
    
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      setAudioActive(true);
      speak(currentPrompt.main);
    }
  };

  const handleStop = () => {
    stop();
    setAudioActive(false);
  };

  const handlePronunciation = () => {
    startListening(currentPrompt.main);
  };

  const handleNextPrompt = () => {
    stop();
    setAudioActive(false);
    resetResult();
    setShowFollowUps(false);
    setCurrentPromptIndex((prev) => (prev + 1) % SPEAKING_PROMPTS.length);
  };

  const handlePrevPrompt = () => {
    stop();
    setAudioActive(false);
    resetResult();
    setShowFollowUps(false);
    setCurrentPromptIndex((prev) => (prev - 1 + SPEAKING_PROMPTS.length) % SPEAKING_PROMPTS.length);
  };

  // ✅ Controls always visible when audio has been activated
  const showControls = audioActive || isPlaying || isPaused;

  return (
    <Card className="speaking-practice">
      <div className="speaking-header">
        <h3>🗣️ Puhumisharjoitus</h3>
        <span className="prompt-counter">{currentPromptIndex + 1} / {SPEAKING_PROMPTS.length}</span>
      </div>

      <div className="prompt-section">
        <div className="prompt-main">
          <p className="prompt-text">{currentPrompt.main}</p>
          {/* ✅ ALWAYS VISIBLE Audio Controls */}
          <div className="audio-controls-compact">
            <button 
              className={`audio-btn-small ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayPause}
              title={isPlaying ? 'Tauko' : isPaused ? 'Jatka' : 'Kuuntele'}
              type="button"
            >
              {isPlaying ? '⏸️' : isPaused ? '▶️' : '🔈'}
            </button>
            {showControls && (
              <button 
                className="audio-btn-small stop"
                onClick={handleStop}
                title="Pysäytä"
                type="button"
              >
                ⏹️
              </button>
            )}
          </div>
        </div>

        <div className="time-guidance">
          <span>⏱️ {currentPrompt.timeGuidance}</span>
        </div>

        <div className="followups-section">
          <button 
            className="toggle-followups"
            onClick={() => setShowFollowUps(!showFollowUps)}
            type="button"
          >
            {showFollowUps ? '🔽 Piilota jatkokysymykset' : '🔽 Näytä jatkokysymykset'}
          </button>
          
          {showFollowUps && (
            <div className="followups-list">
              {currentPrompt.followUps.map((followUp, index) => (
                <div key={index} className="followup-item">
                  <span className="followup-icon">💭</span>
                  <span className="followup-text">{followUp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="speaking-actions">
        <button 
          className={`mic-btn ${listening ? 'listening' : ''}`}
          onClick={handlePronunciation}
          disabled={listening}
          type="button"
        >
          {listening ? '🎤 Kuuntelee...' : '🎙️ Harjoittele'}
        </button>
      </div>

      {result && <PronunciationFeedback result={result} onRetry={handlePronunciation} />}

      <div className="prompt-navigation">
        <button onClick={handlePrevPrompt} className="nav-btn" type="button">← Edellinen</button>
        <button onClick={handleNextPrompt} className="nav-btn primary" type="button">Seuraava →</button>
      </div>
    </Card>
  );
}
