import { useState } from 'react';
import { useTTS } from '../hooks/useTTS';

const readingTexts = [
  {
    title: "Suomen kesä",
    text: "Suomen kesä on lyhyt, mutta kaunis. Kesäkuussa ja heinäkuussa aurinko paistaa melkein koko yön pohjoisessa. Monet suomalaiset viettävät aikaa mökillä. Siellä he saunovat, uivat järvessä ja grillaavat makkaraa. Kesä on tärkeä aika rentoutumiselle.",
    translation: "Finnish summer is short, but beautiful. In June and July, the sun shines almost all night in the north. Many Finns spend time at their cottage. There they sauna, swim in the lake and grill sausages. Summer is an important time for relaxation."
  },
  {
    title: "Talvi Suomessa",
    text: "Talvi on Suomessa pitkä ja kylmä. Lumi sataa usein marraskuusta huhtikuuhun. Lapset tykkäävät laskea mäkeä ja rakentaa lumilinnoja. Aikuiset hiihtävät ja luistelevat. Talvella on myös kaamospohjoisessa, jossa aurinko ei nouse ollenkaan.",
    translation: "Winter in Finland is long and cold. Snow often falls from November to April. Children like to sled and build snow castles. Adults ski and skate. In winter there is also polar night in the north, where the sun doesn't rise at all."
  },
  {
    title: "Suomalainen ruoka",
    text: "Suomalainen ruoka on yksinkertaista ja terveellistä. Kalaa syödään paljon, erityisesti lohta ja silakkaa. Karjalanpiirakka on perinteinen herkku. Suomalaiset juovat paljon kahvia, enemmän kuin mikään muu kansa maailmassa.",
    translation: "Finnish food is simple and healthy. Fish is eaten a lot, especially salmon and herring. Karelian pie is a traditional delicacy. Finns drink a lot of coffee, more than any other nation in the world."
  }
];

export default function ReadingPractice({ showTranslation: globalShowTranslation }) {
  const { speak, stop, isSpeaking } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentText = readingTexts[currentIndex];

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(currentText.text);
    }
  };

  const handleNext = () => {
    stop();
    setCurrentIndex((prev) => (prev + 1) % readingTexts.length);
    setShowTranslation(false);
  };

  const handlePrev = () => {
    stop();
    setCurrentIndex((prev) => (prev - 1 + readingTexts.length) % readingTexts.length);
    setShowTranslation(false);
  };

  return (
    <div className="reading-practice">
      <div className="reading-header">
        <h3>📖 Lukuharjoitus</h3>
        {/* ✅ Stop button visible when audio plays */}
        {isSpeaking && (
          <button className="reading-audio-stop" onClick={stop}>
            ⏹️ Pysäytä
          </button>
        )}
      </div>
      
      <div className="reading-text-container">
        <h4 className="reading-title">{currentText.title}</h4>
        <p className="reading-text">{currentText.text}</p>
        
        {/* ✅ Individual translation toggle */}
        <button 
          className="translation-toggle-small reading-toggle"
          onClick={() => setShowTranslation(!showTranslation)}
          title={showTranslation ? 'Piilota käännös' : 'Näytä käännös'}
        >
          {showTranslation ? '🙈' : '👁️'}
        </button>
        
        {showTranslation && (
          <div className="reading-translation">
            <p>{currentText.translation}</p>
          </div>
        )}
      </div>
      
      <div className="reading-controls">
        <button onClick={handlePrev}>← Edellinen</button>
        <button onClick={handleSpeak} className={isSpeaking ? 'speaking' : ''}>
          {isSpeaking ? '⏹️ Pysäytä' : '🔈 Kuuntele'}
        </button>
        <button onClick={handleNext}>Seuraava →</button>
      </div>
    </div>
  );
}
