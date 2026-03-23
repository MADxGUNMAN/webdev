'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { isAdmin, isApprovedTeacher, isPendingTeacher } from '@/lib/roles';

export default function Sidebar({ isActive, onClose }) {
    const { user, userData } = useAuth();
    const pathname = usePathname();
    const [devLink, setDevLink] = useState({ url: 'https://ansarisouaib.in', label: 'developers' });

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'siteConfig', 'developers'), snap => {
            if (snap.exists()) setDevLink(snap.data());
        });
        return () => unsub();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(auth, provider);
            await setDoc(doc(db, 'users', cred.user.uid), {
                email: cred.user.email,
                firstName: cred.user.displayName?.split(' ')[0] || '',
                lastName: cred.user.displayName?.split(' ').slice(1).join(' ') || '',
                photoURL: cred.user.photoURL || '',
            }, { merge: true });
            localStorage.setItem('loggedInUserId', cred.user.uid);
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    // Determine role label
    const getRoleLabel = () => {
        if (isAdmin(userData)) return 'admin';
        if (isApprovedTeacher(userData)) return 'teacher';
        if (isPendingTeacher(userData)) return 'pending teacher';
        return 'student';
    };

    const navLinks = [
        { href: '/', label: 'home', icon: 'fa-home' },
        { href: '/about', label: 'about', icon: 'fa-question' },
        { href: '/courses', label: 'courses', icon: 'fa-graduation-cap' },
        { href: '/teachers', label: 'teachers', icon: 'fa-chalkboard-user' },
        { href: '/contact', label: 'contact us', icon: 'fa-headset' },
        { href: devLink.url || '#', label: devLink.label || 'developers', icon: 'fa-laptop-code', external: true },
    ];

    return (
        <div className={`side-bar${isActive ? ' active' : ''}`}>
            <div id="close-btn" onClick={onClose}>
                <i className="fas fa-times"></i>
            </div>

            {user ? (
                <div className="profile">
                    <img src={user.photoURL || '/images/pic-1.jpg'} className="image" alt="profile" referrerPolicy="no-referrer" onError={(e) => e.target.src = '/images/pic-1.jpg'} />
                    <h3 className="name">{user.displayName || 'Student'}</h3>
                    <p className="role">{getRoleLabel()}</p>
                    <Link href="/profile" className="btn" onClick={onClose}>view profile</Link>

                    {/* Role-based quick links */}
                    {isAdmin(userData) && (
                        <Link href="/admin/dashboard" className="option-btn" onClick={onClose}
                            style={{ width: '100%', marginTop: '.8rem', fontSize: '1.2rem', textAlign: 'center' }}>
                            <i className="fas fa-shield-halved" style={{ marginRight: '.5rem' }}></i>Admin Panel
                        </Link>
                    )}
                    {isApprovedTeacher(userData) && (
                        <Link href="/teacher/dashboard" className="option-btn" onClick={onClose}
                            style={{ width: '100%', marginTop: '.8rem', fontSize: '1.2rem', textAlign: 'center' }}>
                            <i className="fas fa-chalkboard-user" style={{ marginRight: '.5rem' }}></i>Teacher Panel
                        </Link>
                    )}
                    {isPendingTeacher(userData) && (
                        <Link href="/teacher/waiting" className="option-btn" onClick={onClose}
                            style={{ width: '100%', marginTop: '.8rem', fontSize: '1.2rem', textAlign: 'center', backgroundColor: '#f39c12' }}>
                            <i className="fas fa-clock" style={{ marginRight: '.5rem' }}></i>Pending Approval
                        </Link>
                    )}
                </div>
            ) : (
                <div className="profile">
                    <img src="/images/pic-1.jpg" className="image" alt="profile" />
                    <h3 className="name">Please login</h3>
                    <div className="flex-btn" style={{ paddingTop: '1rem' }}>
                        <Link href="/login" className="option-btn" onClick={onClose}>login</Link>
                        <Link href="/register" className="option-btn" onClick={onClose}>register</Link>
                    </div>
                    <button type="button" onClick={handleGoogleLogin} className="option-btn" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)' }}>
                        <i className="fab fa-google" style={{ marginRight: '.5rem', color: '#db4437' }}></i> Login with Google
                    </button>
                </div>
            )}

            <nav className="navbar">
                {navLinks.map(({ href, label, icon, external }) => {
                    if (external) {
                        return (
                            <a key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                                <i className={`fas ${icon}`}></i>
                                <span>{label}</span>
                            </a>
                        );
                    }
                    return (
                        <Link key={href} href={href} onClick={onClose}
                            style={pathname === href ? { color: 'var(--main-color)' } : {}}>
                            <i className={`fas ${icon}`}></i>
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
