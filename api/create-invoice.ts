import { getDb } from './lib/db.js';
// @ts-ignore
import midtransClient from 'midtrans-client';

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
        const userEmail = userData?.email || '';
        const userName = userData?.name || 'Customer';

        // Midtrans Config
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const clientKey = process.env.MIDTRANS_CLIENT_KEY;

        if (!serverKey) {
            return res.status(500).json({ error: 'Midtrans Server Key not configured' });
        }

        const snap = new midtransClient.Snap({
            isProduction: isProduction,
            serverKey: serverKey,
            clientKey: clientKey
        });

        // Transaction Details
        const amount = 200000; // Updated price based on simplified strategy (Rp 200rb)
        const orderId = `nv-${userId}-${Date.now()}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: {
                first_name: userName,
                email: userEmail
            },
            item_details: [{
                id: 'premium_monthly',
                price: amount,
                quantity: 1,
                name: 'Langganan Nusavite AI - 1 Bulan'
            }],
            callbacks: {
                finish: `${req.headers.origin || 'https://www.nusavite.com'}/dashboard`
            }
        };

        const transaction = await snap.createTransaction(parameter);

        return res.status(200).json({
            invoiceUrl: transaction.redirect_url,
            orderId: orderId,
            token: transaction.token
        });

    } catch (error: any) {
        console.error('Midtrans Create Transaction Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
