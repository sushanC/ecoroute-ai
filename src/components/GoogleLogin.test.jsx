// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const { signInWithPopup, signOut } = vi.hoisted(() => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/auth', () => ({ signInWithPopup, signOut }));
vi.mock('../firebase', () => ({ auth: {}, googleProvider: {} }));

import GoogleLogin from './GoogleLogin';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderGoogleLogin = (overrides = {}) => {
  const props = {
    disabled: false,
    loading: false,
    onAuthenticate: vi.fn().mockResolvedValue({ success: true }),
    onError: vi.fn(),
    onLoadingChange: vi.fn(),
    ...overrides,
  };
  render(<GoogleLogin {...props} />);
  return props;
};

describe('Google sign-in button', () => {
  it('sends the Firebase ID token to the application auth handler', async () => {
    const getIdToken = vi.fn().mockResolvedValue('firebase-id-token');
    signInWithPopup.mockResolvedValue({ user: { getIdToken } });
    const props = renderGoogleLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(props.onAuthenticate).toHaveBeenCalledWith('firebase-id-token'));
    expect(getIdToken).toHaveBeenCalledOnce();
    expect(props.onLoadingChange.mock.calls).toEqual([[true], [false]]);
    expect(props.onError).toHaveBeenCalledOnce();
    expect(props.onError).toHaveBeenCalledWith('');
  });

  it('shows the backend failure and signs out of Firebase', async () => {
    signInWithPopup.mockResolvedValue({ user: { getIdToken: async () => 'firebase-id-token' } });
    signOut.mockResolvedValue(undefined);
    const props = renderGoogleLogin({
      onAuthenticate: vi.fn().mockResolvedValue({ success: false, message: 'ACCOUNT_LINK_REQUIRED' }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(props.onError).toHaveBeenCalledWith('ACCOUNT_LINK_REQUIRED'));
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('handles popup cancellation without exposing Firebase internals', async () => {
    signInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    const props = renderGoogleLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(props.onError).toHaveBeenCalledWith('Google sign-in was cancelled.'));
    expect(props.onAuthenticate).not.toHaveBeenCalled();
    expect(props.onLoadingChange).toHaveBeenLastCalledWith(false);
  });

  it('disables repeated sign-in while a request is in progress', () => {
    renderGoogleLogin({ disabled: true, loading: true });
    expect(screen.getByRole('button', { name: 'Signing in with Google…' }).disabled).toBe(true);
  });
});
