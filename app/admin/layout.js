'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { isAdmin } from '@/lib/roles';

export default function AdminLayout({ children }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) return router.push('/login');
            if (!isAdmin(userData)) return router.push('/');
        }
    }, [user, userData, loading, router]);

    if (loading || !isAdmin(userData)) {
        return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">{children}</main>
        </div>
    );
}
