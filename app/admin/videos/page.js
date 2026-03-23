'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminVideos() {
    const [videos, setVideos] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchVideos = async () => {
        const snap = await getDocs(collection(db, 'videos'));
        setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchVideos(); }, []);

    const toggleBlock = async (id, currentStatus) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        await updateDoc(doc(db, 'videos', id), { status: newStatus });
        fetchVideos();
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this video?')) return;
        await deleteDoc(doc(db, 'videos', id));
        fetchVideos();
    };

    const filtered = videos.filter(v =>
        search === '' || v.title?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">manage videos</h1>

            <form onSubmit={e => e.preventDefault()} style={{ marginBottom: '2rem' }}>
                <input type="text" placeholder="Search videos by title..." maxLength={100}
                    className="box" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: '50rem', fontSize: '1.6rem', padding: '1.2rem' }} />
            </form>

            <p style={{ fontSize: '1.4rem', color: 'var(--light-color)', marginBottom: '1.5rem' }}>
                Total: <strong>{videos.length}</strong> videos
            </p>

            {filtered.length === 0 ? (
                <p style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>No videos found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Title</th>
                                <th>Likes</th>
                                <th>Views</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v.id} style={{ opacity: v.status === 'blocked' ? 0.5 : 1 }}>
                                    <td>
                                        {v.thumbnailUrl ?
                                            <img src={v.thumbnailUrl} alt={v.title} style={{ width: '8rem', height: '5rem', objectFit: 'cover', borderRadius: '.3rem' }} />
                                            : <i className="fas fa-video" style={{ fontSize: '2rem' }}></i>
                                        }
                                    </td>
                                    <td>{v.title}</td>
                                    <td>{v.likes || 0}</td>
                                    <td>{v.views || 0}</td>
                                    <td><span className={`status-badge ${v.status}`}>{v.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                                            <button onClick={() => toggleBlock(v.id, v.status)}
                                                className={v.status === 'blocked' ? 'inline-option-btn' : 'inline-delete-btn'}
                                                style={{ fontSize: '1.2rem', padding: '.5rem 1rem' }}>
                                                {v.status === 'blocked' ? 'Unblock' : 'Block'}
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="inline-delete-btn"
                                                style={{ fontSize: '1.2rem', padding: '.5rem 1rem', backgroundColor: '#c0392b' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
