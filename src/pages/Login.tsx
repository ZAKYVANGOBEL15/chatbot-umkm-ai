import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import logo from '../assets/image/NV.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError('Akses ditolak. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 font-sans selection:bg-black selection:text-white p-4">

            {/* Brand Logo */}
            <div className="mb-12 flex items-center gap-3">
                <img src={logo} alt="Nusavite Logo" className="w-12 h-12 object-contain" />
                <span className="font-bold text-3xl tracking-tight text-black">Nusavite</span>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white p-8 md:p-12 border border-neutral-200 rounded-3xl shadow-2xl shadow-neutral-100">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-black mb-2">Client Portal</h2>
                        <p className="text-neutral-500 text-sm">Masuk untuk mengelola asisten AI Anda</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Email Klien</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-medium placeholder:text-neutral-400"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Password</label>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-medium placeholder:text-neutral-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Memproses...' : 'Masuk Dashboard'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-neutral-400 text-xs">
                        &copy; 2025 Nusavite Digital. All Access Reserved.
                    </p>
                    <div className="flex justify-center gap-6 text-xs text-neutral-400 font-medium">
                        <Link to="/" className="hover:text-black transition-colors">Utama</Link>
                        <a href="https://wa.me/62895402945495" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Bantuan</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
