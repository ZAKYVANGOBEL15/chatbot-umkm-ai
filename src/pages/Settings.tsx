import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AlertCircle, Clock, Zap, MessageSquare, ShieldCheck, Info, Save, Code, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface UserProfile {
    subscriptionStatus: 'trial' | 'active' | 'expired';
    trialExpiresAt?: string;
    subscriptionExpiresAt?: string;
    subscriptionPlan?: string;
    whatsappPhoneNumberId?: string;
    whatsappBusinessAccountId?: string;
    whatsappAccessToken?: string;
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
    const [isExpired, setIsExpired] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form Stats
    const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
    const [waBusinessAccountId, setWaBusinessAccountId] = useState('');
    const [waAccessToken, setWaAccessToken] = useState('');
    const [copied, setCopied] = useState(false);

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
                    setWaPhoneNumberId(data.whatsappPhoneNumberId || '');
                    setWaBusinessAccountId(data.whatsappBusinessAccountId || '');
                    setWaAccessToken(data.whatsappAccessToken || '');

                    if (data.trialExpiresAt) {
                        const expiry = new Date(data.trialExpiresAt);
                        const now = new Date();
                        const diff = expiry.getTime() - now.getTime();
                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        setDaysLeft(days > 0 ? days : 0);
                    }

                    // Check Expiration
                    const status = data.subscriptionStatus || 'trial';
                    const now = new Date();
                    let expired = false;

                    if (status === 'active' && data.subscriptionExpiresAt) {
                        const expiry = new Date(data.subscriptionExpiresAt);
                        if (now > expiry) expired = true;
                    } else if (status === 'trial' && data.trialExpiresAt) {
                        const expiry = new Date(data.trialExpiresAt);
                        if (now > expiry) expired = true;
                    }

                    setIsExpired(expired);
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSaveWhatsApp = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, {
                whatsappPhoneNumberId: waPhoneNumberId,
                whatsappBusinessAccountId: waBusinessAccountId,
                whatsappAccessToken: waAccessToken
            });
            setMessage({ type: 'success', text: 'Konfigurasi WhatsApp berhasil disimpan!' });
        } catch (error) {
            console.error("Error saving WA settings:", error);
            setMessage({ type: 'error', text: 'Gagal menyimpan konfigurasi. Silakan coba lagi.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto relative space-y-8">
            <h1 className="text-3xl font-bold text-[#061E29] tracking-tight mb-2">Pengaturan & Integrasi</h1>
            <p className="text-neutral-500 mb-8">Kelola akun dan hubungkan chatbot Anda ke layanan pihak ketiga.</p>

            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "p-3 rounded-xl",
                            profile?.subscriptionStatus === 'active' ? "bg-[#061E29] text-white" : "bg-neutral-100 text-neutral-600"
                        )}>
                            {profile?.subscriptionStatus === 'active' ? (
                                <Zap className="w-6 h-6" />
                            ) : (
                                <Clock className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Status Layanan</p>
                            <h3 className="text-lg font-bold text-[#061E29] mt-0.5">
                                {profile?.subscriptionStatus === 'active' ? 'Paket Premium Aktif' : `Mode Percobaan (${daysLeft} hari lagi)`}
                            </h3>
                        </div>
                    </div>
                </div>

                {profile?.subscriptionStatus !== 'active' && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-neutral-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-[#061E29] font-bold">Masa Percobaan Terbatas</p>
                            <p className="text-xs text-neutral-500 mt-1">Chatbot Anda akan berhenti merespon setelah masa berlaku habis. Hubungi admin untuk aktivasi permanen.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp Integration Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#061E29]">Integrasi WhatsApp (Meta API)</h3>
                                <p className="text-xs text-neutral-500">Hubungkan chatbot ke nomor WhatsApp bisnis Anda.</p>
                            </div>
                        </div>
                        {isExpired && (
                            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                                <AlertCircle size={14} /> Terkunci
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6 relative">
                    {isExpired && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                            <Clock size={32} className="text-red-500 mb-2" />
                            <h3 className="text-[#061E29] font-bold text-sm">Fitur Terkunci</h3>
                            <p className="text-xs text-neutral-500 mb-4 max-w-xs">
                                Masa aktif Anda telah berakhir. Perpanjang layanan untuk mengubah konfigurasi.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Phone Number ID</label>
                            <input
                                type="text"
                                value={waPhoneNumberId}
                                onChange={(e) => setWaPhoneNumberId(e.target.value)}
                                placeholder="Contoh: 1098234..."
                                disabled={isExpired}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-[#061E29] outline-none transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Business Account ID</label>
                            <input
                                type="text"
                                value={waBusinessAccountId}
                                onChange={(e) => setWaBusinessAccountId(e.target.value)}
                                placeholder="Contoh: 9876543..."
                                disabled={isExpired}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-[#061E29] outline-none transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Permanent Access Token</label>
                        <textarea
                            value={waAccessToken}
                            onChange={(e) => setWaAccessToken(e.target.value)}
                            placeholder="EAAG2..."
                            rows={3}
                            disabled={isExpired}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-[#061E29] outline-none transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="text-xs text-blue-700 leading-relaxed font-medium">
                            <p className="font-bold mb-1">Cara mendapatkan kredensial ini:</p>
                            <ol className="list-decimal ml-4 space-y-1">
                                <li>Buka <a href="https://developers.facebook.com" target="_blank" className="underline">Meta for Developers</a> dan pilih App Anda.</li>
                                <li>Pilih menu <b>WhatsApp</b> &gt; <b>API Setup</b> untuk ID.</li>
                                <li>Buat <b>Permanent Token</b> via menu <b>System Users</b> di Business Suite.</li>
                                <li>Gunakan Webhook URL berikut di Dashboard Meta: <code className="bg-blue-100 px-1 rounded break-all">https://chatbot.nusavite.com/api/webhook</code></li>
                            </ol>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        {message && (
                            <p className={clsx(
                                "text-sm font-bold flex items-center gap-2",
                                message.type === 'success' ? "text-emerald-600" : "text-red-500"
                            )}>
                                {message.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </p>
                        )}
                        <button
                            onClick={handleSaveWhatsApp}
                            disabled={saving || isExpired}
                            className="w-full sm:w-auto px-8 py-3 bg-[#061E29] text-white rounded-xl font-bold text-sm hover:bg-[#0a2d3d] transition-all flex items-center justify-center gap-2 disabled:bg-neutral-400 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                        </button>
                    </div>
                </div>
            </div>


            {/* Widget Integration Section */}
            <div className="p-8 lg:p-12 bg-[#061E29] text-white rounded-3xl border border-neutral-800 shadow-2xl relative overflow-hidden">
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
  data-userid="${user?.uid || 'YOUR_USER_ID'}"
  async>
</script>`}
                        </pre>
                        <button
                            onClick={() => {
                                const code = `<script \n  src="${window.location.origin}/widget.js" \n  data-userid="${user?.uid}"\n  async>\n</script>`;
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

            {/* Contact Support Section */}
            <div className="bg-[#061E29] text-white rounded-2xl p-8 text-center shadow-xl shadow-neutral-200">
                <h3 className="text-xl font-bold mb-2">Butuh Bantuan Teknis?</h3>
                <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                    Jika Anda kesulitan melakukan integrasi Meta API, tim ahli kami siap membantu melakukan setup dari awal sampai aktif.
                </p>

                <a
                    href="https://wa.me/62895402945495"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#061E29] font-bold rounded-xl hover:bg-neutral-100 transition-colors"
                >
                    <Zap className="w-5 h-5" /> Hubungi Admin via WhatsApp
                </a>
            </div>
        </div>
    );
}
