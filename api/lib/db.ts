import admin from 'firebase-admin';

export const getDb = () => {
    // Safety check for ESM environment
    const apps = admin.apps || [];

    if (apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: privateKey.replace(/\\n/g, '\n'),
                    }),
                });
            } catch (initErr: any) {
                console.error('[Firebase] Init Error:', initErr.message);
            }
        } else {
            // Fallback for local development
            admin.initializeApp({
                projectId: projectId
            });
        }
    }
    return admin.firestore();
};
