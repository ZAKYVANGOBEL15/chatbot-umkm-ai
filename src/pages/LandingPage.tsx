// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Code, CheckCircle, ArrowRight, Monitor, Smartphone, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-cyan-500 selection:text-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Nusavite</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#services" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Layanan</a>
                <a href="#features" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Fitur</a>
                <a href="#ai-chatbot" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">AI Chatbot</a>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate('/login')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-700 hover:border-slate-600"
              >
                Login Client
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800/50 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Solusi Digital Terdepan</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
              Bangun Website <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Modern & Cerdas
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Nusavite menghadirkan layanan pembuatan website profesional dengan performa tinggi.
              Kini dilengkapi dengan <span className="text-white font-semibold">Chatbot AI</span> cerdas untuk meningkatkan interaksi bisnis Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-1"
              >
                Konsultasi Gratis
              </a>
              <button
                onClick={() => document.getElementById('ai-chatbot')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-lg transition-all"
              >
                Lihat Demo AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Jasa Pembuatan & Pengembangan</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Kami menawarkan solusi digital komprehensif untuk membawa bisnis Anda ke level berikutnya.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group">
              <div className="w-14 h-14 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Monitor className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Website Company Profile</h3>
              <p className="text-slate-400 leading-relaxed">
                Tampilkan kredibilitas bisnis Anda dengan desain elegan, responsif, dan profesional. Cocok untuk korporasi dan UKM.
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group">
              <div className="w-14 h-14 bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Aplikasi Web Custom</h3>
              <p className="text-slate-400 leading-relaxed">
                Sistem manajemen, dashboard, atau aplikasi khusus yang disesuaikan dengan alur kerja bisnis Anda yang unik.
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group">
              <div className="w-14 h-14 bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Optimasi Performa & SEO</h3>
              <p className="text-slate-400 leading-relaxed">
                Website super cepat dengan struktur SEO friendly agar bisnis Anda mudah ditemukan di mesin pencari Google.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Added Service: AI Chatbot */}
      <section id="ai-chatbot" className="py-24 bg-slate-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
                <span className="text-sm font-bold text-cyan-400 tracking-wide">VALUE ADDED SERVICE</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Website Anda Kini Punya <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Asisten Cerdas 24/7
                </span>
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Jangan biarkan pengunjung website Anda bingung. Layanan pembuatan website kami sudah termasuk opsi integrasi
                <span className="text-white font-semibold"> Chatbot AI Premium</span> yang dapat menjawab pertanyaan pelanggan secara otomatis, natural, dan akurat.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  'Menjawab pertanyaan pelanggan secara instan',
                  'Tersedia 24 jam non-stop tanpa istirahat',
                  'Menghemat biaya customer service manual',
                  'Gaya bahasa natural dan bisa disesuaikan'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/register')}
                className="group flex items-center gap-2 text-cyan-400 font-bold text-lg hover:text-cyan-300 transition-colors"
              >
                Coba Demo Chatbot Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual Representation of Chatbot */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 transform rotate-6 rounded-2xl opacity-20 blur-lg"></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Asisten Virtual Nusavite</h4>
                    <p className="text-xs text-cyan-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                    </p>
                  </div>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  <div className="bg-slate-800 p-4 rounded-tl-xl rounded-tr-xl rounded-br-xl text-slate-300 max-w-[90%]">
                    Halo! Selamat datang di Nusavite. Ada yang bisa saya bantu mengenai pembuatan website bisnis Anda?
                  </div>
                  <div className="bg-blue-900/40 p-4 rounded-tl-xl rounded-tr-xl rounded-bl-xl text-white ml-auto max-w-[90%] border border-blue-800/50">
                    Saya butuh website untuk toko online saya, apakah bisa sekalian dengan fitur chat otomatis?
                  </div>
                  <div className="bg-slate-800 p-4 rounded-tl-xl rounded-tr-xl rounded-br-xl text-slate-300 max-w-[90%]">
                    Tentu saja! Kami spesialis dalam membuat E-commerce modern. Layanan kami sudah termasuk <strong>Value Added Service Chatbot AI</strong> yang bisa menangani pertanyaan stok dan harga secara otomatis.
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="h-10 bg-slate-800 rounded-lg animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-24 bg-slate-900 relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Layanan Tambahan Chatbot AI</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Maksimalkan potensi asisten virtual Anda dengan layanan eksklusif kami.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Custom Knowledge Base</h3>
              <p className="text-slate-400">
                Pelatihan khusus AI dengan data bisnis Anda agar jawaban lebih akurat dan relevan.
              </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-pink-900/30 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Integrasi WhatsApp</h3>
              <p className="text-slate-400">
                Hubungkan Chatbot AI langsung ke WhatsApp Business API untuk respon otomatis 24 jam.
              </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dashboard Analytics</h3>
              <p className="text-slate-400">
                Pantau performa chatbot, riwayat percakapan, dan sentimen pelanggan dalam satu dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Siap Mengembangkan Bisnis Anda?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Dapatkan website profesional dengan teknologi AI terkini. Konsultasikan kebutuhan Anda sekarang.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#"
              className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold transition-colors"
            >
              Hubungi via WhatsApp
            </a>
            <a
              href="mailto:info@nusavite.com"
              className="px-8 py-3 bg-transparent border border-slate-600 text-white hover:border-white rounded-lg font-bold transition-colors"
            >
              Kirim Email
            </a>
          </div>
          <div className="mt-16 text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} Nusavite.com. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}
