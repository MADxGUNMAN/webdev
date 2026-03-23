'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ROLES, TEACHER_STATUS } from '@/lib/roles';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', pass: '', c_pass: '' });
    const [registerAs, setRegisterAs] = useState('student'); // 'student' or 'teacher'
    const [msg, setMsg] = useState('');
    const router = useRouter();
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.pass !== form.c_pass) { setMsg('Passwords do not match'); return; }
        try {
            const cred = await createUserWithEmailAndPassword(auth, form.email, form.pass);
            await updateProfile(cred.user, { displayName: form.name });

            const isTeacher = registerAs === 'teacher';
            const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            const role = cred.user.email === ADMIN_EMAIL ? ROLES.ADMIN
                       : isTeacher ? ROLES.TEACHER
                       : ROLES.STUDENT;

            const userData = {
                email: form.email,
                firstName: form.name.split(' ')[0],
                lastName: form.name.split(' ').slice(1).join(' '),
                role,
                savedPlaylists: [],
                likedVideos: [],
                comments: 0,
                createdAt: new Date().toISOString(),
            };

            // Add teacher-specific fields
            if (isTeacher) {
                userData.teacherStatus = TEACHER_STATUS.PENDING;
                userData.bio = '';
                userData.expertise = '';
            }

            await setDoc(doc(db, 'users', cred.user.uid), userData);

            setMsg('Account Created Successfully!');

            if (role === ROLES.ADMIN) {
                setTimeout(() => router.push('/admin/dashboard'), 1200);
            } else if (isTeacher) {
                setTimeout(() => router.push('/teacher/waiting'), 1200);
            } else {
                setTimeout(() => router.push('/'), 1200);
            }
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') setMsg('Email Address Already Exists!');
            else setMsg('Unable to create account. Try again.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(auth, provider);

            const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            const isTeacher = registerAs === 'teacher';
            const role = cred.user.email === ADMIN_EMAIL ? ROLES.ADMIN
                       : isTeacher ? ROLES.TEACHER
                       : ROLES.STUDENT;

            const userData = {
                email: cred.user.email,
                firstName: cred.user.displayName?.split(' ')[0] || '',
                lastName: cred.user.displayName?.split(' ').slice(1).join(' ') || '',
                photoURL: cred.user.photoURL || '',
                role,
                createdAt: new Date().toISOString(),
            };

            if (isTeacher) {
                userData.teacherStatus = TEACHER_STATUS.PENDING;
                userData.bio = '';
                userData.expertise = '';
            }

            await setDoc(doc(db, 'users', cred.user.uid), userData, { merge: true });
            localStorage.setItem('loggedInUserId', cred.user.uid);

            setMsg('Google Login successful!');
            if (role === ROLES.ADMIN) {
                setTimeout(() => router.push('/admin/dashboard'), 1000);
            } else if (isTeacher) {
                setTimeout(() => router.push('/teacher/waiting'), 1000);
            } else {
                setTimeout(() => router.push('/'), 1000);
            }
        } catch (err) {
            setMsg(err.message || 'Google Login failed.');
        }
    };

    return (
        <section className="form-container">
            <form onSubmit={handleRegister}>
                <h3>register now</h3>
                {msg && <p style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>{msg}</p>}

                {/* Role Toggle */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        type="button"
                        className={`inline-option-btn ${registerAs === 'student' ? '' : 'inactive'}`}
                        style={{
                            flex: 1,
                            fontSize: '1.5rem',
                            padding: '1rem',
                            backgroundColor: registerAs === 'student' ? 'var(--main-color)' : 'var(--light-bg)',
                            color: registerAs === 'student' ? 'var(--white)' : 'var(--light-color)',
                            border: 'none',
                            borderRadius: '.5rem',
                            cursor: 'pointer'
                        }}
                        onClick={() => setRegisterAs('student')}
                    >
                        <i className="fas fa-user-graduate" style={{ marginRight: '.5rem' }}></i>
                        Student
                    </button>
                    <button
                        type="button"
                        className={`inline-option-btn ${registerAs === 'teacher' ? '' : 'inactive'}`}
                        style={{
                            flex: 1,
                            fontSize: '1.5rem',
                            padding: '1rem',
                            backgroundColor: registerAs === 'teacher' ? 'var(--main-color)' : 'var(--light-bg)',
                            color: registerAs === 'teacher' ? 'var(--white)' : 'var(--light-color)',
                            border: 'none',
                            borderRadius: '.5rem',
                            cursor: 'pointer'
                        }}
                        onClick={() => setRegisterAs('teacher')}
                    >
                        <i className="fas fa-chalkboard-user" style={{ marginRight: '.5rem' }}></i>
                        Teacher
                    </button>
                </div>

                <p>your name <span>*</span></p>
                <input type="text" placeholder="enter your name" required maxLength={50} className="box"
                    value={form.name} onChange={set('name')} />
                <p>your email <span>*</span></p>
                <input type="email" placeholder="enter your email" required maxLength={50} className="box"
                    value={form.email} onChange={set('email')} />
                <p>your password <span>*</span></p>
                <input type="password" placeholder="enter your password" required maxLength={20} className="box"
                    value={form.pass} onChange={set('pass')} />
                <p>confirm password <span>*</span></p>
                <input type="password" placeholder="confirm your password" required maxLength={20} className="box"
                    value={form.c_pass} onChange={set('c_pass')} />

                <input type="submit" value={registerAs === 'teacher' ? 'register as teacher' : 'register'} className="btn" />

                <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '1.8rem', color: 'var(--light-color)' }}>or</div>

                <button type="button" onClick={handleGoogleLogin} className="option-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <i className="fab fa-google"></i> Register with Google {registerAs === 'teacher' ? 'as Teacher' : ''}
                </button>

                <p style={{ marginTop: '1rem' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--main-color)' }}>Login</Link>
                </p>
            </form>
        </section>
    );
}
