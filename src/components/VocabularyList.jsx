import { useState, useMemo, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import { useSRS } from '../hooks/useSRS';
import Card from './ui/Card';
import './VocabularyList.css';

export default function VocabularyList({ 
  words, 
  totalWords, 
  onDelete, 
  onEdit, 
  baseIds,
  getProgress,
  completeStep
}) {
  const { speak, stop } = useTTS();
  const { srsData } = useSRS();
  
  const [openIndex, setOpenIndex] = useState(null);
  const [filter, setFilter] = useState('all');

  const toggleCard = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleAction = (e, action, word, wordIndex) => {
    e.stopPropagation();
    if (action === 'study') {
      if (completeStep) completeStep(word.id, 'read');
      stop();
      speak(word.example || word.word);
    }
    if (action === 'speak') {
      if (completeStep) completeStep(word.id, 'practice');
    }
    if (action === 'test') {
      if (completeStep) completeStep(word.id, 'game');
    }
  };

  const handleEdit = (e, word) => {
    e.stopPropagation();
    if (onEdit) onEdit(word);
  };

  const handleDelete = (e, wordId) => {
    e.stopPropagation();
    if (onDelete) onDelete(wordId);
  };

  // ✅ Filter words by status - applied BEFORE pagination
  const filteredWords = useMemo(() => {
    if (!words) return [];
    if (filter === 'all') return words;
    return words.filter(w => (w.status || 'new') === filter);
  }, [words, filter]);

  // ✅ Calculate summary from ALL words (for the colored cards)
  const summary = useMemo(() => {
    if (!words) return { total: 0, new: 0, learning: 0, mastered: 0 };
    return {
      total: words.length,
      new: words.filter(w => (w.status || 'new') === 'new').length,
      learning: words.filter(w => w.status === 'learning').length,
      mastered: words.filter(w => w.status === 'mastered').length
    };
  }, [words]);

  // ✅ Debug log when filter changes
  useEffect(() => {
    console.log(`🔍 Filter: ${filter}, Showing ${filteredWords.length} of ${words?.length || 0} words`);
  }, [filter, filteredWords.length, words?.length]);

  if (!words || words.length === 0) {
    return (
      <Card className="vocab-empty">
        <h3>Ei sanoja vielä</h3>
        <p>Lisää ensimmäinen sana aloittaaksesi!</p>
      </Card>
    );
  }

  return (
    <div className="vocab-list">
      <div className="vocab-header">
        <h2>Sanasto</h2>
        {/* ✅ Show filtered count / total count */}
        <span className="vocab-count">
          {filteredWords.length} / {totalWords} sanaa
          {filter !== 'all' && <span style={{ marginLeft: '8px', color: '#003580' }}>(suodatettu: {filter})</span>}
        </span>
      </div>
      
      {/* Progress Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: '#e8f4fd', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#003580' }}>{summary.total}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Yhteensä</div>
        </div>
        <div style={{ background: '#f8d7da', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#721c24' }}>{summary.new}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>🆕 Uudet</div>
        </div>
        <div style={{ background: '#fff3cd', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#856404' }}>{summary.learning}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>📚 Opittavat</div>
        </div>
        <div style={{ background: '#d4edda', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#155724' }}>{summary.mastered}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>🏆 Hallitut</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'new', 'learning', 'mastered'].map(f => (
          <button
            key={f}
            onClick={() => {
              console.log(`🔘 Filter clicked: ${f}`);
              setFilter(f);
            }}
            style={{
              padding: '6px 14px',
              background: filter === f ? '#003580' : 'white',
              color: filter === f ? 'white' : '#003580',
              border: '2px solid #003580',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === f ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            {f === 'all' ? 'Kaikki' : f === 'new' ? '🆕' : f === 'learning' ? '📚' : '🏆'} {f === 'all' ? '' : f === 'new' ? 'Uudet' : f === 'learning' ? 'Opittavat' : 'Hallitut'}
          </button>
        ))}
      </div>
      
      <div className="vocab-cards">
        {filteredWords.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Ei sanoja tässä kategoriassa.</p>
        ) : (
          filteredWords.map((word, index) => {
            const isOpen = openIndex === index;
            const progress = getProgress(word.id);
            const srs = srsData[word.id] || { strength: 0 };
            const isBaseWord = baseIds?.includes(word.id);
            const status = word.status || 'new';
            const correctCount = word.correctCount || 0;
            const wrongCount = word.wrongCount || 0;
            const lastSeen = word.lastSeen ? new Date(word.lastSeen).toLocaleDateString('fi-FI') : '-';

            return (
              <Card key={word.id} className={`vocab-card ${isOpen ? 'open' : ''}`} onClick={() => toggleCard(index)}>
                <div className="vocab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="word-finnish">{word.word}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {word.category && <span className="category-badge" style={{ background: '#e8f4fd', color: '#003580' }}>{word.category}</span>}
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                      background: status === 'mastered' ? '#d4edda' : status === 'learning' ? '#fff3cd' : '#f8d7da',
                      color: status === 'mastered' ? '#155724' : status === 'learning' ? '#856404' : '#721c24'
                    }}>{status === 'mastered' ? '🏆' : status === 'learning' ? '📚' : '🆕'}</span>
                  </div>
                </div>
                <div className="vocab-sentence">
                  <button className="audio-btn" onClick={(e) => { e.stopPropagation(); stop(); speak(word.example || word.word); }} type="button">🔈</button>
                  <p className="sentence-text">{word.example}</p>
                </div>
                {/* ✅ Visible Counters - Always shown */}
                <div style={{ display: 'flex', gap: '16px', padding: '10px 0', borderTop: '1px dashed #eee', fontSize: '0.9rem', color: '#666' }}>
                  <span title="Oikein"><strong style={{ color: '#28a745' }}>✅</strong> {correctCount}</span>
                  <span title="Väärin"><strong style={{ color: '#dc3545' }}>❌</strong> {wrongCount}</span>
                  <span title="Viimeksi nähty"><strong>📅</strong> {lastSeen}</span>
                  {status === 'mastered' && <span title="Hallittu" style={{ color: '#155724', fontWeight: '600' }}>🏆</span>}
                </div>
                {isOpen && (
                  <div className="actions">
                    <button className={`practice-btn read ${progress.read ? 'done' : ''}`} onClick={(e) => handleAction(e, 'study', word, index)} type="button">📖 Opiskele</button>
                    <button className={`practice-btn speak ${progress.practice ? 'done' : ''}`} onClick={(e) => handleAction(e, 'speak', word, index)} type="button">🗣️ Puhu</button>
                    <button className={`practice-btn game ${progress.game ? 'done' : ''}`} onClick={(e) => handleAction(e, 'test', word, index)} type="button">🎮 Testaa</button>
                    {!isBaseWord && <button className="action-btn" onClick={(e) => handleDelete(e, word.id)} type="button">🗑️</button>}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
