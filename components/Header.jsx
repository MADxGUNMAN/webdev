'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Header({ onMenuToggle }) {
    const { darkMode, toggleDarkMode } = useTheme();
    const { user } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Close dropdowns on scroll
    useEffect(() => {
        const handleScroll = () => {
            setProfileOpen(false);
            setSearchOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleUserBtn = () => {
        setProfileOpen(p => !p);
        setSearchOpen(false);
    };

    const handleSearchBtn = () => {
        setSearchOpen(s => !s);
        setProfileOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setProfileOpen(false);
        router.push('/login');
    };

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
            setProfileOpen(false);
            router.push('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="header">
            <section className="flex">
                <Link href="/" className="logo">Web DEV</Link>

                <form onSubmit={handleSearchSubmit} className={`search-form${searchOpen ? ' active' : ''}`}>
                    <input
                        type="text"
                        placeholder="search courses..."
                        maxLength={100}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="fas fa-search"></button>
                </form>

                <div className="icons">
                    <div id="menu-btn" className="fas fa-bars" onClick={onMenuToggle}></div>
                    <div id="search-btn" className="fas fa-search" onClick={handleSearchBtn}></div>
                    <div id="user-btn" className="fas fa-user" onClick={handleUserBtn}></div>
                    <div
                        id="toggle-btn"
                        className={`fas ${darkMode ? 'fa-moon' : 'fa-sun'}`}
                        onClick={toggleDarkMode}
                    ></div>
                </div>

                <div className={`profile${profileOpen ? ' active' : ''}`}>
                    {user ? (
                        <>
                            <img src={user.photoURL || '/images/pic-1.jpg'} className="image" alt="profile" referrerPolicy="no-referrer" onError={(e) => e.target.src = '/images/pic-1.jpg'} />
                            <h3 className="name">{user.displayName || 'Student'}</h3>
                            <p className="role">student</p>
                            <Link href="/profile" className="btn" onClick={() => setProfileOpen(false)}>view profile</Link>
                            <div className="flex-btn">
                                <button className="option-btn" onClick={handleLogout}>logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <img src="/images/pic-1.jpg" className="image" alt="profile" />
                            <h3 className="name">Please login</h3>
                            <div className="flex-btn" style={{ paddingTop: '1rem' }}>
                                <Link href="/login" className="option-btn" onClick={() => setProfileOpen(false)}>login</Link>
                                <Link href="/register" className="option-btn" onClick={() => setProfileOpen(false)}>register</Link>
                            </div>
                            <button type="button" onClick={handleGoogleLogin} className="option-btn" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--black)' }}>
                                <i className="fab fa-google" style={{ marginRight: '.5rem' }}></i> Login with Google
                            </button>
                        </>
                    )}
                </div>
            </section>
        </header>
    );
}
