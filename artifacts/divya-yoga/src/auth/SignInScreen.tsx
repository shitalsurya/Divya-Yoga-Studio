import React, { useState } from 'react';

export interface DivyaUser {
  name: string;
  mobile: string;
  joinedAt: string;
}

const SESSION_KEY = 'divya_yoga_session';
const USER_KEY = 'divya_yoga_user';

export function getStoredUser(): DivyaUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: DivyaUser): void {
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

interface Props {
  onSignedIn: (user: DivyaUser) => void;
  /** Mobile pre-filled from the onboarding postMessage payload */
  prefillMobile?: string | null;
}

const C = {
  bg: '#F5F0E3',
  surface: '#FBF8F0',
  green: '#3F5942',
  greenSoft: '#E3EADD',
  gold: '#C79A46',
  goldSoft: '#F3E7CC',
  ink: '#2A2118',
  inkSoft: '#8C8272',
  line: '#E7DFCB',
  danger: '#B5563E',
};

const MOBILE_RE = /^[6-9]\d{9}$/;

export default function SignInScreen({ onSignedIn, prefillMobile }: Props) {
  const [mobile, setMobile] = useState(prefillMobile ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const mobileValid = MOBILE_RE.test(mobile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileValid) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (pin.length !== 4) {
      setError('Enter your 4-digit PIN.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Sign-in failed. Please try again.');
        return;
      }

      storeSession(data.sessionToken, {
        name: data.user?.name ?? '',
        mobile: data.user?.mobile ?? mobile,
        joinedAt: data.user?.joinedAt ?? new Date().toISOString(),
      });

      onSignedIn({
        name: data.user?.name ?? '',
        mobile: data.user?.mobile ?? mobile,
        joinedAt: data.user?.joinedAt ?? new Date().toISOString(),
      });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg,
        padding: '0 24px',
        fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🪷</div>
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: C.green,
            fontSize: 22,
            lineHeight: 1.25,
          }}
        >
          Archana's Divya Yoga Studio
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 20,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: C.ink,
            fontSize: 20,
            marginTop: 0,
            marginBottom: 4,
          }}
        >
          Welcome back
        </h2>
        <p style={{ color: C.inkSoft, fontSize: 13, marginTop: 0, marginBottom: 20 }}>
          Sign in with your registered mobile and PIN
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Mobile Number</label>
          <input
            style={{
              ...inputStyle,
              borderColor: mobile.length > 0 && !mobileValid ? C.danger : '#E7DFCB',
            }}
            type="tel"
            inputMode="tel"
            placeholder="9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            autoComplete="tel"
          />
          {mobile.length > 0 && !mobileValid && (
            <p style={{ color: C.danger, fontSize: 11, marginTop: 4, marginBottom: 0 }}>
              Enter a valid 10-digit Indian mobile number
            </p>
          )}

          <label style={{ ...labelStyle, marginTop: 12 }}>4-digit PIN</label>
          <input
            style={inputStyle}
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            autoComplete="current-password"
          />

          {error && (
            <p style={{ color: C.danger, fontSize: 12, marginTop: 10, marginBottom: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              background: busy ? C.greenSoft : C.green,
              color: busy ? C.green : '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              cursor: busy ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {busy ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p
          style={{
            color: C.inkSoft,
            fontSize: 12,
            marginTop: 16,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          New student? Complete the onboarding flow to create your account.
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#8C8272',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 13px',
  border: '1.5px solid #E7DFCB',
  borderRadius: 12,
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#2A2118',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};
