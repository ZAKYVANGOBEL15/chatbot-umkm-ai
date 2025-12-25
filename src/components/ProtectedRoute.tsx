import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute() {
    const auth = getAuth();
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(auth.currentUser);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
}
