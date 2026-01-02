import { Bot, Code, CheckCircle, Monitor, Smartphone, Zap } from 'lucide-react';

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-[#2D3C59] selection:text-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </a>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#services" className="hover:text-neutral-500 transition-colors px-3 py-2 text-sm font-medium tracking-wide">LAYANAN</a>
                <a href="#features" className="hover:text-neutral-500 transition-colors px-3 py-2 text-sm font-medium tracking-wide">FITUR</a>
                <a href="#ai-chatbot" className="hover:text-neutral-500 transition-colors px-3 py-2 text-sm font-medium tracking-wide">AI CHATBOT</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://chatbot.nusavite.com/login"
                className="text-neutral-500 hover:text-[#2D3C59] font-medium text-sm transition-colors px-4"
              >
                Login
              </a>
              <a
                href="https://chatbot.nusavite.com/register"
                className="bg-[#2D3C59] hover:bg-[#1e293b] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-[#2D3C59]/10"
              >
                Daftar Gratis
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#2D3C59]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">Smart Digital Solutions</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[#2D3C59] leading-tight">
              Website & Asisten AI <br />
              <span className="italic font-serif font-medium">untuk Bisnis Anda.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
              Kami membangun website profesional untuk bisnis Anda yang dilengkapi Chatbot AI. Anda bisa melatih bot ini untuk menjawab pertanyaan spesifik tentang produk dan layanan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://chatbot.nusavite.com/register"
                className="px-10 py-5 bg-[#2D3C59] hover:bg-[#1e293b] text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Mulai Trial Gratis 5 Hari
              </a>
              <button
                onClick={() => document.getElementById('ai-chatbot')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white hover:bg-neutral-50 border-2 border-neutral-200 text-[#2D3C59] rounded-full font-bold text-lg transition-all"
              >
                Pelajari Cara Kerjanya
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Blue Section) */}
      <section id="services" className="py-32 bg-[#2D3C59] text-white relative rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Design & <br />Intelligence</h2>
              <p className="text-neutral-400 text-xl font-light">
                Website stunning yang "mengerti" bisnis Anda lewat konfigurasi AI yang mudah.
              </p>
            </div>
            <div className="hidden md:block w-32 h-1 bg-white/20"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-[#2D3C59]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Website Bisnis</h3>
              <p className="text-neutral-400 leading-relaxed">
                Kami buatkan website profil atau toko online yang elegan. Siap pakai dan sudah terpasang widget Chatbot AI.
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-[#2D3C59]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Dashboard Kontrol</h3>
              <p className="text-neutral-400 leading-relaxed">
                Anda dapat akses ke dashboard khusus untuk mengatur "isi otak" chatbot Anda (harga, stok, deskripsi layanan) kapan saja.
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-[#2D3C59]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Integrasi Otomatis</h3>
              <p className="text-neutral-400 leading-relaxed">
                Cukup isi data di dashboard, chatbot di website langsung update pengetahuannya detik itu juga. Tanpa koding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section id="features" className="py-24 bg-[#2D3C59] text-white relative border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500 mb-2 block">Fitur Unggulan</span>
            <h2 className="text-3xl md:text-5xl font-bold">Training AI Mandiri</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#1e293b] border border-[#1e293b] rounded-3xl overflow-hidden">
            <div className="bg-[#243148] p-12 hover:bg-[#1e293b] transition-colors">
              <Code className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Input Data Produk</h3>
              <p className="text-neutral-500">
                Masukkan nama kamar hotel, harga, atau menu restoran Anda. Chatbot akan menghafalnya.
              </p>
            </div>

            <div className="bg-[#243148] p-12 hover:bg-[#1e293b] transition-colors">
              <Smartphone className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Respon 24/7</h3>
              <p className="text-neutral-500">
                Customer bertanya jam 2 pagi di website? Chatbot menjawab sesuai data yang Anda input.
              </p>
            </div>

            <div className="bg-[#243148] p-12 hover:bg-[#1e293b] transition-colors">
              <Monitor className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Kelola via Dashboard</h3>
              <p className="text-neutral-500">
                Login ke nusavite.com untuk update info bisnis Anda. Mudah dan praktis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Added Service: AI Chatbot (White Section) */}
      <section id="ai-chatbot" className="py-32 bg-white relative overflow-hidden rounded-t-[3rem] -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-bold mb-8 text-[#2D3C59] tracking-tight">
                Ajari Chatbot <br />
                <span className="text-neutral-400">Bisnis Anda.</span>
              </h2>
              <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light">
                Sebagai klien Nusavite, Anda mendapatkan akses eksklusif ke <span className="font-bold text-[#2D3C59]">Dashboard Training AI</span>. Di sana Anda bisa memasukkan detail unik bisnis Anda (contoh: "Harga Kamar Deluxe Rp 500rb"). Chatbot di website akan otomatis menggunakan data tersebut untuk melayani tamu.
              </p>

              <ul className="space-y-6 mb-12">
                {[
                  'Input harga & layanan unlimited',
                  'Update informasi secara real-time',
                  'Chatbot bekerja otomatis di website Anda',
                  'Tamu terlayani instan tanpa admin manual'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#2D3C59] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-neutral-800">{item}</span>
                  </li>
                ))}
              </ul>


            </div>

            {/* Visual Representation of Chatbot */}
            <div className="relative">
              <div className="absolute inset-0 bg-neutral-100 transform rotate-3 rounded-3xl"></div>
              <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-6">
                  <div className="w-14 h-14 bg-[#2D3C59] rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-[#2D3C59]">Preview Chat Website</h4>
                    <p className="text-sm text-neutral-500 font-medium">
                      Simulasi Percakapan Pelanggan
                    </p>
                  </div>
                </div>

                <div className="space-y-6 font-sans text-base">
                  <div className="bg-neutral-50 p-6 rounded-2xl rounded-tl-none text-neutral-800">
                    <p className="text-xs text-neutral-500 mb-2 font-bold uppercase">Customer bertanya:</p>
                    Permisi, untuk tipe kamar Deluxe harganya berapa ya per malam?
                  </div>
                  <div className="bg-[#2D3C59] p-6 rounded-2xl rounded-tr-none text-white ml-auto max-w-[90%] shadow-lg">
                    <p className="text-xs text-[#6e85b1] mb-2 font-bold uppercase">Chatbot Menjawab (Sesuai Data Anda):</p>
                    Halo kak! Untuk tipe kamar Deluxe harganya Rp 500.000 per malam, sudah termasuk sarapan untuk 2 orang. Mau dibantu reservasi?
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                  <p className="text-sm text-neutral-400">
                    *Jawaban di atas otomatis digenerate berdasarkan data yang Anda input di dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500 mb-2 block">Investasi Cerdas</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#2D3C59] mb-6">Pilih Paket Langganan</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Opsi pembayaran fleksibel sesuai kebutuhan bisnis Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Standard Plan (Annual) */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 flex flex-col hover:border-[#2D3C59] transition-colors relative">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Standard Website</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-[#2D3C59]">Rp 2.4 Jt</span>
                <span className="text-neutral-500 ml-2">/ tahun</span>
              </div>
              <p className="text-neutral-600 mb-8 text-sm leading-relaxed">
                Solusi hemat "Sekali Bayar" untuk setahun penuh. Cocok untuk branding hotel/bisnis tanpa pusing biaya bulanan.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Website Profesional & Responsif',
                  'Gratis Hosting 1 Tahun',
                  'Gratis Domain (.com) 1 Tahun',
                  'Update Konten Ringan',
                  'Standard Support'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                    <span className="text-neutral-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://wa.me/62895402945495?text=Halo%20Nusavite,%20saya%20tertarik%20paket%20Standard%20Tahunan"
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl border-2 border-neutral-200 text-[#2D3C59] font-bold text-center hover:border-[#2D3C59] transition-colors"
              >
                Pilih Paket Tahunan
              </a>
            </div>

            {/* NEW: Standalone AI Chatbot Plan */}
            <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-neutral-300 flex flex-col hover:border-[#2D3C59] transition-colors relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2D3C59] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                New: Standalone
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">WhatsApp AI Only</h3>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-[#2D3C59]">Rp 200rb</span>
                <span className="text-neutral-500 ml-2">/ bulan</span>
              </div>
              <div className="mb-6">
                <p className="text-[10px] text-neutral-400 line-through">Biaya Aktivasi: Rp 500rb</p>
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                  Promo: Gratis Biaya Setup (3 Klien Pertama)
                </p>
              </div>
              <p className="text-neutral-600 mb-8 text-sm leading-relaxed italic">
                Sangat praktis untuk layanan informasi pasien & reservasi klinik secara otomatis.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Integrasi WhatsApp API',
                  'Latih AI sesuka hati (Product Knowledge)',
                  'Respon Otomatis 24 Jam',
                  'Tanpa Perlu Website Baru',
                  'Dashboard Kontrol Penuh'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                    <span className="text-neutral-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://chatbot.nusavite.com/register"
                className="w-full py-4 rounded-xl border-2 border-[#2D3C59] bg-[#2D3C59] text-white font-bold text-center hover:bg-[#1e293b] transition-colors"
              >
                Pilih Paket WhatsApp AI
              </a>
            </div>

            {/* Premium AI Plan (Monthly) */}
            <div className="bg-[#2D3C59] p-8 rounded-3xl border border-[#1e293b] flex flex-col relative shadow-2xl transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-white text-[#2D3C59] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                Full Bundle
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Master</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">Rp 350rb</span>
                <span className="text-neutral-400 ml-2">/ bulan</span>
              </div>
              <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
                Paket lengkap untuk dominasi digital. Website profesional + Chatbot AI + Maintenance Prioritas.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Semua fitur Website & WhatsApp AI',
                  'Chatbot AI Integrasi Penuh',
                  'Dashboard Training Data Mandiri',
                  'Maintenance Bulanan Prioritas',
                  'Bebas Cancel Kapan Saja'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-neutral-200 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://wa.me/62895402945495?text=Halo%20Nusavite,%20saya%20tertarik%20paket%20Premium%20Master%20(Web%20+%20AI)"
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl bg-white text-[#2D3C59] font-bold text-center hover:bg-neutral-200 transition-colors"
              >
                Mulai Paket Lengkap
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D3C59] mb-8">Punya Bisnis? Bikin Website Sekarang.</h2>
          <p className="text-neutral-500 mb-10 text-xl font-light">
            Solusi lengkap: Website Profesional + Asisten AI yang bisa Anda atur sendiri.
          </p>
          <div className="flex justify-center">
            <a
              href="https://wa.me/62895402945495"
              target="_blank"
              rel="noreferrer"
              className="px-12 py-4 bg-[#2D3C59] text-white hover:bg-[#1e293b] rounded-full font-bold text-lg transition-all"
            >
              Konsultasi Pembuatan Website
            </a>
          </div>
          <div className="mt-20">
            <p className="text-neutral-500 text-sm mb-4">
              Kotamobagu, Sulawesi Utara, Indonesia
            </p>
            <div className="text-neutral-400 text-[10px] font-black tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Nusavite.com - All Rights Reserved
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
