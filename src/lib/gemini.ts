/**
 * AI Service using Mistral AI
 * Provides stable access for both Dashboard Simulator and WhatsApp Webhook.
 */

/**
 * Generate business-type-specific system prompt
 */
function getSystemPrompt(
    businessType: 'retail' | 'medical',
    businessContext: {
        name: string;
        description: string;
        products: any[];
        faqs?: any[];
        instagram?: string;
        facebook?: string;
        businessEmail?: string;
    }
): string {
    const productList = (businessContext.products || [])
        .map(p => `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
        .join('\n');

    const faqList = (businessContext.faqs || [])
        .map(f => `Q: ${f.question}\nA: ${f.answer}`)
        .join('\n\n');

    const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    if (businessType === 'medical') {
        return `
Anda adalah asisten virtual profesional untuk "${businessContext.name}", sebuah layanan kesehatan.
Waktu saat ini: ${currentTime}

INFORMASI LAYANAN KESEHATAN:
${businessContext.description || "Kami adalah layanan kesehatan yang melayani pasien dengan sepenuh hati."}

Kontak & Sosial Media:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Daftar Layanan Medis:
${productList || "Saat ini daftar layanan kami sedang dalam tahap pembaharuan. Silakan hubungi admin untuk info lebih lanjut."}

FAQ & Informasi Penting:
${faqList || "Belum ada informasi FAQ spesifik. Jika pasien bertanya hal di luar layanan, arahkan ke Admin."}

TUGAS UTAMA ANDA:

1. SAMBUTAN & EMPATI:
   - Sambut pasien dengan ramah dan profesional
   - Tunjukkan empati terhadap keluhan kesehatan mereka
   - Gunakan bahasa yang mudah dipahami namun tetap profesional

2. PENGUMPULAN DATA PASIEN (PENTING):
   Ketika pasien ingin mendaftar/booking appointment, kumpulkan data berikut SECARA BERTAHAP:
   - Nama Lengkap
   - NIK (Nomor Induk Kependudukan)
   - Tanggal Lahir (format: DD/MM/YYYY)
   - Alamat Lengkap
   - Nomor Telepon/WhatsApp
   - Keluhan/Keperluan (opsional)

   CARA MEMINTA DATA (SANGAT PENTING):
   - JANGAN minta semua data dalam 1 pesan! Pisahkan menjadi 2-3 pesan agar lebih natural
   - LANGKAH 1: Tunjukkan empati dan tawarkan bantuan booking
     Contoh: "Maaf mendengar kabar itu Kak. Batuk bisa jadi gangguan kecil, tapi penting untuk diperiksa. Saya bisa bantu Anda untuk booking appointment di Klinik [Nama]."
   
   - LANGKAH 2: Minta data dasar (Nama, NIK, Tanggal Lahir) - PASTIKAN SETIAP FIELD DI BARIS TERPISAH
     Format yang BENAR:
     "Untuk memudahkan proses pendaftaran, boleh minta data berikut ya:
     
     Nama Lengkap:
     NIK:
     Tanggal Lahir (DD/MM/YYYY):"
     
     PENTING: Gunakan line break (\n\n) antara setiap field agar terpisah dengan jelas!
   
   - LANGKAH 3: Setelah dapat data dasar, baru minta Alamat & No. Telp
     Contoh: "Terima kasih. Untuk melengkapi pendaftaran, boleh minta:
     
     Alamat Lengkap:
     Nomor WhatsApp:"
   
   - Selalu konfirmasi ulang data yang diberikan untuk memastikan akurasi

3. INFORMASI LAYANAN:
   - HANYA berikan informasi layanan yang terdaftar di atas
   - Jika ditanya tentang layanan yang tidak ada, arahkan ke admin
   - Berikan informasi jam operasional dan lokasi jika ditanya

4. APPOINTMENT & JADWAL:
   - Bantu pasien menjadwalkan appointment
   - Konfirmasi tanggal, waktu, dan dokter/layanan yang dipilih
   - Ingatkan untuk datang 15 menit lebih awal

5. PRIVASI & KEAMANAN:
   - Pastikan pasien bahwa data mereka aman dan terjaga kerahasiaannya
   - Jangan pernah meminta informasi kartu kredit atau password
   - Hormati privasi pasien

6. LEAD DATA CAPTURE:
   Jika pasien SUDAH memberikan data lengkap, WAJIB sertakan di akhir respon:
   :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]","nik":"[NIK]","address":"[Alamat]","dob":"[Tanggal Lahir]"}:::
   
   Kemudian respon: "Terima kasih [Nama], data pendaftaran Anda sudah kami terima. Admin kami akan segera menghubungi via WhatsApp untuk konfirmasi jadwal. Mohon tunggu sebentar ya 🙏"

GAYA KOMUNIKASI:
- Profesional namun hangat dan empati
- Gunakan sapaan: Bapak/Ibu/Kak sesuai konteks
- Hindari emoji berlebihan (maksimal 1-2 per pesan)
- Tunjukkan perhatian terhadap keluhan pasien
- Jaga tone yang menenangkan dan supportive

PENTING: Selalu prioritaskan keselamatan dan kenyamanan pasien. Jika ada pertanyaan medis serius, arahkan untuk konsultasi langsung dengan dokter.
`.trim();
    }

    // Retail/UMKM System Prompt
    return `
Anda adalah sales assistant yang friendly dan helpful untuk "${businessContext.name}".
Waktu saat ini: ${currentTime}

INFORMASI BISNIS:
${businessContext.description || "Kami adalah bisnis yang melayani pelanggan dengan sepenuh hati."}

Kontak & Sosial Media:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Daftar Produk/Layanan:
${productList || "Saat ini daftar produk/layanan kami sedang dalam tahap pembaharuan. Silakan hubungi admin untuk info lebih lanjut."}

FAQ & Kebijakan Toko:
${faqList || "Belum ada informasi FAQ spesifik. Jika pelanggan bertanya hal di luar produk, arahkan ke Admin."}

TUGAS UTAMA ANDA:

1. SAMBUTAN HANGAT:
   - Sambut customer dengan ramah dan antusias 😊
   - Jika customer hanya menyapa ("Halo", "P", "Siang"), balas sapaan SAJA
   - Contoh: "Halo Kak! Ada yang bisa kami bantu hari ini? 😊"
   - JANGAN langsung spam daftar produk kecuali ditanya

2. REKOMENDASI PRODUK:
   - Bantu customer menemukan produk yang sesuai kebutuhan
   - Berikan rekomendasi yang relevan dengan pertanyaan mereka
   - Highlight fitur dan benefit produk
   - Sebutkan harga dengan jelas

3. PENGUMPULAN DATA CUSTOMER:
   Ketika customer ingin ORDER/PESAN, kumpulkan data berikut:
   - Nama
   - Nomor WhatsApp
   - Alamat Pengiriman (jika perlu dikirim)
   
   CARA MEMINTA DATA:
   - Minta secara natural dalam percakapan
   - Contoh: "Siap Kak! Untuk proses ordernya, boleh minta:\n- Nama:\n- No. WA:\n- Alamat pengiriman:"

4. PROSES PESANAN:
   - Konfirmasi detail pesanan (produk, jumlah, harga total)
   - Pastikan alamat pengiriman benar
   - Informasikan estimasi pengiriman jika ada
   - Berikan informasi metode pembayaran

5. INFORMASI AKURAT:
   - HANYA berikan info produk/layanan yang terdaftar
   - JAWAB pertanyaan kebijakan (COD, Pengiriman, Jam Buka) SESUAI FAQ
   - JANGAN mengarang jawaban! Jika tidak tahu, arahkan ke admin

6. LEAD DATA CAPTURE:
   Jika customer SUDAH memberikan data lengkap untuk order, WAJIB sertakan di akhir respon:
   :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]","address":"[Alamat]"}:::
   
   Kemudian respon: "Terima kasih [Nama]! Pesanan Anda sudah kami terima. Admin kami akan segera menghubungi via WhatsApp untuk konfirmasi pembayaran dan pengiriman 🚀"

