import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Store, Package, Globe, Loader2, Sparkles, Instagram, Facebook, Mail } from 'lucide-react';
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
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Product Form
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

    // AI Crawler State
    const [crawlUrl, setCrawlUrl] = useState('');
    const [isCrawling, setIsCrawling] = useState(false);

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
                setInstagram(data.instagram || '');
                setFacebook(data.facebook || '');
                setBusinessEmail(data.businessEmail || '');
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
                instagram,
                facebook,
                businessEmail,
                updatedAt: new Date().toISOString()
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

    const handleCrawl = async () => {
        if (!crawlUrl) return alert('Masukkan URL website dulu bro!');
        if (!auth.currentUser) return;

        setIsCrawling(true);
        try {
            const res = await fetch('/api/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: crawlUrl })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Update Business Profile
            setBusinessName(data.businessName || businessName);
            setBusinessDesc(data.businessDescription || businessDesc);
            setInstagram(data.instagram || instagram);
            setFacebook(data.facebook || facebook);
            setBusinessEmail(data.businessEmail || businessEmail);

            // Add Products to Firestore
            if (data.products && Array.isArray(data.products)) {
                for (const p of data.products) {
                    await addDoc(collection(db, 'users', auth.currentUser.uid, 'products'), {
                        name: p.name,
                        price: Number(p.price) || 0,
                        description: p.description || '',
                        createdAt: new Date().toISOString()
                    });
                }
            }

            alert('Mantap! AI berhasil mempelajari website kamu. Cek hasilnya di bawah.');
            setCrawlUrl('');
        } catch (error: any) {
            console.error('Crawl Error:', error);
            alert('Waduh, gagal narik data: ' + error.message);
        } finally {
            setIsCrawling(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 lg:space-y-8 max-w-full overflow-hidden pb-10 font-sans text-neutral-900">
            {/* AI Scraper Section */}
            <section className="bg-black text-white p-6 lg:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Setup Kilat dengan AI</h2>
                    </div>
                    <p className="text-neutral-400 mb-8 max-w-xl text-sm lg:text-base leading-relaxed">
                        Punya website? Tempel URL-nya di bawah, biar AI saya yang pelajari bisnis kamu secara otomatis dalam hitungan detik.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="url"
                                value={crawlUrl}
                                onChange={(e) => setCrawlUrl(e.target.value)}
                                placeholder="https://website-kamu.com"
                                className="w-full pl-12 pr-4 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                                disabled={isCrawling}
                            />
                        </div>
                        <button
                            onClick={handleCrawl}
                            disabled={isCrawling || !crawlUrl}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            {isCrawling ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Mempelajari...
                                </>
                            ) : (
                                'Mulai Pelajari Website'
                            )}
                        </button>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all duration-700"></div>
            </section>

            {/* Business Profile Section */}
            <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-black rounded-xl text-white">
                        <Store size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-black">Profil Bisnis</h2>
                        <p className="text-sm text-neutral-500">Informasi dasar untuk identitas chatbot Anda.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nama Bisnis</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-neutral-300 font-medium"
                            placeholder="Contoh: Toko Kue Bu Ani"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">System Prompt (Instruksi)</label>
                        <p className="text-xs text-neutral-400 mb-3">Jelaskan apa yang dijual, jam operasional, dan gaya bahasa bot.</p>
                        <textarea
                            value={businessDesc}
                            onChange={(e) => setBusinessDesc(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-neutral-300 font-medium"
                            placeholder="Kami menjual kue basah dan kering. Buka jam 08.00 - 17.00. Jawab dengan ramah dan sopan."
                        />
                    </div>
                </div>

                {/* Social Media & Contact Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Instagram size={14} className="text-pink-500" />
                            Instagram
                        </label>
                        <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@username"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium bg-neutral-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Facebook size={14} className="text-blue-600" />
                            Facebook
                        </label>
                        <input
                            type="text"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="Nama Halaman/Link"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium bg-neutral-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={14} className="text-emerald-500" />
                            Email Bisnis
                        </label>
                        <input
                            type="email"
                            value={businessEmail}
                            onChange={(e) => setBusinessEmail(e.target.value)}
                            placeholder="kontak@bisnis.com"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium bg-neutral-50"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSaveProfile}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-neutral-800 font-bold transition-all shadow-lg hover:translate-y-px"
                    >
                        <Save size={18} />
                        Simpan Profil
                    </button>
                </div>
            </section>

            {/* Products Section */}
            <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neutral-100 rounded-xl text-black">
                        <Package size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-black">Knowledge Produk</h2>
                        <p className="text-sm text-neutral-500">Ajarkan AI tentang produk atau layanan Anda.</p>
                    </div>
                </div>

                {/* Add Product Form */}
                <form onSubmit={handleAddProduct} className="bg-neutral-50 p-6 rounded-2xl mb-8 border border-neutral-200">
                    <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">Tambah Data Baru</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Nama Produk</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                placeholder="Misal: Brownies Cokelat"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-black outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Harga (Rp)</label>
                            <input
                                type="number"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                placeholder="0"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-black outline-none"
                                required
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Deskripsi Singkat</label>
                            <input
                                type="text"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Deskripsi rasa, ukuran, atau fitur..."
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-neutral-800 font-bold shadow-md transition-all">
                                <Plus size={18} /> Tambah
                            </button>
                        </div>
                    </div>
                </form>

                {/* Product List Table */}
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Info Produk</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Harga</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-black">{product.name}</div>
                                        <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{product.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-black font-semibold whitespace-nowrap">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Hapus Produk"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-neutral-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={32} className="text-neutral-200" />
                                            <span>Belum ada data produk sasaran.</span>
                                        </div>
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
