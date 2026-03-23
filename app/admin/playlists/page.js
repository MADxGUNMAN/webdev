'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPlaylists() {
    const [playlists, setPlaylists] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPlaylists = async () => {
        const snap = await getDocs(collection(db, 'playlists'));
        setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchPlaylists(); }, []);

    const toggleBlock = async (id, currentStatus) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        await updateDoc(doc(db, 'playlists', id), { status: newStatus });
        fetchPlaylists();
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this playlist?')) return;
        await deleteDoc(doc(db, 'playlists', id));
        fetchPlaylists();
    };

    const filtered = playlists.filter(p =>
        search === '' || p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.teacherName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">manage playlists</h1>

            <form onSubmit={e => e.preventDefault()} style={{ marginBottom: '2rem' }}>
                <input type="text" placeholder="Search by title or teacher name..." maxLength={100}
                    className="box" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: '50rem', fontSize: '1.6rem', padding: '1.2rem' }} />
            </form>

            <p style={{ fontSize: '1.4rem', color: 'var(--light-color)', marginBottom: '1.5rem' }}>
                Total: <strong>{playlists.length}</strong> playlists
            </p>

            {filtered.length === 0 ? (
                <p style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>No playlists found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Title</th>
                                <th>Teacher</th>
                                <th>Videos</th>
                                <th>Likes</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} style={{ opacity: p.status === 'blocked' ? 0.5 : 1 }}>
                                    <td>
                                        {p.thumbnail ?
                                            <img src={p.thumbnail} alt={p.title} style={{ width: '8rem', height: '5rem', objectFit: 'cover', borderRadius: '.3rem' }} />
                                            : <i className="fas fa-list" style={{ fontSize: '2rem' }}></i>
                                        }
                                    </td>
                                    <td>{p.title}</td>
                                    <td>{p.teacherName}</td>
                                    <td>{p.videoCount || 0}</td>
                                    <td>{p.totalLikes || 0}</td>
                                    <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                                            <button onClick={() => toggleBlock(p.id, p.status)}
                                                className={p.status === 'blocked' ? 'inline-option-btn' : 'inline-delete-btn'}
                                                style={{ fontSize: '1.2rem', padding: '.5rem 1rem' }}>
                                                {p.status === 'blocked' ? 'Unblock' : 'Block'}
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="inline-delete-btn"
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
