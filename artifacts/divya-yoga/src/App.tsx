import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const prototypePath = `${import.meta.env.BASE_URL}prototype.html`;

function App() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <main className="prototype-shell">
      <iframe
        className="prototype-frame"
        title="Archana's Divya Yoga Studio"
        src={prototypePath}
      />
      {installPrompt ? (
        <button className="install-app-button" type="button" onClick={installApp}>
          Install App
        </button>
      ) : null}
    </main>
  );
}

export default App;