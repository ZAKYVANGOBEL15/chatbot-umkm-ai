import { useState, useEffect } from 'react';
import { MessageSquare, Users, ShoppingBag } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const [productCount, setProductCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

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
                        setUserName(userDoc.data().name || '');
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
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Percakapan</p>
                            <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pelanggan Aktif</p>
                            <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Produk Terdaftar</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {loading ? '...' : productCount}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">
                        Selamat Datang{userName ? `, ${userName}` : ''}!
                    </h2>
                    <p className="text-blue-100 max-w-2xl mb-6 text-lg">
                        Mulai siapkan chatbot Anda dengan mengisi data produk dan informasi bisnis agar AI dapat menjawab pertanyaan pelanggan dengan akurat.
                    </p>
                    <Link
                        to="/dashboard/knowledge"
                        className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md"
                    >
                        Mulai Setup Knowledge Base
                    </Link>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
