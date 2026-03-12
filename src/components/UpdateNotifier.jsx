import { useEffect, useState } from 'react';

export default function UpdateNotifier() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for new service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New version activated - show subtle notification
        setUpdateReady(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => setUpdateReady(false), 5000);
      });

      // Check for updates on mount
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }, []);

  if (!updateReady) return null;

  return (
    <div className="update-toast">
      🔄 App updated! Changes applied.
    </div>
  );
}
