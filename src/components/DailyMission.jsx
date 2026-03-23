import { useState, useMemo } from 'react';
import { useSRS } from '../hooks/useSRS';
import Card from './ui/Card';
import './DailyMission.css';

export default function DailyMission({ allWords }) {
  const { getDueWords, srsData } = useSRS();
  const [completed, setCompleted] = useState({ new: 0, review: 0, speaking: 0 });

  const activeWords = useMemo(() => {
    if (!allWords || allWords.length === 0) return [];
    return allWords.filter(w => {
      const srs = srsData[w.id];
      return !srs || (srs.strength || 0) < 4;
    });
  }, [allWords, srsData]);

  const mission = useMemo(() => {
    if (activeWords.length === 0) return { new: 0, review: 0, speaking: 0 };
    
    const dueWords = getDueWords(activeWords);
    const newWords = activeWords.filter(w => !w.strength || w.strength === 0).length;
    const reviewWords = dueWords.length;
    const speakingWords = 5;

    return { new: newWords, review: reviewWords, speaking: speakingWords };
  }, [activeWords, getDueWords]);

  const totalTasks = mission.new + mission.review + mission.speaking;
  const totalCompleted = completed.new + completed.review + completed.speaking;
  const progress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const handleQuickComplete = (type) => {
    setCompleted(prev => ({
      ...prev,
      [type]: Math.min(prev[type] + 1, mission[type])
    }));
  };

  if (!allWords || allWords.length === 0) {
    return (
      <Card className="mission-card empty">
        <div className="mission-icon">🔥</div>
        <h3>Tänään</h3>
        <p className="mission-empty">Lisää sanoja aloittaaksesi!</p>
      </Card>
    );
  }

  return (
    <Card className="mission-card">
      <div className="mission-header">
        <div className="mission-title">
          <span className="mission-icon">🔥</span>
          <h3>Tänään</h3>
        </div>
        <div className="mission-progress-ring">
          <svg viewBox="0 0 36 36" className="progress-svg">
            <circle className="progress-bg" cx="18" cy="18" r="15.9155" />
            <circle 
              className="progress-fill" 
              cx="18" 
              cy="18" 
              r="15.9155"
              strokeDasharray={`${progress}, 100`}
            />
          </svg>
          <span className="progress-percent">{progress}%</span>
        </div>
      </div>

      <div className="mission-tasks">
        <div className="task-row" onClick={() => handleQuickComplete('new')}>
          <div className="task-info">
            <span className="task-icon">📚</span>
            <span className="task-label">Uudet</span>
          </div>
          <div className="task-progress">
            <span className="task-current">{completed.new}</span>
            <span className="task-separator">/</span>
            <span className="task-total">{mission.new}</span>
            <div className="task-bar">
              <div className="task-bar-fill" style={{ width: `${mission.new > 0 ? (completed.new / mission.new) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        <div className="task-row" onClick={() => handleQuickComplete('review')}>
          <div className="task-info">
            <span className="task-icon">🔄</span>
            <span className="task-label">Kertaus</span>
          </div>
          <div className="task-progress">
            <span className="task-current">{completed.review}</span>
            <span className="task-separator">/</span>
            <span className="task-total">{mission.review}</span>
            <div className="task-bar">
              <div className="task-bar-fill" style={{ width: `${mission.review > 0 ? (completed.review / mission.review) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        <div className="task-row" onClick={() => handleQuickComplete('speaking')}>
          <div className="task-info">
            <span className="task-icon">🗣️</span>
            <span className="task-label">Puhuminen</span>
          </div>
          <div className="task-progress">
            <span className="task-current">{completed.speaking}</span>
            <span className="task-separator">/</span>
            <span className="task-total">{mission.speaking}</span>
            <div className="task-bar">
              <div className="task-bar-fill" style={{ width: `${(completed.speaking / mission.speaking) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {progress === 100 ? (
        <div className="mission-complete">
          <span className="complete-emoji">🎉</span>
          <p>Kaikki tehtävät suoritettu!</p>
        </div>
      ) : (
        <button className="continue-btn">
          🎯 Jatka harjoittelua
        </button>
      )}
    </Card>
  );
}
