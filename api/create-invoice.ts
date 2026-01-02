import { getDb } from './lib/db.js';

export default async function handler(req: any, res: any) {
    // 1. Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userId, plan } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const db = getDb();
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const userEmail = userData?.email || 'customer@example.com';
        const userName = userData?.name || 'Customer';

        // Xendit Config
        const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
        if (!XENDIT_SECRET_KEY) {
            return res.status(500).json({ error: 'Xendit Secret Key not configured' });
        }

        const authHeader = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');

        // Invoice Details
        const amount = 150000; // Hardcoded price for now
        const externalId = `inv-${userId}-${Date.now()}`;

        const response = await fetch('https://api.xendit.co/v2/invoices', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                external_id: externalId,
                amount: amount,
                payer_email: userEmail,
                description: `Pembayaran Langganan Premium - ${userData?.businessName || 'ChatBot AI'}`,
                customer: {
                    given_names: userName,
                    email: userEmail
                },
                success_redirect_url: `${req.headers.origin || 'https://www.nusavite.com'}/dashboard`,
                failure_redirect_url: `${req.headers.origin || 'https://www.nusavite.com'}/dashboard`,
                currency: 'IDR'
            })
        });

        const invoice = await response.json();

        if (invoice.error_code) {
            console.error('Xendit Error:', invoice);
            return res.status(400).json({ error: invoice.message });
        }

        return res.status(200).json({
            invoiceUrl: invoice.invoice_url,
            externalId: invoice.external_id
        });

    } catch (error: any) {
        console.error('Create Invoice Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
