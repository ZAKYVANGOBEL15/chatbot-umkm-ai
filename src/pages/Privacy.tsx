import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, Info } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    to="/register"
                    className="inline-flex items-center text-[#2D3C59] hover:opacity-80 mb-8 transition-colors font-bold"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Pendaftaran
                </Link>

                <div className="bg-white shadow-xl rounded-[2rem] overflow-hidden border border-neutral-100">
                    <div className="bg-[#2D3C59] px-6 py-10 text-white text-center">
                        <h1 className="text-3xl font-bold">Kebijakan Akun & Privasi</h1>
                        <p className="mt-2 text-[#2D3C59]/20 font-black uppercase tracking-[0.3em] text-xs">Nusavite Digital</p>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        {/* 1. Verifikasi Identitas */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#2D3C59]/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-[#2D3C59]" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">1. Verifikasi Identitas & Keamanan</h2>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    Nusavite mewajibkan pendaftaran menggunakan Akun Google resmi. Hal ini dilakukan untuk menghindari:
                                </p>
                                <ul className="mt-4 space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Penggunaan email palsu atau temporary mail (bot).
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Penyalahgunaan sistem trial oleh satu pengguna yang sama.
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Menjamin keamanan akses data bisnis Anda.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. Kebijakan Trial */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#2D3C59]/10 rounded-lg">
                                    <Info className="w-6 h-6 text-[#2D3C59]" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">2. Aktivasi Trial Otomatis</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Setiap akun baru yang berhasil terverifikasi melalui Google Sign-In akan mendapatkan akses Trial Gratis selama 5 hari.
                                Seluruh fitur Premium/Pro akan terbuka secara otomatis agar Anda dapat mencoba integrasi chatbot WhatsApp kami secara maksimal sebelum memutuskan untuk berlangganan.
                            </p>
                        </section>

                        {/* 3. Penggunaan Data */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#2D3C59]/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-[#2D3C59]" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">3. Perlindungan Data Bisnis</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Kami berkomitmen penuh untuk melindungi privasi Anda. Data yang kami simpan (Nama Bisnis, Knowledge Base, dan Log Chat) dienkripsi dan hanya digunakan untuk kepentingan operasional asisten AI Anda.
                            </p>
                            <p className="text-sm italic text-neutral-400">
                                Nusavite tidak pernah membagikan atau menjual data pelanggan kepada pihak ketiga.
                            </p>
                        </section>

                        {/* Footer Link */}
                        <section className="border-t pt-8 text-center">
                            <p className="text-gray-500 text-sm mb-2">Punya pertanyaan lebih lanjut?</p>
                            <p className="text-neutral-400 text-xs mb-6 font-medium">nusavite06@gmail.com • Kotamobagu, Sulawesi Utara</p>
                            <a
                                href="https://wa.me/62895402945495"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block bg-[#2D3C59] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                Chat Admin via WhatsApp
                            </a>
                        </section>
                    </div>

                    <div className="bg-gray-50 px-6 py-6 text-center border-t border-neutral-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            © {new Date().getFullYear()} Nusavite Digital - All Access Reserved
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
