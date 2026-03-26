import { useState, useEffect } from 'react';
import Card from './ui/Card';
import './StudyPlan.css';

export default function StudyPlan() {
  const [currentPhase, setCurrentPhase] = useState('');
  const [todayGrammar, setTodayGrammar] = useState('');
  const [todayWriting, setTodayWriting] = useState('');
  const [todaySpeaking, setTodaySpeaking] = useState('');

  // Phase definitions
  const phases = [
    { name: 'FOUNDATION', start: '2026-03-24', end: '2026-04-06', color: '#28a745' },
    { name: 'EXPANSION', start: '2026-04-07', end: '2026-04-20', color: '#17a2b8' },
    { name: 'EXAM MODE', start: '2026-04-21', end: '2026-05-05', color: '#ffc107' },
    { name: 'POLISH', start: '2026-05-06', end: '2026-05-15', color: '#dc3545' }
  ];

  // Grammar topics by phase
  const grammarTopics = {
    'FOUNDATION': ['Partitive', 'Verbityypit', 'Sanajärjestys', 'Genetiivi'],
    'EXPANSION': ['Imperfekti', 'Illatiivi / Inessiivi / Elatiivi', 'Objekti', 'Komparatiivi'],
    'EXAM MODE': ['Konditionaali', 'Sivulauseet (että, jos, vaikka)', 'Passiivi', 'Partisiipit'],
    'POLISH': ['Kertaus: heikot alueet', 'Kertaus: virheet', 'Kertaus: aikamuodot', 'Kertaus: lauserakenteet']
  };

  // Writing prompts
  const writingPrompts = [
    'Kirjoita päivästäsi',
    'Kuvaile eilistä päivää',
    'Kirjoita virallinen viesti',
    'Kerro mielipiteesi',
    'Kuvaile asuntoasi',
    'Kirjoita hakemus',
    'Kerro perheestäsi',
    'Kuvaile harrastuksiasi',
    'Kirjoita kirje ystävälle',
    'Kerro tulevaisuudensuunnitelmista'
  ];

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    // Find current phase
    const current = phases.find(p => todayStr >= p.start && todayStr <= p.end);
    setCurrentPhase(current?.name || 'FOUNDATION');

    // Set today's grammar (rotate by day)
    if (current) {
      const topics = grammarTopics[current.name];
      const grammarIndex = dayOfYear % topics.length;
      setTodayGrammar(topics[grammarIndex]);
    }

    // Set today's writing prompt (rotate by day)
    const writingIndex = dayOfYear % writingPrompts.length;
    setTodayWriting(writingPrompts[writingIndex]);
    setTodaySpeaking('Sano kirjoituksesi ääneen ja nauhoita itsesi');
  }, []);

  const currentPhaseData = phases.find(p => p.name === currentPhase);

  return (
    <div className="study-plan">
      {/* 🔥 Core Learning Loop */}
      <Card className="learning-loop">
        <h2>🎯 Oppimisen Sykli</h2>
        <div className="loop-steps">
          <div className="loop-step" style={{ background: '#e8f4fd' }}>
            <span className="loop-icon">📖</span>
            <span className="loop-label">INPUT</span>
            <span className="loop-desc">Lukeminen</span>
          </div>
          <div className="loop-arrow">→</div>
          <div className="loop-step" style={{ background: '#fff3cd' }}>
            <span className="loop-icon">📚</span>
            <span className="loop-label">UNDERSTAND</span>
            <span className="loop-desc">Sanasto</span>
          </div>
          <div className="loop-arrow">→</div>
          <div className="loop-step" style={{ background: '#d4edda' }}>
            <span className="loop-icon">☕</span>
            <span className="loop-label">BREAK</span>
            <span className="loop-desc">Lepo</span>
          </div>
          <div className="loop-arrow">→</div>
          <div className="loop-step" style={{ background: '#f8d7da' }}>
            <span className="loop-icon">✍️</span>
            <span className="loop-label">APPLY</span>
            <span className="loop-desc">Kirjoitus</span>
          </div>
          <div className="loop-arrow">→</div>
          <div className="loop-step" style={{ background: '#e2d5f1' }}>
            <span className="loop-icon">🗣️</span>
            <span className="loop-label">PRODUCE</span>
            <span className="loop-desc">Puhuminen</span>
          </div>
        </div>
      </Card>

      {/* 📊 Current Phase */}
      <Card className="phase-indicator" style={{ borderLeft: `4px solid ${currentPhaseData?.color || '#003580'}` }}>
        <h2>📍 Nykyinen Vaihe</h2>
        <div className="phase-display" style={{ background: currentPhaseData?.color + '20' }}>
          <span className="phase-name" style={{ color: currentPhaseData?.color }}>
            {currentPhase || 'LOADING...'}
          </span>
          <span className="phase-dates">
            {currentPhaseData ? `${currentPhaseData.start} – ${currentPhaseData.end}` : ''}
          </span>
        </div>
        <div className="all-phases">
          {phases.map(p => (
            <div 
              key={p.name} 
              className={`phase-badge ${p.name === currentPhase ? 'active' : ''}`}
              style={{ borderColor: p.color }}
            >
              {p.name}
            </div>
          ))}
        </div>
      </Card>

      {/* 📅 Today's Plan */}
      <Card className="todays-plan">
        <h2>📋 Tämän Päivän Suunnitelma</h2>
        <div className="plan-grid">
          <div className="plan-item" style={{ background: '#e8f4fd' }}>
            <span className="plan-icon">🟢</span>
            <span className="plan-task">Lukeminen</span>
            <span className="plan-time">1.5h</span>
          </div>
          <div className="plan-item" style={{ background: '#e8f4fd' }}>
            <span className="plan-icon">🔵</span>
            <span className="plan-task">Sanasto</span>
            <span className="plan-time">1h</span>
          </div>
          <div className="plan-item" style={{ background: '#fff3cd' }}>
            <span className="plan-icon">🟡</span>
            <span className="plan-task">Kielioppi</span>
            <span className="plan-time">1.5h</span>
          </div>
          <div className="plan-item" style={{ background: '#f8d7da' }}>
            <span className="plan-icon">🔴</span>
            <span className="plan-task">Kirjoitus</span>
            <span className="plan-time">1.5h</span>
          </div>
          <div className="plan-item" style={{ background: '#e2d5f1' }}>
            <span className="plan-icon">🟣</span>
            <span className="plan-task">Puhuminen</span>
            <span className="plan-time">1h</span>
          </div>
        </div>
      </Card>

      {/* 📚 Today's Grammar */}
      <Card className="grammar-topic">
        <h2>📘 Päivän Kielioppi</h2>
        <div className="grammar-display">
          <span className="grammar-topic-name">{todayGrammar || 'Ladataan...'}</span>
          <p className="grammar-hint">Harjoittele tätä aihetta tänään</p>
        </div>
      </Card>

      {/* ✍️ Writing Task */}
      <Card className="writing-task">
        <h2>✍️ Kirjoitustehtävä</h2>
        <div className="task-box">
          <p className="task-prompt">{todayWriting}</p>
          <p className="task-hint">Kirjoita vähintään 150 sanaa</p>
        </div>
      </Card>

      {/* 🗣️ Speaking Task */}
      <Card className="speaking-task">
        <h2>🗣️ Puhumistehtävä</h2>
        <div className="task-box">
          <p className="task-prompt">{todaySpeaking}</p>
          <p className="task-hint">Nauhoita ja kuuntele itsesi</p>
        </div>
      </Card>

      {/* 📆 Weekly Structure */}
      <Card className="weekly-structure">
        <h2>📅 Viikkorakenne</h2>
        <div className="week-grid">
          <div className="day-card full">
            <span className="day-name">Ma–Pe</span>
            <span className="day-task">Täysi opiskelu</span>
          </div>
          <div className="day-card light">
            <span className="day-name">La</span>
            <span className="day-task">Kevyt kertaus</span>
          </div>
          <div className="day-card mock">
            <span className="day-name">Su</span>
            <span className="day-task">Harjoituskoe</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
