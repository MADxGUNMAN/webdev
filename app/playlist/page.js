'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import JsonLd from '@/components/JsonLd';

const SITE_URL = 'https://www.webdevcodes.xyz';

function PlaylistContent() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const playlistId = params.get('id');
    const [playlist, setPlaylist] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const isSaved = userData?.savedPlaylists?.includes(playlistId);

    // Real-time playlist data
    useEffect(() => {
        if (!playlistId) { setLoading(false); return; }
        const unsub = onSnapshot(doc(db, 'playlists', playlistId), (snap) => {
            if (snap.exists()) {
                setPlaylist({ id: snap.id, ...snap.data() });
            }
            setLoading(false);
        });
        return () => unsub();
    }, [playlistId]);

    // Real-time videos
    useEffect(() => {
        if (!playlistId) return;
        const unsub = onSnapshot(query(collection(db, 'videos'), where('playlistId', '==', playlistId), where('status', '==', 'active')), (snap) => {
            setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [playlistId]);

    // Dynamic title
    useEffect(() => {
        if (playlist?.title) {
            document.title = `${playlist.title} – WebDev Codes`;
        }
    }, [playlist]);

    const toggleSavePlaylist = async () => {
        if (!user) return router.push('/login');
        if (!playlistId) return;
        const userRef = doc(db, 'users', user.uid);
        const currentlySaved = userData?.savedPlaylists?.includes(playlistId);
        await updateDoc(userRef, {
            savedPlaylists: currentlySaved ? arrayRemove(playlistId) : arrayUnion(playlistId)
        });
    };

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading playlist...</p>;
    if (!playlist) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Playlist not found.</p>;

    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: playlist.title,
        description: playlist.description || `Learn ${playlist.title} with WebDev Codes`,
        url: `${SITE_URL}/playlist?id=${playlist.id}`,
        provider: { '@type': 'Organization', name: 'WebDev Codes', url: SITE_URL },
        ...(playlist.teacherName && { instructor: { '@type': 'Person', name: playlist.teacherName } }),
        ...(playlist.thumbnail && { image: playlist.thumbnail }),
        ...(videos.length > 0 && {
            hasPart: videos.map((v, i) => ({
                '@type': 'VideoObject',
                name: v.title,
                url: `${SITE_URL}/watch-video?v=${v.id}`,
                position: i + 1,
                ...(v.thumbnailUrl && { thumbnailUrl: v.thumbnailUrl }),
            })),
        }),
    };

    return (
        <>
            <JsonLd data={courseSchema} />
            <section className="playlist-details">
                <h1 className="heading">playlist details</h1>
                <div className="row">
                    <div className="column">
                        <form className="save-playlist" onSubmit={e => e.preventDefault()}>
                            <button type="button" onClick={toggleSavePlaylist} style={{ backgroundColor: isSaved ? 'var(--black)' : '' }}>
                                <i className="far fa-bookmark" style={{ color: isSaved ? 'var(--white)' : '' }}></i>
                                <span style={{ color: isSaved ? 'var(--white)' : '' }}>
                                    {isSaved ? 'saved playlist' : 'save playlist'}
                                </span>
                            </button>
                        </form>
                        <div className="thumb">
                            <img src={playlist.thumbnail || '/images/pic-1.jpg'} alt="playlist" />
                            <span>{videos.length} videos</span>
                        </div>
                    </div>
                    <div className="column">
                        <div className="tutor">
                            <img src={playlist.teacherPhoto || '/images/pic-1.jpg'} alt="tutor" referrerPolicy="no-referrer" />
                            <div>
                                <h3>{playlist.teacherName || 'Teacher'}</h3>
                                <span>{playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : ''}</span>
                            </div>
                        </div>
                        <div className="details">
                            <h3>{playlist.title}</h3>
                            <p>{playlist.description || 'No description provided.'}</p>
                            <Link href={`/teacher-profile?id=${playlist.teacherId}`} className="inline-btn">view profile</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="playlist-videos">
                <h1 className="heading">playlist videos</h1>
                <div className="box-container">
                    {videos.length > 0 ? videos.map(v => (
                        <Link key={v.id} className="box" href={`/watch-video?v=${v.id}`}>
                            <i className="fas fa-play"></i>
                            <img src={v.thumbnailUrl || '/images/pic-1.jpg'} alt={v.title} />
                            <h3>{v.title}</h3>
                        </Link>
                    )) : (
                        <p style={{ fontSize: '1.6rem', color: 'var(--light-color)', padding: '2rem' }}>No videos in this playlist yet.</p>
                    )}
                </div>
            </section>
        </>
    );
}

export default function PlaylistPage() {
    return (
        <Suspense fallback={<p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>}>
            <PlaylistContent />
        </Suspense>
    );
}
