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
        // 0. Manual Bypass for troubleshooting
        if (import.meta.env.VITE_SKIP_APP_CHECK === 'true') {
            console.warn('[AppCheck] Manual bypass enabled via VITE_SKIP_APP_CHECK.');
            return null;
        }

        // 1. Check if we have a site key
        if (!RECAPTCHA_SITE_KEY) {
            if (import.meta.env.DEV) {
                console.warn('[AppCheck] No reCAPTCHA site key found. Skipping initialization.');
            }
            return null;
        }

        // 2. Handle Localhost / Development Automatically
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost || import.meta.env.DEV) {
            // @ts-ignore - Force debug mode for local development to avoid ReCAPTCHA errors
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
            console.info('[AppCheck] Running in Development/Localhost mode. Debug token enabled.');
        }

        const appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true,
        });

        if (import.meta.env.DEV) {
            console.log('[AppCheck] Successfully initialized.');
        }

        return appCheck;
    } catch (error) {
        // App Check failure should NEVER block the entire app
        console.warn('[AppCheck] Initialization failed, but proceeding anyway:', error);
        return null;
    }
};
