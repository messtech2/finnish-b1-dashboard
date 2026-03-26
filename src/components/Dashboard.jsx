import { useState } from 'react';
import ExamCountdown from './ExamCountdown';
import ReadingModule from './yki/ReadingModule';
import VocabularyList from './VocabularyList';
import StudyPlan from './StudyPlan';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('reading');

  const tabs = [
    { id: 'reading', label: '📖 Lukeminen', icon: '📖' },
    { id: 'vocabulary', label: '📚 Sanasto', icon: '📚' },
    { id: 'quiz', label: '🎮 Peli', icon: '🎮' },
    { id: 'flashcards', label: '🎴 Kortit', icon: '🎴' },
    { id: 'studyplan', label: '📅 Suunnitelma', icon: '📅' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'reading':
        return <ReadingModule mode="practice" />;
      case 'vocabulary':
        return <VocabularyList />;
      case 'quiz':
        return <div className="tab-content"><h2>🎮 Peli / Quiz</h2><p>Quiz component here</p></div>;
      case 'flashcards':
        return <div className="tab-content"><h2>🎴 Flashcards</h2><p>Flashcards component here</p></div>;
      case 'studyplan':
        return <StudyPlan />;
      default:
        return <ReadingModule mode="practice" />;
    }
  };

  return (
    <div className="dashboard">
      {/* 🔥 GLOBAL COUNTDOWN - Always visible */}
      <ExamCountdown />

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
}
