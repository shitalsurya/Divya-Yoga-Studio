import { useEffect, useState } from 'react';
import MainApp from './main-app';
import SignInScreen, {
  getSessionToken,
  storeSession,
  type DivyaUser,
} from './auth/SignInScreen';
import { LanguageProvider } from './i18n/LanguageContext';
import { setAuthTokenGetter } from '@workspace/api-client-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type AppState = 'onboarding' | 'signin' | 'app';

const prototypePath = `${import.meta.env.BASE_URL}prototype.html`;
const ONBOARDING_COMPLETE_KEY = 'divya_yoga_onboarding_complete';
const ONBOARDING_COMPLETE_MESSAGE = 'divya-yoga-onboarding-complete';

function deriveInitialState(): AppState {
  const onboardingDone = window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
  if (!onboardingDone) return 'onboarding';
  const token = getSessionToken();
  return token ? 'app' : 'signin';
}

function App() {
  const [appState, setAppState] = useState<AppState>(deriveInitialState);
  const [onboardingData, setOnboardingData] = useState<Record<string, unknown> | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  // Register the session token getter so all generated API hooks send Bearer tokens.
  useEffect(() => {
    setAuthTokenGetter(() => getSessionToken());
    return () => setAuthTokenGetter(null);
  }, []);

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

      const data = event.data?.onboarding ?? null;
      if (data) {
        setOnboardingData(data);
        window.localStorage.setItem('divya_yoga_onboarding_data', JSON.stringify(data));
      }

      // The prototype's Confirmation screen already called signup + booking APIs.
      // We only navigate to signin — the user must explicitly authenticate.
      setAppState('signin');
    };

    window.addEventListener('message', handleOnboardingMessage);
    return () => window.removeEventListener('message', handleOnboardingMessage);
  }, []);

  const handleSignedIn = (_user: DivyaUser) => {
    setAppState('app');
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  // Mobile pre-fill from the onboarding payload (name/mobile/pin were collected on Booking screen)
  const prefillMobile =
    typeof onboardingData?.mobile === 'string' ? onboardingData.mobile : null;

  return (
    <LanguageProvider>
      {appState === 'onboarding' && (
        <main className="prototype-shell">
          <iframe
            className="prototype-frame"
            title="Archana's Divya Yoga Studio"
            src={prototypePath}
          />
        </main>
      )}

      {appState === 'signin' && (
        <SignInScreen onSignedIn={handleSignedIn} prefillMobile={prefillMobile} />
      )}

      {appState === 'app' && (
        <main className="prototype-shell">
          <MainApp />
        </main>
      )}

      {installPrompt ? (
        <button className="install-app-button" type="button" onClick={installApp}>
          Install App
        </button>
      ) : null}
    </LanguageProvider>
  );
}

export default App;
