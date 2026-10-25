import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const getMessage = (error) => {
  if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') return 'Google sign-in was cancelled.';
  if (error?.code === 'auth/popup-blocked') return 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.';
  if (error?.code === 'auth/unauthorized-domain') return 'This site is not enabled for Google sign-in. Contact the site administrator.';
  return 'Google sign-in failed. Check your connection and try again.';
};

export default function GoogleLogin({ disabled, loading, onAuthenticate, onError, onLoadingChange }) {
  const handleGoogleLogin = async () => {
    if (disabled) return;
    onError('');
    onLoadingChange(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await onAuthenticate(idToken);
      if (!response?.success) {
        await signOut(auth);
        onError(response?.message || 'Google sign-in could not be completed.');
      }
    } catch (error) {
      onError(getMessage(error));
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <button type="button" className="google-auth-btn" onClick={handleGoogleLogin} disabled={disabled}>
      <svg aria-hidden="true" viewBox="0 0 48 48" className="google-mark">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.1 7.14-10.14 7.14-17.56Z" />
        <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.89l-7.62-5.91c-2.12 1.42-4.84 2.27-8.29 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
      </svg>
      {loading ? 'Signing in with Google…' : 'Continue with Google'}
    </button>
  );
}
