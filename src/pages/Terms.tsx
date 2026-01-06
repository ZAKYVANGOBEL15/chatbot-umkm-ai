import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, RefreshCcw, Mail, CheckCircle } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                </Link>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-blue-600 px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold">Syarat & Ketentuan Nusavite</h1>
                        <p className="mt-2 text-blue-100 italic">Terakhir diperbarui: 26 Desember 2025</p>
                    </div>

                    <div className="p-8 space-y-10">
                        {/* 1. Ketentuan Layanan */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">1. Ketentuan Layanan</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Nusavite menyediakan layanan Asisten AI berbasis chatbot untuk membantu UMKM berinteraksi dengan pelanggan.
                                Dengan mendaftar dan menggunakan layanan kami, Anda menyetujui seluruh ketentuan yang tertulis di halaman ini.
                            </p>
                        </section>

                        {/* 2. Kebijakan Pengembalian Dana (Refund) */}
                        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-4">
                                <RefreshCcw className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">2. Kebijakan Pengembalian Dana (Refund)</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Kami menawarkan masa Trial Gratis selama 5 hari bagi semua pengguna baru untuk mencoba seluruh fitur Pro.
                                Karena adanya masa trial tersebut, seluruh pembayaran langganan yang dilakukan setelah masa trial habis bersifat
                                Final dan Non-Refundable (Tidak dapat dikembalikan).
                            </p>
                        </section>

                        {/* 3. Aktivasi Layanan */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-800">3. Aktivasi Layanan (Fulfillment)</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Nusavite adalah layanan Software-as-a-Service (SaaS). Setelah transaksi pembayaran berhasil dikonfirmasi oleh sistem kami, akses ke fitur Premium/Pro Anda akan aktif secara otomatis dan instan tanpa perlu pengiriman fisik.
                            </p>
                        </section>

                        {/* 4. Kebijakan Privasi */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">4. Kebijakan Privasi</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-semibold mb-2">Data yang Kami Kelola:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                                <li>Data Profil Bisnis (Nama, Deskripsi, Produk).</li>
                                <li>Nomor WhatsApp yang dihubungkan ke sistem.</li>
                                <li>Log interaksi chat untuk keperluan peningkatan kualitas AI.</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed">
                                Kami berkomitmen untuk menjaga kerahasiaan data Anda dan tidak akan menjual informasi tersebut kepada pihak ketiga manapun.
                            </p>
                        </section>

                        {/* 4. Kontak Kami */}
                        <section className="border-t pt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Mail className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">5. Hubungi Kami</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Jika Anda memiliki pertanyaan terkait layanan atau pembayaran, silakan hubungi tim kami:
                            </p>
                            <div className="bg-gray-100 p-6 rounded-2xl inline-block w-full">
                                <p className="text-gray-800 font-bold">Email: nusavite06@gmail.com</p>
                                <p className="text-gray-800 font-bold mt-2">WhatsApp: +62 895-4029-45495</p>
                                <p className="text-gray-600 text-sm mt-4 italic">Alamat: Kotamobagu, Sulawesi Utara, Indonesia</p>
                            </div>
                        </section>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 text-center">
                        <p className="text-sm text-gray-500">
                            © 2025 Nusavite - Solusi Digital Pintar untuk UMKM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
