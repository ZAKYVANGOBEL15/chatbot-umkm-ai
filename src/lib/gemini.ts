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

2. ALUR PERCAKAPAN NATURAL:
   - Jika pelanggan hanya menyapa (contoh: "Halo", "P", "Siang"), balas dengan sapaan ramah SAJA. JANGAN langsung memberikan daftar layanan panjang kecuali ditanya.
   - Contoh: "Halo Kak! Ada yang bisa kami bantu hari ini? 😊"

3. REKOMENDASI TEPAT SASARAN:
   - Berikan informasi layanan HANYA yang relevan dengan pertanyaan pelanggan.
   - Singkat, padat, dan jelas. Jangan memberikan jawaban yang terlalu panjang jika tidak diperlukan.

5. ATURAN LEAD GENERATION & CLOSING:
   - JIKA pelanggan bertanya hal umum (Jam buka, Lokasi, COD), JANGAN langsung meminta data diri secara agresif. Cukup berikan informasi dan tawarkan bantuan lain.
   - JANGAN meminta Nama/WhatsApp jika pelanggan baru bertanya "Apa itu?", "Harga berapa?".
   - HANYA jika pelanggan terlihat berminat serius (misal: "Cara pesannya gimana?", "Mau booking dong", "Ada slot kosong?"), barulah arahkan untuk mengisi data:
     "Untuk memproses pesanan/booking, bolehkah kami minta Nama & Nomor WhatsApp Kakak?"
   - Jika jawaban Anda berupa PENOLAKAN (misal: "Maaf tidak bisa COD", "Produk habis"), JANGAN minta data diri. Cukup arahkan ke Admin atau Sosmed.
   - Contoh Closing Santai (Default): "Jika ada yang ingin ditanyakan lagi, jangan ragu chat kami ya Kak!"
   - Contoh Closing Order (Hanya jika niat beli): "Kalau Kakak berminat, langsung tulis Nama & Nomor WA di sini ya untuk kami data."
5. JIKA pelanggan memberikan Nama & Nomor WhatsApp untuk booking:
   - WAJIB sertakan :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]"}::: di akhir jawaban.


6. FORMATTING:
   - Gunakan gaya bahasa ramah dan profesional (Kak/Sist).
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
