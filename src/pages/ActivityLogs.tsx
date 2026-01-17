import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Clock, MessageSquare, User, Calendar, Trash2 } from 'lucide-react';

interface ActivityLog {
    id: string;
    userEmail: string;
    userName: string;
    action: string;
    detail: string;
    timestamp: any;
}

export default function ActivityLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) return;
        fetchLogs();
    }, [currentUser]);

    const fetchLogs = async () => {
        if (!currentUser) return;
        try {
            const q = query(collection(db, 'users', currentUser.uid, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            const data: ActivityLog[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as ActivityLog);
            });
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (!currentUser || !window.confirm('Hapus log ini?')) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'activity_logs', logId));
            setLogs(logs.filter(l => l.id !== logId));
        } catch (error) {
            console.error("Error deleting log:", error);
            alert("Gagal menghapus log.");
        }
    };

    const handleClearAllLogs = async () => {
        if (!currentUser || logs.length === 0 || !window.confirm('Hapus SEMUA log aktivitas? Tindakan ini tidak bisa dibatalkan.')) return;

        setIsDeleting(true);
        try {
            const batch = writeBatch(db);
            logs.forEach((log) => {
                const docRef = doc(db, 'users', currentUser.uid, 'activity_logs', log.id);
                batch.delete(docRef);
            });
            await batch.commit();
            setLogs([]);
            alert("Semua log berhasil dibersihkan.");
        } catch (error) {
            console.error("Error clearing logs:", error);
            alert("Gagal membersihkan log.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#061E29]">Log Aktivitas Sopia</h1>
                    <p className="text-neutral-500 text-sm">Pantau interaksi dan pertanyaan yang diajukan karyawan kepada AI.</p>
                </div>
                {logs.length > 0 && (
                    <button
                        onClick={handleClearAllLogs}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                        <Trash2 size={14} />
                        {isDeleting ? 'Membersihkan...' : 'Bersihkan Semua Log'}
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center p-12 text-neutral-400">Memuat aktivitas...</div>
                ) : logs.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-neutral-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#061E29] mb-2">Belum Ada Aktivitas</h3>
                        <p className="text-neutral-500 max-w-sm mx-auto">
                            Saat ini belum ada interaksi yang tercatat. Pastikan karyawan sudah mulai menggunakan aplikasi Sopia.
                        </p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="relative group bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-[#061E29]/5 text-[#061E29] rounded-xl flex-shrink-0">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-[#061E29] text-sm flex items-center gap-1">
                                            <User size={12} className="text-neutral-400" /> {log.userName}
                                        </span>
                                        <span className="text-xs text-neutral-400">• {log.userEmail}</span>
                                    </div>
                                    <p className="text-neutral-700 leading-relaxed text-sm">
                                        {log.detail}
                                    </p>
                                </div>
                            </div>
                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 text-xs text-neutral-400 border-t md:border-t-0 border-neutral-100 pt-3 md:pt-0 pl-0 md:pl-4 md:border-l min-w-[140px]">
                                <span className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-lg">
                                    <Calendar size={12} /> {log.timestamp?.toDate().toLocaleDateString('id-ID')}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <Clock size={12} /> {log.timestamp?.toDate().toLocaleTimeString('id-ID')}
                                </span>

                                <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="md:absolute md:top-2 md:right-2 p-2 text-neutral-300 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all"
                                    title="Hapus Log"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
