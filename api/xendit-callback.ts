import { getDb } from './lib/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const xenditToken = req.headers['x-callback-token'];
        const WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN;

        // Verify Webhook Token
        if (WEBHOOK_TOKEN && xenditToken !== WEBHOOK_TOKEN) {
            console.warn('Invalid Xendit Webhook Token');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const payload = req.body;
        console.log('Xendit Webhook Received:', payload.status, payload.external_id);

        // Check if payment is settled/paid
        if (payload.status === 'SETTLED' || payload.status === 'PAID') {
            const externalId = payload.external_id;
            // externalId format: inv-userId-timestamp
            const userId = externalId.split('-')[1];

            if (userId) {
                const db = getDb();

                // Calculate expiry date (30 days from now)
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);

                await db.collection('users').doc(userId).update({
                    subscriptionStatus: 'active',
                    subscriptionExpiresAt: expiryDate.toISOString(),
                    lastPaymentId: payload.id,
                    updatedAt: new Date().toISOString()
                });

                console.log(`User ${userId} upgraded to Premium via Xendit.`);
            }
        }

        return res.status(200).json({ status: 'ok' });

    } catch (error: any) {
        console.error('Xendit Callback Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
