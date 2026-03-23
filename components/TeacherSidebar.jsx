'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function TeacherSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to logout?')) return;
        await signOut(auth);
        localStorage.removeItem('loggedInUserId');
        router.push('/');
    };

    const links = [
        { href: '/teacher/dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
        { href: '/teacher/playlists', label: 'My Playlists', icon: 'fa-list' },
        { href: '/teacher/playlists/add', label: 'Add Playlist', icon: 'fa-plus' },
        { href: '/teacher/videos', label: 'My Videos', icon: 'fa-video' },
        { href: '/teacher/videos/add', label: 'Upload Video', icon: 'fa-upload' },
        { href: '/teacher/analytics', label: 'Analytics', icon: 'fa-chart-bar' },
        { href: '/teacher/profile', label: 'My Profile', icon: 'fa-user-pen' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <i className="fas fa-chalkboard-user" style={{ fontSize: '2.4rem', color: 'var(--main-color)' }}></i>
                <h2>Teacher Panel</h2>
            </div>
            <nav className="admin-sidebar-nav">
                {links.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`admin-sidebar-link ${pathname === link.href ? 'active' : ''}`}
                    >
                        <i className={`fas ${link.icon}`}></i>
                        <span>{link.label}</span>
                    </Link>
                ))}
                <button onClick={handleLogout} className="admin-sidebar-link"
                    style={{ background: 'none', cursor: 'pointer', color: '#e74c3c', marginTop: '1rem', borderTop: '.1rem solid rgba(255,255,255,.1)', width: '100%', textAlign: 'left' }}>
                    <i className="fas fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
}
