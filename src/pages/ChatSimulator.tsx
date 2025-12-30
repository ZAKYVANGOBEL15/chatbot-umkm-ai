import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, Smartphone } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export default function ChatSimulator() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Halo! Ada yang bisa saya bantu terkait produk kami?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [businessContext, setBusinessContext] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Business Context (Profile + Products)
        const loadContext = async () => {
            if (!auth.currentUser) return;

            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const productsSnap = await getDocs(collection(db, 'users', auth.currentUser.uid, 'products'));

            const products = productsSnap.docs.map(d => d.data());
            const userData = userDoc.data();

            if (userData) {
                setBusinessContext({
                    name: userData.businessName || 'Toko Kami',
                    description: userData.businessDescription || 'Toko serba ada.',
                    products: products
                });
            }
        };
        loadContext();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !businessContext) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // Create history for AI context
            const history = messages.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                text: m.text
            }));

            // SECURE: Call our own backend proxy instead of direct Mistral call
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
                setMessages(prev => [...prev, { role: 'model', text: `Error: ${data.error || 'Terjadi kesalahan sistem'}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
            }
        } catch (error: any) {
            console.error("Simulator Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: `Maaf, terjadi kesalahan koneksi server. (${error.message})` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([{ role: 'model', text: 'Halo! Ada yang bisa saya bantu terkait produk kami?' }]);
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative min-h-0">
                {/* Mock Phone Header */}
                <div className="bg-emerald-600 p-3 lg:p-4 flex items-center justify-between text-white shrink-0 shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot size={20} className="lg:hidden" />
                            <Bot size={24} className="hidden lg:block" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm lg:text-base truncate">{businessContext?.name || 'Loading...'}</h3>
                            <p className="text-[10px] lg:text-xs text-emerald-100 opacity-90">Online</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-lg text-emerald-100 transition-colors" title="Reset Chat">
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2] scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div
                                className={`max-w-[85%] lg:max-w-[75%] p-3 rounded-xl text-[13px] lg:text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-3 lg:p-4 bg-gray-100 border-t border-gray-200 shrink-0">
                    <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan..."
                            className="flex-1 px-4 py-2 lg:py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white text-sm lg:text-base"
                            disabled={loading || !businessContext}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 shrink-0"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Simulator Info Sidebar */}
            <div className="hidden lg:block w-72 lg:w-80 bg-blue-50 p-6 rounded-xl h-fit border border-blue-100 sticky top-0">
                <div className="flex items-center gap-3 mb-4 text-blue-800">
                    <Smartphone size={22} />
                    <h3 className="font-bold">Mode Simulator</h3>
                </div>
                <p className="text-sm text-blue-700 mb-6 leading-relaxed">
                    Ini adalah pratinjau bagaimana chatbot akan merespons pelanggan di WhatsApp.
                    Pastikan data di <strong>Knowledge Base</strong> sudah lengkap agar jawaban lebih akurat.
                </p>

                <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
                    <h4 className="font-extrabold text-[10px] uppercase text-gray-400 tracking-wider mb-2">Debug Info:</h4>
                    <div className="text-xs text-gray-600 space-y-1.5">
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                            <span>Bot Name:</span>
                            <span className="font-medium text-blue-600">{businessContext?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Products:</span>
                            <span className="font-medium text-blue-600">{businessContext?.products?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
