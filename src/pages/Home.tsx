import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingBag, ArrowRight, Zap, Shield, Smartphone } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0b14] text-white font-sans selection:bg-blue-500/30">
            {/* Gradient Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Nusavite</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#solutions" className="hover:text-white transition-colors">Solusi</a>
                    <a href="#about" className="hover:text-white transition-colors">Tentang</a>
                    <Link to="/login" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
                        Login Dashboard
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    EKOSISTEM DIGITAL UMKM #1 DI INDONESIA
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
                    Akselerasi Bisnis Anda <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400">
                        Dengan Teknologi Masa Depan
                    </span>
                </h1>

                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                    Nusavite menghadirkan berbagai solusi cerdas untuk membantu UMKM Indonesia Go Digital. Mulai dari asisten AI hingga sistem kasir modern.
                </p>

                {/* Solution Cards */}
                <div id="solutions" className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-20">
                    {/* Solution 1: AI Chatbot */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 text-left">
                            <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Nusavite AI Chatbot</h3>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                Asisten pintar yang menjawab pertanyaan pelanggan via WhatsApp otomatis 24/7. Tingkatkan konversi penjualan Anda tanpa lelah.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                            >
                                Mulai Sekarang <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Solution 2: Laundry System */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 text-left">
                            <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Nusavite Laundry</h3>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                Kelola bisnis laundry Anda dengan sistem kasir yang rapi, laporan keuangan otomatis, dan manajemen customer terbaik.
                            </p>
                            <a
                                href="https://laundryku.nusavite.com/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                            >
                                Kunjungi Layanan <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 pt-16 pb-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-6 h-6 text-blue-500" />
                            <span className="text-xl font-bold">Nusavite</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                            Membangun ekosistem digital untuk kemajuan UMKM di seluruh Nusantara. Solusi bisnis masa depan dalam satu platform.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Produk</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/login" className="hover:text-blue-400 transition-colors">AI Chatbot</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Kasir Laundry</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Point of Sales</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Refund</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-gray-600">
                        © 2025 Nusavite. Dibuat dengan ❤️ untuk UMKM Indonesia.
                    </p>
                    <div className="flex gap-6">
                        <Shield className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-all cursor-pointer" />
                        <Smartphone className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-all cursor-pointer" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
