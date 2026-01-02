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
            // Only log in development mode
            if (import.meta.env.DEV) {
                console.warn('reCAPTCHA site key not found. App Check will not be initialized.');
            }
            return null;
        }

        const appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true,
        });

        return appCheck;
    } catch (error) {
        // Only log errors in development
        if (import.meta.env.DEV) {
            console.error('Failed to initialize App Check:', error);
        }
        return null;
    }
};
