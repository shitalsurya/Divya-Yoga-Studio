/**
 * Divya Yoga Studio — Push Notification helpers
 *
 * Uses the Notifications API + ServiceWorkerRegistration.showNotification()
 * so notifications appear in the OS tray (not just in-page toasts).
 *
 * Trigger real OS notifications: send them via the registered SW so they
 * work even when the page is in the background.
 */

export type NotifType =
  | 'batch_reminder'
  | 'workshop_confirmed'
  | 'waitlist_opened'
  | 'streak_nudge';

interface NotifPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

const BASE_ICON = `${typeof window !== 'undefined' ? window.location.origin : ''}/icons/icon-192.svg`;

const TEMPLATES: Record<NotifType, NotifPayload> = {
  batch_reminder: {
    title: '🧘 Class starts in 30 minutes',
    body: 'Prepare your mat, water bottle, and take a few calming breaths.',
    tag: 'batch_reminder',
    data: { action: 'home' },
  },
  workshop_confirmed: {
    title: '🌸 Workshop Registration Confirmed',
    body: "You're registered for the Face Yoga Workshop. Details via WhatsApp.",
    tag: 'workshop_confirmed',
    data: { action: 'workshops' },
  },
  waitlist_opened: {
    title: '✨ A seat opened up for you',
    body: 'A spot just freed up in the Stress Relief Workshop — reserve it now.',
    tag: 'waitlist_opened',
    data: { action: 'workshops' },
  },
  streak_nudge: {
    title: "🔥 Protect Your Streak",
    body: "Don't lose your 12-day streak — check in or watch a quick video today.",
    tag: 'streak_nudge',
    data: { action: 'practice' },
  },
};

/** Returns the current Notification permission state. */
export function getPermissionState(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

/** Requests notification permission. Returns the resulting state. */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

/**
 * Shows a single notification via the service worker (OS-level tray).
 * Falls back to a direct Notification object if SW is unavailable.
 */
export async function showNotification(type: NotifType): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const payload = TEMPLATES[type];
  const options: NotificationOptions = {
    body: payload.body,
    icon: BASE_ICON,
    badge: BASE_ICON,
    tag: payload.tag,
    data: payload.data,
    requireInteraction: false,
  };

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(payload.title, options);
      return;
    } catch {
      // fall through to direct Notification
    }
  }

  // Fallback — direct Notification constructor (no SW).
  new Notification(payload.title, options);
}

/**
 * Sends all 4 notification types with a short stagger.
 * Intended for the debug "Send Test Notifications" button.
 */
export async function sendTestNotifications(): Promise<void> {
  const types: NotifType[] = [
    'batch_reminder',
    'workshop_confirmed',
    'waitlist_opened',
    'streak_nudge',
  ];

  for (let i = 0; i < types.length; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, i * 600));
    await showNotification(types[i]);
  }
}
