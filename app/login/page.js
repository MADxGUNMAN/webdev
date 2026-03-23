'use client';
import { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/roles';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const router = useRouter();

    const redirectByRole = async (uid) => {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
            const data = snap.data();
            if (data.role === ROLES.ADMIN) return router.push('/admin/dashboard');
            if (data.role === ROLES.TEACHER) {
                if (data.teacherStatus === 'approved') return router.push('/teacher/dashboard');
                return router.push('/teacher/waiting');
            }
        }
        router.push('/');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('loggedInUserId', cred.user.uid);
            setMsg('Login successful!');
            setTimeout(() => redirectByRole(cred.user.uid), 800);
        } catch (err) {
            if (err.code === 'auth/invalid-credential') setMsg('Incorrect Email or Password');
            else setMsg('Account does not exist');
        }
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
            setMsg('Google Login successful!');
            setTimeout(() => redirectByRole(cred.user.uid), 800);
        } catch (err) {
            setMsg(err.message || 'Google Login failed.');
        }
    };

    return (
        <section className="form-container">
            <form onSubmit={handleLogin}>
                <h3>login now</h3>
                {msg && <p style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>{msg}</p>}
                <p>your email <span>*</span></p>
                <input type="email" placeholder="enter your email" required maxLength={50} className="box"
                    value={email} onChange={e => setEmail(e.target.value)} />
                <p>your password <span>*</span></p>
                <input type="password" placeholder="enter your password" required maxLength={20} className="box"
                    value={password} onChange={e => setPassword(e.target.value)} />
                <input type="submit" value="login" className="btn" />

                <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '1.8rem', color: 'var(--light-color)' }}>or</div>

                <button type="button" onClick={handleGoogleLogin} className="option-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <i className="fab fa-google"></i> Login with Google
                </button>

                <p style={{ marginTop: '1rem' }}>
                    Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--main-color)' }}>Register</Link>
                </p>
            </form>
        </section>
    );
}
