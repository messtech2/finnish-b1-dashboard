import { useState } from 'react';
import BulkImport from './BulkImport';

export default function DataManagement({ vocabulary, onRefreshGitHub }) {
  const [showBulkImport, setShowBulkImport] = useState(false);

  const exportVocabulary = () => {
    // Export ALL words (GitHub + user) in clean format (no IDs)
    const cleanExport = vocabulary.map(({ id, source, ...rest }) => rest);
    const dataStr = JSON.stringify(cleanExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finnish-vocabulary-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportUserWordsOnly = () => {
    const userWords = vocabulary.filter(w => w.source === 'user');
    const cleanExport = userWords.map(({ id, source, ...rest }) => rest);
    const dataStr = JSON.stringify(cleanExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-words-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkImport = (newWords) => {
    const stored = localStorage.getItem('finnish-vocab-v3');
    const existingVocab = stored ? JSON.parse(stored) : [];
    
    const uniqueNewWords = newWords.filter(newWord => 
      !vocabulary.some(existing => 
        existing.word.toLowerCase().trim() === newWord.word.toLowerCase().trim()
      )
    );
    
    if (uniqueNewWords.length === 0) {
      alert('⚠️ All words already exist!');
      setShowBulkImport(false);
      return;
    }
    
    const updatedVocab = [...existingVocab, ...uniqueNewWords];
    localStorage.setItem('finnish-vocab-v3', JSON.stringify(updatedVocab));
    
    alert(`✅ Imported ${uniqueNewWords.length} new words!`);
    setShowBulkImport(false);
    window.location.reload();
  };

  if (showBulkImport) {
    return (
      <BulkImport 
        onImport={handleBulkImport}
        onCancel={() => setShowBulkImport(false)}
      />
    );
  }

  return (
    <div className="data-management">
      <h3>💾 Data Management</h3>
      <div className="data-actions">
        <button onClick={onRefreshGitHub} className="data-btn refresh">
          🔄 Refresh from GitHub
        </button>
        <button onClick={exportVocabulary} className="data-btn export">
          📤 Export All (JSON)
        </button>
        <button onClick={exportUserWordsOnly} className="data-btn export">
          📤 Export My Words
        </button>
        <button onClick={() => setShowBulkImport(true)} className="data-btn import">
          📥 Import (JSON)
        </button>
      </div>
      <p className="data-hint">
        💡 GitHub words update automatically. Export for backup!
      </p>
    </div>
  );
}
