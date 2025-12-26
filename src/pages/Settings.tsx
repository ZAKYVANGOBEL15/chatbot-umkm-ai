import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CreditCard, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface UserProfile {
    subscriptionStatus: 'trial' | 'active' | 'expired';
    trialExpiresAt?: string;
    subscriptionPlan?: string;
    businessName?: string;
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function Settings() {
    const auth = getAuth();
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    setProfile(data);

                    if (data.trialExpiresAt) {
                        const expiry = new Date(data.trialExpiresAt);
                        const now = new Date();
                        const diff = expiry.getTime() - now.getTime();
                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        setDaysLeft(days > 0 ? days : 0);
                    }
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const [paying, setPaying] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setPaying(true);
        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, plan: 'pro' })
            });
            const data = await response.json();

            if (data.token) {
                window.snap.pay(data.token, {
                    onSuccess: () => {
                        alert("Pembayaran Terkonfirmasi! Akun Anda sedang diperbarui...");
                        window.location.reload();
                    },
                    onPending: () => {
                        alert("Menunggu pembayaran Anda.");
                    },
                    onError: () => {
                        alert("Pembayaran Gagal. Silakan coba lagi.");
                    },
                    onClose: () => {
                        setPaying(false);
                    }
                });
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert("Terjadi kesalahan sistem pembayaran.");
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto relative">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan & Langganan</h1>

            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "p-3 rounded-xl",
                            profile?.subscriptionStatus === 'active' ? "bg-green-100" : "bg-blue-100"
                        )}>
                            {profile?.subscriptionStatus === 'active' ? (
                                <Zap className="w-6 h-6 text-green-600" />
                            ) : (
                                <Clock className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Status Akun</p>
                            <h3 className="text-lg font-bold text-gray-800">
                                {profile?.subscriptionStatus === 'active' ? 'Pelanggan Pro' : `Masa Percobaan (${daysLeft} hari lagi)`}
                            </h3>
                        </div>
                    </div>
                </div>

                {profile?.subscriptionStatus !== 'active' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Layanan akan berhenti otomatis setelah masa percobaan habis.</p>
                            <p className="text-xs text-blue-600 mt-1">Upgrade sekarang untuk menikmati fitur tanpa batas dan dukungan prioritas.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing Section */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Plan (Current/Disabled) */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 opacity-60">
                    <h4 className="text-gray-600 font-bold mb-1">Paket Gratis</h4>
                    <p className="text-sm text-gray-500 mb-4">Masa percobaan standar</p>
                    <div className="text-3xl font-bold text-gray-800 mb-6">Gratis</div>
                    <ul className="space-y-3 mb-8 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-400" /> WhatsApp Integration
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-400" /> 5-Day Access
                        </li>
                    </ul>
                    <button disabled className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                        Paket Aktif
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-600 relative overflow-hidden ring-4 ring-blue-50">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                        Rekomendasi
                    </div>
                    <h4 className="text-blue-600 font-bold mb-1">Paket Pro</h4>
                    <p className="text-sm text-gray-500 mb-4">Layanan asisten AI 24/7</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-bold text-gray-800">Rp 299.000</span>
                        <span className="text-gray-500 text-sm">/bulan</span>
                    </div>
                    <ul className="space-y-3 mb-8 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" /> Unlimited WhatsApp Chat
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" /> Fast Response AI (Gemini 2.0)
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Products
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" /> Support Prioritas
                        </li>
                    </ul>
                    <button
                        onClick={handleUpgrade}
                        disabled={paying}
                        className={clsx(
                            "w-full py-3 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                            paying ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                        )}
                    >
                        {paying ? 'Memproses...' : 'Lanjut ke Pembayaran'} <CreditCard className="w-4 h-4" />
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 italic">
                        *Pembayaran otomatis dikonfirmasi seketika
                    </p>
                </div>
            </div>
        </div>
    );
}
