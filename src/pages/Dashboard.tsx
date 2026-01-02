import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShoppingBag, Clock, ArrowRight, Phone, Calendar, User, ExternalLink, Trash2, Zap, Monitor } from 'lucide-react';
import { collection, getDocs, doc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const [productCount, setProductCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [subscriptionStatus, setSubscriptionStatus] = useState('trial');
    const [subscriptionPlan, setSubscriptionPlan] = useState('basic');
    const [daysLeft, setDaysLeft] = useState(0);
    const [expiryDateString, setExpiryDateString] = useState('');
    const [isWhatsAppConfigured, setIsWhatsAppConfigured] = useState(false);
    const [userId, setUserId] = useState('');
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [customers, setCustomers] = useState<any[]>([]); // Array to store customer data

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
            // 1. Products (Static)
            const productsSnap = await getDocs(collection(db, 'users', user.uid, 'products'));
            setProductCount(productsSnap.size);

            // 2. Customers (Realtime Listener)
            // 2. Customers (Realtime Listener)
            onSnapshot(collection(db, 'users', user.uid, 'customers'),
                (snapshot) => {
                    setCustomerCount(snapshot.size);
                    const loadedCustomers = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).sort((a: any, b: any) => {
                        // Sort by newest first (handling potential missing fields safely)
                        const dateA = new Date(a.createdAt || 0).getTime();
                        const dateB = new Date(b.createdAt || 0).getTime();
                        return dateB - dateA;
                    });
                    setCustomers(loadedCustomers);
                },
                (err) => {
                    console.error("Snapshot error:", err);
                    setFetchError(`Gagal memuat data pelanggan: ${err.message}`);
                }
            );

            // 3. User Profile
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserName(data.name || '');
                const status = data.subscriptionStatus || 'trial';
                setSubscriptionStatus(status);
                setSubscriptionPlan(data.subscriptionPlan || 'basic');

                if (status === 'active' && data.subscriptionExpiresAt) {
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
            }
        } catch (error: any) {
            console.error("Dashboard fetch error:", error);
            setFetchError(`Terjadi kesalahan: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCustomer = async (customerId: string, customerName: string) => {
        if (!userId) return;

        if (window.confirm(`Apakah Anda yakin ingin menghapus data "${customerName}"? Data yang dihapus tidak dapat dikembalikan.`)) {
            try {
                await deleteDoc(doc(db, 'users', userId, 'customers', customerId));
                // No need to manually update state, onSnapshot will handle it!
            } catch (error: any) {
                console.error("Error deleting customer:", error);
                alert("Gagal menghapus data: " + error.message);
            }
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

    return (
        <div className="space-y-8 max-w-full overflow-hidden">
            {/* Subscription Status Banner */}
            {subscriptionStatus === 'active' ? (
                <div className="bg-[#061E29] text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-neutral-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 border border-white/20 rounded-lg">
                            <Clock size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Paket Premium Aktif</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Layanan aktif hingga: <span className="text-white font-bold">{expiryDateString || '1 Bulan'}</span>.</p>
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
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#061E29]">
                        Halo, {userName || 'Partner'}!
                    </h2>
                    <p className="text-neutral-500 max-w-xl mb-8 text-base lg:text-lg leading-relaxed">
                        Latih asisten AI Anda sekarang. Semakin lengkap data produk, semakin cerdas jawaban chatbot Anda.
                    </p>
                    <Link
                        to="/dashboard/knowledge"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#061E29] text-white rounded-xl font-bold hover:bg-[#0a2d3d] transition-all shadow-md group-hover:translate-x-1"
                    >
                        Mulai Setup Knowledge Base <ArrowRight size={18} />
                    </Link>
                </div>
                {/* Minimalist Decoration */}
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-neutral-50 to-transparent hidden lg:block"></div>
            </div>

            {/* Stats Cards */}
            <h3 className="text-xl font-bold text-[#061E29] border-l-4 border-[#061E29] pl-4">Statistik Real-time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-[#061E29] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 rounded-xl">
                            <MessageSquare size={24} className="text-[#061E29]" />
                        </div>
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md">Total Chat</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#061E29] mb-1">Coming Soon</h3>
                    <p className="text-xs text-neutral-400">Menunggu integrasi</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-[#061E29] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 rounded-xl">
                            <Users size={24} className="text-[#061E29]" />
                        </div>
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md">Pelanggan</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#061E29] mb-1">
                        {loading ? '...' : customerCount}
                    </h3>
                    <p className="text-xs text-neutral-400">Prospek / Leads Baru</p>
                </div>

                <div className="p-6 bg-[#061E29] text-white rounded-2xl shadow-xl shadow-neutral-200 transform lg:-translate-y-4">
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

            {/* Customer List Section */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-[#061E29]">Daftar Prospek Pelanggan</h3>
                        <p className="text-sm text-neutral-500">Data lead yang berhasil didapatkan oleh AI.</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        {customerCount} Total
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {customers.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400">
                            <Users className="mx-auto mb-2 opacity-20" size={48} />
                            <p>Belum ada data pelanggan.</p>
                            <p className="text-xs">Coba test chat di simulator atau tunggu pelanggan asli.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                    <th className="p-4 border-b border-neutral-100">Nama Pelanggan</th>
                                    <th className="p-4 border-b border-neutral-100">Kontak WhatsApp</th>
                                    <th className="p-4 border-b border-neutral-100">Waktu</th>
                                    <th className="p-4 border-b border-neutral-100 text-center">Status</th>
                                    <th className="p-4 border-b border-neutral-100 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-xs group-hover:bg-[#061E29] group-hover:text-white transition-colors">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-semibold text-neutral-800">{customer.name || 'Tanpa Nama'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {customer.phone ? (
                                                <a
                                                    href={`https://wa.me/${customer.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-bold"
                                                >
                                                    <Phone size={12} />
                                                    {customer.phone}
                                                    <ExternalLink size={10} className="opacity-50" />
                                                </a>
                                            ) : (
                                                <span className="text-neutral-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-neutral-500 text-sm">
                                                <Calendar size={14} />
                                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                }) : '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                                {customer.status || 'New'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Hapus Data"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>


        </div>
    );
}
