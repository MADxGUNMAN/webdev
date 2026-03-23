'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/roles';

export default function RouteGuard({ children }) {
    const { user, userData, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (loading || !user || !userData) return;

        const isPanelRoute = pathname.startsWith('/admin') ||
            (pathname.startsWith('/teacher/') && !pathname.startsWith('/teacher-'));
        const isAuthRoute = pathname === '/login' || pathname === '/register';

        // If user is admin and NOT on admin routes, redirect to admin dashboard
        if (userData.role === ROLES.ADMIN && !pathname.startsWith('/admin') && !isAuthRoute) {
            router.replace('/admin/dashboard');
            return;
        }

        // If user is approved teacher and NOT on teacher routes, redirect to teacher dashboard
        if (userData.role === ROLES.TEACHER && userData.teacherStatus === 'approved' &&
            !pathname.startsWith('/teacher') && !isAuthRoute) {
            router.replace('/teacher/dashboard');
            return;
        }

        // If user is pending teacher and not on waiting page, redirect to waiting
        if (userData.role === ROLES.TEACHER && userData.teacherStatus === 'pending' &&
            pathname !== '/teacher/waiting' && !isAuthRoute) {
            router.replace('/teacher/waiting');
            return;
        }

    }, [user, userData, loading, pathname, router]);

    return children;
}
