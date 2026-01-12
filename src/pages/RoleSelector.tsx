import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { Lock, RefreshCw } from 'lucide-react';

export default function RoleSelector() {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'pin' | 'reset'>('pin');
    const [pin, setPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [correctPin, setCorrectPin] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setCorrectPin(userDoc.data().adminPin || '');
                    }
                } catch (err) {
                    console.error("Error fetching admin pin:", err);
                }
                setLoading(false);
                if (currentUser.email === 'tester.nusavite@gmail.com') {
                    sessionStorage.setItem(`userRole_${currentUser.uid}`, 'admin');
                    navigate('/dashboard');
                }
            } else {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleVerifyPin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);

        if (pin === correctPin) {
            sessionStorage.setItem(`userRole_${user?.uid}`, 'admin');
            navigate('/dashboard');
        } else {
            setError('PIN yang Anda masukkan salah.');
            setPin('');
        }
        setIsVerifying(false);
    };

    const handleForgotPin = async () => {
        if (!user) return;
        setError('');
        setIsVerifying(true);
        try {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(user, provider);
            // If success, go to reset step
            setStep('reset');
        } catch (err: any) {
            console.error("Re-auth error:", err);
            setError('Gagal memverifikasi akun Google. Silakan coba lagi.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || newPin.length < 4) return;
        setIsVerifying(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                adminPin: newPin,
                updatedAt: new Date().toISOString()
            });
            sessionStorage.setItem(`userRole_${user.uid}`, 'admin');
            navigate('/dashboard');
        } catch (err) {
            setError('Gagal memperbarui PIN. Silakan coba lagi.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <img src="/NV.png" alt="Nusavite" className="h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-[#061E29]">Verifikasi Admin</h2>
                    <p className="text-neutral-500 mt-2">Login Google hanya untuk akses Admin</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100">
                    {step === 'pin' ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 text-[#061E29] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-[#061E29]">Masukkan PIN Admin</h3>
                                <p className="text-sm text-neutral-500 mt-1">Gunakan PIN yang Anda buat saat pendaftaran.</p>
                            </div>

                            <form onSubmit={handleVerifyPin} className="space-y-6">
                                <div>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        autoFocus
                                        required
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="••••••"
                                        className="w-full text-center text-4xl tracking-[1em] py-4 border-b-2 border-neutral-200 focus:border-[#061E29] focus:outline-none transition-all placeholder:text-neutral-100"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={pin.length < 4 || isVerifying}
                                    className="w-full py-4 bg-[#061E29] text-white font-bold rounded-2xl hover:bg-[#0a2d3d] transition-all shadow-lg shadow-[#061E29]/20 disabled:opacity-50"
                                >
                                    {isVerifying ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleForgotPin}
                                    className="w-full text-sm font-bold text-neutral-400 hover:text-[#061E29] transition-colors mt-2"
                                >
                                    Lupa PIN? Reset via Google
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RefreshCw size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-[#061E29]">Set PIN Baru</h3>
                                <p className="text-sm text-neutral-500 mt-1">Identitas terverifikasi. Masukkan PIN baru untuk Admin.</p>
                            </div>

                            <form onSubmit={handleResetPin} className="space-y-6">
                                <div>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        autoFocus
                                        required
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="PIN BARU"
                                        className="w-full text-center text-4xl tracking-[0.2em] py-4 border-b-2 border-neutral-200 focus:border-[#061E29] focus:outline-none transition-all placeholder:text-neutral-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={newPin.length < 4 || isVerifying}
                                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                                >
                                    {isVerifying ? 'Menyimpan...' : 'Simpan PIN & Masuk'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                    Terhubung sebagai: <span className="font-bold text-neutral-600">{user?.email}</span>
                </div>
            </div>
        </div>
    );
}
