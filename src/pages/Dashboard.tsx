import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShoppingBag, Clock, ArrowRight, Phone, User, ExternalLink, Trash2, Zap } from 'lucide-react';
import { FacebookConnectButton } from '../components/FacebookConnectButton';
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
                    <div className="flex gap-2">
                        <Link
                            to="/dashboard/settings"
                            className="px-4 py-2 bg-white text-amber-600 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider rounded-lg hover:bg-amber-50 transition-colors flex items-center"
                        >
                            Manual
                        </Link>
                        <FacebookConnectButton
                            onSuccess={(response) => {
                                console.log("WhatsApp Linked!", response);
                                alert("Success! WhatsApp Connected via Embedded Signup.");
                                setIsWhatsAppConfigured(true);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061E29] to-[#0f3443] text-white shadow-2xl p-8 lg:p-12 border border-[#1a3b4b]/50 group">
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-emerald-300 mb-4 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            System Operational
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white tracking-tight">
                            Halo, {userName || 'Partner'}!
                        </h2>
                        <p className="text-neutral-300 max-w-xl text-base lg:text-lg leading-relaxed font-light">
                            Bisnis Anda berjalan otomatis hari ini. Cek prospek terbaru di bawah atau latih AI Anda agar semakin cerdas.
                        </p>
                    </div>

                    <Link
                        to="/dashboard/knowledge"
                        className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#061E29] rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30 hover:-translate-y-1 active:scale-95"
                    >
                        Setup Knowledge Base <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Abstract Decoration */}
                <div className="absolute -right-20 -bottom-32 w-80 h-80 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-1000"></div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-3 border-l-4 border-[#061E29] pl-4 py-1">
                <h3 className="text-xl font-bold text-[#061E29]">Ringkasan Bisnis</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1 */}
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
                        <p className="text-sm text-neutral-500 font-medium">Total Interaksi Chat</p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="group relative bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <Users size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                +{customerCount} MINGGU INI
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#061E29] mb-1">
                            {loading ? '...' : customerCount}
                        </h3>
                        <p className="text-sm text-neutral-500 font-medium">Prospek / Leads Baru</p>
                    </div>
                </div>

                {/* Card 3 (Dark) */}
                <div className="group relative bg-[#061E29] p-6 rounded-2xl border border-neutral-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-white">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                        <ShoppingBag size={80} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white group-hover:text-[#061E29] transition-colors">
                                <ShoppingBag size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">
                            {loading ? '...' : productCount}
                        </h3>
                        <p className="text-sm text-neutral-400 font-medium">Produk Terlatih</p>
                    </div>
                </div>
            </div>

            {/* Customer List Section */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-100/50 overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-neutral-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#061E29]">Daftar Prospek Masuk</h3>
                            <p className="text-sm text-neutral-500 font-medium">Pelanggan yang memberikan kontak via Chatbot.</p>
                        </div>
                    </div>
                    <div className="bg-[#061E29] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-[#061E29]/20">
                        {customerCount} Total
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {customers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                                <Users size={32} />
                            </div>
                            <h4 className="text-neutral-900 font-bold mb-1">Belum ada data pelanggan</h4>
                            <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                                Coba simulasikan percakapan di menu Chat Simulator dan berikan Nama/No HP Anda.
                            </p>
                            <Link to="/dashboard/chat" className="inline-block mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                                Ke Simulator &rarr;
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                                    <th className="p-5 pl-8">Nama Pelanggan</th>
                                    <th className="p-5">Kontak WhatsApp</th>
                                    <th className="p-5">Waktu Masuk</th>
                                    <th className="p-5 text-center">Status</th>
                                    <th className="p-5 text-center pr-8">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-sm shadow-sm group-hover:from-[#061E29] group-hover:to-[#0f3443] group-hover:text-white transition-all">
                                                    {customer.name ? customer.name.charAt(0).toUpperCase() : <User size={16} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#061E29] text-sm">{customer.name || 'Tanpa Nama'}</div>
                                                    <div className="text-xs text-neutral-400 font-medium">{customer.source || 'Chatbot'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {customer.phone ? (
                                                <a
                                                    href={`https://wa.me/${customer.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl transition-all text-xs font-bold border border-emerald-100 group-hover:shadow-sm"
                                                >
                                                    <Phone size={14} />
                                                    <span className="font-mono">{customer.phone}</span>
                                                    <ExternalLink size={12} className="opacity-50" />
                                                </a>
                                            ) : (
                                                <span className="text-neutral-300 text-xs italic">Tidak ada nomor</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                                <span className="text-xs text-neutral-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {customer.createdAt ? new Date(customer.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${customer.status === 'new'
                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'new' ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400'}`}></span>
                                                {customer.status || 'New'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center pr-8">
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                                className="p-2.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                title="Hapus Data"
                                            >
                                                <Trash2 size={18} />
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
