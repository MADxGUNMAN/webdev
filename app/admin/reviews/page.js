'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [form, setForm] = useState({ name: '', text: '', stars: 5, order: 0 });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'reviews'), snap => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
        });
        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.text.trim()) return;
        if (editId) {
            await updateDoc(doc(db, 'reviews', editId), { ...form, stars: Number(form.stars), order: Number(form.order) });
            setEditId(null);
        } else {
            await addDoc(collection(db, 'reviews'), { ...form, stars: Number(form.stars), order: Number(form.order), createdAt: new Date().toISOString() });
        }
        setForm({ name: '', text: '', stars: 5, order: 0 });
    };

    const handleEdit = (r) => {
        setEditId(r.id);
        setForm({ name: r.name, text: r.text, stars: r.stars || 5, order: r.order || 0 });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this review?')) return;
        await deleteDoc(doc(db, 'reviews', id));
    };

    const inputStyle = { width: '100%', padding: '1rem', fontSize: '1.4rem', border: 'var(--border)', borderRadius: '.5rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)' };

    return (
        <section style={{ padding: '2rem' }}>
            <h1 className="heading">manage reviews</h1>

            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit} style={{ maxWidth: '60rem', margin: '0 auto 3rem', background: 'var(--white)', padding: '2rem', borderRadius: '.5rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                    {editId ? 'Edit Review' : 'Add New Review'}
                </h3>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '1.3rem', color: 'var(--light-color)', display: 'block', marginBottom: '.5rem' }}>Reviewer Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '1.3rem', color: 'var(--light-color)', display: 'block', marginBottom: '.5rem' }}>Review Text</label>
                    <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={3} required style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '1.3rem', color: 'var(--light-color)', display: 'block', marginBottom: '.5rem' }}>Stars (1-5)</label>
                        <input type="number" min="1" max="5" step="0.5" value={form.stars} onChange={e => setForm({ ...form, stars: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ fontSize: '1.3rem', color: 'var(--light-color)', display: 'block', marginBottom: '.5rem' }}>Order</label>
                        <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} style={inputStyle} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="inline-btn" style={{ fontSize: '1.4rem' }}>{editId ? 'Update' : 'Add Review'}</button>
                    {editId && <button type="button" className="inline-option-btn" style={{ fontSize: '1.4rem' }} onClick={() => { setEditId(null); setForm({ name: '', text: '', stars: 5, order: 0 }); }}>Cancel</button>}
                </div>
            </form>

            {/* Reviews List */}
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1.5rem' }}>All Reviews ({reviews.length})</h3>
                {reviews.map(r => (
                    <div key={r.id} style={{ background: 'var(--white)', padding: '1.5rem 2rem', borderRadius: '.5rem', marginBottom: '1rem', boxShadow: '0 .1rem .2rem rgba(0,0,0,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1.5rem', color: 'var(--black)' }}>{r.name} <span style={{ fontSize: '1.2rem', color: 'var(--light-color)' }}>— {'★'.repeat(Math.floor(r.stars || 0))}{(r.stars % 1 >= 0.5) ? '½' : ''} (order: {r.order || 0})</span></h4>
                            <p style={{ fontSize: '1.3rem', color: 'var(--light-color)', marginTop: '.5rem' }}>{r.text.length > 120 ? r.text.substring(0, 120) + '...' : r.text}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                            <button className="inline-option-btn" style={{ fontSize: '1.2rem', padding: '.6rem 1.2rem' }} onClick={() => handleEdit(r)}>Edit</button>
                            <button className="inline-delete-btn" style={{ fontSize: '1.2rem', padding: '.6rem 1.2rem' }} onClick={() => handleDelete(r.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
