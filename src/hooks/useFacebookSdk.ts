import { useState, useEffect } from 'react';

// Define the window interface with FB
declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export const useFacebookSdk = () => {
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!FACEBOOK_APP_ID) {
            console.warn('Facebook App ID is missing in .env.local');
            setError('Missing App ID');
            return;
        }

        if (window.FB) {
            setIsSdkLoaded(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0', // Use latest durable version
            });
            setIsSdkLoaded(true);
        };

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js,
                fjs = d.getElementsByTagName(s)[0] as HTMLElement;
            if (d.getElementById(id)) return;
            js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = 'https://connect.facebook.net/en_US/sdk.js';
            if (fjs && fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
            }
        })(document, 'script', 'facebook-jssdk');
    }, []);

    return { isSdkLoaded, error };
};
