import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';

// Get reCAPTCHA site key from environment variables
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Enable debug mode in development
if (import.meta.env.DEV) {
    // @ts-ignore - Firebase App Check debug token
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
}

/**
 * Initialize Firebase App Check with reCAPTCHA v3
 * This provides bot protection and rate limiting for all Firebase services
 */
export const initAppCheck = () => {
    try {
        if (!RECAPTCHA_SITE_KEY) {
            console.warn('⚠️ reCAPTCHA site key not found. App Check will not be initialized.');
            console.warn('Please add VITE_RECAPTCHA_SITE_KEY to your .env.local file.');
            return null;
        }

        const appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true, // Auto-refresh tokens before they expire
        });

        console.log('✅ Firebase App Check initialized successfully');
        return appCheck;
    } catch (error) {
        console.error('❌ Failed to initialize App Check:', error);
        return null;
    }
};
