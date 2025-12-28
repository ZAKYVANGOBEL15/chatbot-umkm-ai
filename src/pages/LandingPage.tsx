// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Code, CheckCircle, ArrowRight, Monitor, Smartphone, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

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
              <button
                onClick={() => navigate('/login')}
                className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"
              >
                Login Client
              </button>
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
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">Digital Perfection</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-black leading-tight">
              We Build <br />
              <span className="italic font-serif font-medium">Digital Legacies.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
              Nusavite menghadirkan standar baru dalam pengembangan website dan integrasi AI. Elegan, Cerdas, dan Presisi untuk bisnis Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="px-10 py-5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Mulai Konsultasi
              </a>
              <button
                onClick={() => document.getElementById('ai-chatbot')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white hover:bg-neutral-50 border-2 border-neutral-200 text-black rounded-full font-bold text-lg transition-all"
              >
                Explore Solution
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
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Craftsmanship & <br />Intelligence</h2>
              <p className="text-neutral-400 text-xl font-light">
                Kombinasi seni desain dan kecerdasan buatan untuk hasil yang tak tertandingi.
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
              <h3 className="text-2xl font-bold mb-4">Website Signature</h3>
              <p className="text-neutral-400 leading-relaxed">
                Company profile yang dirancang khusus untuk mencerminkan identitas premium brand Anda. Tanpa template, murni karya seni digital.
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Bespoke Web App</h3>
              <p className="text-neutral-400 leading-relaxed">
                Sistem kompleks yang dibalut antarmuka minimalis. Dashboard, manajemen sistem, dan automasi bisnis yang seamless.
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-white/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">High Performance</h3>
              <p className="text-neutral-400 leading-relaxed">
                Optimasi tingkat lanjut untuk kecepatan loading instan dan struktur SEO yang solid. Fondasi teknis yang sempurna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services (Still Black, Distinct Style) */}
      <section className="py-24 bg-black text-white relative border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500 mb-2 block">Ekosistem Digital</span>
            <h2 className="text-3xl md:text-5xl font-bold">Layanan Eksklusif Tambahan</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800 rounded-3xl overflow-hidden">
            <div className="bg-neutral-950 p-12 hover:bg-neutral-900 transition-colors">
              <Code className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Custom AI Knowledge</h3>
              <p className="text-neutral-500">
                Brain training untuk AI Anda dengan data spesifik perusahaan.
              </p>
            </div>

            <div className="bg-neutral-950 p-12 hover:bg-neutral-900 transition-colors">
              <Smartphone className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">WhatsApp Business API</h3>
              <p className="text-neutral-500">
                Integrasi chat automatis langsung ke platform messaging #1 dunia.
              </p>
            </div>

            <div className="bg-neutral-950 p-12 hover:bg-neutral-900 transition-colors">
              <Monitor className="w-10 h-10 text-white mb-6" />
              <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
              <p className="text-neutral-500">
                Insight mendalam tentang interaksi customer dan performa bot.
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
                24/7 <br />
                <span className="text-neutral-400">Intelligent Assistant.</span>
              </h2>
              <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light">
                Setiap website buatan kami dilengkapi opsi integritas <span className="font-bold text-black">Chatbot AI Premium</span>. Bukan sekadar penjawab otomatis, tapi representasi cerdas brand Anda yang bekerja tanpa henti.
              </p>

              <ul className="space-y-6 mb-12">
                {[
                  'Respon instan dalam hitungan detik',
                  'Operasional 24 jam x 7 hari',
                  'Gaya bahasa brand-aware yang natural',
                  'Efisiensi biaya operasional signifikan'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-neutral-800">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/register')}
                className="group flex items-center gap-4 text-black font-bold text-xl hover:translate-x-2 transition-transform"
              >
                Lihat Demo Chatbot <ArrowRight className="w-6 h-6" />
              </button>
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
                    <h4 className="font-bold text-xl text-black">Nusavite AI</h4>
                    <p className="text-sm text-neutral-500 font-medium">
                      Always Online
                    </p>
                  </div>
                </div>

                <div className="space-y-6 font-sans text-base">
                  <div className="bg-neutral-50 p-6 rounded-2xl rounded-tl-none text-neutral-800">
                    Halo. Saya asisten virtual Nusavite. Ada yang bisa saya bantu untuk transformasi digital bisnis Anda?
                  </div>
                  <div className="bg-black p-6 rounded-2xl rounded-tr-none text-white ml-auto max-w-[90%] shadow-lg">
                    Saya ingin website yang elegan dan tidak pasaran.
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-2xl rounded-tl-none text-neutral-800">
                    Pilihan tepat. Kami mengusung desain <strong>Monochrome Luxury</strong> yang fokus pada tipografi kuat dan layout bersih. Sangat cocok untuk brand premium.
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100">
                  <div className="flex gap-3">
                    <div className="h-3 w-3 bg-neutral-300 rounded-full animate-bounce"></div>
                    <div className="h-3 w-3 bg-neutral-300 rounded-full animate-bounce delay-75"></div>
                    <div className="h-3 w-3 bg-neutral-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Ready to Elevate?</h2>
          <p className="text-neutral-500 mb-10 text-xl font-light">
            Biarkan kami menangani teknologinya, Anda fokus pada ekspansi bisnis.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="px-12 py-4 bg-black text-white hover:bg-neutral-800 rounded-full font-bold text-lg transition-all"
            >
              Hubungi via WhatsApp
            </a>
            <a
              href="mailto:info@nusavite.com"
              className="px-12 py-4 bg-transparent border-2 border-neutral-200 text-black hover:border-black rounded-full font-bold text-lg transition-all"
            >
              Kirim Email
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
