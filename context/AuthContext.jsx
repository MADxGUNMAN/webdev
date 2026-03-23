'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ROLES } from '@/lib/roles';

const AuthContext = createContext(null);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Auto-detect admin by email
                        if (firebaseUser.email === ADMIN_EMAIL && data.role !== ROLES.ADMIN) {
                            setDoc(userRef, { role: ROLES.ADMIN }, { merge: true });
                        }
                        setUserData(data);
                    } else {
                        // Initialize new user — detect admin by email
                        const role = firebaseUser.email === ADMIN_EMAIL ? ROLES.ADMIN : ROLES.STUDENT;
                        const initialData = {
                            email: firebaseUser.email,
                            firstName: firebaseUser.displayName?.split(' ')[0] || '',
                            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                            photoURL: firebaseUser.photoURL || '',
                            role,
                            savedPlaylists: [],
                            likedVideos: [],
                            comments: 0,
                            createdAt: new Date().toISOString(),
                        };
                        setDoc(userRef, initialData, { merge: true });
                        setUserData(initialData);
                    }
                });
            } else {
                setUserData(null);
                if (unsubscribeDoc) unsubscribeDoc();
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
