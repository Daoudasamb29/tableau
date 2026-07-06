import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App securely (avoid double initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Gmail sending scope
provider.addScope('https://www.googleapis.com/auth/gmail.send');

// Memory cache for the OAuth access token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no cached token, they might need to sign in again to get a fresh token,
        // or we let them triggers sign-in on action.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Check if authenticated
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Sign out
export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Encodes an email message in RFC 822 format and Base64url encodes it for the Gmail API.
 */
function buildRawEmail(to: string, fromName: string, subject: string, htmlBody: string): string {
  const boundary = 'foo_bar_baz_boundary';
  
  const headers = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `From: "${fromName}" <me>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    // Simple text version
    btoa(unescape(encodeURIComponent(htmlBody.replace(/<[^>]*>/g, '')))),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(htmlBody))),
    '',
    `--${boundary}--`
  ].join('\r\n');

  // base64url encoding
  return btoa(unescape(encodeURIComponent(headers)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email using the Gmail API users.messages.send endpoint
 */
export const sendGmailEmail = async (
  to: string,
  subject: string,
  htmlBody: string,
  fromName: string = 'DEM niou_dem Transports'
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const token = getAccessToken();
  if (!token) {
    return { success: false, error: 'Non authentifié avec Google. Veuillez connecter votre compte Gmail.' };
  }

  try {
    const raw = buildRawEmail(to, fromName, subject, htmlBody);
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('Error sending email via Gmail API:', err);
    return { success: false, error: err.message || 'Erreur d\'envoi inconnue.' };
  }
};
