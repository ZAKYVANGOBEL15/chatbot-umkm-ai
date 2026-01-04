import React from 'react';
import ReactDOM from 'react-dom';
import { MessageCircle } from 'lucide-react';

interface FacebookConnectButtonProps {
    onSuccess?: (authResponse: any) => void;
    onError?: (error: any) => void;
}

export const FacebookConnectButton: React.FC<FacebookConnectButtonProps> = ({
    onSuccess,
    onError,
}) => {
    // No longer needing FB SDK hooks for this manual mode
    const [showManualInput, setShowManualInput] = React.useState(false);
    const [manualValues, setManualValues] = React.useState({
        token: '',
        phoneId: '',
        wabaId: ''
    });

    const handleManualSubmit = () => {
        if (onSuccess) {
            // Pass structure matching what the backend expects
            onSuccess({
                accessToken: manualValues.token,
                phoneId: manualValues.phoneId,
                wabaId: manualValues.wabaId
            });
            setShowManualInput(false);
        }
    };

    if (showManualInput) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h3 className="text-lg font-bold mb-4">Manual WhatsApp Connection</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Please enter the credentials from your Meta Developer Dashboard.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Access Token (Permanent)</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={manualValues.token}
                                onChange={e => setManualValues(prev => ({ ...prev, token: e.target.value }))}
                                placeholder="EAA..."
                            />
                        </div>
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
                                onClick={() => setShowManualInput(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleManualSubmit}
                                disabled={!manualValues.token || !manualValues.phoneId || !manualValues.wabaId}
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
        <button
            onClick={() => setShowManualInput(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-md"
        >
            <MessageCircle size={20} />
            Connect WhatsApp
        </button>
    );
};
