import { getDb } from './lib/db.js';

export default async function handler(req: any, res: any) {
    // 1. Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, history, businessContext, userId } = req.body || {};

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        let finalContext = businessContext;

        // Fetch context from DB if userId is present (Source of Truth)
        if (userId) {
            try {
                const db = getDb();
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const productsSnap = await db.collection('users').doc(userId).collection('products').get();
                    const products = productsSnap.docs.map(d => d.data());

                    finalContext = {
                        name: userData?.businessName || finalContext?.name || 'Bisnis Kami',
                        description: userData?.businessDescription || finalContext?.description || 'UMKM Indonesia.',
                        instagram: userData?.instagram || finalContext?.instagram || '',
                        facebook: userData?.facebook || finalContext?.facebook || '',
                        businessEmail: userData?.businessEmail || finalContext?.businessEmail || '',
                        products: products.length > 0 ? products : (finalContext?.products || [])
                    };
                }
            } catch (dbErr) {
                console.error('Error fetching context from DB:', dbErr);
                // Fallback to what was passed in body
            }
        }

        if (!finalContext) {
            return res.status(400).json({ error: 'Missing businessContext or userId' });
        }

        // 2. Get API Key safely
        const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured.' });
        }

        // 3. Prepare System Instructions
        const productList = (finalContext?.products || [])
            .map((p: any) => `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
            .join('\n');

        const systemInstructions = `
Anda adalah Customer Service untuk "${finalContext?.name || "Bisnis Kami"}".
Waktu saat ini: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
Deskripsi Bisnis: ${finalContext?.description || "UMKM Indonesia."}
Kontak & Sosmed:
- Instagram: ${finalContext?.instagram || "-"}
- Facebook: ${finalContext?.facebook || "-"}
- Email: ${finalContext?.businessEmail || "-"}

Daftar Produk/Layanan:
${productList || "Hubungi kami untuk informasi lengkap."}

Tugas: Jawab pertanyaan pelanggan dengan ramah, singkat, dan gunakan data di atas. Jangan mengarang informasi.
Gunakan gaya bahasa yang akrab (Kak/Sist). Jika tidak tahu jawabannya, arahkan ke kontak admin.
`.trim();

        const messages = [
            { role: "system", content: systemInstructions },
            ...(history || []).map((h: any) => ({
                role: h.role === "user" ? "user" : "assistant",
                content: h.text
            })),
            { role: "user", content: message }
        ];

        // 4. Call Mistral API
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
            return res.status(500).json({ error: `Mistral Error: ${data.error.message}` });
        }

        const reply = data.choices?.[0]?.message?.content || "Maaf, saya tidak mendapatkan jawaban.";
        return res.status(200).json({ reply });

    } catch (error: any) {
        console.error('Chat API Fatal Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
