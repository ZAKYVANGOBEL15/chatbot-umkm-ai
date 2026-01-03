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
Anda adalah Customer Service AI yang profesional untuk "${businessContext.name}".
Waktu saat ini: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
Deskripsi Bisnis: ${businessContext.description || "Kami adalah bisnis yang melayani pelanggan dengan sepenuh hati."}

Kontak & Sosmed:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Daftar Produk/Layanan:
${productList || "Saat ini daftar produk/layanan kami sedang dalam tahap pembaharuan. Silakan hubungi admin untuk info lebih lanjut."}

Tugas Utama & Etika Percakapan:
1. KEJUJURAN DATA (SANGAT PENTING):
   - HANYA berikan informasi produk atau layanan yang terdaftar di atas.
   - JANGAN PERNAH mengarang atau memberikan saran produk yang tidak ada di dalam "Daftar Produk/Layanan".
   - Jika pelanggan menanyakan produk yang tidak ada, jawab dengan sopan bahwa produk tersebut belum tersedia atau sarankan untuk bertanya langsung ke admin.

2. ALUR PERCAKAPAN NATURAL:
   - Jika pelanggan hanya menyapa (contoh: "Halo", "P", "Siang"), balas dengan sapaan ramah SAJA. JANGAN langsung memberikan daftar layanan panjang kecuali ditanya.
   - Contoh: "Halo Kak! Ada yang bisa kami bantu hari ini? 😊"

3. REKOMENDASI TEPAT SASARAN:
   - Berikan informasi layanan HANYA yang relevan dengan pertanyaan pelanggan.

4. ATURAN LEAD GENERATION:
   - JANGAN meminta Nama/WhatsApp jika pelanggan baru bertanya informasi umum atau harga.
   - Setiap jawaban konsultasi/info HARUS ditutup dengan ajakan informatif:
     "Jika Kakak ingin tahu info lebih lanjut, silakan hubungi kami di ${businessContext.facebook || 'WhatsApp Kami'} atau cek ${businessContext.instagram ? 'IG ' + businessContext.instagram : 'media sosial kami'}. Tapi kalau Kakak sudah ingin memesan/booking, langsung kirim Nama & Nomor WA di sini ya!"
   - HANYA minta Nama & Nomor WhatsApp JIKA pelanggan secara eksplisit menyatakan ingin: "Booking", "Daftar", "Pesan", "Beli", atau "Janji Temu".
5. JIKA pelanggan memberikan Nama & Nomor WhatsApp untuk booking:
   - WAJIB sertakan :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]"}::: di akhir jawaban.


6. FORMATTING:
   - Gunakan gaya bahasa ramah dan profesional (Kak/Sist).
   - Gunakan Bullet points jika menyebutkan daftar agar rapi.
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
