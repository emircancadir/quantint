/** Shared styles for the auth + admin forms, in the design's visual language. */

export const authCard: React.CSSProperties = {
  maxWidth: '440px',
  margin: '0 auto',
  background: 'var(--q-surface)',
  border: '1px solid var(--q-line)',
  borderRadius: '16px',
  padding: '40px 44px',
};

export const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '13.5px',
  fontWeight: 600,
  color: 'var(--q-muted)',
  marginBottom: '7px',
};

export const textInput: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--q-line-soft)',
  borderRadius: '9px',
  padding: '12px 15px',
  fontSize: '15px',
  fontFamily: 'var(--font-plex-sans), sans-serif',
  background: 'var(--q-surface-soft)',
  outline: 'none',
  color: 'var(--q-ink)',
};

export const primaryButton: React.CSSProperties = {
  width: '100%',
  background: 'var(--q-button-bg)',
  color: '#FFFFFF',
  padding: '13px 24px',
  borderRadius: '9px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  fontFamily: 'var(--font-plex-sans), sans-serif',
};

export const errorText: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: '13.5px',
  color: '#B3261E',
  background: '#FDF1F0',
  border: '1px solid #F2C9C5',
  borderRadius: '8px',
  padding: '10px 14px',
};
