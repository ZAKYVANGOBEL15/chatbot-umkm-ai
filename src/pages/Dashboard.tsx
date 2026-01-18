import { useState, useEffect } from 'react';
import { MessageSquare, ShoppingBag, ArrowRight, Zap, Clock } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const [productCount, setProductCount] = useState(0);
    const [faqCount, setFaqCount] = useState(0);
    const [docCount, setDocCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [subscriptionStatus, setSubscriptionStatus] = useState('trial');
    const [daysLeft, setDaysLeft] = useState(0);
    const [userId, setUserId] = useState('');
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchUserData(user);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const fetchUserData = async (user: any) => {
        try {
            // 1. Products 
            const productsSnap = await getDocs(collection(db, 'users', user.uid, 'products'));
            setProductCount(productsSnap.size);

            // 2. FAQs
            const faqsSnap = await getDocs(collection(db, 'users', user.uid, 'faqs'));
            setFaqCount(faqsSnap.size);

            // 3. Documents
            const docsSnap = await getDocs(collection(db, 'users', user.uid, 'documents'));
            setDocCount(docsSnap.size);

            // 4. User Profile
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserName(data.businessName || '');

                // RBAC: Read role from Session Storage
                const status = data.subscriptionStatus || 'trial';
                setSubscriptionStatus(status);

                if (status === 'trial' && data.trialExpiresAt) {
                    const expiry = new Date(data.trialExpiresAt);
                    const now = new Date();
                    const diff = expiry.getTime() - now.getTime();
                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    setDaysLeft(days > 0 ? days : 0);
                }
            }
        } catch (error: any) {
            console.error("Dashboard fetch error:", error);
            setFetchError(`Terjadi kesalahan: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, plan: 'Monthly' })
            });
            const data = await res.json();
            if (data.invoiceUrl) {
                window.location.href = data.invoiceUrl;
            } else {
                alert('Gagal membuat invoice: ' + (data.error || 'Unknown error'));
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Upgrade error:', err);
            alert('Terjadi kesalahan saat menghubungi server.');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 max-w-full overflow-hidden text-[#061E29]">
            {/* Subscription Status Banner */}
            {subscriptionStatus === 'active' ? (
                <div className="bg-[#061E29] text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-neutral-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 border border-white/20 rounded-lg">
                            <Clock size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Paket Premium Aktif</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Layanan aktif dan siap digunakan sepenuhnya.</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Trial Warning */
                <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-neutral-100 rounded-lg">
                            <Clock size={20} className="text-neutral-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#061E29]">Mode Demo / Trial</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Sisa waktu demo: <span className="text-[#061E29] font-bold">{daysLeft} hari</span>.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#061E29] text-white text-xs font-bold rounded-lg hover:bg-[#0a2d3d] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:bg-neutral-400"
                    >
                        <Zap size={14} className="text-emerald-400" />
                        {loading ? 'Memproses...' : 'Daftar Premium'}
                    </button>
                </div>
            )}

            {/* Error Alert */}
            {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{fetchError}</span>
                    <span className="block text-xs mt-1">Coba refresh halaman atau hubungi admin.</span>
                </div>
            )}


            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white text-[#061E29] shadow-sm p-8 lg:p-12 border border-neutral-200 group">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-4">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Internal System Active
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#061E29] tracking-tight">
                            Halo, {userName || 'Partner'}!
                        </h2>
                        <p className="text-neutral-500 max-w-xl text-base lg:text-lg leading-relaxed font-normal">
                            Pusat kendali SOP dan asisten pintar klinik Anda. Kelola basis pengetahuan dan bantu karyawan bekerja lebih efektif hari ini.
                        </p>
                    </div>

                    <Link
                        to="/dashboard/knowledge"
                        className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-[#061E29] hover:bg-[#0a2d3d] text-white rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95"
                    >
                        Setup Knowledge Base <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-3 border-l-4 border-[#061E29] pl-4 py-1">
                <h3 className="text-xl font-bold text-[#061E29]">Ringkasan Operasional</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group relative bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <MessageSquare size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <MessageSquare size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#061E29] mb-1">Coming Soon</h3>
                        <p className="text-sm text-neutral-500 font-medium">Log Interaksi Karyawan</p>
                    </div>
                </div>

                <div className="group relative bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <ShoppingBag size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase">
                                Aktif
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#061E29] mb-1">
                            {loading ? '...' : docCount}
                        </h3>
                        <p className="text-sm text-neutral-500 font-medium">File & Link SOP Terdaftar</p>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="group relative bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <Zap size={80} className="text-[#061E29]" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <Zap size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#061E29] mb-1">
                            {loading ? '...' : (productCount + faqCount)}
                        </h3>
                        <p className="text-sm text-neutral-500 font-medium">Total Item Pengetahuan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
