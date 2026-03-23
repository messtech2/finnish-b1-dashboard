import { useState, useMemo, useCallback } from 'react';
import { useSRS } from '../hooks/useSRS';

export default function DailyMission({ allWords }) {
  const { getDueWords, srsData } = useSRS();
  const [completed, setCompleted] = useState({ new: 0, review: 0, speaking: 0 });
  const [showArchived, setShowArchived] = useState(false);

  const activeWords = useMemo(() => {
    if (!allWords || allWords.length === 0) return [];
    return allWords.filter(w => {
      const srs = srsData[w.id];
      return !srs || (srs.strength || 0) < 4;
    });
  }, [allWords, srsData]);

  const archivedWords = useMemo(() => {
    if (!allWords || allWords.length === 0) return [];
    return allWords.filter(w => {
      const srs = srsData[w.id];
      return srs && (srs.strength || 0) >= 4;
    });
  }, [allWords, srsData]);

  const mission = useMemo(() => {
    if (activeWords.length === 0) return { new: [], review: [], speaking: [] };
    const dueWords = getDueWords(activeWords);
    const newWords = activeWords.filter(w => !w.strength || w.strength === 0).slice(0, 20);
    const reviewWords = dueWords.slice(0, 10);
    const daySeed = new Date().toISOString().split('T')[0];
    const speakingWords = [...activeWords]
      .sort((a, b) => {
        const hash = (str) => str?.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 0;
        return (hash(a.id + daySeed) - hash(b.id + daySeed));
      })
      .slice(0, 5);
    return { new: newWords, review: reviewWords, speaking: speakingWords };
  }, [activeWords, getDueWords]);

  const handleComplete = useCallback((type, wordId) => {
    if (!wordId) return;
    setCompleted(prev => ({
      ...prev,
      [type]: Math.min(prev[type] + 1, mission[type]?.length || 0)
    }));
  }, [mission]);

  const totalTasks = (mission.new?.length || 0) + (mission.review?.length || 0) + (mission.speaking?.length || 0);
  const totalCompleted = completed.new + completed.review + completed.speaking;
  const progress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  if (!allWords || allWords.length === 0) {
    return (
      <div className="daily-mission empty">
        <h3>🔥 Tänään</h3>
        <p>Lisää sanoja aloittaaksesi päivittäiset tehtävät!</p>
      </div>
    );
  }

  // ✅ FIX: Create unique keys combining section + wordId + array index
  const getUniqueKey = (word, section, index) => {
    if (word?.id) {
      return `${section}-${word.id}-idx${index}-${Date.now()}`;
    }
    return `${section}-${index}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  return (
    <div className="daily-mission">
      <div className="mission-header">
        <h3>🔥 Tänään</h3>
        <div className="mission-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>

      {archivedWords.length > 0 && (
        <button className="archive-toggle-btn" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? '🗄️ Piilota varastoidut' : `🗄️ Näytä varastoidut (${archivedWords.length})`}
        </button>
      )}

      <div className="mission-stats">
        <div className="stat-card new">
          <span className="stat-number">{mission.new?.length || 0}</span>
          <span className="stat-label">Uutta</span>
          <span className="stat-completed">✅ {completed.new}</span>
        </div>
        <div className="stat-card review">
          <span className="stat-number">{mission.review?.length || 0}</span>
          <span className="stat-label">Kertaa</span>
          <span className="stat-completed">✅ {completed.review}</span>
        </div>
        <div className="stat-card speaking">
          <span className="stat-number">{mission.speaking?.length || 0}</span>
          <span className="stat-label">Puhu</span>
          <span className="stat-completed">✅ {completed.speaking}</span>
        </div>
      </div>

      <div className="mission-tasks">
        {mission.new?.length > 0 && (
          <div className="task-section">
            <h4>📚 Uudet sanat</h4>
            <ul>
              {mission.new.slice(0, 5).map((word, index) => (
                <li key={getUniqueKey(word, 'new', index)} className="task-item">
                  <span>{word?.word}</span>
                  <button className="complete-btn" onClick={() => word?.id && handleComplete('new', word.id)}>✅</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {mission.review?.length > 0 && (
          <div className="task-section">
            <h4>🔄 Kertaus</h4>
            <ul>
              {mission.review.slice(0, 5).map((word, index) => (
                <li key={getUniqueKey(word, 'review', index)} className="task-item">
                  <span>{word?.word}</span>
                  <button className="complete-btn" onClick={() => word?.id && handleComplete('review', word.id)}>✅</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {mission.speaking?.length > 0 && (
          <div className="task-section">
            <h4>🗣️ Puhuminen</h4>
            <ul>
              {mission.speaking.slice(0, 5).map((word, index) => (
                <li key={getUniqueKey(word, 'speaking', index)} className="task-item">
                  <span>{word?.word}</span>
                  <button className="complete-btn" onClick={() => word?.id && handleComplete('speaking', word.id)}>✅</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {totalTasks === 0 && activeWords.length > 0 && (
          <p className="mission-complete">🎉 Kaikki tehtävät suoritettu!</p>
        )}
      </div>

      {showArchived && archivedWords.length > 0 && (
        <div className="archived-section">
          <h4>🗄️ Varastoidut ({archivedWords.length})</h4>
          <p className="archived-hint">Nämä sanat on hallittu (vahvuus ≥ 4). Napauta palauttaaksesi aktiiviseen harjoitteluun.</p>
          <div className="archived-grid">
            {archivedWords.slice(0, 20).map((word, index) => (
              <button key={`archived-${word.id}-${index}`} className="archived-word-btn" title="Palauta harjoitteluun">
                {word.word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
