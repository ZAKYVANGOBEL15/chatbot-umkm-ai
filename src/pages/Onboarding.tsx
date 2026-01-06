import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type BusinessType = 'retail' | 'medical';

export default function Onboarding() {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState<BusinessType>('retail');
    const [adminPin, setAdminPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !businessName.trim() || !adminPin.trim()) return;

        if (adminPin.length < 4) {
            alert("PIN Admin minimal 4 digit.");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                businessName: businessName.trim(),
                businessType,
                adminPin: adminPin.trim(),
                onboardingCompleted: true,
                updatedAt: new Date().toISOString()
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/NV.png" alt="Nusavite" className="h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-neutral-900">Ceritakan Bisnis Anda</h2>
                    <p className="mt-2 text-neutral-600">Bantu AI memahami bisnis Anda agar bekerja lebih maksimal</p>
                </div>

                {/* Form Card */}
                <div className="bg-white py-8 px-4 shadow-xl shadow-neutral-200/50 rounded-2xl sm:px-10 border border-neutral-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Business Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-3">
                                Kategori Bisnis <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 gap-4">
                                <div
                                    onClick={() => setBusinessType('retail')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all hover:scale-[1.02] ${businessType === 'retail'
                                        ? 'border-[#2D3C59] bg-[#2D3C59]/5 shadow-lg'
                                        : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full ${businessType === 'retail' ? 'bg-[#2D3C59] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg ${businessType === 'retail' ? 'text-[#2D3C59]' : 'text-neutral-700'}`}>Retail / UMKM</h3>
                                        <p className="text-xs text-neutral-500 mt-1">Kantor, Toko Online, F&B, Jasa Umum</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${businessType === 'retail' ? 'border-[#2D3C59]' : 'border-neutral-300'
                                        }`}>
                                        {businessType === 'retail' && (
                                            <div className="w-3.5 h-3.5 rounded-full bg-[#2D3C59]" />
                                        )}
                                    </div>
                                </div>

                                <div
                                    onClick={() => setBusinessType('medical')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all hover:scale-[1.02] ${businessType === 'medical'
                                        ? 'border-[#2D3C59] bg-[#2D3C59]/5 shadow-lg'
                                        : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full ${businessType === 'medical' ? 'bg-[#2D3C59] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg ${businessType === 'medical' ? 'text-[#2D3C59]' : 'text-neutral-700'}`}>Klinik / Kesehatan</h3>
                                        <p className="text-xs text-neutral-500 mt-1">Klinik, Rumah Sakit, Praktek Dokter</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${businessType === 'medical' ? 'border-[#2D3C59]' : 'border-neutral-300'
                                        }`}>
                                        {businessType === 'medical' && (
                                            <div className="w-3.5 h-3.5 rounded-full bg-[#2D3C59]" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Name */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-neutral-700">
                                Nama Bisnis <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="businessName"
                                type="text"
                                required
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder={businessType === 'retail' ? 'Contoh: Toko Sepatu Budi' : 'Contoh: Klinik Sehat Sentosa'}
                                className="mt-1 appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2D3C59] focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Admin PIN */}
                        <div>
                            <label htmlFor="adminPin" className="block text-sm font-medium text-neutral-700">
                                PIN Keamanan Admin <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="adminPin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                                value={adminPin}
                                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="4-6 Digit Angka"
                                className="mt-1 appearance-none block w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2D3C59] focus:border-transparent transition-all"
                            />
                            <p className="mt-2 text-[10px] text-neutral-500 italic">PIN ini digunakan untuk membatasi akses karyawan ke menu Admin.</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !businessName.trim() || !adminPin.trim()}
                            className="w-full py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#2D3C59] hover:bg-[#1a2537] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D3C59] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Menyimpan...' : '✓ Lanjutkan ke Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
