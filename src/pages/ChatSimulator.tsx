import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, Smartphone, Lock, ThumbsDown, MessageSquare } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'model';
    text: string;
    id?: string;
}

export default function ChatSimulator() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Halo! Ada yang bisa saya bantu terkait produk kami?', id: 'init' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [businessContext, setBusinessContext] = useState<any>(null);
    const [isExpired, setIsExpired] = useState(false);

    // Correction State
    const [correctingMsgId, setCorrectingMsgId] = useState<string | null>(null);
    const [correctionInput, setCorrectionInput] = useState('');
    const [isSavingCorrection, setIsSavingCorrection] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Load Business Context
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const productsSnap = await getDocs(collection(db, 'users', user.uid, 'products'));
                const faqsSnap = await getDocs(collection(db, 'users', user.uid, 'faqs'));

                const products = productsSnap.docs.map(d => d.data());
                const faqs = faqsSnap.docs.map(d => d.data());
                const userData = userDoc.data();

                if (userData) {
                    setBusinessContext({
                        name: userData.businessName || 'Toko Kami',
                        description: userData.businessDescription || 'Toko serba ada.',
                        products: products,
                        faqs: faqs
                    });

                    // Check Expiration
                    const status = userData.subscriptionStatus || 'active';
                    const now = new Date();
                    let expired = false;

                    if (status === 'active' && userData.subscriptionExpiresAt) {
                        const expiry = new Date(userData.subscriptionExpiresAt);
                        if (now > expiry) expired = true;
                    } else if (status === 'trial' && userData.trialExpiresAt) {
                        const expiry = new Date(userData.trialExpiresAt);
                        if (now > expiry) expired = true;
                    }
                    setIsExpired(expired);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, correctingMsgId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !businessContext) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg, id: Date.now().toString() }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                text: m.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: history,
                    userId: auth.currentUser?.uid,
                    businessContext: businessContext
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setMessages(prev => [...prev, { role: 'model', text: `Error: ${data.error || 'Terjadi kesalahan sistem'}`, id: Date.now().toString() }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: data.reply, id: Date.now().toString() }]);
                if (data.leadCaptured) {
                    console.log("Lead captured:", data.leadInfo);
                }
            }
        } catch (error: any) {
            console.error("Simulator Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: `Maaf, terjadi kesalahan koneksi server. (${error.message})`, id: Date.now().toString() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([{ role: 'model', text: 'Halo! Ada yang bisa saya bantu terkait produk kami?', id: 'init' }]);
    };

    const handleCorrection = async () => {
        if (!auth.currentUser || !correctionInput.trim()) return;
        setIsSavingCorrection(true);

        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);

            // 1. Get current desc
            const snap = await getDoc(userRef);
            if (!snap.exists()) return;

            const currentDesc = snap.data().businessDescription || '';

            // 2. Append correction
            const newCorrection = `\n\n[INFO TAMBAHAN]: ${correctionInput}`;
            const updatedDesc = currentDesc + newCorrection;

            // 3. Save
            await updateDoc(userRef, {
                businessDescription: updatedDesc,
                updatedAt: new Date().toISOString()
            });

            // 4. Update local context so simulator is instantly smarter
            setBusinessContext((prev: any) => ({
                ...prev,
                description: updatedDesc
            }));

            alert("Koreksi berhasil disimpan! Bot sekarang sudah mempelajari info baru ini.");
            setCorrectingMsgId(null);
            setCorrectionInput('');

        } catch (error: any) {
            console.error("Correction Error:", error);
            alert("Gagal menyimpan koreksi: " + error.message);
        } finally {
            setIsSavingCorrection(false);
        }
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-neutral-200/60 flex flex-col overflow-hidden relative min-h-0">

                {/* Modern Header */}
                <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-neutral-100 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-tr from-[#061E29] to-[#0A2E3D] rounded-full flex items-center justify-center shadow-lg text-white">
                                <Bot size={24} />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-800 text-lg leading-tight">{businessContext?.name || 'AI Assistant'}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <p className="text-xs text-neutral-500 font-medium">Online • Simulator Mode</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="group p-2.5 hover:bg-red-50 rounded-xl text-neutral-400 hover:text-red-500 transition-all duration-300 border border-transparent hover:border-red-100"
                        title="Reset Percakapan"
                    >
                        <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Messages Area - Modern Clean Look */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-neutral-50/50 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out`}>
                            <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[85%] lg:max-w-[75%]`}>

                                {/* Avatar for Bot messages only */}
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center shrink-0 mb-1 shadow-sm text-[#061E29]">
                                        <Bot size={16} />
                                    </div>
                                )}

                                <div className={`group relative p-4 lg:p-5 rounded-2xl shadow-sm text-sm lg:text-[15px] leading-relaxed transition-all duration-300
                                    ${msg.role === 'user'
                                        ? 'bg-[#061E29] text-white rounded-tr-sm shadow-md'
                                        : 'bg-white text-neutral-700 border border-neutral-100 rounded-tl-sm hover:shadow-md'
                                    }`}
                                >
                                    <div className="markdown-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Correction Button */}
                                    {msg.role === 'model' && msg.id !== 'init' && (
                                        <button
                                            onClick={() => {
                                                if (correctingMsgId === msg.id) {
                                                    setCorrectingMsgId(null);
                                                } else {
                                                    setCorrectingMsgId(msg.id!);
                                                    setCorrectionInput('');
                                                }
                                            }}
                                            className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 bg-white rounded-full shadow-md text-neutral-400 hover:text-red-500 hover:scale-110"
                                            title="Koreksi Jawaban Ini"
                                        >
                                            <ThumbsDown size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Correction Form */}
                            {correctingMsgId === msg.id && (
                                <div className="mt-4 w-full max-w-xl ml-10 bg-white border border-orange-100 rounded-2xl p-4 shadow-lg animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-50">
                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                            <ThumbsDown size={12} />
                                        </div>
                                        <span className="text-sm font-bold text-neutral-700">Koreksi Jawaban AI</span>
                                    </div>
                                    <textarea
                                        value={correctionInput}
                                        onChange={(e) => setCorrectionInput(e.target.value)}
                                        placeholder="Beritahu AI jawaban yang benar agar dia belajar..."
                                        className="w-full text-sm p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#061E29]/20 focus:border-[#061E29] bg-neutral-50 transition-all resize-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end gap-3 mt-3">
                                        <button
                                            onClick={() => setCorrectingMsgId(null)}
                                            className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleCorrection}
                                            disabled={!correctionInput.trim() || isSavingCorrection}
                                            className="px-4 py-2 text-sm bg-[#061E29] text-white font-medium rounded-lg hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none flex items-center gap-2"
                                        >
                                            {isSavingCorrection ? (
                                                <>
                                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : 'Simpan Perbaikan'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center shrink-0 shadow-sm">
                                <Bot size={16} className="text-[#061E29]" />
                            </div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-100 flex gap-1.5 items-center">
                                <span className="w-2 h-2 bg-[#061E29]/40 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-[#061E29]/40 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-[#061E29]/40 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Modern Floating Input Area */}
                <div className="p-4 lg:p-6 bg-white border-t border-neutral-100 relative">
                    {isExpired && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <Lock size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-neutral-900 font-bold text-lg mb-2">Masa Berlaku Habis</h3>
                            <p className="text-neutral-500 mb-6 max-w-sm leading-relaxed">
                                Paket Trial/Premium Anda telah berakhir. Upgrade sekarang untuk melanjutkan layanan otomatis.
                            </p>
                            <a
                                href="https://wa.me/62895402945495?text=Halo%20Admin,%20saya%20ingin%20perpanjang%20paket%20chatbot"
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-2.5 bg-[#061E29] text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Hubungi Admin
                            </a>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                <MessageSquare size={16} />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isExpired ? "Layanan Nonaktif" : "Ketik pesan simulasi..."}
                            className="w-full pl-14 pr-14 py-4 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#061E29]/10 focus:border-[#061E29] bg-neutral-50 focus:bg-white text-neutral-800 placeholder:text-neutral-400 transition-all shadow-sm"
                            disabled={loading || !businessContext || isExpired}
                        />
                        <div className="absolute right-2 top-2 bottom-2">
                            <button
                                type="submit"
                                disabled={loading || !input.trim() || isExpired}
                                className="h-full aspect-square flex items-center justify-center bg-[#061E29] text-white rounded-xl hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                <Send size={18} className={loading ? 'hidden' : 'block'} />
                                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-[10px] text-neutral-400 mt-3">
                        AI dapat melakukan kesalahan. Selalu periksa informasi penting.
                    </p>
                </div>
            </div>

            {/* Aesthetic Sidebar */}
            <div className="hidden lg:flex w-80 flex-col gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/60 sticky top-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Smartphone size={20} />
                        </div>
                        <h3 className="font-bold text-neutral-800">Simulator Mode</h3>
                    </div>

                    <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                        Pratinjau respons chatbot di WhatsApp. Klik tombol <ThumbsDown size={14} className="inline text-red-400 mx-1" /> jika jawaban salah untuk melatih AI secara instan.
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                            <h4 className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider mb-3">Debug Information</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">Bot Name</span>
                                    <span className="font-semibold text-[#061E29] px-2 py-1 bg-white rounded border border-neutral-100 shadow-sm">
                                        {businessContext?.name || '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">Products Loaded</span>
                                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                        {businessContext?.products?.length || 0} items
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">FAQs Loaded</span>
                                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                        {businessContext?.faqs?.length || 0} items
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#061E29] to-neutral-800 text-white shadow-lg relative overflow-hidden group cursor-default">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Bot size={64} />
                            </div>
                            <h4 className="font-bold text-sm mb-1 relative z-10">Tips Pro</h4>
                            <p className="text-xs text-neutral-300 relative z-10 leading-relaxed">
                                Gunakan koreksi sesering mungkin di awal penggunaan agar bot semakin pintar mengenali bisnis Anda.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
