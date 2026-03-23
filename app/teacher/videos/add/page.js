'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { uploadFile } from '@/lib/uploadFile';
import { useRouter } from 'next/navigation';

export default function AddVideo() {
    const { user } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ title: '', description: '', playlistId: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [progress, setProgress] = useState('');

    useEffect(() => {
        if (!user) return;
        const fetchPlaylists = async () => {
            const snap = await getDocs(query(collection(db, 'playlists'), where('teacherId', '==', user.uid)));
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPlaylists(list);
            if (list.length > 0) setForm(f => ({ ...f, playlistId: list[0].id }));
        };
        fetchPlaylists();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return setMsg('Please enter a title');
        if (!videoFile) return setMsg('Please select a video file');
        if (!form.playlistId) return setMsg('Please create a playlist first');
        setLoading(true);
        setMsg('');

        try {
            setProgress('Uploading video...');
            let videoUrl = '';
            if (videoFile) {
                const path = `${user.uid}/${Date.now()}_${videoFile.name}`;
                videoUrl = await uploadFile('videos', videoFile, path);
            }

            setProgress('Uploading thumbnail...');
            let thumbnailUrl = '';
            if (thumbFile) {
                const path = `${user.uid}/${Date.now()}_${thumbFile.name}`;
                thumbnailUrl = await uploadFile('thumbnails', thumbFile, path);
            }

            setProgress('Saving video data...');
            await addDoc(collection(db, 'videos'), {
                title: form.title,
                description: form.description,
                videoUrl,
                thumbnailUrl,
                playlistId: form.playlistId,
                teacherId: user.uid,
                likes: 0,
                views: 0,
                status: 'active',
                createdAt: new Date().toISOString(),
            });

            // Increment video count on the playlist
            await updateDoc(doc(db, 'playlists', form.playlistId), {
                videoCount: increment(1),
                updatedAt: new Date().toISOString(),
            });

            setMsg('Video uploaded successfully!');
            setProgress('');
            setTimeout(() => router.push('/teacher/videos'), 1200);
        } catch (err) {
            setMsg('Failed: ' + err.message);
            setProgress('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-container">
            <form onSubmit={handleSubmit}>
                <h3>upload new video</h3>
                {msg && <p style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>{msg}</p>}
                {progress && <p style={{ color: 'var(--main-color)', marginBottom: '1rem', fontSize: '1.4rem' }}>{progress}</p>}

                <p>video title <span>*</span></p>
                <input type="text" placeholder="Enter video title" required maxLength={100} className="box"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

                <p>description</p>
                <textarea placeholder="Enter video description" maxLength={2000} className="box" rows={5}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical', width: '100%', fontSize: '1.6rem', padding: '1.4rem' }}></textarea>

                <p>select playlist <span>*</span></p>
                {playlists.length === 0 ? (
                    <p style={{ fontSize: '1.4rem', color: '#e74c3c', marginBottom: '1rem' }}>
                        No playlists found. <a href="/teacher/playlists/add" style={{ color: 'var(--main-color)' }}>Create one first</a>.
                    </p>
                ) : (
                    <select className="box" value={form.playlistId} onChange={e => setForm(f => ({ ...f, playlistId: e.target.value }))}
                        style={{ width: '100%', fontSize: '1.6rem', padding: '1.4rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)', border: 'var(--border)' }}>
                        {playlists.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                )}

                <p>video file <span>*</span></p>
                <input type="file" accept="video/*" className="box" required onChange={e => setVideoFile(e.target.files[0])}
                    style={{ padding: '1rem', fontSize: '1.4rem' }} />

                <p>thumbnail image</p>
                <input type="file" accept="image/*" className="box" onChange={e => setThumbFile(e.target.files[0])}
                    style={{ padding: '1rem', fontSize: '1.4rem' }} />

                <input type="submit" value={loading ? 'uploading...' : 'upload video'} className="btn" disabled={loading} />
            </form>
        </section>
    );
}
