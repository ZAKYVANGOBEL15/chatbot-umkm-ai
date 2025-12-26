import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShoppingBag, Clock } from 'lucide-react';
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
        // Use onAuthStateChanged to ensure we wait for the user session
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch product count
                    const productsSnap = await getDocs(collection(db, 'users', user.uid, 'products'));
                    setProductCount(productsSnap.size);

                    // Fetch user info for welcome message
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
        <div className="space-y-6 max-w-full overflow-hidden">
            {/* Trial Warning */}
            {subscriptionStatus === 'trial' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-800">Masa Percobaan Aktif</p>
                            <p className="text-xs text-amber-600 mt-0.5">Layanan Anda akan berakhir dalam <span className="font-bold underline">{daysLeft} hari</span>.</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard/settings"
                        className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors text-center"
                    >
                        Upgrade Sekarang
                    </Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="p-5 lg:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <MessageSquare size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs lg:text-sm text-gray-500 font-medium truncate">Total Percakapan</p>
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">0</h3>
                        </div>
                    </div>
                </div>
                <div className="p-5 lg:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
                            <Users size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs lg:text-sm text-gray-500 font-medium truncate">Pelanggan Aktif</p>
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">0</h3>
                        </div>
                    </div>
                </div>
                <div className="p-5 lg:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs lg:text-sm text-gray-500 font-medium truncate">Produk Terdaftar</p>
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                                {loading ? '...' : productCount}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="p-6 lg:p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                        Selamat Datang{userName ? `, ${userName}` : ''}!
                    </h2>
                    <p className="text-blue-100 max-w-2xl mb-6 text-base lg:text-lg opacity-90">
                        Mulai siapkan chatbot Anda dengan mengisi data produk dan informasi bisnis agar AI dapat menjawab pertanyaan pelanggan dengan akurat.
                    </p>
                    <Link
                        to="/dashboard/knowledge"
                        className="inline-flex items-center justify-center px-6 lg:px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md text-sm lg:text-base"
                    >
                        Mulai Setup Knowledge Base
                    </Link>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 lg:w-64 h-48 lg:h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 lg:w-80 h-64 lg:h-80 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
