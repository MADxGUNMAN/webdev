'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to logout?')) return;
        await signOut(auth);
        localStorage.removeItem('loggedInUserId');
        router.push('/');
    };

    const links = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
        { href: '/admin/teachers', label: 'Teachers', icon: 'fa-chalkboard-user' },
        { href: '/admin/students', label: 'Students', icon: 'fa-user-graduate' },
        { href: '/admin/videos', label: 'Videos', icon: 'fa-video' },
        { href: '/admin/playlists', label: 'Playlists', icon: 'fa-list' },
        { href: '/admin/content', label: 'Home Content', icon: 'fa-house-chimney' },
        { href: '/admin/about', label: 'About Page', icon: 'fa-info-circle' },
        { href: '/admin/contact', label: 'Contact & Footer', icon: 'fa-address-book' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <i className="fas fa-shield-halved" style={{ fontSize: '2.4rem', color: 'var(--main-color)' }}></i>
                <h2>Super Admin</h2>
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
