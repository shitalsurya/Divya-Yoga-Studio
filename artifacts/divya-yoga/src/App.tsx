import { useEffect, useState } from 'react';
import MainApp from './main-app';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const prototypePath = `${import.meta.env.BASE_URL}prototype.html`;
const ONBOARDING_COMPLETE_KEY = 'divya_yoga_onboarding_complete';
const ONBOARDING_COMPLETE_MESSAGE = 'divya-yoga-onboarding-complete';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) !== 'true',
  );
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleOnboardingMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== ONBOARDING_COMPLETE_MESSAGE) return;

      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setShowOnboarding(false);
    };

    window.addEventListener('message', handleOnboardingMessage);
    return () => window.removeEventListener('message', handleOnboardingMessage);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <main className="prototype-shell">
      {showOnboarding ? (
        <iframe
          className="prototype-frame"
          title="Archana's Divya Yoga Studio"
          src={prototypePath}
        />
      ) : (
        <MainApp />
      )}
      {installPrompt ? (
        <button className="install-app-button" type="button" onClick={installApp}>
          Install App
        </button>
      ) : null}
    </main>
  );
}

export default App;