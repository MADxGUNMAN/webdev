'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function AdminContentPage() {
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const [newCat, setNewCat] = useState({ name: '', icon: '' });
    const [newTopic, setNewTopic] = useState({ name: '', icon: '' });
    const [loading, setLoading] = useState(true);
    const [editingCat, setEditingCat] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);

    const fetchData = async () => {
        const catSnap = await getDocs(collection(db, 'categories'));
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const topSnap = await getDocs(collection(db, 'topics'));
        setTopics(topSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCat.name.trim() || !newCat.icon.trim()) return;
        await addDoc(collection(db, 'categories'), { name: newCat.name, icon: newCat.icon, order: categories.length });
        setNewCat({ name: '', icon: '' });
        fetchData();
    };

    const addTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.name.trim() || !newTopic.icon.trim()) return;
        await addDoc(collection(db, 'topics'), { name: newTopic.name, icon: newTopic.icon, order: topics.length });
        setNewTopic({ name: '', icon: '' });
        fetchData();
    };

    const deleteCat = async (id) => {
        if (!confirm('Delete this category?')) return;
        await deleteDoc(doc(db, 'categories', id));
        fetchData();
    };

    const deleteTopic = async (id) => {
        if (!confirm('Delete this topic?')) return;
        await deleteDoc(doc(db, 'topics', id));
        fetchData();
    };

    const saveEditCat = async (id) => {
        await updateDoc(doc(db, 'categories', id), { name: editingCat.name, icon: editingCat.icon });
        setEditingCat(null);
        fetchData();
    };

    const saveEditTopic = async (id) => {
        await updateDoc(doc(db, 'topics', id), { name: editingTopic.name, icon: editingTopic.icon });
        setEditingTopic(null);
        fetchData();
    };

    const inputStyle = {
        fontSize: '1.4rem', padding: '1rem', borderRadius: '.5rem',
        border: 'var(--border)', backgroundColor: 'var(--light-bg)', color: 'var(--black)', flex: 1,
    };

    const tableStyle = {
        width: '100%', borderCollapse: 'collapse', fontSize: '1.4rem', marginTop: '1.5rem',
    };

    const tdStyle = {
        padding: '1rem 1.5rem', borderBottom: '.1rem solid rgba(0,0,0,.1)', color: 'var(--black)',
    };

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="admin-dashboard">
            <h1 className="heading">manage home content</h1>

            {/* Categories Section */}
            <div style={{ background: 'var(--white)', borderRadius: '.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                    <i className="fas fa-layer-group" style={{ color: 'var(--main-color)', marginRight: '.5rem' }}></i>
                    Top Categories
                </h2>

                <form onSubmit={addCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <input style={inputStyle} placeholder="Category name" value={newCat.name}
                        onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))} />
                    <input style={inputStyle} placeholder='Icon class (e.g. fas fa-code)' value={newCat.icon}
                        onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))} />
                    <button type="submit" className="inline-btn" style={{ fontSize: '1.4rem' }}>
                        <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i> Add
                    </button>
                </form>

                <table style={tableStyle}>
                    <thead>
                        <tr style={{ background: 'var(--light-bg)' }}>
                            <th style={tdStyle}>Icon</th>
                            <th style={tdStyle}>Name</th>
                            <th style={tdStyle}>Icon Class</th>
                            <th style={tdStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                <td style={tdStyle}><i className={c.icon} style={{ fontSize: '2rem', color: 'var(--main-color)' }}></i></td>
                                <td style={tdStyle}>
                                    {editingCat?.id === c.id ? (
                                        <input style={{ ...inputStyle, width: '100%' }} value={editingCat.name}
                                            onChange={e => setEditingCat(prev => ({ ...prev, name: e.target.value }))} />
                                    ) : c.name}
                                </td>
                                <td style={tdStyle}>
                                    {editingCat?.id === c.id ? (
                                        <input style={{ ...inputStyle, width: '100%' }} value={editingCat.icon}
                                            onChange={e => setEditingCat(prev => ({ ...prev, icon: e.target.value }))} />
                                    ) : <code style={{ fontSize: '1.2rem', color: 'var(--light-color)' }}>{c.icon}</code>}
                                </td>
                                <td style={tdStyle}>
                                    {editingCat?.id === c.id ? (
                                        <div style={{ display: 'flex', gap: '.5rem' }}>
                                            <button className="inline-btn" style={{ fontSize: '1.2rem' }} onClick={() => saveEditCat(c.id)}>Save</button>
                                            <button className="inline-delete-btn" style={{ fontSize: '1.2rem' }} onClick={() => setEditingCat(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '.5rem' }}>
                                            <button className="inline-option-btn" style={{ fontSize: '1.2rem' }}
                                                onClick={() => setEditingCat({ id: c.id, name: c.name, icon: c.icon })}>Edit</button>
                                            <button className="inline-delete-btn" style={{ fontSize: '1.2rem' }} onClick={() => deleteCat(c.id)}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && <tr><td colSpan={4} style={tdStyle}>No categories yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Topics Section */}
            <div style={{ background: 'var(--white)', borderRadius: '.5rem', padding: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                    <i className="fas fa-hashtag" style={{ color: 'var(--main-color)', marginRight: '.5rem' }}></i>
                    Popular Topics
                </h2>

                <form onSubmit={addTopic} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <input style={inputStyle} placeholder="Topic name" value={newTopic.name}
                        onChange={e => setNewTopic(t => ({ ...t, name: e.target.value }))} />
                    <input style={inputStyle} placeholder='Icon class (e.g. fab fa-html5)' value={newTopic.icon}
                        onChange={e => setNewTopic(t => ({ ...t, icon: e.target.value }))} />
                    <button type="submit" className="inline-btn" style={{ fontSize: '1.4rem' }}>
                        <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i> Add
                    </button>
                </form>

                <table style={tableStyle}>
                    <thead>
                        <tr style={{ background: 'var(--light-bg)' }}>
                            <th style={tdStyle}>Icon</th>
                            <th style={tdStyle}>Name</th>
                            <th style={tdStyle}>Icon Class</th>
                            <th style={tdStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.map(t => (
                            <tr key={t.id}>
                                <td style={tdStyle}><i className={t.icon} style={{ fontSize: '2rem', color: 'var(--main-color)' }}></i></td>
                                <td style={tdStyle}>
                                    {editingTopic?.id === t.id ? (
                                        <input style={{ ...inputStyle, width: '100%' }} value={editingTopic.name}
                                            onChange={e => setEditingTopic(prev => ({ ...prev, name: e.target.value }))} />
                                    ) : t.name}
                                </td>
                                <td style={tdStyle}>
                                    {editingTopic?.id === t.id ? (
                                        <input style={{ ...inputStyle, width: '100%' }} value={editingTopic.icon}
                                            onChange={e => setEditingTopic(prev => ({ ...prev, icon: e.target.value }))} />
                                    ) : <code style={{ fontSize: '1.2rem', color: 'var(--light-color)' }}>{t.icon}</code>}
                                </td>
                                <td style={tdStyle}>
                                    {editingTopic?.id === t.id ? (
                                        <div style={{ display: 'flex', gap: '.5rem' }}>
                                            <button className="inline-btn" style={{ fontSize: '1.2rem' }} onClick={() => saveEditTopic(t.id)}>Save</button>
                                            <button className="inline-delete-btn" style={{ fontSize: '1.2rem' }} onClick={() => setEditingTopic(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '.5rem' }}>
                                            <button className="inline-option-btn" style={{ fontSize: '1.2rem' }}
                                                onClick={() => setEditingTopic({ id: t.id, name: t.name, icon: t.icon })}>Edit</button>
                                            <button className="inline-delete-btn" style={{ fontSize: '1.2rem' }} onClick={() => deleteTopic(t.id)}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {topics.length === 0 && <tr><td colSpan={4} style={tdStyle}>No topics yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            <p style={{ fontSize: '1.3rem', color: 'var(--light-color)', marginTop: '2rem' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '.5rem' }}></i>
                Use Font Awesome icon classes. Browse icons at <a href="https://fontawesome.com/icons" target="_blank" rel="noreferrer" style={{ color: 'var(--main-color)' }}>fontawesome.com/icons</a>
            </p>
        </section>
    );
}
