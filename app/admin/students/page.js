'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchStudents(); }, []);

    const toggleBlock = async (uid, currentlyBlocked) => {
        await updateDoc(doc(db, 'users', uid), {
            blocked: !currentlyBlocked,
            updatedAt: new Date().toISOString()
        });
        fetchStudents();
    };

    const filtered = students.filter(s =>
        search === '' ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">manage students</h1>

            <form onSubmit={e => e.preventDefault()} style={{ marginBottom: '2rem' }}>
                <input type="text" placeholder="Search students by name or email..." maxLength={100}
                    className="box" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: '50rem', fontSize: '1.6rem', padding: '1.2rem' }} />
            </form>

            <p style={{ fontSize: '1.4rem', color: 'var(--light-color)', marginBottom: '1.5rem' }}>
                Total: <strong>{students.length}</strong> students
            </p>

            {filtered.length === 0 ? (
                <p style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>No students found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Liked</th>
                                <th>Saved</th>
                                <th>Comments</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} style={{ opacity: s.blocked ? 0.5 : 1 }}>
                                    <td>
                                        <img src={s.photoURL || '/images/pic-1.jpg'} alt={s.firstName}
                                            style={{ width: '4rem', height: '4rem', borderRadius: '50%', objectFit: 'cover' }}
                                            referrerPolicy="no-referrer" />
                                    </td>
                                    <td>{s.firstName} {s.lastName} {s.blocked && <span style={{ color: '#e74c3c', fontSize: '1.2rem' }}>(blocked)</span>}</td>
                                    <td>{s.email}</td>
                                    <td>{s.likedVideos?.length || 0}</td>
                                    <td>{s.savedPlaylists?.length || 0}</td>
                                    <td>{s.comments || 0}</td>
                                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <button
                                            onClick={() => toggleBlock(s.id, s.blocked)}
                                            className={s.blocked ? 'inline-option-btn' : 'inline-delete-btn'}
                                            style={{ fontSize: '1.2rem', padding: '.5rem 1rem' }}
                                        >
                                            {s.blocked ? 'Unblock' : 'Block'}
                                        </button>
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
