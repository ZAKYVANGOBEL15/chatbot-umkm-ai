// import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { Bot, Code, CheckCircle, ArrowRight, Monitor, Smartphone, Zap } from 'lucide-react';

export default function LandingPage() {
  // const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-black selection:text-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl font-serif">N</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-black">Nusavite</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#services" className="hover:text-neutral-500 transition-colors px-3 py-2 text-sm font-medium tracking-wide">LAYANAN</a>
                <a href="#features" className="hover:text-neutral-500 transition-colors px-3 py-2 text-sm font-medium tracking-wide">FITUR</a>
                <a href="#ai-chatbot" className="hover:text-neutral-500 transition-colors px-3 py-2 text-sm font-medium tracking-wide">AI CHATBOT</a>
              </div>
            </div>
            <div>
              <a
                href="https://chatbot.nusavite.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all inline-block"
              >
                Login Dashboard
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
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">Smart Digital Solutions</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-black leading-tight">
              Website Canggih <br />
              <span className="italic font-serif font-medium">Terintegrasi AI.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
              Kami membangun website profesional untuk bisnis Anda yang dilengkapi Chatbot AI. Anda bisa melatih bot ini untuk menjawab pertanyaan spesifik tentang produk dan layanan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="px-10 py-5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Pesan Website Sekarang
              </a>
              <button
                onClick={() => document.getElementById('ai-chatbot')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white hover:bg-neutral-50 border-2 border-neutral-200 text-black rounded-full font-bold text-lg transition-all"
              >
                Pelajari Cara Kerjanya
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Black Section) */}
      <section id="services" className="py-32 bg-black text-white relative rounded-t-[3rem]">
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
                <Monitor className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Website Bisnis</h3>
              <p className="text-neutral-400 leading-relaxed">
                Kami buatkan website profil atau toko online yang elegan. Siap pakai dan sudah terpasang widget Chatbot AI.
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Dashboard Kontrol</h3>
              <p className="text-neutral-400 leading-relaxed">
                Anda dapat akses ke dashboard khusus untuk mengatur "isi otak" chatbot Anda (harga, stok, deskripsi layanan) kapan saja.
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-black" />
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
      <section className="py-24 bg-black text-white relative border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500 mb-2 block">Fitur Unggulan</span>
            <h2 className="text-3xl md:text-5xl font-bold">Training AI Mandiri</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800 rounded-3xl overflow-hidden">
            <div className="bg-neutral-950 p-12 hover:bg-neutral-900 transition-colors">
              <Code className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Input Data Produk</h3>
              <p className="text-neutral-500">
                Masukkan nama kamar hotel, harga, atau menu restoran Anda. Chatbot akan menghafalnya.
              </p>
            </div>

            <div className="bg-neutral-950 p-12 hover:bg-neutral-900 transition-colors">
              <Smartphone className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Respon 24/7</h3>
              <p className="text-neutral-500">
                Customer bertanya jam 2 pagi di website? Chatbot menjawab sesuai data yang Anda input.
              </p>
            </div>

            <div className="bg-neutral-950 p-12 hover:bg-neutral-900 transition-colors">
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
              <h2 className="text-5xl md:text-7xl font-bold mb-8 text-black tracking-tight">
                Ajari Chatbot <br />
                <span className="text-neutral-400">Bisnis Anda.</span>
              </h2>
              <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light">
                Sebagai klien Nusavite, Anda mendapatkan akses eksklusif ke <span className="font-bold text-black">Dashboard Training AI</span>. Di sana Anda bisa memasukkan detail unik bisnis Anda (contoh: "Harga Kamar Deluxe Rp 500rb"). Chatbot di website akan otomatis menggunakan data tersebut untuk melayani tamu.
              </p>

              <ul className="space-y-6 mb-12">
                {[
                  'Input harga & layanan unlimited',
                  'Update informasi secara real-time',
                  'Chatbot bekerja otomatis di website Anda',
                  'Tamu terlayani instan tanpa admin manual'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-neutral-800">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://chatbot.nusavite.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 text-black font-bold text-xl hover:translate-x-2 transition-transform"
              >
                Login ke Dashboard Chatbot <ArrowRight className="w-6 h-6" />
              </a>
            </div>

            {/* Visual Representation of Chatbot */}
            <div className="relative">
              <div className="absolute inset-0 bg-neutral-100 transform rotate-3 rounded-3xl"></div>
              <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-6">
                  <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-black">Preview Chat Website</h4>
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
                  <div className="bg-black p-6 rounded-2xl rounded-tr-none text-white ml-auto max-w-[90%] shadow-lg">
                    <p className="text-xs text-neutral-400 mb-2 font-bold uppercase">Chatbot Menjawab (Sesuai Data Anda):</p>
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

      {/* CTA Footer */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Punya Bisnis? Bikin Website Sekarang.</h2>
          <p className="text-neutral-500 mb-10 text-xl font-light">
            Solusi lengkap: Website Profesional + Asisten AI yang bisa Anda atur sendiri.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="px-12 py-4 bg-black text-white hover:bg-neutral-800 rounded-full font-bold text-lg transition-all"
            >
              Konsultasi Pembuatan Website
            </a>
            <a
              href="mailto:info@nusavite.com"
              className="px-12 py-4 bg-transparent border-2 border-neutral-200 text-black hover:border-black rounded-full font-bold text-lg transition-all"
            >
              Email Kami
            </a>
          </div>
          <div className="mt-20 text-neutral-400 text-sm font-medium tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Nusavite.com. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}
