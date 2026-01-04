import admin from 'firebase-admin';

// Reusing the DB helper logic from webhook.ts (or importing if extracted)
// For simplicity/robustness, I'll verify if I can import or copy-paste. 
// Since webhook.ts has it inline, I'll copy-paste the safe init logic here or extract it later.
// To keep it clean, I'll assume minimal init here or try to reuse if a lib exists.
// Checking `src/lib/firebase.ts`... that's client SDK.
// `api/lib/db.js` seems to exist based on `chat.ts` import!
// `import { getDb } from './lib/db.js';` was seen in `chat.ts`.

import { getDb } from './lib/db.js';

export default async function handler(req: any, res: any) {
    // CORS
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { accessToken, userId } = req.body;

        if (!accessToken || !userId) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        // 1. Validate Token & Get User Info from Graph API
        const meRes = await fetch(`https://graph.facebook.com/v17.0/me?fields=id,name&access_token=${accessToken}`);
        const meData = await meRes.json();

        if (meData.error) {
            throw new Error(`Graph API Error: ${meData.error.message}`);
        }

        console.log('[FB Auth] Token Verified for User:', meData.name, `(${meData.id})`);

        // 2. Fetch WhatsApp Business Accounts & Phone Numbers
        // We need to find the phone number ID connected to this token.
        // Usually, for embedded signup, the token is linked to a System User which has access to the WABA.
        // We try to list businesses -> phone numbers.

        const accountsRes = await fetch(`https://graph.facebook.com/v17.0/me?fields=businesses{id,name,phone_numbers{id,display_phone_number}}&access_token=${accessToken}`);
        const accountsData = await accountsRes.json();

        let phoneNumberId = '';
        let businessPhone = '';
        let wabaId = '';

        if (accountsData.businesses && accountsData.businesses.length > 0) {
            // Find the first business with a phone number
            for (const business of accountsData.businesses) {
                if (business.phone_numbers && business.phone_numbers.data.length > 0) {
                    wabaId = business.id;
                    const phoneObj = business.phone_numbers.data[0];
                    phoneNumberId = phoneObj.id;
                    businessPhone = phoneObj.display_phone_number;
                    break;
                }
            }
        }

        // Fallback: If structure is different (sometimes 'accounts' field)
        if (!phoneNumberId) {
            const granularRes = await fetch(`https://graph.facebook.com/v17.0/me/accounts?fields=id,name&access_token=${accessToken}`);
            // ... further logic if needed, but 'businesses' usually works for WABA system users.
        }

        if (!phoneNumberId) {
            return res.status(404).json({ error: 'No WhatsApp Phone Number found linked to this account.' });
        }

        console.log(`[FB Auth] Found WhatsApp Info - PhoneID: ${phoneNumberId}, Number: ${businessPhone}, WABA: ${wabaId}`);

        // 3. Save to Firestore
        const db = getDb();
        await db.collection('users').doc(userId).update({
            whatsappAccessToken: accessToken,
            whatsappPhoneNumberId: phoneNumberId,
            whatsappBusinessAccountId: wabaId,
            businessPhone: businessPhone,
            isWhatsAppConfigured: true,
            updatedAt: new Date().toISOString()
        });

        // 4. (Optional) Exchange for Long-Lived Token?
        // For MVP, the received token from Embedded Signup is often long-lived or good enough.
        // We can add exchange logic later if it expires quickly.

        return res.status(200).json({
            success: true,
            message: 'WhatsApp Connected Successfully',
            data: {
                phoneNumberId,
                businessPhone,
                wabaId
            }
        });

    } catch (error: any) {
        console.error('[FB Auth Error]', error);
        return res.status(500).json({ error: error.message });
    }
}
