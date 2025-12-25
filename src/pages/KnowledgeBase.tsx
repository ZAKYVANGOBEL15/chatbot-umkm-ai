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
                businessDescription: businessDesc
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
        <div className="space-y-8">
            {/* Business Profile Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Store size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Profil Bisnis</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Toko Kue Bu Ani"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Peraturan Toko (System Prompt)</label>
                        <p className="text-xs text-gray-500 mb-2">Jelaskan apa yang dijual, jam operasional, dan gaya bahasa bot.</p>
                        <textarea
                            value={businessDesc}
                            onChange={(e) => setBusinessDesc(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Kami menjual kue basah dan kering. Buka jam 08.00 - 17.00. Jawab dengan ramah dan sopan."
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Save size={18} />
                        Simpan Profil
                    </button>
                </div>
            </section>

            {/* Products Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Package size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Daftar Produk</h2>
                    </div>
                </div>

                {/* Add Product Form */}
                <form onSubmit={handleAddProduct} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Tambah Produk Baru</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                placeholder="Nama Produk"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                placeholder="Harga (Rp)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div className="md:col-span-3">
                            <input
                                type="text"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Deskripsi singkat produk"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <Plus size={18} /> Tambah
                            </button>
                        </div>
                    </div>
                </form>

                {/* Product List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-600 text-sm">
                                <th className="py-3 px-2">Nama Produk</th>
                                <th className="py-3 px-2">Harga</th>
                                <th className="py-3 px-2">Deskripsi</th>
                                <th className="py-3 px-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-2 font-medium">{product.name}</td>
                                    <td className="py-3 px-2">Rp {product.price.toLocaleString('id-ID')}</td>
                                    <td className="py-3 px-2 text-gray-500 text-sm">{product.description}</td>
                                    <td className="py-3 px-2 text-right">
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">
                                        Belum ada produk. Tambahkan produk pertama Anda!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
