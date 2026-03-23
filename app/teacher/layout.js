'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TeacherSidebar from '@/components/TeacherSidebar';
import { isApprovedTeacher, isPendingTeacher } from '@/lib/roles';

export default function TeacherLayout({ children }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) return router.push('/login');
            if (isPendingTeacher(userData)) return router.push('/teacher/waiting');
            if (!isApprovedTeacher(userData)) return router.push('/');
        }
    }, [user, userData, loading, router]);

    if (loading || !isApprovedTeacher(userData)) {
        return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;
    }

    return (
        <div className="admin-layout">
            <TeacherSidebar />
            <main className="admin-main">{children}</main>
        </div>
    );
}
