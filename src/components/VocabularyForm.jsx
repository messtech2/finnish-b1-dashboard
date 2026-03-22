import { useState } from 'react';

export default function VocabularyForm({ onAddWord, onEditWord, editingWord, onCancelEdit }) {
  // Initialize from editingWord OR empty (no useEffect!)
  const [word, setWord] = useState(editingWord?.word || '');
  const [meaning, setMeaning] = useState(editingWord?.meaning || '');
  const [example, setExample] = useState(editingWord?.example || '');
  const [exampleTranslation, setExampleTranslation] = useState(editingWord?.exampleTranslation || '');
  const [category, setCategory] = useState(editingWord?.category || 'general');
  const [showAdvanced, setShowAdvanced] = useState(!!editingWord);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    
    // Auto-generate example if not provided
    const finalExample = example || `Minä käytän sanaa "${word}".`;
    const finalTranslation = exampleTranslation || `I use the word "${word}".`;
    
    if (editingWord) {
      onEditWord({ 
        ...editingWord, 
        word, 
        meaning, 
        example: finalExample, 
        exampleTranslation: finalTranslation,
        category 
      });
    } else {
      onAddWord({ 
        word, 
        meaning, 
        example: finalExample, 
        exampleTranslation: finalTranslation,
        category 
      });
    }
    
    // Reset form
    setWord('');
    setMeaning('');
    setExample('');
    setExampleTranslation('');
    setCategory('general');
    setShowAdvanced(false);
  };

  const handleCancel = () => {
    setWord('');
    setMeaning('');
    setExample('');
    setExampleTranslation('');
    setCategory('general');
    setShowAdvanced(false);
    if (onCancelEdit) onCancelEdit();
  };

  const categories = [
    { value: 'general', label: '📌 Yleinen' },
    { value: 'daily-routines', label: '🌅 Arki' },
    { value: 'travel', label: '✈️ Matkustaminen' },
    { value: 'food', label: '🍽️ Ruoka' },
    { value: 'work', label: '💼 Työ' },
    { value: 'hobbies', label: '🎯 Hobbies' },
    { value: 'family', label: '👨‍👩‍👧 Perhe' },
    { value: 'user', label: '📝 Oma' }
  ];

  return (
    <form onSubmit={handleSubmit} className="vocab-form">
      <div className="form-header">
        <h3>{editingWord ? '✏️ Muokkaa sanaa' : '➕ Lisää uusi sana'}</h3>
        {editingWord && (
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Peruuta
          </button>
        )}
      </div>

      {/* REQUIRED: Word + Meaning */}
      <div className="form-group">
        <input 
          type="text" 
          placeholder="Suomen kieli (esim. Omena)" 
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="form-input"
          required
        />
        <input 
          type="text" 
          placeholder="Merkitys (esim. Apple)" 
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="form-input"
          required
        />
      </div>

      {/* TOGGLE: Advanced fields */}
      <button 
        type="button" 
        className="toggle-advanced-btn"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '🔽 Piilota lisäkentät' : '🔽 Lisää esimerkkilause'}
      </button>

      {/* ADVANCED: Example sentence + translation + category */}
      {showAdvanced && (
        <div className="advanced-fields">
          <div className="form-group">
            <label className="form-label">
              📝 Esimerkkilause (suomi)
              <span className="label-hint">Kirjoita lause jossa sana esiintyy</span>
            </label>
            <input 
              type="text" 
              placeholder={word ? `Esimerkki: "Minä syön ${word}."` : 'Esimerkki: "Haluan oppia suomea."'}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              📝 Example sentence (English)
              <span className="label-hint">Translation of your example</span>
            </label>
            <input 
              type="text" 
              placeholder={word ? `Example: "I eat ${word}."` : 'Example: "I want to learn Finnish."'}
              value={exampleTranslation}
              onChange={(e) => setExampleTranslation(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              📂 Kategoria
              <span className="label-hint">Valitse aihealue</span>
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input form-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button type="submit" className={editingWord ? 'edit-btn' : 'add-btn'}>
        {editingWord ? '💾 Tallenna muutokset' : '➕ Lisää sana'}
      </button>
    </form>
  );
}
