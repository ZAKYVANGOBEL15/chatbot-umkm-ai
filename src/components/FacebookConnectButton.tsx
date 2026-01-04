import React from 'react';
import ReactDOM from 'react-dom';
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

    const [showManualInput, setShowManualInput] = React.useState(false);
    const [manualValues, setManualValues] = React.useState({ phoneId: '', wabaId: '' });
    const [tempToken, setTempToken] = React.useState('');
    const isManualModeRef = React.useRef(false);

    const handleLogin = (isManual: boolean = false) => {
        isManualModeRef.current = isManual;
        if (isManual) {
            setShowManualInput(true);
        }

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

                    // Check the Ref, not the state, to avoid stale closure issues
                    if (isManualModeRef.current) {
                        setTempToken(response.authResponse.accessToken);
                        return; // Wait for manual submit
                    }

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
                scope: 'whatsapp_business_management,whatsapp_business_messaging'
            }
        );
    };

    const handleManualSubmit = () => {
        if (onSuccess && tempToken) {
            onSuccess({
                accessToken: tempToken,
                ...manualValues
            });
            setShowManualInput(false);
        }
    };

    if (error) {
        return (
            <button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded flex items-center gap-2">
                <MessageCircle size={20} />
                Setup Required (Check Env)
            </button>
        );
    }

    if (showManualInput && tempToken) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h3 className="text-lg font-bold mb-4">Manual WhatsApp Connection</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Please enter the IDs from your Meta Developer Dashboard.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={manualValues.phoneId}
                                onChange={e => setManualValues(prev => ({ ...prev, phoneId: e.target.value }))}
                                placeholder="e.g. 104xxxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">WABA ID</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={manualValues.wabaId}
                                onChange={e => setManualValues(prev => ({ ...prev, wabaId: e.target.value }))}
                                placeholder="e.g. 105xxxxxxxx"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => { setShowManualInput(false); setTempToken(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleManualSubmit}
                                disabled={!manualValues.phoneId || !manualValues.wabaId}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => { setShowManualInput(false); handleLogin(); }}
                disabled={!isSdkLoaded}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSdkLoaded
                    ? 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-wait'
                    }`}
            >
                <MessageCircle size={20} />
                {isSdkLoaded ? 'Connect WhatsApp' : 'Loading SDK...'}
            </button>
            <button
                onClick={() => { setShowManualInput(true); handleLogin(true); }}
                className="text-xs text-gray-500 hover:text-blue-600 underline"
            >
                Having trouble? Connect Manually
            </button>
        </div>
    );
};
