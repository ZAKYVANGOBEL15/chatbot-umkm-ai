import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { getFriendlyErrorMessage } from '../lib/auth-errors';

export default function Register() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user already exists
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Initialize new user profile
                const now = new Date();
                const trialExpiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

                await setDoc(docRef, {
                    name: user.displayName || 'User',
                    email: user.email,
                    role: 'admin', // Default root user is admin
                    businessName: '',
                    createdAt: now.toISOString(),
                    trialExpiresAt: trialExpiresAt.toISOString(),
                    subscriptionStatus: 'trial',
                    subscriptionPlan: 'basic'
                });
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">

            {/* Back Button */}


            {/* Left Side: Brand Identity - Visible as Top on Mobile, Left on Desktop */}
            <div className="lg:w-[45%] flex flex-col items-center justify-center p-12 bg-neutral-50 border-b lg:border-b-0 lg:border-r border-neutral-100 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src="/baground_login_daftar.jpg"
                        alt="Background"
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay to ensure logo visibility */}
                    <div className="absolute inset-0 bg-[#2D3C59]/10 mix-blend-multiply" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="text-center">
                        <div className="h-2 w-20 bg-[#2D3C59] mx-auto rounded-full opacity-0 mb-8" />

                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-white">
                <div className="w-full max-w-md">
                    <div className="bg-white p-8 md:p-10 border border-neutral-100 rounded-[2rem] shadow-xl shadow-neutral-100/50">
                        <div className="text-center mb-10">
                            <img src="/NV.png" alt="Nusavite" className="h-16 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-black mb-2">Daftar Akun</h2>

                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center" aria-live="polite">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Google Button */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold py-5 rounded-2xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md transform active:scale-[0.98]"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Daftar dengan Google
                                </button>
                            </div>
                        </div>

                        <p className="mt-10 text-center text-sm text-neutral-500">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="text-[#2D3C59] font-bold hover:underline">
                                Masuk disini
                            </Link>
                        </p>

                        <div className="mt-10 pt-6 border-t border-neutral-50 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                            <Link to="/terms" className="hover:text-[#2D3C59] transition-colors">Syarat</Link>
                            <Link to="/privacy" className="hover:text-[#2D3C59] transition-colors">Kebijakan</Link>
                            <a href="https://wa.me/62895402945495" target="_blank" rel="noreferrer" className="hover:text-[#2D3C59] transition-colors">Bantuan</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
