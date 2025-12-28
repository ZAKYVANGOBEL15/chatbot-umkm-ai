import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const [productCount, setProductCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [subscriptionStatus, setSubscriptionStatus] = useState('trial');
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const productsSnap = await getDocs(collection(db, 'users', user.uid, 'products'));
                    setProductCount(productsSnap.size);

                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserName(data.name || '');
                        setSubscriptionStatus(data.subscriptionStatus || 'trial');

                        if (data.trialExpiresAt) {
                            const expiry = new Date(data.trialExpiresAt);
                            const now = new Date();
                            const diff = expiry.getTime() - now.getTime();
                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                            setDaysLeft(days > 0 ? days : 0);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching dashboard stats:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-8 max-w-full overflow-hidden">
            {/* Trial Warning */}
            {subscriptionStatus === 'trial' && (
                <div className="bg-black text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-neutral-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 border border-white/20 rounded-lg">
                            <Clock size={20} className="text-neutral-300" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Mode Percobaan Aktif</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Sisa waktu: <span className="text-white font-bold">{daysLeft} hari</span>.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Section */}
            <div className="p-8 lg:p-12 bg-white rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-100 overflow-hidden relative group">
                <div className="relative z-10">
                    <span className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2 block">System Overview</span>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-black">
                        Halo, {userName || 'Partner'}!
                    </h2>
                    <p className="text-neutral-500 max-w-xl mb-8 text-base lg:text-lg leading-relaxed">
                        Latih asisten AI Anda sekarang. Semakin lengkap data produk, semakin cerdas jawaban chatbot Anda.
                    </p>
                    <Link
                        to="/dashboard/knowledge"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-md group-hover:translate-x-1"
                    >
                        Mulai Setup Knowledge Base <ArrowRight size={18} />
                    </Link>
                </div>
                {/* Minimalist Decoration */}
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-neutral-50 to-transparent hidden lg:block"></div>
            </div>

            {/* Stats Cards */}
            <h3 className="text-xl font-bold text-black border-l-4 border-black pl-4">Statistik Real-time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-black transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 rounded-xl">
                            <MessageSquare size={24} className="text-black" />
                        </div>
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md">Total Chat</span>
                    </div>
                    <h3 className="text-3xl font-bold text-black mb-1">Coming Soon</h3>
                    <p className="text-xs text-neutral-400">Menunggu integrasi</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-black transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 rounded-xl">
                            <Users size={24} className="text-black" />
                        </div>
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md">Pelanggan</span>
                    </div>
                    <h3 className="text-3xl font-bold text-black mb-1">Coming Soon</h3>
                    <p className="text-xs text-neutral-400">Data belum tersedia</p>
                </div>

                <div className="p-6 bg-black text-white rounded-2xl shadow-xl shadow-neutral-200 transform lg:-translate-y-4">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-white/60 bg-white/10 px-2 py-1 rounded-md">Knowledge Base</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                        {loading ? '...' : productCount}
                    </h3>
                    <p className="text-xs text-neutral-400">Data Produk Terlatih</p>
                </div>
            </div>
        </div>
    );
}
