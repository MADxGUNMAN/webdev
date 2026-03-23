'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0, teachers: 0, pending: 0,
        videos: 0, playlists: 0, comments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubs = [];

        // Real-time users
        unsubs.push(onSnapshot(collection(db, 'users'), snap => {
            let students = 0, teachers = 0, pending = 0;
            snap.forEach(d => {
                const data = d.data();
                if (data.role === 'student') students++;
                if (data.role === 'teacher') {
                    teachers++;
                    if (data.teacherStatus === 'pending') pending++;
                }
            });
            setStats(prev => ({ ...prev, students, teachers, pending }));
            setLoading(false);
        }));

        // Real-time videos
        unsubs.push(onSnapshot(collection(db, 'videos'), snap => {
            setStats(prev => ({ ...prev, videos: snap.size }));
        }));

        // Real-time playlists
        unsubs.push(onSnapshot(collection(db, 'playlists'), snap => {
            setStats(prev => ({ ...prev, playlists: snap.size }));
        }));

        // Real-time comments
        unsubs.push(onSnapshot(collection(db, 'comments'), snap => {
            setStats(prev => ({ ...prev, comments: snap.size }));
        }));

        return () => unsubs.forEach(u => u());
    }, []);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading dashboard...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">admin dashboard</h1>

            {stats.pending > 0 && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '1.5rem 2rem', borderRadius: '.5rem', marginBottom: '2rem', fontSize: '1.6rem' }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: '#856404', marginRight: '1rem' }}></i>
                    <strong>{stats.pending} teacher(s)</strong> pending approval.
                    <Link href="/admin/teachers" style={{ color: 'var(--main-color)', marginLeft: '1rem' }}>Review now →</Link>
                </div>
            )}

            <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))', gap: '2rem' }}>
                {[
                    { icon: 'fa-user-graduate', count: stats.students, label: 'Students', color: '#3498db' },
                    { icon: 'fa-chalkboard-user', count: stats.teachers, label: 'Teachers', color: '#2ecc71' },
                    { icon: 'fa-clock', count: stats.pending, label: 'Pending Approvals', color: '#f39c12' },
                    { icon: 'fa-video', count: stats.videos, label: 'Total Videos', color: '#9b59b6' },
                    { icon: 'fa-list', count: stats.playlists, label: 'Total Playlists', color: '#e74c3c' },
                    { icon: 'fa-comment', count: stats.comments, label: 'Total Comments', color: '#1abc9c' },
                ].map((s, i) => (
                    <div key={i} className="admin-stat-box" style={{ borderLeft: `.4rem solid ${s.color}` }}>
                        <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
                        <div>
                            <span className="count">{s.count}</span>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '3rem' }}>
                <Link href="/admin/teachers" className="inline-btn">Manage Teachers</Link>
                <Link href="/admin/students" className="inline-btn">Manage Students</Link>
                <Link href="/admin/videos" className="inline-option-btn">Manage Videos</Link>
                <Link href="/admin/playlists" className="inline-option-btn">Manage Playlists</Link>
            </div>
        </section>
    );
}
