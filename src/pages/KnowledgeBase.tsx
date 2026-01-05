import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Store, Package, Loader2, Instagram, Facebook, Mail, Pencil, X, HelpCircle, MessageCircleQuestion, FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

interface DocumentData {
    id: string;
    name: string;
    url: string;
    createdAt: string;
}

export default function KnowledgeBase() {
    const [businessName, setBusinessName] = useState('');
    const [businessDesc, setBusinessDesc] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingDoc, setIsAddingDoc] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', url: '' });

    // Product Form
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // FAQ Form
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [isEditingFaq, setIsEditingFaq] = useState(false);
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

    const formatNumber = (val: string) => {
        if (!val) return '';
        const number = val.replace(/\D/g, '');
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

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
        const qProducts = query(collection(db, 'users', auth.currentUser!.uid, 'products'));
        const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
            const items: Product[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(items);
            if (!loading) setLoading(false);
        });

        // Listen to FAQs
        const qFaqs = query(collection(db, 'users', auth.currentUser!.uid, 'faqs'));
        const unsubscribeFaqs = onSnapshot(qFaqs, (snapshot) => {
            const items: FAQ[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as FAQ);
            });
            setFaqs(items);
        });

        // Listen to Documents
        const qDocs = query(collection(db, 'users', auth.currentUser!.uid, 'documents'), orderBy('createdAt', 'desc'));
        const unsubscribeDocs = onSnapshot(qDocs, (snapshot) => {
            const items: DocumentData[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as DocumentData);
            });
            setDocuments(items);
            setLoading(false);
        });

        return () => {
            unsubscribeProducts();
            unsubscribeFaqs();
            unsubscribeDocs();
        };
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

    // Product Handlers
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        try {
            if (isEditing && editingId) {
                await updateDoc(doc(db, 'users', auth.currentUser.uid, 'products', editingId), {
                    name: newProduct.name,
                    price: Number(newProduct.price.replace(/\D/g, '')),
                    description: newProduct.description,
                    updatedAt: new Date().toISOString()
                });
                setIsEditing(false);
                setEditingId(null);
            } else {
                await addDoc(collection(db, 'users', auth.currentUser.uid, 'products'), {
                    name: newProduct.name,
                    price: Number(newProduct.price.replace(/\D/g, '')),
                    description: newProduct.description,
                    createdAt: new Date().toISOString()
                });
            }
            setNewProduct({ name: '', price: '', description: '' });
        } catch (e) {
            alert(isEditing ? 'Gagal mengupdate produk.' : 'Gagal menambah produk.');
        }
    };

    const handleEditProduct = (product: Product) => {
        setNewProduct({
            name: product.name,
            price: formatNumber(String(product.price)),
            description: product.description || ''
        });
        setIsEditing(true);
        setEditingId(product.id);
        const form = document.getElementById('product-form');
        form?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditProduct = () => {
        setIsEditing(false);
        setEditingId(null);
        setNewProduct({ name: '', price: '', description: '' });
    };

    const handleDeleteProduct = async (id: string) => {
        if (!auth.currentUser) return;
        if (confirm('Yakin ingin menghapus produk ini?')) {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'products', id));
        }
    };

    // FAQ Handlers
    const handleAddFaq = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        try {
            if (isEditingFaq && editingFaqId) {
                await updateDoc(doc(db, 'users', auth.currentUser.uid, 'faqs', editingFaqId), {
                    question: newFaq.question,
                    answer: newFaq.answer,
                    updatedAt: new Date().toISOString()
                });
                setIsEditingFaq(false);
                setEditingFaqId(null);
            } else {
                await addDoc(collection(db, 'users', auth.currentUser.uid, 'faqs'), {
                    question: newFaq.question,
                    answer: newFaq.answer,
                    createdAt: new Date().toISOString()
                });
            }
            setNewFaq({ question: '', answer: '' });
        } catch (e) {
            alert(isEditingFaq ? 'Gagal update FAQ.' : 'Gagal tambah FAQ.');
        }
    };

    const handleEditFaq = (faq: FAQ) => {
        setNewFaq({
            question: faq.question,
            answer: faq.answer
        });
        setIsEditingFaq(true);
        setEditingFaqId(faq.id);
        const form = document.getElementById('faq-form');
        form?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditFaq = () => {
        setIsEditingFaq(false);
        setEditingFaqId(null);
        setNewFaq({ question: '', answer: '' });
    };

    const handleDeleteFaq = async (id: string) => {
        if (!auth.currentUser) return;
        if (confirm('Yakin hapus pertanyaan ini?')) {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'faqs', id));
        }
    };

    const handleAddDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDoc.name.trim() || !newDoc.url.trim() || !auth.currentUser) return;

        setIsAddingDoc(true);
        try {
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'documents'), {
                name: newDoc.name.trim(),
                url: newDoc.url.trim(),
                createdAt: new Date().toISOString()
            });

            setNewDoc({ name: '', url: '' });
            alert('Mantap! Link dokumen berhasil ditambahkan.');
        } catch (error: any) {
            console.error('Add Link Error:', error);
            alert('Waduh, gagal simpan link: ' + error.message);
        } finally {
            setIsAddingDoc(false);
        }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!auth.currentUser) return;
        if (!confirm('Hapus link dokumen ini?')) return;

        try {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'documents', docId));
        } catch (error: any) {
            console.error('Delete Doc Error:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 lg:space-y-8 max-w-full overflow-hidden pb-10 font-sans text-neutral-900">

            {/* Business Profile Section */}
            <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#061E29] rounded-xl text-white">
                        <Store size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-[#061E29]">Profil & Prosedur Klinik</h2>
                        <p className="text-sm text-neutral-500">Informasi dasar untuk panduan asisten internal Anda.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nama Bisnis</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] outline-none transition-all placeholder:text-neutral-300 font-medium"
                            placeholder="Contoh: Toko Kue Bu Ani"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Profil & Deskripsi Klinik (Alamat, Jam Buka, Alur Umum)</label>
                        <p className="text-xs text-neutral-400 mb-3">Informasikan alamat cabang, jam operasional, dan alur kerja umum di sini untuk dipelajari AI.</p>
                        <textarea
                            value={businessDesc}
                            onChange={(e) => setBusinessDesc(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] outline-none transition-all placeholder:text-neutral-300 font-medium"
                            placeholder="Alamat: Jl. Kesehatan Raya No. 123. Jam Buka: Senin-Jumat 08.00-17.00. Prosedur Utama: Pasien datang langsung ambil nomor antrean di meja depan..."
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
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#061E29] outline-none transition-all text-sm font-medium bg-neutral-50"
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
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#061E29] outline-none transition-all text-sm font-medium bg-neutral-50"
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
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#061E29] outline-none transition-all text-sm font-medium bg-neutral-50"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSaveProfile}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#061E29] text-white rounded-xl hover:bg-[#0a2d3d] font-bold transition-all shadow-lg hover:translate-y-px"
                    >
                        <Save size={18} />
                        Simpan Profil
                    </button>
                </div>
            </section>

            {/* Document / Link SOP Section */}
            <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <LinkIcon size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-[#061E29]">Link Dokumen & SOP</h2>
                        <p className="text-sm text-neutral-500">Masukkan link G-Drive, PDF, atau dokumen SOP untuk dipelajari asisten AI.</p>
                    </div>
                </div>

                <form onSubmit={handleAddDoc} className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Nama Dokumen</label>
                            <input
                                type="text"
                                value={newDoc.name}
                                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                                placeholder="Contoh: Daftar Harga 2024"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Link/URL Dokumen (G-Drive, dll)</label>
                            <input
                                type="url"
                                value={newDoc.url}
                                onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                                placeholder="https://drive.google.com/..."
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={isAddingDoc}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#061E29] text-white rounded-xl hover:bg-[#0a2d3d] font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isAddingDoc ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Simpan Link
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-4 flex items-center gap-2">
                        <HelpCircle size={12} />
                        Tips: Gunakan link Google Drive atau Dropbox yang sudah di-share (untuk email karyawan atau publicly).
                    </p>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.length === 0 ? (
                        <div className="col-span-full p-10 text-center bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed">
                            <LinkIcon size={40} className="text-neutral-300 mx-auto mb-4" />
                            <p className="text-sm text-neutral-500 font-medium">Belum ada link dokumen. Tambahkan agar AI bisa memberikannya ke staf.</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="bg-white border border-neutral-100 p-4 rounded-2xl hover:border-purple-100 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#061E29] text-sm truncate uppercase tracking-tight" title={doc.name}>{doc.name}</h4>
                                        <p className="text-[10px] text-neutral-400 mt-1 uppercase font-bold tracking-widest">
                                            Ditambahkan {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-50">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                        title="Buka Link"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                    <button
                                        onClick={() => handleDeleteDoc(doc.id)}
                                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Hapus"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Support / FAQ Section - Moved up as it is high priority */}
            <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <MessageCircleQuestion size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-[#061E29]">FAQ Operasional</h2>
                        <p className="text-sm text-neutral-500">Pertanyaan umum yang sering ditanyakan staf/karyawan.</p>
                    </div>
                </div>

                {/* Add FAQ Form */}
                <form id="faq-form" onSubmit={handleAddFaq} className={`p-6 rounded-2xl mb-8 border transition-all ${isEditingFaq ? 'bg-blue-50 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#061E29] uppercase tracking-wider">
                            {isEditingFaq ? 'Edit Pertanyaan (FAQ)' : 'Tambah FAQ Baru'}
                        </h3>
                        {isEditingFaq && (
                            <button
                                type="button"
                                onClick={cancelEditFaq}
                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
                            >
                                <X size={14} /> Batal Edit
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Pertanyaan (Karyawan/User)</label>
                            <input
                                type="text"
                                value={newFaq.question}
                                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                placeholder="Contoh: Bagaimana prosedur pendaftaran pasien baru?"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Jawaban (Bot/SOP)</label>
                            <textarea
                                value={newFaq.answer}
                                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                placeholder="Contoh: Pasien baru wajib menunjukkan KTP dan mengisi formulir pendaftaran di meja resepsionis."
                                rows={3}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold shadow-md transition-all ${isEditingFaq ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#061E29] hover:bg-[#0a2d3d]'}`}>
                                {isEditingFaq ? <Save size={18} /> : <Plus size={18} />}
                                {isEditingFaq ? 'Update FAQ' : 'Tambah FAQ'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed">
                            <div className="w-12 h-12 bg-neutral-200 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <HelpCircle size={24} />
                            </div>
                            <p className="text-sm text-neutral-500 font-medium">Belum ada FAQ. Tambahkan pertanyaan staf agar AI membantu operasional harian.</p>
                        </div>
                    ) : (
                        faqs.map((faq) => (
                            <div key={faq.id} className="group p-5 bg-white border border-neutral-100 rounded-2xl hover:border-blue-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2 w-full">
                                        <div className="flex items-start gap-3">
                                            <span className="flex-shrink-0 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded mb-auto mt-0.5">Q</span>
                                            <h4 className="font-bold text-[#061E29]">{faq.question}</h4>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="flex-shrink-0 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded mb-auto mt-0.5">A</span>
                                            <p className="text-sm text-neutral-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditFaq(faq)}
                                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFaq(faq.id)}
                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Products Section */}
            <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neutral-100 rounded-xl text-[#061E29]">
                        <Package size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-[#061E29]">Layanan & Daftar Harga</h2>
                        <p className="text-sm text-neutral-500">Berikan daftar harga layanan agar asisten bisa menjawab pertanyaan karyawan.</p>
                    </div>
                </div>

                {/* Add Product Form */}
                <form id="product-form" onSubmit={handleAddProduct} className={`p-6 rounded-2xl mb-8 border transition-all ${isEditing ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#061E29] uppercase tracking-wider">
                            {isEditing ? 'Edit Data Produk' : 'Tambah Data Baru'}
                        </h3>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={cancelEditProduct}
                                className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                            >
                                <X size={14} /> Batal Edit
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Nama Layanan</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                placeholder="Misal: Pemeriksaan Umum"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-[#061E29] outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Harga (Rp)</label>
                            <input
                                type="text"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: formatNumber(e.target.value) })}
                                placeholder="0"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-[#061E29] outline-none"
                                required
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Deskripsi Singkat</label>
                            <input
                                type="text"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Deskripsi layanan, durasi, atau keunggulan..."
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-[#061E29] outline-none"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-bold shadow-md transition-all ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#061E29] hover:bg-[#0a2d3d]'}`}>
                                {isEditing ? <Save size={18} /> : <Plus size={18} />}
                                {isEditing ? 'Simpan' : 'Tambah'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Product List Table */}
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Info Layanan</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Harga</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-[#061E29]">{product.name}</div>
                                        <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{product.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#061E29] font-semibold whitespace-nowrap">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                title="Edit Produk"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Hapus Produk"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
