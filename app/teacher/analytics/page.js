'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TeacherAnalytics() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ playlists: 0, videos: 0, likes: 0, views: 0, comments: 0 });
    const [topVideos, setTopVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            const playlistsSnap = await getDocs(query(collection(db, 'playlists'), where('teacherId', '==', user.uid)));
            const videosSnap = await getDocs(query(collection(db, 'videos'), where('teacherId', '==', user.uid)));

            let totalLikes = 0, totalViews = 0;
            const videoList = [];
            videosSnap.forEach(d => {
                const data = d.data();
                totalLikes += data.likes || 0;
                totalViews += data.views || 0;
                videoList.push({ id: d.id, ...data });
            });

            // Sort by likes for top videos
            videoList.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            setTopVideos(videoList.slice(0, 5));

            let totalComments = 0;
            if (videosSnap.docs.length > 0) {
                const videoIds = videosSnap.docs.map(d => d.id).slice(0, 10);
                const commentsSnap = await getDocs(query(collection(db, 'comments'), where('videoId', 'in', videoIds)));
                totalComments = commentsSnap.size;
            }

            setStats({
                playlists: playlistsSnap.size,
                videos: videosSnap.size,
                likes: totalLikes,
                views: totalViews,
                comments: totalComments,
            });
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading analytics...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">analytics</h1>

            <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {[
                    { icon: 'fa-list', count: stats.playlists, label: 'Playlists' },
                    { icon: 'fa-video', count: stats.videos, label: 'Videos' },
                    { icon: 'fa-heart', count: stats.likes, label: 'Total Likes' },
                    { icon: 'fa-eye', count: stats.views, label: 'Total Views' },
                    { icon: 'fa-comment', count: stats.comments, label: 'Comments' },
                ].map((s, i) => (
                    <div key={i} className="admin-stat-box">
                        <i className={`fas ${s.icon}`}></i>
                        <div>
                            <span className="count">{s.count}</span>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: '2.2rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                <i className="fas fa-fire" style={{ color: 'var(--main-color)', marginRight: '.5rem' }}></i>
                Top Performing Videos
            </h2>

            {topVideos.length === 0 ? (
                <p style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>No video data yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Likes</th>
                                <th>Views</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topVideos.map((v, i) => (
                                <tr key={v.id}>
                                    <td>{i + 1}</td>
                                    <td>{v.title}</td>
                                    <td><i className="fas fa-heart" style={{ color: '#e74c3c', marginRight: '.3rem' }}></i>{v.likes || 0}</td>
                                    <td><i className="fas fa-eye" style={{ color: 'var(--main-color)', marginRight: '.3rem' }}></i>{v.views || 0}</td>
                                    <td><span className={`status-badge ${v.status}`}>{v.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
