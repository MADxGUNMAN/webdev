'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { TEACHER_STATUS } from '@/lib/roles';

export default function TeacherWaitingPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    // Auto-redirect when approved
    useEffect(() => {
        if (userData?.teacherStatus === TEACHER_STATUS.APPROVED) {
            router.push('/teacher/dashboard');
        }
    }, [userData, router]);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;
    if (!user) return null;

    const isBlocked = userData?.teacherStatus === TEACHER_STATUS.BLOCKED;

    return (
        <section className="form-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '60rem', padding: '3rem' }}>
                {isBlocked ? (
                    <>
                        <i className="fas fa-ban" style={{ fontSize: '8rem', color: '#e74c3c', marginBottom: '2rem' }}></i>
                        <h1 style={{ fontSize: '3rem', color: 'var(--black)', marginBottom: '1rem' }}>Application Rejected</h1>
                        <p style={{ fontSize: '1.8rem', color: 'var(--light-color)', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Unfortunately, your teacher application has been rejected by the admin.
                            If you believe this is an error, please contact us.
                        </p>
                        <Link href="/contact" className="inline-btn">contact support</Link>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '10rem', height: '10rem', border: '.4rem solid var(--main-color)',
                            borderTop: '.4rem solid transparent', borderRadius: '50%',
                            margin: '0 auto 2rem', animation: 'spin 1s linear infinite'
                        }}></div>
                        <h1 style={{ fontSize: '3rem', color: 'var(--black)', marginBottom: '1rem' }}>Application Under Review</h1>
                        <p style={{ fontSize: '1.8rem', color: 'var(--light-color)', lineHeight: 1.8, marginBottom: '1rem' }}>
                            Thank you for registering as a teacher! Your application is currently being reviewed by our admin team.
                        </p>
                        <p style={{ fontSize: '1.6rem', color: 'var(--light-color)', marginBottom: '2rem' }}>
                            This page will <strong>automatically redirect</strong> you once your application is approved. Please be patient.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/" className="inline-btn">go to home</Link>
                            <Link href="/contact" className="inline-option-btn">contact admin</Link>
                        </div>
                    </>
                )}

                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </section>
    );
}
