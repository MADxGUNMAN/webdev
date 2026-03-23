'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadFile } from '@/lib/uploadFile';
import { useRouter, useParams } from 'next/navigation';

const CATEGORIES = ['development', 'design', 'business', 'marketing', 'music', 'photography', 'software', 'science'];

export default function EditPlaylist() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const playlistId = params.id;
    const [form, setForm] = useState({ title: '', description: '', category: 'development' });
    const [thumbFile, setThumbFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const snap = await getDoc(doc(db, 'playlists', playlistId));
            if (snap.exists()) {
                const d = snap.data();
                setForm({ title: d.title || '', description: d.description || '', category: d.category || 'development' });
            }
            setFetching(false);
        };
        fetch();
    }, [playlistId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const updates = {
                title: form.title,
                description: form.description,
                category: form.category,
                updatedAt: new Date().toISOString(),
            };
            if (thumbFile) {
                const path = `${user.uid}/${Date.now()}_${thumbFile.name}`;
                updates.thumbnail = await uploadFile('thumbnails', thumbFile, path);
            }
            await updateDoc(doc(db, 'playlists', playlistId), updates);
            setMsg('Playlist updated!');
            setTimeout(() => router.push('/teacher/playlists'), 1200);
        } catch (err) {
            setMsg('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;

    return (
        <section className="form-container">
            <form onSubmit={handleSubmit}>
                <h3>edit playlist</h3>
                {msg && <p style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>{msg}</p>}

                <p>playlist title <span>*</span></p>
                <input type="text" required maxLength={100} className="box"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

                <p>description</p>
                <textarea maxLength={1000} className="box" rows={5}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical', width: '100%', fontSize: '1.6rem', padding: '1.4rem' }}></textarea>

                <p>category</p>
                <select className="box" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', fontSize: '1.6rem', padding: '1.4rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)', border: 'var(--border)' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <p>new thumbnail (optional)</p>
                <input type="file" accept="image/*" className="box" onChange={e => setThumbFile(e.target.files[0])}
                    style={{ padding: '1rem', fontSize: '1.4rem' }} />

                <input type="submit" value={loading ? 'updating...' : 'update playlist'} className="btn" disabled={loading} />
            </form>
        </section>
    );
}
