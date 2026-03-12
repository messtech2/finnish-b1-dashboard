import { useRef } from 'react';

export default function DataManagement({ vocabulary, onImport }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(vocabulary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finnish-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          onImport(importedData);
        } else {
          alert('❌ Invalid file format. Expected an array of words.');
        }
      } catch (error) {
        alert('❌ Error reading file. Make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="data-management">
      <h3>💾 Backup & Restore</h3>
      <div className="data-actions">
        <button onClick={handleExport} className="data-btn export">
          📥 Export All Vocabulary
        </button>
        <button 
          onClick={() => fileInputRef.current.click()} 
          className="data-btn import"
        >
          📤 Import Vocabulary
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
      <p className="data-hint">
        💡 Export includes example sentences. Import to restore or transfer.
      </p>
    </div>
  );
}