
/**
 * Generate business-type-specific system prompt in appropriate language
 */
function getSystemPrompt(
    businessContext: {
        name: string;
        description: string;
        products: any[];
        faqs?: any[];
        documents?: { name: string; url: string }[];
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

    const documentList = (businessContext.documents || [])
        .map(d => `- [Download ${d.name}](${d.url})`)
        .join('\n');

    const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Clinic Internal Assistant System Prompt (Indonesian)
    return `
Anda adalah "Sopia", asisten pintar untuk "${businessContext.name}". 

IDENTITAS & GAYA BAHASA:
- Nama Anda adalah Sopia.
- Anda adalah asisten yang cerdas, ramah, dan sangat natural (seperti asisten Gemini asli).
- Berikan sapaan dan jawaban yang mengalir secara alami, tulus, dan membantu tanpa terikat template kaku.
- Jika ditanya siapa namamu, jawablah dengan gaya bahasa yang natural bahwa kamu adalah Sopia, asisten mereka.
- Anda adalah pusat informasi SOP, kebijakan internal, dan asisten kerja yang profesional namun tetap nyaman untuk diajak berkomunikasi.

TUJUAN ANDA:
1. Memberikan jawaban yang AKURAT dan CEPAT berdasarkan Knowledge Base klinis yang tersedia.
2. Membantu efisiensi kerja karyawan sehingga mereka tidak perlu mencari dokumen manual.
3. Menjadi sumber rujukan informasi internal yang terpercaya.

INFORMASI KLINIK & SOP (KNOWLEDGE BASE):
${businessContext.description || "Kami adalah layanan kesehatan profesional."}

DAFTAR SOP / LAYANAN / PRODUK:
${productList || "Belum ada data SOP/Produk tersimpan."}

INFORMASI TAMBAHAN / FAQ INTERNAL:
${faqList || "Belum ada FAQ internal."}

DOKUMEN & FILE SOP (DOWNLOADABLE):
${documentList || "Belum ada dokumen yang bisa diunduh."}
Jika karyawan menanyakan file atau dokumen tertentu, berikan LINK DOWNLOAD di atas secara eksplisit menggunakan format Markdown link.

Waktu saat ini: ${currentTime}

ATURAN KOMUNIKASI:
1. Jawablah seolah-olah Anda adalah Sopia, asisten pintar yang ramah namun tetap profesional.
2. Gunakan bahasa Indonesia yang profesional namun tetap nyaman untuk rekan kerja.
3. JIKA PERTANYAAN TIDAK ADA DI KNOWLEDGE BASE: Katakan sejujurnya bahwa Anda tidak menemukan informasi tersebut di SOP saat ini dan sarankan untuk bertanya langsung ke Manajer atau Admin.
4. JANGAN membuat-buat aturan atau SOP yang tidak ada di data yang diberikan.
5. Fokuslah pada detail teknis prosedural jika ditanyakan.

STRUKTUR JAWABAN:
- Langsung ke poin masalah.
- Teratur (gunakan bullet points jika menjelaskan langkah-langkah).
- Berikan penekanan pada poin-poin krusial atau peringatan (WARNING) jika ada di SOP.

Ingat: Anda adalah Sopia, Anda membantu karyawan agar pelayanan ke pasien menjadi lebih efisien.
`.trim();
}


/**
 * Post-process AI response to fix common formatting issues and handle LEAD_DATA securely
 */
function formatAIResponse(text: string): string {
    let formatted = text;

    // Handle LEAD_DATA securely by removing it from the response to the user
    // The LEAD_DATA should be processed separately by the application, not shown to users
    const leadDataRegex = /:::LEAD_DATA=\{[^}]*\}:::/g;
    formatted = formatted.replace(leadDataRegex, '');

    return formatted;
}

export async function generateAIResponse(
    userMessage: string,
    businessContext: {
        name: string;
        description: string;
        products: any[];
        faqs?: any[];
        documents?: { name: string; url: string }[];
        instagram?: string;
        facebook?: string;
        businessEmail?: string;
        businessType?: 'retail' | 'medical'; // Add business type
    },
    history: { role: string; text: string }[]
) {
    const geminiKey = (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
    const mistralKey = (typeof process !== 'undefined' ? (process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY) : (import.meta as any).env?.VITE_MISTRAL_API_KEY) || '';
    const openrouterKey = (typeof process !== 'undefined' ? (process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY) : (import.meta as any).env?.VITE_OPENROUTER_API_KEY) || '';


    // Use specialized clinic system prompt
    const systemInstructions = getSystemPrompt(businessContext);


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

            console.warn("Gemini empty response, falling back...");
        } catch (error) {
            console.error("Gemini Error:", error);
        }
    }

    // 2. Try OpenRouter (Llama 3.3 70B Free)
    if (openrouterKey.trim()) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openrouterKey.trim()}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://nusavite.vercel.app", // Optional for OpenRouter
                    "X-Title": "ChatBot UMKM AI"
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3.3-70b-instruct:free",
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
            const content = data.choices?.[0]?.message?.content;
            if (content) return formatAIResponse(content);

            console.warn("OpenRouter empty response, falling back to Mistral...");
        } catch (error) {
            console.error("OpenRouter Error:", error);
        }
    }

    // 3. Fallback to Mistral
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

/**
 * Extract LEAD_DATA from AI response for secure processing
 */
export function extractLeadData(aiResponse: string) {
    const leadDataRegex = /:::LEAD_DATA=(\{[^}]*\}):::/;
    const match = aiResponse.match(leadDataRegex);

    if (match && match[1]) {
        try {
            const leadData = JSON.parse(match[1]);
            return leadData;
        } catch (error) {
            console.error("Error parsing LEAD_DATA:", error);
            return null;
        }
    }

    return null;
}
