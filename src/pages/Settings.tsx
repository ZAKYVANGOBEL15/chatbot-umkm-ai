import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AlertCircle, Clock, Zap } from 'lucide-react';
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

            {/* Contact Support Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Butuh Bantuan atau Upgrade Paket?</h3>
                <p className="text-gray-500 mb-6">
                    Hubungi admin untuk perpanjangan masa aktif, upgrade kuota AI, atau kendala teknis lainnya.
                </p>

                <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                >
                    <Zap className="w-5 h-5" /> Hubungi Admin via WhatsApp
                </a>
            </div>
        </div>
    );
}
