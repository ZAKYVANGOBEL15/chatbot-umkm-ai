import { getDb } from './lib/db.js';
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const notification = req.body;
        const serverKey = process.env.MIDTRANS_SERVER_KEY;

        if (!serverKey) {
            console.error('MIDTRANS_SERVER_KEY not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // 1. Verify Signature
        // Signature = hash(order_id + status_code + gross_amount + ServerKey)
        const { order_id, status_code, gross_amount, signature_key } = notification;
        const payload = order_id + status_code + gross_amount + serverKey;
        const expectedSignature = crypto.createHash('sha512').update(payload).digest('hex');

        if (signature_key !== expectedSignature) {
            console.warn('Invalid Midtrans Signature');
            return res.status(401).json({ error: 'Invalid Signature' });
        }

        console.log(`[Midtrans Webhook] Received: ${order_id} - ${notification.transaction_status}`);

        // 2. Handle Payment Status
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'challenge') {
                console.log(`[Midtrans] Transaction ${order_id} is challenged.`);
            } else if (fraudStatus === 'accept' || !fraudStatus) {
                // Payment Success!
                // orderId format: nv-userId-timestamp
                const parts = order_id.split('-');
                const userId = parts[1];

                if (userId) {
                    const db = getDb();

                    // Calculate expiry date (30 days from now)
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);

                    await db.collection('users').doc(userId).update({
                        subscriptionStatus: 'active',
                        subscriptionPlan: 'pro',
                        subscriptionExpiresAt: expiryDate.toISOString(),
                        lastPaymentId: notification.transaction_id,
                        paymentMethod: notification.payment_type,
                        updatedAt: new Date().toISOString()
                    });

                    console.log(`[Midtrans] User ${userId} upgraded to Premium via ${notification.payment_type}.`);
                }
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            // Optional: Handle failure/expiration if needed
            console.log(`[Midtrans] Transaction ${order_id} failed with status: ${transactionStatus}`);
        }

        return res.status(200).json({ status: 'ok' });

    } catch (error: any) {
        console.error('Midtrans Callback Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
