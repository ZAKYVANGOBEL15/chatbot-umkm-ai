/**
 * AI Service using Mistral AI
 * Provides stable access for both Dashboard Simulator and WhatsApp Webhook.
 */

/**
 * Detect if the user is speaking in English
 */
function isEnglish(text: string): boolean {
    // Simple heuristic: if text contains more English words than Indonesian, consider it English
    const englishWords = [
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
        'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
        'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must', 'need', 'want',
        'hello', 'hi', 'good', 'bad', 'help', 'please', 'thank', 'thanks', 'you', 'your',
        'health', 'medical', 'doctor', 'appointment', 'medicine', 'treatment', 'clinic',
        'shop', 'buy', 'purchase', 'product', 'service', 'order', 'price', 'cost', 'money',
        'how', 'what', 'where', 'when', 'who', 'why', 'which', 'this', 'that', 'these', 'those'
    ];

    const textLower = text.toLowerCase();
    const words = textLower.match(/\b\w+\b/g) || [];

    if (words.length === 0) return false;

    let englishCount = 0;
    for (const word of words) {
        if (englishWords.includes(word)) {
            englishCount++;
        }
    }

    // If more than 30% of the words are English, consider the text as English
    return (englishCount / words.length) > 0.3;
}

/**
 * Generate business-type-specific system prompt in appropriate language
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
    },
    isUserEnglish: boolean = false
): string {
    const productList = (businessContext.products || [])
        .map(p => isUserEnglish ?
            `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}` :
            `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
        .join('\n');

    const faqList = (businessContext.faqs || [])
        .map(f => isUserEnglish ?
            `Q: ${f.question}\nA: ${f.answer}` :
            `Q: ${f.question}\nA: ${f.answer}`)
        .join('\n\n');

    const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    if (businessType === 'medical') {
        if (isUserEnglish) {
            return `
You are a professional virtual assistant for "${businessContext.name}", a healthcare service.
Current time: ${currentTime}

HEALTHCARE INFORMATION:
${businessContext.description || "We are a healthcare service that serves patients wholeheartedly."}

Contact & Social Media:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Medical Services List:
${productList || "Currently our service list is being updated. Please contact admin for more information."}

FAQ & Important Information:
${faqList || "No specific FAQ information yet. If patients ask about things outside our services, direct them to Admin."}

IMPORTANT RULES (READ FIRST):
1. NEVER repeat messages or disclaimers you have already delivered in the chat history.
2. If you have already stated that you cannot provide medical advice, DON'T say it again in the following messages.
3. If you are in the process of data collection (Name, ID, etc.), FOCUS only on the data collection. DON'T insert medical disclaimers in the middle of the registration process.
4. Answer efficiently. Don't be verbose.

YOUR MAIN TASKS:

1. GREETING & EMPATHY:
   - Greet patients warmly and professionally
   - Show genuine empathy toward their health concerns
   - Use easy-to-understand, warm, and calming language
   - Show care and attention to patient comfort
   - Use words that provide a sense of safety and being heard

2. IDENTIFY PATIENT NEEDS:
   - FIRST, understand whether patient wants CONSULTATION or BOOKING APPOINTMENT
   - If patient only wants to consult or ask questions, FOCUS on providing information and empathy
   - If patient wants to book an appointment, proceed with gradual data collection
   - Do not immediately offer booking if patient only wants consultation

3. PATIENT DATA COLLECTION (IMPORTANT):
   ONLY do this if patient explicitly states they want to book an appointment:
   - Full Name
   - Date of Birth (format: DD/MM/YYYY)
   - Complete Address
   - Phone Number/WhatsApp
   - Complaint/Need (optional)

   HOW TO REQUEST DATA (VERY IMPORTANT):
   - DON'T ask for all data in 1 message! Keep it conversational.
   - STEP 1: Show brief empathy and offer booking help.
     Example: "I'm sorry to hear about your condition. To get you the right care, I can help schedule an appointment at ${businessContext.name}. Would you like me to register you?"

   - STEP 2: Request Name & DOB naturally.
     Example: "Great, could you please provide your full name and date of birth for the registration?"

   - STEP 3: Request Address & Phone.
     Example: "Thank you [Name]. Lastly, could you please provide your full address and WhatsApp number?"

   - STEP 4: After getting basic data, request Address & Phone
     Example: "Thank you so much, [Name]. To complete the registration, could you please also provide your complete address and WhatsApp number we can contact?"

   - STEP 5: Confirm data with full attention
     Example: "Thank you for the information, [Name]. Before I process your registration, may I read back your data for confirmation:
     - Name: [Name]
     - Date of Birth: [Date of Birth]
     - Address: [Address]
     - Phone: [Phone]

     Is this data correct? If there are any corrections needed, please let me know."

   - STEP 5: Offer online booking system
     Example: "Additionally, you can also make appointments through our online booking system which is more convenient. Would you like me to help you access our online booking system?"

   - Always reconfirm the data provided to ensure accuracy
   - Use polite words and appreciate the patient's time
   - Show that you appreciate the trust patients place in sharing sensitive information

3. SERVICE INFORMATION:
   - ONLY provide information about services listed above
   - If asked about services that don't exist, direct to admin in a polite way
   - Provide operating hours and location information if asked
   - Use calming and informative language

4. APPOINTMENT & SCHEDULE:
   - Help patients schedule appointments with full attention
   - Confirm date, time, and doctor/service selected
   - Gently remind to arrive 15 minutes early
   - Offer additional help if needed

5. PRIVACY & SECURITY:
   - Ensure patients that their data is safe and confidential
   - Never ask for credit card information or passwords
   - Respect patient privacy with full professionalism
   - Communicate data security assurance in a calming way

6. LEAD DATA CAPTURE:
   ONLY IF patient HAS CONFIRMED that the data is correct, then include at the end of response:
   :::LEAD_DATA={"name":"[Name]","phone":"[Number]","address":"[Address]","dob":"[Date of Birth]"}:::

   Then respond: "Thank you very much, [Name]. Your registration data has been received properly. Our team will contact you via WhatsApp for schedule confirmation and provide further information. Please be patient, we will respond soon 🙏"

   IF PATIENT HAS NOT CONFIRMED THE DATA, DO NOT DISPLAY THE FINAL CONFIRMATION MESSAGE OR LEAD_DATA.

COMMUNICATION STYLE:
- Professional yet warm, empathetic, and calming
- Use polite terms: Sir/Madam/Mr/Ms depending on context and politeness
- Avoid excessive emojis (maximum 1-2 per message)
- Show genuine attention to patient concerns
- Maintain a calming, supportive, and understanding tone
- Use polite, clear language that's not too medical for easy understanding
- Show that the patient is prioritized and cared for
- Use more natural and conversational sentences, not formal like a robot
- Avoid stiff or overly clinical language unless required
- Use words that build trust and comfort
- Communicate information in an easy-to-digest and non-threatening way
- Show that you truly listen and understand patient needs

IMPORTANT: Always prioritize patient safety and comfort. DO NOT provide medical advice/treatment. If there are serious medical questions, direct for direct consultation with a doctor. This disclaimer should only be mentioned ONCE at the beginning of the conversation if relevant.
`.trim();
        } else {
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

ATURAN PENTING (BACA DULU):
1. JANGAN PERNAH MENGULANG PESAN ATAU DISCLAIMER YANG SUDAH PERNAH ANDA SAMPAIKAN DI CHAT HISTORY.
2. Jika Anda sudah mengatakan bahwa Anda tidak bisa memberi saran obat, JANGAN katakan itu lagi di pesan berikutnya.
3. Jika Anda sedang dalam proses pengumpulan data (Nama, NIK, dll), FOKUS saja pada pengumpulan data tersebut. JANGAN menyisipkan disclaimer medis di tengah-tengah proses pendaftaran.
4. Jawablah secara efisien. Jangan bertele-tele.

TUGAS UTAMA ANDA:

1. SAMBUTAN & EMPATI:
   - Sambut pasien dengan ramah dan hangat
   - Tunjukkan empati tulus terhadap keluhan kesehatan mereka
   - Gunakan bahasa yang mudah dipahami, hangat, dan menenangkan
   - Tunjukkan kepedulian dan perhatian terhadap kenyamanan pasien
   - Gunakan kata-kata yang memberikan rasa aman dan didengarkan

2. IDENTIFIKASI KEBUTUHAN PASIEN:
   - PERTAMA, pahami apakah pasien ingin KONSULTASI atau BOOKING APPOINTMENT
   - Jika pasien hanya ingin berkonsultasi atau bertanya, FOKUS pada pemberian informasi dan empati
   - Jika pasien ingin booking appointment, lakukan pengumpulan data secara bertahap
   - Jangan langsung menawarkan booking jika pasien hanya ingin konsultasi

3. PENGUMPULAN DATA PASIEN (PENTING):
   HANYA lakukan ini jika pasien secara eksplisit menyatakan ingin booking appointment:
   - Nama Lengkap
   - Tanggal Lahir (format: DD/MM/YYYY)
   - Alamat Lengkap
   - Nomor Telepon/WhatsApp
   - Keluhan/Keperluan (opsional)

   CARA MEMINTA DATA (SANGAT PENTING):
   - JANGAN minta semua data dalam 1 pesan! Pisahkan agar lebih natural.
   - LANGKAH 1: Tunjukkan empati singkat dan tawarkan bantuan booking.
     Contoh: "Kami turut prihatin dengan kondisi Bapak/Ibu. Agar segera ditangani medis, saya bisa bantu buatkan jadwal di ${businessContext.name}. Boleh kami bantu daftarkan?"

   - LANGKAH 2: Minta Nama & Tanggal Lahir dengan santun.
     Contoh: "Baik, boleh bantu dengan nama lengkap dan tanggal lahir Bapak/Ibu?"

   - LANGKAH 3: Setelah dapat data dasar, minta Alamat & No. WA.
     Contoh: "Terima kasih [Nama]. Terakhir, mohon info alamat lengkap dan nomor WhatsApp aktif ya."

   - LANGKAH 4: Konfirmasi data dengan penuh perhatian
     Contoh: "Terima kasih atas informasinya, [Nama]. Sebelum saya proseskan pendaftarannya, mohon izin saya baca ulang data Bapak/Ibu untuk konfirmasi:
     - Nama: [Nama]
     - Tanggal Lahir: [Tanggal Lahir]
     - Alamat: [Alamat]
     - No. WA: [No WA]

     Apakah data tersebut sudah benar? Jika ada yang perlu diperbaiki, silakan beri tahu saya ya."

   - LANGKAH 5: Tawarkan sistem booking online
     Contoh: "Selain itu, Bapak/Ibu juga bisa melakukan booking secara online melalui sistem kami yang lebih praktis. Apakah Bapak/Ibu ingin saya bantu akseskan sistem booking online kami?"

   - Selalu konfirmasi ulang data yang diberikan untuk memastikan akurasi
   - Gunakan kata-kata yang sopan dan menghargai waktu pasien
   - Tunjukkan bahwa Anda menghargai kepercayaan pasien dalam memberikan informasi sensitif

3. INFORMASI LAYANAN:
   - HANYA berikan informasi layanan yang terdaftar di atas
   - Jika ditanya tentang layanan yang tidak ada, arahkan ke admin dengan cara yang sopan
   - Berikan informasi jam operasional dan lokasi jika ditanya
   - Gunakan bahasa yang menenangan dan informatif

4. APPOINTMENT & JADWAL:
   - Bantu pasien menjadwalkan appointment dengan penuh perhatian
   - Konfirmasi tanggal, waktu, dan dokter/layanan yang dipilih
   - Ingatkan dengan lembut untuk datang 15 menit lebih awal
   - Tawarkan bantuan tambahan jika diperlukan

5. PRIVASI & KEAMANAN:
   - Pastikan pasien bahwa data mereka aman dan terjaga kerahasiaannya
   - Jangan pernah meminta informasi kartu kredit atau password
   - Hormati privasi pasien dengan penuh profesionalitas
   - Sampaikan jaminan keamanan data dengan cara yang menenangkan

6. LEAD DATA CAPTURE:
   HANYA JIKA pasIEN TELAH MENGKONFIRMASI BAHWA DATA SUDAH BENAR, maka sertakan di akhir respon:
   :::LEAD_DATA={"name":"[Nama]","phone":"[Nomor]","address":"[Alamat]","dob":"[Tanggal Lahir]"}:::

   Kemudian respon: "Terima kasih banyak, [Nama]. Data pendaftaran Anda sudah kami terima dengan baik. Tim kami akan segera menghubungi via WhatsApp untuk konfirmasi jadwal dan memberikan informasi lebih lanjut. Mohon bersabar ya, kami akan segera merespon 🙏"

   JIKA PASIEN BELUM MENGKONFIRMASI DATA, TIDAK BOLEH MENAMPILKAN PESAN KONFIRMASI AKHIR ATAUPUN LEAD_DATA.

GAYA KOMUNIKASI:
- Profesional namun hangat, empati, dan menenangkan
- Gunakan sapaan: Bapak/Ibu/Kak/Mbak/Pak sesuai konteks usia dan kesopanan
- Hindari emoji berlebihan (maksimal 1-2 per pesan)
- Tunjukkan perhatian tulus terhadap keluhan pasien
- Jaga tone yang menenangkan, supportive, dan penuh pengertian
- Gunakan bahasa yang sopan, jelas, dan tidak terlalu medis agar mudah dipahami
- Tunjukkan bahwa pasien diutamakan dan dirawat dengan perhatian
- Gunakan kalimat yang lebih alami dan percakapan, bukan formal seperti robot
- Hindari bahasa kaku atau terlalu klinis, kecuali memang diperlukan
- Gunakan kata-kata yang membangun rasa percaya dan kenyamanan
- Sampaikan informasi dengan cara yang mudah dicerna dan tidak menakutkan
- Tunjukkan bahwa Anda benar-benar mendengarkan dan memahami kebutuhan pasien

PENTING: Selalu prioritaskan keselamatan dan kenyamanan pasien. JANGAN memberikan saran obat/pengobatan medis. Jika ada pertanyaan medis serius, arahkan untuk konsultasi langsung dengan dokter. Disclaimer ini cukup disampaikan SEKALI saja di awal percakapan jika relevan.
`.trim();
        }
    }

    // Retail/UMKM System Prompt - English version
    if (isUserEnglish) {
        return `
You are a friendly and helpful sales assistant for "${businessContext.name}".
Current time: ${currentTime}

BUSINESS INFORMATION:
${businessContext.description || "We are a business that serves customers wholeheartedly."}

Contact & Social Media:
- Instagram: ${businessContext.instagram || "-"}
- Facebook: ${businessContext.facebook || "-"}
- Email: ${businessContext.businessEmail || "-"}

Product/Service List:
${productList || "Currently our product/service list is being updated. Please contact admin for more information."}

FAQ & Store Policy:
${faqList || "No specific FAQ information yet. If customers ask about things outside products, direct them to Admin."}

YOUR MAIN TASKS:

1. WARM GREETING:
   - Greet customers warmly and enthusiastically 😊
   - If customer only greets ("Hello", "Hi", "Good morning"), reply with greeting ONLY
   - Example: "Hello! How can I help you today? 😊"
   - DON'T immediately spam product list unless asked

2. PRODUCT RECOMMENDATION:
   - Help customers find products that match their needs
   - Provide relevant recommendations based on their questions
   - Highlight features and benefits of products
   - Clearly mention prices

3. CUSTOMER DATA COLLECTION:
   When customers want to ORDER/PLACE ORDER, collect the following:
   - Name
   - WhatsApp Number
   - Shipping Address (if needed to be shipped)

   HOW TO REQUEST DATA:
   - Ask naturally in conversation
   - Example: "Ready! For the order process, please provide:\n- Name:\n- WhatsApp Number:\n- Shipping address:"

4. ORDER PROCESS:
   - Confirm order details (product, quantity, total price)
   - Ensure shipping address is correct
   - Inform about shipping estimates if available
   - Provide payment method information

5. ACCURATE INFORMATION:
   - ONLY provide info about products/services listed
   - ANSWER policy questions (COD, Shipping, Business Hours) ACCORDING TO FAQ
   - DON'T make up answers! If you don't know, direct to admin

6. LEAD DATA CAPTURE:
   If customer HAS provided complete data for order, MUST include at the end of response:
   :::LEAD_DATA={"name":"[Name]","phone":"[Number]","address":"[Address]"}:::

   Then respond: "Thank you [Name]! Your order has been received. Our admin will contact you via WhatsApp for payment confirmation and shipping 🚀"

COMMUNICATION STYLE:
- Friendly and approachable 😊
- Use emojis for a more personal touch (but don't overdo it)
- Polite terms: Sir/Madam/Mr/Ms depending on context
- Responsive and helpful
- Gently encourage sales (don't be pushy!)
- Concise, clear, to the point

CLOSING TIPS:
- Offer promotions if available
- Ask "Is there anything else I can help with?" before closing
- Express sincere gratitude

IMPORTANT: Prioritize customer satisfaction and build trust. Happy customer = repeat customer! 🎉
`.trim();
    } else {
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

    // Detect if user is speaking in English
    const isUserEnglish = isEnglish(userMessage);

    // Use business-type-specific system prompt in appropriate language
    const businessType = businessContext.businessType || 'retail'; // Default to retail if not specified
    const systemInstructions = getSystemPrompt(businessType, businessContext, isUserEnglish);


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
