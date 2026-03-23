import { useState } from 'react';

export default function BulkImport({ onImport, onCancel }) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const validateAndParse = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of vocabulary items');
      }

      // Validate each item
      const validated = parsed.map((item, index) => {
        if (!item.word || !item.meaning) {
          throw new Error(`Item ${index + 1}: Missing required fields (word, meaning)`);
        }
        
        return {
          id: Date.now() + index, // Generate unique IDs
          word: item.word.trim(),
          meaning: item.meaning.trim(),
          example: item.example?.trim() || `Minä käytän sanaa "${item.word}".`,
          exampleTranslation: item.exampleTranslation?.trim() || `I use the word "${item.word}".`,
          category: item.category || 'user',
          difficulty: item.difficulty || 'medium',
          strength: 0,
          userExamples: [],
          addedAt: new Date().toISOString(),
          lastReviewed: null,
          nextReview: null
        };
      });

      return validated;
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
  };

  const handlePreview = () => {
    setError('');
    try {
      const validated = validateAndParse(jsonInput);
      setPreview(validated);
      setShowPreview(true);
    } catch (err) {
      setError(err.message);
      setPreview([]);
      setShowPreview(false);
    }
  };

  const handleImport = () => {
    setError('');
    try {
      const validated = validateAndParse(jsonInput);
      onImport(validated);
      setJsonInput('');
      setPreview([]);
      setShowPreview(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTemplate = () => {
    const template = `[
  {
    "word": "example word",
    "meaning": "English translation",
    "example": "Finnish sentence here",
    "exampleTranslation": "English translation",
    "category": "general",
    "difficulty": "medium"
  }
]`;
    setJsonInput(template);
    setError('');
    setPreview([]);
    setShowPreview(false);
  };

  return (
    <div className="bulk-import">
      <div className="import-header">
        <h3>📥 Bulk Import Vocabulary (JSON)</h3>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="import-instructions">
        <p>Paste your vocabulary JSON below. Each item needs:</p>
        <ul>
          <li><strong>word</strong> (required) - Finnish word</li>
          <li><strong>meaning</strong> (required) - English translation</li>
          <li><strong>example</strong> (optional) - Finnish sentence</li>
          <li><strong>exampleTranslation</strong> (optional) - English sentence</li>
          <li><strong>category</strong> (optional) - general, travel, food, etc.</li>
          <li><strong>difficulty</strong> (optional) - easy, medium, hard, very-hard</li>
        </ul>
        <button className="template-btn" onClick={loadTemplate}>
          📋 Load Template
        </button>
      </div>

      <textarea
        className="json-input"
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='Paste JSON here...

Example:
[
  {
    "word": "kahvi",
    "meaning": "coffee",
    "example": "Juon kahvia aamulla.",
    "exampleTranslation": "I drink coffee in the morning.",
    "category": "food",
    "difficulty": "easy"
  }
]'
        rows={15}
      />

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {showPreview && preview.length > 0 && (
        <div className="preview-section">
          <h4>Preview ({preview.length} words):</h4>
          <div className="preview-list">
            {preview.slice(0, 5).map((item, index) => (
              <div key={index} className="preview-item">
                <strong>{item.word}</strong> = {item.meaning}
                <span className="preview-category">{item.category}</span>
              </div>
            ))}
            {preview.length > 5 && (
              <p className="preview-more">...and {preview.length - 5} more</p>
            )}
          </div>
        </div>
      )}

      <div className="import-actions">
        <button 
          className="preview-btn" 
          onClick={handlePreview}
          disabled={!jsonInput.trim()}
        >
          👁️ Preview
        </button>
        <button 
          className="import-submit-btn" 
          onClick={handleImport}
          disabled={!jsonInput.trim() || preview.length === 0}
        >
          ✅ Import {preview.length > 0 && `(${preview.length} words)`}
        </button>
      </div>
    </div>
  );
}
