import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShoppingBag, Clock, ArrowRight, Code, Copy, Check } from 'lucide-react';
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
    const [expiryDateString, setExpiryDateString] = useState('');
    const [isWhatsAppConfigured, setIsWhatsAppConfigured] = useState(false);
    const [userId, setUserId] = useState('');
    const [copied, setCopied] = useState(false);

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
                        const status = data.subscriptionStatus || 'trial';
                        setSubscriptionStatus(status);

                        if (status === 'active' && data.subscriptionExpiresAt) {
                            // Format: 28 Januari 2026
                            const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                            setExpiryDateString(new Date(data.subscriptionExpiresAt).toLocaleDateString('id-ID', options));
                        } else if (status === 'trial' && data.trialExpiresAt) {
                            const expiry = new Date(data.trialExpiresAt);
                            const now = new Date();
                            const diff = expiry.getTime() - now.getTime();
                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                            setDaysLeft(days > 0 ? days : 0);
                        }
                        setIsWhatsAppConfigured(!!(data.whatsappPhoneNumberId && data.whatsappAccessToken));
                        setUserId(user.uid);
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
            {/* Subscription Status Banner */}
            {subscriptionStatus === 'active' ? (
                <div className="bg-black text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-neutral-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 border border-white/20 rounded-lg">
                            <Clock size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Paket Premium Aktif</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Layanan aktif hingga: <span className="text-white font-bold">{expiryDateString || 'Selamanya'}</span>.</p>
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
                            <p className="text-sm font-bold text-black">Mode Demo / Trial</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Sisa waktu demo: <span className="text-black font-bold">{daysLeft} hari</span>.</p>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20upgrade%20ke%20Paket%20Premium"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Hubungi Admin
                    </a>
                </div>
            )}

            {/* WhatsApp Connection Status Section */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-sm transition-all ${isWhatsAppConfigured
                ? 'bg-emerald-50 border-emerald-100'
                : 'bg-amber-50 border-amber-100 animate-pulse'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isWhatsAppConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        <MessageSquare size={20} className="text-white" />
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${isWhatsAppConfigured ? 'text-emerald-900' : 'text-amber-900'}`}>
                            WhatsApp Status: {isWhatsAppConfigured ? 'Terhubung (Ready)' : 'Belum Dikonfigurasi'}
                        </p>
                        <p className={`text-xs ${isWhatsAppConfigured ? 'text-emerald-700' : 'text-amber-700'} mt-0.5`}>
                            {isWhatsAppConfigured
                                ? 'Chatbot siap melayani pelanggan Anda di WhatsApp.'
                                : 'Segera masukkan API Key Meta Anda di menu Pengaturan.'}
                        </p>
                    </div>
                </div>
                {!isWhatsAppConfigured && (
                    <Link
                        to="/dashboard/settings"
                        className="px-4 py-2 bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Setup Sekarang
                    </Link>
                )}
            </div>

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

            {/* Widget Integration Section */}
            <div className="p-8 lg:p-12 bg-neutral-900 text-white rounded-3xl border border-neutral-800 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Code size={20} className="text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold">Integrasi Website Lain</h3>
                    </div>

                    <p className="text-neutral-400 mb-8 max-w-2xl text-sm lg:text-base">
                        Gunakan kode di bawah ini untuk memasang chatbot AI ini di website Vercel kamu yang lain.
                        Pastikan kamu sudah mengisi data di Knowledge Base agar AI bisa menjawab dengan benar.
                    </p>

                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 relative group">
                        <pre className="text-xs lg:text-sm text-emerald-400 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                            {`<script 
  src="${window.location.origin}/widget.js" 
  data-userid="${userId || 'YOUR_USER_ID'}"
  async>
</script>`}
                        </pre>
                        <button
                            onClick={() => {
                                const code = `<script \n  src="${window.location.origin}/widget.js" \n  data-userid="${userId}"\n  async>\n</script>`;
                                navigator.clipboard.writeText(code);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 flex items-center gap-2 group"
                        >
                            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4 text-xs text-neutral-500 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Otomatis terhubung ke Knowledge Base
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Mendukung semua website Vercel/HTML
                        </div>
                    </div>
                </div>
                {/* Background Glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
            </div>
        </div>
    );
}
