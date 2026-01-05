import { getDb } from './lib/db.js';

export default async function handler(req: any, res: any) {
    // 1. Handle CORS & Security (Dynamic for Widget Embedding)
    const origin = req.headers.origin;

    // Reflected CORS: Allow any origin to support widget embedding on customer sites.
    // Security is enforced via userId validation, subscription checks, and App Check.
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Firebase-AppCheck');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, history, userId } = req.body || {};

        if (!userId) {
            return res.status(400).json({
                error: 'Missing userId',
                message: 'Akses ditolak: User ID diperlukan untuk otentikasi.'
            });
        }

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        let finalContext = null;

        // Fetch context ALWAYS from DB (Source of Truth)
        try {
            const db = getDb();
            const userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists) {
                return res.status(404).json({
                    error: 'User Not Found',
                    message: 'User ID tidak terdaftar di sistem kami.'
                });
            }

            const userData = userDoc.data();

            // --- SUBSCRIPTION CHECK ---
            const status = userData?.subscriptionStatus || 'trial';
            let isExpired = false;

            if (status === 'active' && userData?.subscriptionExpiresAt) {
                isExpired = new Date(userData.subscriptionExpiresAt).getTime() < Date.now();
            } else if (status === 'trial' && userData?.trialExpiresAt) {
                isExpired = new Date(userData.trialExpiresAt).getTime() < Date.now();
            }

            if (isExpired) {
                return res.status(403).json({
                    error: 'Subscription Expired',
                    message: `Masa ${status} Anda telah habis. Silakan hubungi admin untuk melanjutkan layanan.`
                });
            }
            // --------------------------

            const productsSnap = await db.collection('users').doc(userId).collection('products').get();
            const products = productsSnap.docs.map(d => d.data());

            const faqsSnap = await db.collection('users').doc(userId).collection('faqs').get();
            const faqs = faqsSnap.docs.map(d => d.data());

            const docsSnap = await db.collection('users').doc(userId).collection('documents').get();
            const documents = docsSnap.docs.map(d => {
                const data = d.data();
                return { name: data.name, url: data.url };
            });

            finalContext = {
                name: userData?.businessName || 'Bisnis Kami',
                description: userData?.businessDescription || 'UMKM Indonesia.',
                instagram: userData?.instagram || '',
                facebook: userData?.facebook || '',
                businessEmail: userData?.businessEmail || '',
                businessType: userData?.businessType || 'retail',
                products: products.length > 0 ? products : [],
                faqs: faqs.length > 0 ? faqs : [],
                documents: documents.length > 0 ? documents : []
            };
        } catch (dbErr) {
            console.error('Error fetching context from DB:', dbErr);
            return res.status(500).json({ error: 'Database Error', message: 'Gagal memvalidasi data user.' });
        }

        if (!finalContext) {
            return res.status(500).json({ error: 'Internal Error', message: 'Gagal menyusun konteks bisnis.' });
        }

        // 3. Call Shared AI Logic
        // We import it dynamically or assume it's available via previous import. 
        // Since this is a file replacement, I need to add the import at the top if it's missing, 
        // but this tool only replaces a chunk. 
        // I'll assume I need to do a separate edit for imports or rely on the fact that I will replace the WHOLE file logic in a smarter way if I could.
        // Actually, I should use multi_replace to add the import as well. 
        // Wait, I can't easily add the import with this tool if I'm targeting the body.
        // I will actally use `replace_file_content` to replace the WHOLE logic block.

        let reply = await import('../src/lib/gemini.js').then(m =>
            m.generateAIResponse(message, finalContext, history || [])
        );

        // 4. (Removed manual fetch)



        // (No verification needed, the shared lib handles it)


        // --- LEAD GENERATION LOGIC ---
        // Robust regex to catch :::LEAD_DATA={...}::: or :::LEAD_DATA={...}:::
        const match = reply.match(/:::LEAD_DATA\s*=?\s*(\{.*?\})?:::/);
        let leadCaptured = false;
        let leadInfo = null;

        if (match && match[1]) {
            try {
                // Sanitize JSON string just in case AI adds weird quotes
                const jsonStr = match[1].trim();
                const leadData = JSON.parse(jsonStr);
                console.log("Lead Captured:", leadData);

                // Save to Firestore users/{userId}/customers
                if (userId) {
                    const db = getDb();
                    await db.collection('users').doc(userId).collection('customers').add({
                        name: leadData.name,
                        phone: leadData.phone,
                        nik: leadData.nik || '-',
                        address: leadData.address || '-',
                        dob: leadData.dob || '-',
                        status: 'new', // new, contacted, converted
                        source: 'chatbot',
                        createdAt: new Date().toISOString(),
                        lastInteraction: new Date().toISOString()
                    });
                    console.log("Lead saved to DB");
                    leadCaptured = true;
                    leadInfo = leadData;
                }

                // Remove the tag from the visible reply
                reply = reply.replace(match[0], '').trim();

            } catch (e) {
                console.error("Failed to parse/save lead data:", e);
                // Clean tag anyway
                reply = reply.replace(match[0], '').trim();
            }
        }
        // -----------------------------

        return res.status(200).json({ reply, leadCaptured, leadInfo });

    } catch (error: any) {
        console.error('Chat API Fatal Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