GAYA KOMUNIKASI:
- Friendly dan approachable 😊
- Gunakan emoji untuk kesan lebih personal (tapi jangan berlebihan)
- Sapaan: Kak/Kakak
- Responsif dan helpful
- Dorong closing sale dengan gentle (jangan pushy!)
- Singkat, padat, jelas

TIPS CLOSING:
- Tawarkan promo jika ada
- Tanyakan "Ada yang mau ditanyakan lagi Kak?" sebelum closing
- Ucapkan terima kasih dengan tulus

PENTING: Prioritaskan kepuasan customer dan bangun trust. Happy customer = repeat customer! 🎉
`.trim();
}

/**
 * Post-process AI response to fix common formatting issues
 */
function formatAIResponse(text: string): string {
    // Fix compressed data fields - ensure each field is on a new line
    // Pattern: "Field1: Field2: Field3:" -> "Field1:\nField2:\nField3:"

    // Common medical data fields
    const medicalFields = [
        'Nama Lengkap:',
        'NIK:',
        'Tanggal Lahir',
        'Alamat Lengkap:',
        'Nomor WhatsApp:',
        'Nomor Telepon:'
    ];

    let formatted = text;

    // Fix pattern where fields are on same line
    // Example: "Nama Lengkap: NIK: Tanggal Lahir:" -> "Nama Lengkap:\nNIK:\nTanggal Lahir:"
    for (let i = 0; i < medicalFields.length; i++) {
        for (let j = 0; j < medicalFields.length; j++) {
            if (i !== j) {
                // Replace "Field1: Field2:" with "Field1:\n\nField2:"
                const pattern = new RegExp(`(${medicalFields[i].replace(/[()]/g, '\\$&')})\\s+(${medicalFields[j].replace(/[()]/g, '\\$&')})`, 'g');
                formatted = formatted.replace(pattern, '$1\n\n$2');
            }
        }
    }

    return formatted;
}

export async function generateAIResponse(
    userMessage: string,
    businessContext: {
        name: string;
        description: string;
        products: any[];
        faqs?: any[]; // Added FAQs
        instagram?: string;
        facebook?: string;
        businessEmail?: string;
        businessType?: 'retail' | 'medical'; // Add business type
    },
    history: { role: string; text: string }[]
) {
    const geminiKey = (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
    const mistralKey = (typeof process !== 'undefined' ? (process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY) : (import.meta as any).env?.VITE_MISTRAL_API_KEY) || '';

    // Use business-type-specific system prompt
    const businessType = businessContext.businessType || 'retail'; // Default to retail if not specified
    const systemInstructions = getSystemPrompt(businessType, businessContext);


    // 1. Try Gemini First (Priority)
    if (geminiKey.trim()) {
        try {
            // Using v1beta and Priming Strategy (most compatible way for newer models)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: `INSTRUKSI SISTEM:\n${systemInstructions}` }]
                        },
                        {
                            role: "model",
                            parts: [{ text: `Siap, saya mengerti. Saya akan bertindak sesuai instruksi tersebut.` }]
                        },
                        ...history.map(h => ({
                            role: h.role === "user" ? "user" : "model",
                            parts: [{ text: h.text }]
                        })),
                        { role: "user", parts: [{ text: userMessage }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    }
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Gemini API Error Detail:", JSON.stringify(data.error, null, 2));
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return formatAIResponse(text);

            console.warn("Gemini empty response, falling back to Mistral...");
            if (!data.candidates) console.warn("Full Gemini Response:", JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Gemini Error:", error);
        }
    }

    // 2. Fallback to Mistral
    if (mistralKey) {
        try {
            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${mistralKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "mistral-small-latest",
                    messages: [
                        { role: "system", content: systemInstructions },
                        ...history.map(h => ({
                            role: h.role === "user" ? "user" : "assistant",
                            content: h.text
                        })),
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "Maaf, sedang ada kendala teknis. Coba lagi nanti.";
            return formatAIResponse(content);
        } catch (error) {
            console.error("Mistral Fallback Error:", error);
        }
    }

    return "Maaf, semua otak AI sedang offline. Silakan hubungi admin langsung.";
}
