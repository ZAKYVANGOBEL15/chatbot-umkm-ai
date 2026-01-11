import { useState, useEffect } from 'react';
import { Bot, Code, CheckCircle, MessageSquare, Smartphone, Zap, HelpCircle, UserPlus, Database, FastForward, Menu, X } from 'lucide-react';

const ChatSimulation = () => {
  const [step, setStep] = useState(0);
  const [displayText, setDisplayText] = useState('');

  const customerMessage = "Admin, gimana prosedur klaim reimbursement kacamata untuk karyawan ya?";
  const aiMessage = "Halo! Sesuai SOP Perusahaan, klaim kacamata bisa dilakukan lewat portal HR dengan melampirkan resi asli dan resep dokter. Maksimal klaim adalah Rp 1.000.000 per tahun ya!";

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (step === 0) {
      timeout = setTimeout(() => setStep(1), 1000);
    } else if (step === 1) {
      if (displayText.length < customerMessage.length) {
        timeout = setTimeout(() => {
          setDisplayText(customerMessage.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setStep(2);
          setDisplayText('');
        }, 1500);
      }
    } else if (step === 2) {
      timeout = setTimeout(() => setStep(3), 2000);
    } else if (step === 3) {
      if (displayText.length < aiMessage.length) {
        timeout = setTimeout(() => {
          setDisplayText(aiMessage.slice(0, displayText.length + 1));
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setStep(0);
          setDisplayText('');
        }, 5000);
      }
    }

    return () => clearTimeout(timeout);
  }, [step, displayText]);

  return (
    <div className="space-y-6 font-sans">
      {/* Customer Message (Right) */}
      <div className={`flex justify-end transition-all duration-500 transform ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-neutral-50 p-4 md:p-6 rounded-2xl rounded-tr-none text-neutral-800 border border-neutral-100 shadow-sm max-w-[85%] ml-auto">
          <p className="text-[10px] text-neutral-400 mb-2 font-bold uppercase tracking-widest text-right">Karyawan Bertanya:</p>
          <p className="text-sm font-medium leading-relaxed">
            {step === 1 ? displayText : customerMessage}
          </p>
        </div>
      </div>

      {/* AI Typing / Response (Left) */}
      {step >= 2 && (
        <div className={`flex justify-start transition-all duration-500 transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-[#2D3C59] p-4 md:p-6 rounded-2xl rounded-tl-none text-white shadow-xl max-w-[85%]">
            <p className="text-[10px] text-white/40 mb-2 font-bold uppercase tracking-widest">Nusavite AI Menjawab:</p>
            {step === 2 ? (
              <div className="flex gap-1.5 py-1">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed">{displayText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PartnerLogos = () => (
  <div className="flex items-center gap-12 md:gap-24">
    <div className="flex items-center">
      <img
        src="/Midtrans_logo.png"
        alt="Midtrans"
        className="h-14 md:h-16 object-contain"
      />
    </div>
    <div className="flex items-center">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg"
        alt="Google Cloud"
        className="h-10 md:h-12 object-contain"
      />
    </div>
    <div className="flex items-center">
      <img
        src="/vercel_logo.png"
        alt="Vercel"
        className="h-10 md:h-12 object-contain"
      />
    </div>
  </div>
);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-[#2D3C59] selection:text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-neutral-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-24">
            {/* Left: Logo */}
            <div className="flex-1 flex items-center">
              <a href="/" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
              </a>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex justify-center">
              <div className="flex items-center gap-8 bg-neutral-50/80 px-8 py-3 rounded-full border border-neutral-100 backdrop-blur-sm">
                <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-[#2D3C59] transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#2D3C59] after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">CARA KERJA</a>
                <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-[#2D3C59] transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#2D3C59] after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">FITUR</a>
                <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-[#2D3C59] transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#2D3C59] after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">HARGA</a>
              </div>
            </div>

            {/* Right: Auth Buttons (Desktop) */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-4">
              <a
                href="https://chatbot.nusavite.com/login"
                className="text-neutral-500 hover:text-[#2D3C59] font-medium text-sm transition-colors px-4 py-2 hover:bg-neutral-50 rounded-full"
              >
                Login
              </a>
              <a
                href="https://chatbot.nusavite.com/register"
                className="bg-[#2D3C59] hover:bg-[#1e293b] text-white px-7 py-3 rounded-full text-sm font-semibold transition-all shadow-xl shadow-[#2D3C59]/20 hover:shadow-2xl hover:shadow-[#2D3C59]/30 hover:-translate-y-0.5"
              >
                Daftar Gratis
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex flex-1 justify-end">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-[#2D3C59] hover:bg-neutral-50 rounded-xl transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden absolute w-full bg-white border-b border-neutral-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[500px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 space-y-4 pt-4">
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-neutral-600 hover:text-[#2D3C59] py-2">CARA KERJA</a>
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-neutral-600 hover:text-[#2D3C59] py-2">FITUR</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-neutral-600 hover:text-[#2D3C59] py-2">HARGA</a>
            </div>

            <div className="h-px bg-neutral-100 my-4" />

            <div className="flex flex-col gap-4">
              <a
                href="https://chatbot.nusavite.com/login"
                className="w-full text-center text-neutral-600 font-bold py-4 rounded-2xl border border-neutral-100 hover:bg-neutral-50"
              >
                Login
              </a>
              <a
                href="https://chatbot.nusavite.com/register"
                className="w-full text-center bg-[#2D3C59] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#2D3C59]/20"
              >
                Mulai Daftar Gratis
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-32 lg:pb-32 overflow-hidden isolate">
        {/* Background Image with Premium Overlay */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/baground_hero.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70"></div>
        </div>

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2D3C59]/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#2D3C59]/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm mb-6 hover:border-[#2D3C59]/30 transition-colors cursor-default">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D3C59] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2D3C59]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Smart Digital Solutions</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-[#2D3C59] leading-[1.1]">
              SOP Assistant <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2D3C59] to-[#4a5f85]">Bisnis</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 mb-10 leading-relaxed max-w-2xl font-light">
              Bantu <span className="text-[#2D3C59] font-medium">karyawan</span> bekerja lebih cepat dan efisien dengan asisten AI yang hafal seluruh <span className="text-[#2D3C59] font-medium">SOP & Prosedur</span> kantor Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <a
                href="https://chatbot.nusavite.com/register"
                className="group relative px-8 py-3.5 bg-[#2D3C59] text-white rounded-full font-bold text-base transition-all shadow-xl shadow-[#2D3C59]/30 hover:shadow-[#2D3C59]/40 hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">Mulai Trial Gratis 5 Hari</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </a>
              <button
                onClick={() => document.getElementById('ai-chatbot')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 bg-white text-[#2D3C59] rounded-full font-bold text-base transition-all border border-neutral-200 hover:border-[#2D3C59] hover:bg-neutral-50"
              >
                Pelajari Cara Kerjanya
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-neutral-400 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos if needed, currently empty for cleaner look or could add icons */}
              <p className="text-sm font-medium tracking-widest uppercase">Trusted by Modern Businesses</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between items-center text-center mb-20 gap-8">
            <div>
              <span className="text-sm font-bold tracking-widest uppercase text-[#2D3C59]/60 mb-3 block">Simple Setup</span>
              <h2 className="text-4xl md:text-6xl font-bold text-[#2D3C59] tracking-tight">3 Langkah Mudah <br />Digitalisasi SOP</h2>
            </div>
            <p className="max-w-md text-neutral-500 text-lg leading-relaxed text-center">
              Tidak perlu coding. Tidak perlu instalasi rumit. Fokus pada bisnis, biarkan AI bekerja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative group">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent hidden md:block -z-10"></div>

            {/* Step 1 */}
            <div className="relative bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-[#2D3C59]/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-[#2D3C59] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#2D3C59]/30">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#2D3C59]">1. Daftar Akun</h3>
              <p className="text-neutral-500 leading-relaxed font-light">
                Buat akun di platform Nusavite dan hubungkan nomor WhatsApp Bisnis Anda dalam hitungan detik.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-[#2D3C59]/10 transition-all duration-300 hover:-translate-y-2 mt-8 md:mt-0">
              <div className="w-20 h-20 bg-white border-2 border-[#2D3C59] text-[#2D3C59] rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#2D3C59]">2. Input Dokumen SOP</h3>
              <p className="text-neutral-500 leading-relaxed font-light">
                Unggah atau ketik prosedur kerja, kebijakan internal, dan FAQ bisnis Anda ke dashboard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-[#2D3C59]/10 transition-all duration-300 hover:-translate-y-2 mt-8 md:mt-0">
              <div className="w-20 h-20 bg-[#2D3C59] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#2D3C59]/30">
                <FastForward className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#2D3C59]">3. Siap Membantu Staf</h3>
              <p className="text-neutral-500 leading-relaxed font-light">
                Karyawan bisa bertanya apapun seputar prosedur kantor lewat WhatsApp atau Dashboard secara instan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Blue Section) */}
      <section id="services" className="py-32 bg-[#2D3C59] text-white relative rounded-[3rem] mx-4 lg:mx-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
            <div className="max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter leading-none">
                Automation & <br />
                <span className="text-white/40">Intelligence.</span>
              </h2>
              <p className="text-white/70 text-2xl font-light max-w-xl">
                Biarkan AI menangani tugas berulang, Anda fokus pada pertumbuhan bisnis yang strategis.
              </p>
            </div>
            <div className="hidden md:flex flex-col gap-4">
              <div className="w-20 h-1 bg-white/20 rounded-full"></div>
              <div className="w-12 h-1 bg-white/20 rounded-full ml-auto"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-7 h-7 text-[#2D3C59]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Integrasi WhatsApp</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Hubungkan AI langsung ke WhatsApp. Balas pertanyaan operasional karyawan secara instan dan personal.
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-[#2D3C59]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Training Mandiri</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Update informasi produk, harga, dan layanan di dashboard. AI akan langsung "belajar" dan menggunakannya.
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-7 h-7 text-[#2D3C59]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Database Prosedur</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Simpan semua pengetahuan bisnis dalam satu tempat. AI akan menjadi pusat informasi yang selalu update.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section id="features" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-400 mb-4 block">Fitur Unggulan</span>
            <h2 className="text-4xl md:text-6xl font-bold text-[#2D3C59] tracking-tight">Training AI Mandiri</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-neutral-100 rounded-[2.5rem] overflow-hidden border border-neutral-100 shadow-2xl shadow-neutral-100">
            <div className="bg-white p-14 hover:bg-neutral-50 transition-colors group">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2D3C59] transition-colors duration-500">
                <Code className="w-6 h-6 text-[#2D3C59] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2D3C59]">Input Data Produk</h3>
              <p className="text-neutral-500 leading-relaxed">
                Masukkan nama kamar hotel, harga, atau menu restoran Anda. Chatbot akan menghafalnya.
              </p>
            </div>

            <div className="bg-white p-14 hover:bg-neutral-50 transition-colors group">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2D3C59] transition-colors duration-500">
                <Smartphone className="w-6 h-6 text-[#2D3C59] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2D3C59]">Konsultasi Cepat</h3>
              <p className="text-neutral-500 leading-relaxed">
                Staf bingung dengan aturan kantor? Cukup tanya ke bot WhatsApp, jawaban keluar dalam hitungan detik.
              </p>
            </div>

            <div className="bg-white p-14 hover:bg-neutral-50 transition-colors group">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2D3C59] transition-colors duration-500">
                <MessageSquare className="w-6 h-6 text-[#2D3C59] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2D3C59]">Kelola via Dashboard</h3>
              <p className="text-neutral-500 leading-relaxed">
                Login ke nusavite.com untuk update info bisnis Anda. Mudah dan praktis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Added Service: AI Chatbot (White Section) */}
      <section id="ai-chatbot" className="py-32 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full border border-neutral-200 bg-white text-xs font-bold text-neutral-500 uppercase tracking-widest mb-8">
                Exclusive Tech
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-8 text-[#2D3C59] tracking-tight leading-none">
                Ajari Chatbot <br />
                <span className="text-neutral-400">Bisnis Anda.</span>
              </h2>
              <p className="text-xl text-neutral-600 mb-12 leading-relaxed font-light">
                Sebagai klien Nusavite, Anda mendapatkan akses eksklusif ke <span className="font-semibold text-[#2D3C59] border-b-2 border-[#2D3C59]/20">Dashboard Training AI</span>. Di sana Anda bisa memasukkan detail unik bisnis Anda.
              </p>

              <ul className="space-y-6 mb-12">
                {[
                  'Input prosedur & SOP unlimited',
                  'Update kebijakan secara real-time',
                  'Asisten bekerja otomatis lewat WhatsApp',
                  'Staf lebih mandiri tanpa tanya Owner terus'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-5 group">
                    <div className="w-8 h-8 rounded-full bg-[#2D3C59]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2D3C59] transition-colors duration-300">
                      <CheckCircle className="w-5 h-5 text-[#2D3C59] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-lg text-neutral-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Representation of Chatbot */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#2D3C59] transform rotate-3 rounded-[3rem] opacity-5"></div>
              <div className="relative bg-white border border-neutral-100 rounded-[3rem] p-10 shadow-2xl shadow-neutral-200/50">
                <div className="flex items-center gap-5 mb-10 border-b border-neutral-100 pb-8">
                  <div className="w-16 h-16 bg-[#2D3C59] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D3C59]/20">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl text-[#2D3C59] tracking-tight">Preview Chat</h4>
                    <p className="text-neutral-500 font-medium">
                      Simulasi Percakapan WhatsApp
                    </p>
                  </div>
                </div>

                <ChatSimulation />

                <div className="mt-10 pt-8 border-t border-neutral-100 text-center">
                  <p className="text-sm text-neutral-400 font-medium">
                    *Jawaban di atas otomatis digenerate AI berdasarkan data dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-20">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-[#2D3C59] mb-4 tracking-tight">Pertanyaan Umum</h2>
              <p className="text-neutral-500 text-xl font-light">Hal-hal yang sering ditanyakan partner kami.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "Apakah aman untuk nomor WhatsApp saya?",
                a: "Sangat aman. Kami menggunakan official WhatsApp Business API yang legal dan direkomendasikan oleh Meta, sehingga risiko blokir sangat minim dibandingkan menggunakan tools tidak resmi."
              },
              {
                q: "Apakah bot bisa mengerti Bahasa Daerah?",
                a: "Bisa banget! AI kami berbasis Gemini Pro yang dilatih untuk mengerti konteks, termasuk Bahasa Jawa, Sunda, dan bahasa gaul sehari-hari agar tetap terasa ramah."
              },
              {
                q: "Apakah saya harus online di laptop terus?",
                a: "Sama sekali ngga perlu. Bot bekerja di server cloud kami 24 jam nonstop. Anda bisa mematikan laptop atau HP, dan bot tetap akan menjawab pertanyaan staf Anda."
              },
              {
                q: "Bagaimana cara update SOP/Prosedur?",
                a: "Cukup login ke Dashboard Nusavite, ubah detail prosedur atau kebijakannya, simpan, dan AI akan otomatis menggunakan data terbaru dalam hitungan detik."
              }
            ].map((faq, index) => (
              <div key={index} className="p-10 rounded-[2.5rem] border border-neutral-100 bg-neutral-50/30 hover:bg-white hover:border-neutral-200 hover:shadow-xl hover:shadow-neutral-100/50 transition-all duration-300 group">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-[#2D3C59]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2D3C59] transition-colors duration-300">
                    <HelpCircle className="w-6 h-6 text-[#2D3C59] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2D3C59] mb-4">{faq.q}</h3>
                    <p className="text-neutral-600 leading-relaxed font-light">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-400 mb-3 block">Investasi Cerdas</span>
            <h2 className="text-4xl md:text-6xl font-bold text-[#2D3C59] mb-6 tracking-tight">Pilih Paket Langganan</h2>
            <p className="text-neutral-500 text-xl max-w-2xl mx-auto font-light">
              Solusi all-in-one dengan harga yang sangat terjangkau.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Split Exclusive Plan */}
            <div className="bg-white rounded-[3rem] border border-neutral-200 flex flex-col-reverse md:flex-row shadow-2xl shadow-neutral-200/50 relative overflow-hidden group hover:border-[#2D3C59]/30 transition-colors duration-500">

              {/* Left Side: Features */}
              <div className="flex-1 p-10 md:p-14 md:border-r border-neutral-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#2D3C59] rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#2D3C59]">WhatsApp AI Master</h3>
                </div>

                <p className="text-neutral-500 mb-10 text-lg leading-relaxed font-light">
                  Solusi lengkap untuk otomatisasi bantuan internal WhatsApp. AI pintar yang siap melayani staf Anda 24/7 tanpa henti.
                </p>

                <ul className="grid sm:grid-cols-2 gap-y-5 gap-x-8 text-left w-full">
                  {[
                    'Integrasi WhatsApp API',
                    'Latih AI Data Produk Sendiri',
                    'Respon Otomatis 24 Jam',
                    'Dashboard Kontrol',
                    'Unlimited Chat & Database',
                    'Efisiensi Operasional Staf',
                    'Update Data Real-time',
                    'Support Prioritas'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#2D3C59] flex-shrink-0" />
                      <span className="text-neutral-700 font-medium text-sm md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: Price & CTA */}
              <div className="w-full md:w-[400px] p-10 md:p-14 bg-neutral-50/50 flex flex-col justify-center items-center text-center border-b md:border-b-0 border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D3C59]/5 rounded-bl-full -mr-16 -mt-16"></div>

                <div className="mb-10 relative z-10 text-center">
                  <div className="inline-block px-3 py-1 bg-[#2D3C59] text-white text-[10px] font-bold rounded-full mb-4 animate-bounce">
                    PROMO PERILISAN
                  </div>
                  <span className="text-neutral-400 text-xs uppercase font-bold tracking-widest block mb-3">Biaya Langganan</span>
                  <div className="flex flex-col items-center justify-center whitespace-nowrap">
                    <span className="text-neutral-400 text-sm line-through opacity-50 mb-1">Rp 499.000</span>
                    <span className="text-5xl font-black text-[#2D3C59] tracking-tighter">Rp 200.000</span>
                  </div>
                  <span className="text-neutral-400 text-sm font-medium">Rupiah / bulan</span>
                </div>



                <a
                  href="https://chatbot.nusavite.com/register"
                  className="w-full py-5 rounded-xl bg-[#2D3C59] text-white font-bold text-lg text-center hover:bg-[#1e293b] transition-all transform hover:scale-[1.02] shadow-xl shadow-[#2D3C59]/20"
                >
                  Dapatkan Akses
                </a>

                <p className="mt-8 text-neutral-400 text-xs font-medium">
                  Support Bisnis, Kantor & UMKM.<br />Efisiensi staf terjamin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Dark Style */}
      <section className="bg-[#2D3C59] pt-24 pb-12 rounded-t-[3rem] mx-4 lg:mx-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-1 bg-white/20 mx-auto mb-12 rounded-full"></div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tighter">Siap Automasi Bisnis?</h2>
          <p className="text-white/60 mb-12 text-xl font-light max-w-2xl mx-auto">
            Mulai trial gratis 5 hari dan rasakan bagaimana AI membantu menangani pertanyaan internal Anda.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://chatbot.nusavite.com/register"
              className="px-10 py-4 bg-white text-[#2D3C59] rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Coba Gratis Sekarang
            </a>
            <a
              href="https://wa.me/62895402945495"
              target="_blank"
              rel="noreferrer"
              className="px-10 py-4 bg-[#2D3C59] text-white border border-white/20 hover:border-white rounded-full font-bold text-lg transition-all"
            >
              Konsultasi Dulu
            </a>
          </div>
          <div className="mt-24">
            {/* Partnership Logos with Infinite Scroll */}
            <div className="flex flex-col items-center mb-16 px-4 overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8">Official Partners & Infrastructure</p>

              <div className="relative w-full overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap w-max gap-12 md:gap-24 items-center">
                  {/* Original Logos */}
                  <PartnerLogos />
                  {/* Duplicated Logos for Seamless Loop */}
                  <PartnerLogos />
                </div>
              </div>

              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                  animation: marquee 30s linear infinite;
                }
              `}} />
            </div>

            <div className="pt-20 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
                {/* Brand & Legal Name */}
                <div className="md:col-span-2">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto mb-6 brightness-0 invert opacity-80" />
                  <div className="text-white text-sm font-bold tracking-widest uppercase mb-2">
                    MUHAMMAD ZAKY VAN GOBEL
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs font-light">
                    Solusi asisten AI pintar untuk mengotomatisasi SOP dan layanan operasional bisnis Anda 24/7.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-6">Navigasi</h4>
                  <ul className="space-y-4 text-sm font-medium text-white/70">
                    <li><a href="#how-it-works" className="hover:text-white transition-colors">Cara Kerja</a></li>
                    <li><a href="#features" className="hover:text-white transition-colors">Fitur Utama</a></li>
                    <li><a href="#pricing" className="hover:text-white transition-colors">Harga Paket</a></li>
                  </ul>
                </div>

                {/* Contact & Legal */}
                <div>
                  <h4 className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-6">Hubungi Kami</h4>
                  <ul className="space-y-4 text-sm font-medium text-white/70">
                    <li className="break-all">nusavite06@gmail.com</li>
                    <li>+62 895-4029-45495</li>
                    <li className="text-white/40 font-light italic">Kotamobagu, Sulawesi Utara</li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <a href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
                  <a href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</a>
                </div>

                <div className="text-white/20 text-[10px] font-black tracking-widest uppercase">
                  &copy; {new Date().getFullYear()} Nusavite.com • All Rights Reserved
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
