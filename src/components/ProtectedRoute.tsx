import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function ProtectedRoute() {
    const auth = getAuth();
    const db = getFirestore();
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(auth.currentUser);
    const [needsOnboarding, setNeedsOnboarding] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if user has completed onboarding
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if ((!data.businessName || !data.businessType) && currentUser.email !== 'tester.nusavite@gmail.com') {
                            setNeedsOnboarding(true);
                        }
                    }
                } catch (e) {
                    console.error("Error checking user profile:", e);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, db]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user needs onboarding and isn't already on the onboarding page (avoid loop if we were protecting that route too, but Protection is usually for dashboard)
    // Actually Onboarding page should be PUBLIC or Protected? 
    // Usually Onboarding is a Protected Route but accessible.
    // Here ProtectedRoute wraps Dashboard. So if needsOnboarding, redirect to /onboarding.
    if (needsOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}
