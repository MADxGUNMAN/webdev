'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [tab, setTab] = useState('pending');
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'teacher')));
        setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchTeachers(); }, []);

    const updateStatus = async (uid, status) => {
        await updateDoc(doc(db, 'users', uid), { teacherStatus: status, updatedAt: new Date().toISOString() });
        fetchTeachers();
    };

    const filtered = teachers.filter(t => t.teacherStatus === tab);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">manage teachers</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {['pending', 'approved', 'blocked'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={tab === t ? 'inline-btn' : 'inline-option-btn'}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {t} ({teachers.filter(x => x.teacherStatus === t).length})
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p style={{ fontSize: '1.6rem', color: 'var(--light-color)' }}>No {tab} teachers.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <img src={t.photoURL || '/images/pic-1.jpg'} alt={t.firstName}
                                            style={{ width: '4rem', height: '4rem', borderRadius: '50%', objectFit: 'cover' }}
                                            referrerPolicy="no-referrer" />
                                    </td>
                                    <td>{t.firstName} {t.lastName}</td>
                                    <td>{t.email}</td>
                                    <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td><span className={`status-badge ${t.teacherStatus}`}>{t.teacherStatus}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                                            {t.teacherStatus === 'pending' && (
                                                <button onClick={() => updateStatus(t.id, 'approved')} className="inline-btn" style={{ fontSize: '1.2rem', padding: '.5rem 1rem' }}>
                                                    Approve
                                                </button>
                                            )}
                                            {t.teacherStatus !== 'blocked' && (
                                                <button onClick={() => updateStatus(t.id, 'blocked')} className="inline-delete-btn" style={{ fontSize: '1.2rem', padding: '.5rem 1rem' }}>
                                                    Block
                                                </button>
                                            )}
                                            {t.teacherStatus === 'blocked' && (
                                                <button onClick={() => updateStatus(t.id, 'approved')} className="inline-option-btn" style={{ fontSize: '1.2rem', padding: '.5rem 1rem' }}>
                                                    Unblock
                                                </button>
                                            )}
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
