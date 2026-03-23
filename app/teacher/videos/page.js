'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function TeacherVideos() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = async () => {
        if (!user) return;
        const snap = await getDocs(query(collection(db, 'videos'), where('teacherId', '==', user.uid)));
        setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchVideos(); }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this video?')) return;
        await deleteDoc(doc(db, 'videos', id));
        fetchVideos();
    };

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">my videos</h1>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/teacher/videos/add" className="inline-btn">
                    <i className="fas fa-upload" style={{ marginRight: '.5rem' }}></i> Upload New Video
                </Link>
            </div>

            {videos.length === 0 ? (
                <p style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>No videos uploaded yet.</p>
            ) : (
                <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(30rem, 1fr))', gap: '2rem' }}>
                    {videos.map(v => (
                        <div key={v.id} className="box" style={{ background: 'var(--white)', borderRadius: '.5rem', padding: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.1)' }}>
                            {v.thumbnailUrl && (
                                <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: 'auto', borderRadius: '.5rem', marginBottom: '1rem' }} />
                            )}
                            <h3 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '.5rem' }}>{v.title}</h3>
                            <p style={{ fontSize: '1.3rem', color: 'var(--light-color)', marginBottom: '1rem' }}>
                                <i className="fas fa-heart"></i> {v.likes || 0} likes &nbsp;
                                <i className="fas fa-eye"></i> {v.views || 0} views &nbsp;
                                <span className={`status-badge ${v.status}`}>{v.status}</span>
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button onClick={() => handleDelete(v.id)} className="inline-delete-btn">delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
