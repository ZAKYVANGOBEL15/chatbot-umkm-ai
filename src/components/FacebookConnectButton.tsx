import React from 'react';
import { useFacebookSdk } from '../hooks/useFacebookSdk';
import { MessageCircle } from 'lucide-react';

interface FacebookConnectButtonProps {
    onSuccess?: (authResponse: any) => void;
    onError?: (error: any) => void;
}

export const FacebookConnectButton: React.FC<FacebookConnectButtonProps> = ({
    onSuccess,
    onError,
}) => {
    const { isSdkLoaded, error } = useFacebookSdk();

    const handleLogin = () => {
        if (!isSdkLoaded) {
            console.warn('Facebook SDK not loaded yet');
            return;
        }

        if (!window.FB) {
            console.error("FB object not found on window");
            return;
        }

        window.FB.login(
            function (response: any) {
                if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    console.log('Access Token:', response.authResponse.accessToken);

                    // In real app, send this token to backend to exchange for long-lived token & save to DB
                    if (onSuccess) {
                        onSuccess(response.authResponse);
                    }
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                    if (onError) {
                        onError('User cancelled login');
                    }
                }
            },
            {
                // Scopes required for WhatsApp Management
                scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management'
            }
        );
    };

    if (error) {
        return (
            <button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded flex items-center gap-2">
                <MessageCircle size={20} />
                Setup Required (Check Env)
            </button>
        );
    }

    return (
        <button
            onClick={handleLogin}
            disabled={!isSdkLoaded}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSdkLoaded
                ? 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-wait'
                }`}
        >
            <MessageCircle size={20} />
            {isSdkLoaded ? 'Connect WhatsApp' : 'Loading SDK...'}
        </button>
    );
};
