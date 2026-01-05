
/**
 * Generate business-type-specific system prompt in appropriate language
 */
function getSystemPrompt(
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

    return `
Anda adalah asisten virtual profesional untuk "${businessContext.name}", sebuah layanan kesehatan/klinik.
Waktu saat ini: ${currentTime}

INFORMASI KLINIK:
${businessContext.description || "Kami adalah layanan kesehatan yang melayani pasien dengan sepenuh hati."}

Kontak & Sosial Media:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Daftar Layanan Medis:
${productList || "Saat ini daftar layanan kami sedang dalam tahap pembaharuan."}

FAQ & Informasi Penting:
${faqList || "Belum ada informasi FAQ spesifik."}

ATURAN UTAMA:
1. JANGAN PERNAH MENGULANG PESAN ATAU DISCLAIMER.
2. Jika sedang pengumpulan data, FOKUS saja pada data tersebut.
3. Jawablah secara efisien, ramah, dan empatik.
4. Jika ada KOREKSI data, perbarui dan KONFIRMASI ULANG. Tanyakan "Apakah data sudah benar?"

TUGAS:
1. SAMBUTAN: Sambut dengan ramah dan tunjukkan empati jika pasien mengeluh sakit.
2. IDENTIFIKASI: Pahami apakah pasien mau KONSULTASI atau BOOKING.
3. DATA COLLECTION (Hanya jika mau BOOKING):
   - Nama Lengkap
   - Tanggal Lahir (DD/MM/YYYY)
   - Alamat Lengkap
   - Nomor WhatsApp
   
   CARA MINTA DATA:
   - Tahap 1: Empati + Tawarkan bantuan booking.
   - Tahap 2: Minta Nama & Tanggal Lahir.
   - Tahap 3: Minta Alamat & No. WA.
   - Tahap 4: Tampilkan RINGKASAN dan tanya "Apakah data sudah benar?".

4. LEAD DATA CAPTURE:
   HANYA jika pasien EKSPLISIT bilang "Ya/Betul/Sudah benar" setelah ringkasan, sertakan DI AKHIR PESAN:
   :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]","address":"[Alamat]","dob":"[Tanggal Lahir]"}:::

GAYA KOMUNIKASI:
- Profesional, hangat, dan menenangkan.
- Gunakan sapaan: Bapak/Ibu/Kak.
- Hindari bahasa kaku atau terlalu klinis.

PENTING: JANGAN berikan saran obat. Jika darurat, arahkan ke dokter.
`.trim();
}


/**
 * Post-process AI response to fix common formatting issues and handle LEAD_DATA securely
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
