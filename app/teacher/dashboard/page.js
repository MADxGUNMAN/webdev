'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ playlists: 0, videos: 0, likes: 0, comments: 0 });

    useEffect(() => {
        if (!user) return;
        const unsubs = [];

        // Real-time playlists count
        unsubs.push(onSnapshot(query(collection(db, 'playlists'), where('teacherId', '==', user.uid)), snap => {
            setStats(prev => ({ ...prev, playlists: snap.size }));
        }));

        // Real-time videos count + likes
        unsubs.push(onSnapshot(query(collection(db, 'videos'), where('teacherId', '==', user.uid)), snap => {
            let totalLikes = 0;
            const videoIds = [];
            snap.forEach(d => {
                totalLikes += d.data().likes || 0;
                videoIds.push(d.id);
            });
            setStats(prev => ({ ...prev, videos: snap.size, likes: totalLikes }));

            // Fetch comments for these videos
            if (videoIds.length > 0) {
                const commentIds = videoIds.slice(0, 10);
                getDocs(query(collection(db, 'comments'), where('videoId', 'in', commentIds))).then(cSnap => {
                    setStats(prev => ({ ...prev, comments: cSnap.size }));
                });
            }
        }));

        return () => unsubs.forEach(u => u());
    }, [user]);

    return (
        <section className="admin-dashboard">
            <h1 className="heading">teacher dashboard</h1>
            <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(25rem, 1fr))', gap: '2rem' }}>
                <div className="admin-stat-box">
                    <i className="fas fa-list"></i>
                    <div>
                        <span className="count">{stats.playlists}</span>
                        <p>Total Playlists</p>
                    </div>
                </div>
                <div className="admin-stat-box">
                    <i className="fas fa-video"></i>
                    <div>
                        <span className="count">{stats.videos}</span>
                        <p>Total Videos</p>
                    </div>
                </div>
                <div className="admin-stat-box">
                    <i className="fas fa-heart"></i>
                    <div>
                        <span className="count">{stats.likes}</span>
                        <p>Total Likes</p>
                    </div>
                </div>
                <div className="admin-stat-box">
                    <i className="fas fa-comment"></i>
                    <div>
                        <span className="count">{stats.comments}</span>
                        <p>Total Comments</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '3rem' }}>
                <Link href="/teacher/playlists/add" className="inline-btn">
                    <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i> Add New Playlist
                </Link>
                <Link href="/teacher/videos/add" className="inline-btn">
                    <i className="fas fa-upload" style={{ marginRight: '.5rem' }}></i> Upload New Video
                </Link>
                <Link href="/teacher/analytics" className="inline-option-btn">
                    <i className="fas fa-chart-bar" style={{ marginRight: '.5rem' }}></i> View Analytics
                </Link>
            </div>
        </section>
    );
}
