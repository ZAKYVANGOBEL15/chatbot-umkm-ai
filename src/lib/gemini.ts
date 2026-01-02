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
        instagram?: string;
        facebook?: string;
        businessEmail?: string;
    },
    history: { role: string; text: string }[]
) {
    // Get API key safely for both Server (Node) and Client (Browser)
    let apiKey = '';

    if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY || '';
    }

    // Fallback for browser environment (Vite)
    if (!apiKey && typeof window !== 'undefined') {
        // @ts-ignore
        const meta = import.meta as any;
        apiKey = meta.env?.VITE_MISTRAL_API_KEY || '';
    }

    if (!apiKey) {
        return "Error: API Key Mistral belum dikonfigurasi. Hubungi Admin.";
    }

    const productList = (businessContext.products || [])
        .map(p => `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
        .join('\n');

    const systemInstructions = `
Anda adalah Customer Service untuk "${businessContext.name}".
Waktu saat ini: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
Deskripsi Bisnis: ${businessContext.description || "UMKM Indonesia."}

Kontak & Sosmed:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Daftar Produk/Layanan:
${productList || "Hubungi kami untuk informasi produk lengkap."}

Tugas Utama & Etika Percakapan:
1. ALUR PERCAKAPAN NATURAL:
   - Jika pelanggan hanya menyapa (contoh: "Halo", "P", "Siang"), balas dengan sapaan ramah SAJA. JANGAN langsung memberikan daftar layanan panjang kecuali ditanya.
   - Contoh: "Halo Kak! Ada yang bisa kami bantu hari ini? 😊"
2. REKOMENDASI TEPAT SASARAN:
   - Berikan informasi layanan HANYA yang relevan dengan keluhan/pertanyaan pelanggan. 
   - Jika pelanggan mengeluh "muka kusam", berikan 2-3 pilihan layanan pencerah saja, jangan semua menu.
3. ATURAN LEAD GENERATION (SANGAT PENTING):
   - JANGAN meminta Nama/WhatsApp jika pelanggan baru bertanya informasi umum, harga, atau sekadar konsultasi ringan.
   - Jika belum ada niat booking, cukup jawab pertanyaannya dengan informatif dan ramah agar klien tidak merasa terpaksa.
   - Setiap jawaban konsultasi/info HARUS ditutup dengan kalimat penutup yang informatif:
     "Jika Kakak ingin tahu info harga atau konsultasi, silakan hubungi kami di ${businessContext.facebook || 'WhatsApp Kami'} atau cek ${businessContext.instagram ? 'IG ' + businessContext.instagram : 'media sosial kami'}. Tapi kalau Kakak sudah ingin booking, langsung kirim Nama & Nomor WA di sini ya!"
   - HANYA minta Nama & Nomor WhatsApp secara eksklusif JIKA pelanggan secara eksplisit menyatakan ingin: "Booking", "Daftar", "Konsultasi ke Dokter", atau "Beli".
4. JIKA (dan hanya jika) pelanggan sudah siap booking dan memberikan Nama & Nomor WhatsApp:
   a. WAJIB sertakan :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]"}::: di akhir jawaban.
   b. Konfirmasi bahwa data telah diterima dan tim akan menghubungi mereka.

5. FORMATTING:
   - Gunakan gaya bahasa akrab (Kak/Sist).
   - Gunakan Bullet points (1., 2.) jika menyebutkan daftar agar rapi.
   - Bold nama produk (**Nama Produk**).
`.trim();

    try {
        const messages = [
            { role: "system", content: systemInstructions },
            ...history.map(h => ({
                role: h.role === "user" ? "user" : "assistant",
                content: h.text
            })),
            { role: "user", content: userMessage }
        ];

        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistral-small-latest",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Mistral Error:", data.error);
            return `Maaf, terjadi masalah pada layanan AI: ${data.error.message || "Unknown error"}`;
        }

        return data.choices?.[0]?.message?.content || "Maaf, saya tidak mendapatkan jawaban.";
    } catch (error: any) {
        console.error("AI Fetch Error:", error);
        return `Maaf, gagal menyambung ke otak AI. (${error.message})`;
    }
}
