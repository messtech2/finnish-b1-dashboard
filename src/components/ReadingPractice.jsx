import { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import Card from './ui/Card';
import './ReadingPractice.css';

const READING_TEXTS = [
  {
    title: "Työpäivä Suomessa",
    text: "Suomalainen työpäivä alkaa yleensä kahdeksan tai yhdeksän aikaan aamulla. Useimmat ihmiset menevät töihin joko bussilla, junalla tai autolla, koska julkinen liikenne toimii hyvin. Työpaikalla on tärkeää olla ajoissa, sillä punctuality on osa suomalaista kulttuuria. Lounasaika on yleensä kello 11–12, ja monet syövät työpaikan ruokalassa, vaikka jotkut tuovatkin eväät kotoa. Iltapäivällä, noin kello 15, on usein kahvitauko, jolloin työntekijät voivat jutella rennosti. Työpäivä päättyy yleensä neljän ja viiden välillä, mutta tietenkin se riippuu alasta. Kotiin päästyään monet suomalaiset viettävät aikaa perheen kanssa, käyvät lenkillä tai harrastavat jotain muuta. Vaikka työ on tärkeää, myös vapaa-aika arvostetaan suuresti Suomessa.",
    translation: "A Finnish workday usually starts at eight or nine in the morning. Most people go to work by bus, train, or car, because public transport works well.",
    questions: [
      "Milloin työpäivä yleensä alkaa Suomessa?",
      "Miksi on tärkeää olla ajoissa työpaikalla?",
      "Mitä suomalaiset tekevät vapaa-ajallaan?"
    ],
    writingPrompt: "Kuvaile oma työpäiväsi tai koulupäiväsi."
  },
  {
    title: "Suomen luonto ja vuodenajat",
    text: "Suomi on maa, jossa luonto on hyvin läsnä ihmisten elämässä. Vaikka talvet ovat pitkiä ja pimeitä, monet suomalaiset rakastavat talvea, koska silloin voi hiihtää, luistella ja nauttia lumisesta maisemasta. Kevät tulee hitaasti, mutta kun se viimein saapuu, luonto herää eloon ja linnut alkavat laulaa. Kesä on lyhyt mutta intensiivinen: aurinko paistaa pitkään, ja ihmiset viettävät paljon aikaa ulkona, mökeillä tai rannalla. Syksy taas tuo mukanaan kauniit ruskanvärit, mutta myös sateet ja viilenemisen. Koska vuodenajat vaihtelevat niin paljon, suomalaiset ovat oppineet sopeutumaan eri olosuhteisiin.",
    translation: "Finland is a country where nature is very present in people's lives. Although winters are long and dark, many Finns love winter.",
    questions: [
      "Miksi suomalaiset rakastavat talvea?",
      "Mitä ihmiset tekevät kesällä?",
      "Miksi luonto on tärkeä suomalaisille?"
    ],
    writingPrompt: "Mikä vuodenaika on sinulle paras ja miksi?"
  }
];

export default function ReadingPractice() {
  const { speak, pause, resume, stop, isPlaying, isPaused } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [audioActive, setAudioActive] = useState(false);

  const currentText = READING_TEXTS[currentIndex];

  // Stop audio when text changes
  useEffect(() => {
    stop();
    setAudioActive(false);
  }, [currentIndex, stop]);

  const handlePlayPause = () => {
    if (!currentText?.text) return;
    
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      setAudioActive(true);
      speak(currentText.text);
    }
  };

  const handleStop = () => {
    stop();
    setAudioActive(false);
  };

  const handleNext = () => {
    stop();
    setAudioActive(false);
    setCurrentIndex((prev) => (prev + 1) % READING_TEXTS.length);
    setShowTranslation(false);
    setShowQuestions(true);
    setUserAnswers({});
  };

  const handlePrev = () => {
    stop();
    setAudioActive(false);
    setCurrentIndex((prev) => (prev - 1 + READING_TEXTS.length) % READING_TEXTS.length);
    setShowTranslation(false);
    setShowQuestions(true);
    setUserAnswers({});
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  // ✅ Controls always visible when audio has been activated for this text
  const showControls = audioActive || isPlaying || isPaused;

  return (
    <Card className="reading-practice">
      <div className="reading-header">
        <h3>📖 Lukuharjoitus</h3>
        <div className="reading-controls-header">
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
            {/* ✅ Stop button - visible when audio is/was active */}
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
          <button 
            className="toggle-translation-btn"
            onClick={() => setShowTranslation(!showTranslation)}
            type="button"
          >
            {showTranslation ? '🙈 Piilota EN' : '👁️ Näytä EN'}
          </button>
        </div>
      </div>
      
      <div className="reading-text-container">
        <h4 className="reading-title">{currentText.title}</h4>
        <div className="reading-text-wrapper">
          <p className="reading-text">{currentText.text}</p>
          {showTranslation && (
            <div className="reading-translation">
              <p>{currentText.translation}</p>
            </div>
          )}
        </div>
      </div>

      <div className="questions-section">
        <div className="questions-header">
          <h4>❓ Ymmärtämiskysymykset</h4>
          <button className="toggle-questions-btn" onClick={() => setShowQuestions(!showQuestions)} type="button">
            {showQuestions ? '🔽 Piilota' : '🔽 Näytä'}
          </button>
        </div>
        {showQuestions && (
          <div className="questions-list">
            {currentText.questions.map((question, index) => (
              <div key={index} className="question-item">
                <p className="question-text">{question}</p>
                <textarea
                  className="question-answer"
                  value={userAnswers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Vastaa suomeksi..."
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="writing-task-section">
        <h4>✍️ Kirjoitustehtävä</h4>
        <p className="writing-prompt">{currentText.writingPrompt}</p>
        <p className="writing-hint">💡 Kirjoita 4–5 lausetta vihkoosi.</p>
      </div>
      
      <div className="reading-navigation">
        <button onClick={handlePrev} className="nav-btn" type="button">← Edellinen</button>
        <span className="text-counter">{currentIndex + 1} / {READING_TEXTS.length}</span>
        <button onClick={handleNext} className="nav-btn primary" type="button">Seuraava →</button>
      </div>
    </Card>
  );
}
