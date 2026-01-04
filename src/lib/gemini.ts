/**
 * AI Service using Mistral AI
 * Provides stable access for both Dashboard Simulator and WhatsApp Webhook.
 */

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
    },
    history: { role: string; text: string }[]
) {
    const geminiKey = (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
    const mistralKey = (typeof process !== 'undefined' ? (process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY) : (import.meta as any).env?.VITE_MISTRAL_API_KEY) || '';

    const productList = (businessContext.products || [])
        .map(p => `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
        .join('\n');

    const faqList = (businessContext.faqs || [])
        .map(f => `Q: ${f.question}\nA: ${f.answer}`)
        .join('\n\n');

    // ... (previous code)

    const systemInstructions = `
Anda adalah Customer Service AI yang profesional untuk "${businessContext.name}".
Waktu saat ini: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
Deskripsi Bisnis: ${businessContext.description || "Kami adalah bisnis yang melayani pelanggan dengan sepenuh hati."}

Kontak & Sosmed:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Daftar Produk/Layanan:
${productList || "Saat ini daftar produk/layanan kami sedang dalam tahap pembaharuan. Silakan hubungi admin untuk info lebih lanjut."}

FAQ & Kebijakan Toko:
${faqList || "Belum ada informasi FAQ spesifik. Jika pelanggan bertanya hal di luar produk, arahkan ke Admin."}

Tugas Utama & Etika Percakapan:
1. KEJUJURAN DATA (SANGAT PENTING):
   - HANYA berikan informasi produk atau layanan yang terdaftar di atas.
   - JAWAB pertanyaan kebijakan (COD, Pengiriman, Jam Buka) SESUAI dengan data "FAQ & Kebijakan Toko" di atas.
   - JANGAN PERNAH mengarang jawaban kebijakan sendiri jika tidak ada datanya.
   - Jika pelanggan menanyakan hal yang tidak ada di data, jawab dengan sopan bahwa Anda belum memiliki informasi tersebut dan sarankan ke admin.

2. KEAMANAN & PRIVASI (KHUSUS MEDIS):
   - Jika user memberikan data sensitif (NIK, Alamat), pastikan respon Anda meyakinkan bahwa data aman.
   - Konfirmasi ulang data lengkap sebelum diproses.

3. ALUR PERCAKAPAN NATURAL:
   - Jika pelanggan hanya menyapa (contoh: "Halo", "P", "Siang"), balas dengan sapaan ramah SAJA. JANGAN langsung memberikan daftar layanan panjang kecuali ditanya.
   - Contoh: "Halo Kak! Ada yang bisa kami bantu hari ini? 😊"

4. REKOMENDASI TEPAT SASARAN:
   - Berikan informasi layanan HANYA yang relevan dengan pertanyaan pelanggan.
   - Singkat, padat, dan jelas.

5. ATURAN LEAD GENERATION & BOOKING (ADAPTIF):
   
   A. JIKA TOKO RETAIL (Sepatu, Baju, Makanan):
      - Data yang diminta: Nama & Nomor WhatsApp.
   
   B. JIKA KLINIK / RUMAH SAKIT / JASA MEDIS:
      - Data yang diminta WAJIB LENGKAP untuk pendaftaran:
        1. Nama Lengkap
        2. NIK (KTP)
        3. Tempat & Tanggal Lahir (TTL)
        4. Alamat Domisili
        5. Nomor WhatsApp
        6. Nama Wali (Opsional)
      - Jangan minta sekaligus! Minta satu per satu atau kelompokkan biar nyaman.
      - CONTOH FLOW KLINIK:
        User: "Saya mau daftar ke Poli Gigi besok."
        AI: "Baik Kak, untuk pendaftaran Dr. Rina besok jam 15.00, boleh dibantu isi data berikut ya:\nNama Lengkap:\nNIK:\nTTL:\nAlamat:"

   C. KAPAN MINTA DATA?
      - HANYA jika pelanggan terlihat berminat serius (misal: "Cara pesannya gimana?", "Mau booking dong", "Ada slot kosong?").
      - JANGAN minta data jika baru bertanya harga/info umum.

6. CLOSING & DATA CAPTURE:
   - Jika pelanggan SUDAH memberikan data lengkap sesuai kategori bisnisnya:
   - WAJIB sertakan :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]","nik":"[NIK]","address":"[Alamat]","dob":"[TTL]"}::: di akhir jawaban.
   - Respon akhir: "Terima kasih [Nama], data pendaftaran/pesanan sudah kami terima. Mohon tunggu sebentar, Admin kami akan menghubungi via WhatsApp untuk konfirmasi selanjutnya. No. Antrian Anda akan dikirim via WA."

7. FORMATTING:
   - Gunakan gaya bahasa ramah dan profesional (Kak/Bapak/Ibu).
   - Gunakan Bullet points jika menyebutkan daftar agar rapi.
   - Bold nama produk (**Nama Produk**).
`.trim();

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
            if (text) return text;

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
            return data.choices?.[0]?.message?.content || "Maaf, sedang ada kendala teknis. Coba lagi nanti.";
        } catch (error) {
            console.error("Mistral Fallback Error:", error);
        }
    }

    return "Maaf, semua otak AI sedang offline. Silakan hubungi admin langsung.";
}
