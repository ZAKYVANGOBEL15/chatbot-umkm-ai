import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getFriendlyErrorMessage } from '../lib/auth-errors';

import logo from '../assets/image/NV.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                // Initialize new user profile (in case they login with Google first)
                const now = new Date();
                const trialExpiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

                await setDoc(docRef, {
                    name: user.displayName || 'User',
                    email: user.email,
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">

            {/* Left Side: Brand Identity - Visible as Top on Mobile, Left on Desktop */}
            <div className="lg:w-[45%] flex flex-col items-center justify-center p-12 bg-neutral-50 border-b lg:border-b-0 lg:border-r border-neutral-100 relative overflow-hidden">
                {/* Decorative background elements for desktop */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none hidden lg:block" aria-hidden="true">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2D3C59]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2D3C59]" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-[2.5rem] shadow-2xl shadow-neutral-200 border border-neutral-100 flex items-center justify-center p-6 transform hover:rotate-3 transition-transform duration-500">
                        <img src={logo} alt="Nusavite Logo" className="w-full h-full object-contain" fetchPriority="high" loading="eager" />
                    </div>
                    <div className="text-center">
                        <h1 className="font-black text-3xl lg:text-5xl tracking-[0.3em] uppercase text-[#2D3C59] mb-3">Nusavite</h1>
                        <div className="h-1.5 w-16 bg-[#2D3C59] mx-auto rounded-full opacity-20 mb-6" />
                        <p className="hidden lg:block text-neutral-500 font-medium tracking-[0.2em] text-sm uppercase">AI Digital Assistant</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-white">
                <div className="w-full max-w-md">
                    <div className="bg-white p-8 md:p-10 border border-neutral-100 rounded-[2rem] shadow-xl shadow-neutral-100/50">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-black mb-2">Selamat Datang</h2>
                            <p className="text-neutral-500 text-sm">Masuk untuk mengelola asisten AI Anda</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                                Masuk dengan Google
                            </button>

                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-px bg-neutral-100" />
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Atau</span>
                                <div className="flex-1 h-px bg-neutral-100" />
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Klien</label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-[#2D3C59] focus:bg-white outline-none transition-all font-medium placeholder:text-neutral-300"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Password</label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-[#2D3C59] focus:bg-white outline-none transition-all font-medium placeholder:text-neutral-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#2D3C59] hover:bg-[#1e2a41] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl shadow-[#2D3C59]/10"
                                >
                                    {loading ? 'Memproses...' : 'Masuk Dashboard'}
                                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-4">
                        <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} Nusavite Digital. All Access Reserved.
                        </p>
                        <div className="flex justify-center gap-6 text-[11px] text-neutral-500 font-bold uppercase tracking-widest">
                            <Link to="/" className="hover:text-black transition-colors">Utama</Link>
                            <Link to="/privacy" className="hover:text-black transition-colors">Kebijakan</Link>
                            <a href="https://wa.me/62895402945495" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Bantuan</a>
                            <Link to="/register" className="text-[#2D3C59] hover:opacity-80 transition-opacity">Daftar</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
