import { useState } from 'react';

export default function VocabularyForm({ onAddWord, onEditWord, editingWord, onCancelEdit }) {
  const [finnish, setFinnish] = useState(editingWord?.finnish || '');
  const [meaning, setMeaning] = useState(editingWord?.meaning || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!finnish || !meaning) return;
    
    if (editingWord) {
      onEditWord({ ...editingWord, finnish, meaning });
    } else {
      onAddWord({ finnish, meaning });
    }
    
    setFinnish('');
    setMeaning('');
  };

  const handleCancel = () => {
    setFinnish('');
    setMeaning('');
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="vocab-form">
      <div className="form-header">
        <h3>{editingWord ? '✏️ Edit Word' : '➕ Add New Word'}</h3>
        {editingWord && (
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
      <input 
        type="text" 
        placeholder="Finnish word (e.g., Omena)" 
        value={finnish}
        onChange={(e) => setFinnish(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Meaning (e.g., Apple)" 
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
      />
      <button type="submit" className={editingWord ? 'edit-btn' : ''}>
        {editingWord ? '💾 Save Changes' : 'Add Word'}
      </button>
    </form>
  );
}