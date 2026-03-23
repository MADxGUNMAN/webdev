'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadFile } from '@/lib/uploadFile';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['development', 'design', 'business', 'marketing', 'music', 'photography', 'software', 'science'];

export default function AddPlaylist() {
    const { user } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ title: '', description: '', category: 'development' });
    const [thumbFile, setThumbFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return setMsg('Please enter a title');
        setLoading(true);
        setMsg('');

        try {
            let thumbnailUrl = '';
            if (thumbFile) {
                const path = `${user.uid}/${Date.now()}_${thumbFile.name}`;
                thumbnailUrl = await uploadFile('thumbnails', thumbFile, path);
            }

            await addDoc(collection(db, 'playlists'), {
                title: form.title,
                description: form.description,
                category: form.category,
                thumbnail: thumbnailUrl,
                teacherId: user.uid,
                teacherName: user.displayName || 'Teacher',
                teacherPhoto: user.photoURL || '/images/pic-1.jpg',
                videoCount: 0,
                totalLikes: 0,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            setMsg('Playlist created successfully!');
            setTimeout(() => router.push('/teacher/playlists'), 1200);
        } catch (err) {
            setMsg('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-container">
            <form onSubmit={handleSubmit}>
                <h3>add new playlist</h3>
                {msg && <p style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>{msg}</p>}

                <p>playlist title <span>*</span></p>
                <input type="text" placeholder="Enter playlist title" required maxLength={100} className="box"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

                <p>description</p>
                <textarea placeholder="Enter playlist description" maxLength={1000} className="box" rows={5}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical', width: '100%', fontSize: '1.6rem', padding: '1.4rem' }}></textarea>

                <p>category</p>
                <select className="box" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', fontSize: '1.6rem', padding: '1.4rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)', border: 'var(--border)' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <p>thumbnail image</p>
                <input type="file" accept="image/*" className="box" onChange={e => setThumbFile(e.target.files[0])}
                    style={{ padding: '1rem', fontSize: '1.4rem' }} />

                <input type="submit" value={loading ? 'creating...' : 'create playlist'} className="btn" disabled={loading} />
            </form>
        </section>
    );
}
