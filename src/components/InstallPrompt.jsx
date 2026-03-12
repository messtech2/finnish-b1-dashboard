// src/components/InstallPrompt.jsx
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <div className="install-icon">📱</div>
        <h3>Asenna sovellus</h3>
        <p>Install Suomi B1 Dashboard on your home screen for quick access!</p>
        <div className="install-actions">
          <button onClick={handleInstall} className="install-btn">
            📲 Install Now
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}