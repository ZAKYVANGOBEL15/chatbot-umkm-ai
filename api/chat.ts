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
        // Check for the secret LEAD_DATA tag, allowing for optional spaces
        const match = reply.match(/:::LEAD_DATA\s*=\s*(.*?):::/);
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
