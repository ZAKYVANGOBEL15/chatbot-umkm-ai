import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Trash2, Plus, UserCheck, Shield } from 'lucide-react';

interface WhitelistedUser {
    id: string;
    email: string;
    name: string;
    role: 'karyawan' | 'admin';
    addedAt: any;
}

export default function WhitelistManager() {
    const [whitelist, setWhitelist] = useState<WhitelistedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) return;
        fetchWhitelist();
    }, [currentUser]);

    const fetchWhitelist = async () => {
        if (!currentUser) return;
        try {
            const q = query(collection(db, 'users', currentUser.uid, 'whitelist'), orderBy('addedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data: WhitelistedUser[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as WhitelistedUser);
            });
            setWhitelist(data);
        } catch (error) {
            console.error("Error fetching whitelist:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newName || !currentUser) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'whitelist'), {
                email: newEmail.trim().toLowerCase(),
                name: newName.trim(),
                role: 'karyawan',
                addedAt: new Date()
            });
            setNewEmail('');
            setNewName('');
            fetchWhitelist();
        } catch (error) {
            console.error("Error adding to whitelist:", error);
            alert("Gagal menambahkan user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser || !window.confirm('Hapus user ini dari akses?')) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'whitelist', id));
            fetchWhitelist();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#061E29]">Whitelist Karyawan</h1>
                    <p className="text-neutral-500">Kelola daftar email karyawan yang diizinkan mengakses "Sopia" via Aplikasi Mobile.</p>
                </div>
            </div>

            {/* Add New User Form */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h2 className="font-bold text-[#061E29] mb-4 flex items-center gap-2">
                    <UserCheck size={20} /> Tambah Akses Karyawan
                </h2>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase tracking-wider">Nama Karyawan</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#061E29] transition-all"
                            required
                        />
                    </div>
                    <div className="w-full md:flex-1">
                        <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase tracking-wider">Email Google</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="budi@gmail.com"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#061E29] transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-6 py-3 bg-[#061E29] text-white font-bold rounded-xl hover:bg-[#0a2d3d] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Plus size={20} />
                        {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#061E29] text-white">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider">Nama</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-neutral-500">Memuat data...</td></tr>
                            ) : whitelist.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-neutral-500">Belum ada karyawan yang didaftarkan.</td></tr>
                            ) : (
                                whitelist.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="p-4 font-medium text-[#061E29]">{user.name}</td>
                                        <td className="p-4 text-neutral-600">{user.email}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                                <Shield size={12} /> {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus Akses"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
