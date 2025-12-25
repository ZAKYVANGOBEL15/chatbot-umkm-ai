import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, Smartphone } from 'lucide-react';
import { generateAIResponse } from '../lib/gemini';
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

            const reply = await generateAIResponse(userMsg, businessContext, history);
            setMessages(prev => [...prev, { role: 'model', text: reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Maaf, terjadi kesalahan pada sistem.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([{ role: 'model', text: 'Halo! Ada yang bisa saya bantu terkait produk kami?' }]);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
                {/* Mock Phone Header */}
                <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold">{businessContext?.name || 'Loading...'}</h3>
                            <p className="text-xs text-emerald-100">Online</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-lg text-emerald-100" title="Reset Chat">
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
                    {/* WhatsApp-like background pattern could be added here */}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {/* <span className="text-[10px] text-gray-400 block text-right mt-1">10:00</span> */}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-100 border-t border-gray-200">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan..."
                            className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-emerald-500"
                            disabled={loading || !businessContext}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Simulator Info Sidebar */}
            <div className="w-80 hidden lg:block bg-blue-50 p-6 rounded-xl h-fit">
                <div className="flex items-center gap-3 mb-4 text-blue-800">
                    <Smartphone size={24} />
                    <h3 className="font-bold">Mode Simulator</h3>
                </div>
                <p className="text-sm text-blue-700 mb-6">
                    Ini adalah pratinjau bagaimana chatbot akan merespons pelanggan di WhatsApp.
                    Pastikan data di <strong>Knowledge Base</strong> sudah lengkap agar jawaban lebih akurat.
                </p>

                <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">Debug Info:</h4>
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>Bot Name: {businessContext?.name}</p>
                        <p>Products Loaded: {businessContext?.products?.length || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
