import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Store, Package } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, deleteDoc, query } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
}

export default function KnowledgeBase() {
    const [businessName, setBusinessName] = useState('');
    const [businessDesc, setBusinessDesc] = useState('');
    const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
    const [waAccessToken, setWaAccessToken] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Product Form
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

    useEffect(() => {
        if (!auth.currentUser) return;

        // Load Business Profile
        const loadProfile = async () => {
            const docRef = doc(db, 'users', auth.currentUser!.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBusinessName(data.businessName || '');
                setBusinessDesc(data.businessDescription || '');
                setWaPhoneNumberId(data.whatsappPhoneNumberId || '');
                setWaAccessToken(data.whatsappAccessToken || '');
            }
        };
        loadProfile();

        // Listen to Products
        const q = query(collection(db, 'users', auth.currentUser!.uid, 'products'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Product[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSaveProfile = async () => {
        if (!auth.currentUser) return;
        try {
            const docRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(docRef, {
                businessName,
                businessDescription: businessDesc,
                whatsappPhoneNumberId: waPhoneNumberId,
                whatsappAccessToken: waAccessToken
            });
            alert('Profil bisnis berhasil disimpan!');
        } catch (e) {
            alert('Gagal menyimpan profil.');
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        try {
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'products'), {
                name: newProduct.name,
                price: Number(newProduct.price),
                description: newProduct.description,
                createdAt: new Date().toISOString()
            });
            setNewProduct({ name: '', price: '', description: '' });
        } catch (e) {
            alert('Gagal menambah produk.');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!auth.currentUser) return;
        if (confirm('Yakin ingin menghapus produk ini?')) {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'products', id));
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 lg:space-y-8 max-w-full overflow-hidden pb-10">
            {/* Business Profile Section */}
            <section className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Store size={22} />
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-gray-800">Profil Bisnis</h2>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Bisnis</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Contoh: Toko Kue Bu Ani"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi & Peraturan Toko (System Prompt)</label>
                        <p className="text-xs text-gray-500 mb-2">Jelaskan apa yang dijual, jam operasional, dan gaya bahasa bot.</p>
                        <textarea
                            value={businessDesc}
                            onChange={(e) => setBusinessDesc(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Kami menjual kue basah dan kering. Buka jam 08.00 - 17.00. Jawab dengan ramah dan sopan."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold text-emerald-600">Integrasi WhatsApp (Opsional)</label>
                        <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Dapatkan dari Meta Developers Portal</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-lg border border-emerald-100">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Phone Number ID</label>
                                <input
                                    type="text"
                                    value={waPhoneNumberId}
                                    onChange={(e) => setWaPhoneNumberId(e.target.value)}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-sm"
                                    placeholder="Misal: 456789123450"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Permanent Access Token</label>
                                <input
                                    type="password"
                                    value={waAccessToken}
                                    onChange={(e) => setWaAccessToken(e.target.value)}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-sm"
                                    placeholder="EAAB..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveProfile}
                        className="w-full sm:w-auto mt-2 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        <Save size={18} />
                        Simpan Profil
                    </button>
                </div>
            </section>

            {/* Products Section */}
            <section className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Package size={22} />
                        </div>
                        <h2 className="text-lg lg:text-xl font-bold text-gray-800">Daftar Produk</h2>
                    </div>
                </div>

                {/* Add Product Form */}
                <form onSubmit={handleAddProduct} className="bg-gray-50 p-4 lg:p-5 rounded-lg mb-8 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Tambah Produk Baru</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nama Produk</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                placeholder="Misal: Brownies Cokelat"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Harga (Rp)</label>
                            <input
                                type="number"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white"
                                required
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Deskripsi Singkat</label>
                            <input
                                type="text"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Zaky Project - Lezat & Manis"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm transition-all">
                                <Plus size={18} /> Tambah
                            </button>
                        </div>
                    </div>
                </form>

                {/* Product List Table */}
                <div className="overflow-x-auto -mx-5 lg:mx-0">
                    <div className="inline-block min-w-full align-middle p-1">
                        <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Info Produk</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Harga</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{product.description || '-'}</div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                                                Rp {product.price.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                Belum ada produk. Tambahkan produk pertama Anda!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
