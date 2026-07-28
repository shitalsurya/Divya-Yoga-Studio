import React, { useState } from 'react';

export interface DivyaUser {
  name: string;
  contact: string; // phone or email
  joinedAt: string; // ISO date
}

const USER_KEY = 'divya_yoga_user';

export function getStoredUser(): DivyaUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: DivyaUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

interface Props {
  onSignedIn: (user: DivyaUser) => void;
  onboarding?: Record<string, unknown> | null;
}

// Minimal colour tokens — mirrors Divya Yoga palette without importing main-app
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

export default function SignInScreen({ onSignedIn, onboarding }: Props) {
  const existing = getStoredUser();
  const [mode, setMode] = useState<'signin' | 'signup'>(existing ? 'signin' : 'signup');
  const [name, setName] = useState(existing?.name ?? '');
  const [contact, setContact] = useState(existing?.contact ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !contact.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signin' && pin.length !== 4) {
      setError('Enter your 4-digit PIN.');
      return;
    }
    setBusy(true);
    // Simulate a short network round-trip
    await new Promise((r) => setTimeout(r, 700));
    const user: DivyaUser = {
      name: name.trim(),
      contact: contact.trim(),
      joinedAt: existing?.joinedAt ?? new Date().toISOString(),
    };
    storeUser(user);
    // Persist onboarding data alongside user if provided
    if (onboarding) {
      localStorage.setItem('divya_yoga_onboarding_data', JSON.stringify(onboarding));
    }
    setBusy(false);
    onSignedIn(user);
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
          {mode === 'signin' ? 'Welcome back' : 'Create Account'}
        </h2>
        <p style={{ color: C.inkSoft, fontSize: 13, marginTop: 0, marginBottom: 20 }}>
          {mode === 'signin'
            ? 'Sign in to your Divya Yoga account'
            : "Join Archana's Divya Yoga Studio"}
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Your Name</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Shital"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />

          <label style={{ ...labelStyle, marginTop: 12 }}>Phone or Email</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="98765 43210"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            autoComplete="tel"
          />

          {mode === 'signin' && (
            <>
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
            </>
          )}

          {error && (
            <p style={{ color: C.danger, fontSize: 12, marginTop: 8 }}>{error}</p>
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
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign In' : 'Get Started'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError('');
            setPin('');
          }}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 14,
            background: 'none',
            border: 'none',
            color: C.inkSoft,
            fontSize: 12.5,
            cursor: 'pointer',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          {mode === 'signin'
            ? 'New student? Create account'
            : 'Already have an account? Sign in'}
        </button>
      </div>

      {onboarding && (
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            borderRadius: 12,
            background: C.goldSoft,
            border: `1px solid ${C.gold}`,
            maxWidth: 360,
            width: '100%',
            fontSize: 12,
            color: C.ink,
            lineHeight: 1.4,
          }}
        >
          🎯 Your onboarding selections are saved and will personalise your home screen.
        </div>
      )}
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
