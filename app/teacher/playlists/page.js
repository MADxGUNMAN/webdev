'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function TeacherPlaylists() {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlaylists = async () => {
        if (!user) return;
        const snap = await getDocs(query(collection(db, 'playlists'), where('teacherId', '==', user.uid)));
        setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchPlaylists(); }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this playlist and all its videos?')) return;
        await deleteDoc(doc(db, 'playlists', id));
        // Also delete related videos
        const videosSnap = await getDocs(query(collection(db, 'videos'), where('playlistId', '==', id)));
        for (const v of videosSnap.docs) {
            await deleteDoc(doc(db, 'videos', v.id));
        }
        fetchPlaylists();
    };

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">my playlists</h1>

            <div style={{ marginBottom: '2rem' }}>
                <Link href="/teacher/playlists/add" className="inline-btn">
                    <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i> Add New Playlist
                </Link>
            </div>

            {playlists.length === 0 ? (
                <p className="empty" style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>
                    No playlists yet. Create your first playlist to get started!
                </p>
            ) : (
                <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(30rem, 1fr))', gap: '2rem' }}>
                    {playlists.map(pl => (
                        <div key={pl.id} className="box" style={{ background: 'var(--white)', borderRadius: '.5rem', padding: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.1)' }}>
                            {pl.thumbnail && (
                                <img src={pl.thumbnail} alt={pl.title} style={{ width: '100%', height: '15rem', objectFit: 'cover', borderRadius: '.5rem', marginBottom: '1rem' }} />
                            )}
                            <h3 style={{ fontSize: '2rem', color: 'var(--black)', marginBottom: '.5rem' }}>{pl.title}</h3>
                            <p style={{ fontSize: '1.4rem', color: 'var(--light-color)', marginBottom: '1rem' }}>{pl.description?.slice(0, 100)}...</p>
                            <p style={{ fontSize: '1.3rem', color: 'var(--light-color)' }}>
                                <i className="fas fa-video"></i> {pl.videoCount || 0} videos &nbsp;
                                <i className="fas fa-heart"></i> {pl.totalLikes || 0} likes &nbsp;
                                <span className={`status-badge ${pl.status}`}>{pl.status}</span>
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <Link href={`/teacher/playlists/${pl.id}/edit`} className="inline-option-btn">edit</Link>
                                <button onClick={() => handleDelete(pl.id)} className="inline-delete-btn">delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
