'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, collection, query, where, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import JsonLd from '@/components/JsonLd';

const SITE_URL = 'https://www.webdevcodes.xyz';

function WatchVideoContent() {
    const params = useSearchParams();
    const router = useRouter();
    const { user, userData } = useAuth();
    const videoParam = params.get('v');

    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const viewIncremented = useRef(false);

    // Real-time video data
    useEffect(() => {
        if (!videoParam) { setLoading(false); return; }

        const unsub = onSnapshot(doc(db, 'videos', videoParam), (snap) => {
            if (snap.exists()) {
                setVideo({ id: snap.id, ...snap.data() });
            }
            setLoading(false);
        });

        return () => unsub();
    }, [videoParam]);

    // Dynamic title
    useEffect(() => {
        if (video?.title) {
            document.title = `${video.title} – WebDev Codes`;
        }
    }, [video]);

    // Increment views once per page visit (outside the listener)
    useEffect(() => {
        if (!videoParam || viewIncremented.current) return;
        viewIncremented.current = true;
        updateDoc(doc(db, 'videos', videoParam), { views: increment(1) }).catch(() => {});
    }, [videoParam]);

    // Real-time comments
    useEffect(() => {
        if (!videoParam) return;

        const unsub = onSnapshot(query(collection(db, 'comments'), where('videoId', '==', videoParam)), (snap) => {
            setComments(snap.docs.map(d => {
                const c = d.data();
                return {
                    id: d.id,
                    img: c.userPhoto || '/images/pic-1.jpg',
                    name: c.userName || 'User',
                    date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
                    text: c.text,
                    userId: c.userId,
                    createdAt: c.createdAt,
                };
            }));
        });

        return () => unsub();
    }, [videoParam]);

    const isLiked = userData?.likedVideos?.includes(video?.id);

    const toggleLikeVideo = async () => {
        if (!user) return router.push('/login');
        if (!video?.id) return;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            likedVideos: isLiked ? arrayRemove(video.id) : arrayUnion(video.id)
        });
        await updateDoc(doc(db, 'videos', video.id), {
            likes: increment(isLiked ? -1 : 1)
        });
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim() || !user) return !user && router.push('/login');

        setComment('');

        if (video?.id) {
            await addDoc(collection(db, 'comments'), {
                text: comment,
                userId: user.uid,
                userName: user.displayName || 'User',
                userPhoto: user.photoURL || '',
                videoId: video.id,
                playlistId: video.playlistId || '',
                createdAt: new Date().toISOString(),
            });
        }

        await updateDoc(doc(db, 'users', user.uid), {
            comments: increment(1)
        });
    };

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading video...</p>;
    if (!video) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Video not found.</p>;

    const videoSchema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.title,
        description: video.description || `Watch ${video.title} on WebDev Codes`,
        url: `${SITE_URL}/watch-video?v=${video.id}`,
        ...(video.thumbnailUrl && { thumbnailUrl: video.thumbnailUrl }),
        ...(video.videoUrl && { contentUrl: video.videoUrl }),
        ...(video.createdAt && { uploadDate: video.createdAt }),
        ...(video.teacherName && { author: { '@type': 'Person', name: video.teacherName } }),
        publisher: { '@type': 'Organization', name: 'WebDev Codes', url: SITE_URL },
        interactionStatistic: [
            { '@type': 'InteractionCounter', interactionType: { '@type': 'WatchAction' }, userInteractionCount: video.views || 0 },
            { '@type': 'InteractionCounter', interactionType: { '@type': 'LikeAction' }, userInteractionCount: video.likes || 0 },
        ],
        ...(comments.length > 0 && {
            comment: comments.slice(0, 10).map(c => ({
                '@type': 'Comment',
                text: c.text,
                author: { '@type': 'Person', name: c.name },
                ...(c.createdAt && { dateCreated: c.createdAt }),
            })),
        }),
    };

    return (
        <>
            <JsonLd data={videoSchema} />
            <section className="watch-video">
                <div className="video-container">
                    <div className="video">
                        <video src={video.videoUrl} controls poster={video.thumbnailUrl} id="video"></video>
                    </div>
                    <h3 className="title">{video.title}</h3>
                    <div className="info">
                        <p className="date"><i className="fas fa-calendar"></i><span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}</span></p>
                        <p className="date"><i className="fas fa-heart"></i><span>{video.likes || 0} likes</span></p>
                        <p className="date"><i className="fas fa-eye"></i><span>{video.views || 0} views</span></p>
                    </div>
                    <div className="tutor">
                        <img src={video.teacherPhoto || '/images/pic-1.jpg'} alt="tutor" referrerPolicy="no-referrer" />
                        <div>
                            <h3>{video.teacherName || 'Teacher'}</h3>
                            <span>educator</span>
                        </div>
                    </div>
                    <form className="flex" onSubmit={e => e.preventDefault()}>
                        <Link href={`/playlist?id=${video.playlistId}`} className="inline-btn">view playlist</Link>
                        <button type="button" onClick={toggleLikeVideo} style={{ backgroundColor: isLiked ? 'var(--black)' : '' }}>
                            <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'} style={{ color: isLiked ? 'var(--white)' : '' }}></i>
                            <span style={{ color: isLiked ? 'var(--white)' : '' }}>{isLiked ? 'liked' : 'like'}</span>
                        </button>
                    </form>
                    <p className="description">
                        {video.description || 'No description provided.'}
                    </p>
                </div>
            </section>

            <section className="comments">
                <h1 className="heading">{comments.length} comments</h1>

                <form className="add-comment" onSubmit={handleAddComment}>
                    <h3>add comments</h3>
                    <textarea
                        placeholder="enter your comment"
                        maxLength={1000}
                        rows={10}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    ></textarea>
                    <input type="submit" value="add comment" className="inline-btn" />
                </form>

                <h1 className="heading">user comments</h1>
                <div className="box-container">
                    {comments.length > 0 ? comments.map((c) => (
                        <div key={c.id} className="box">
                            <div className="user">
                                <img src={c.img} alt={c.name} referrerPolicy="no-referrer" />
                                <div>
                                    <h3>{c.name}</h3>
                                    <span>{c.date}</span>
                                </div>
                            </div>
                            <div className="comment-box">{c.text}</div>
                            {user && c.userId === user.uid && (
                                <div className="flex-btn" style={{ marginTop: '1rem' }}>
                                    <button className="inline-delete-btn" onClick={async () => {
                                        if (!confirm('Delete this comment?')) return;
                                        await deleteDoc(doc(db, 'comments', c.id));
                                    }}>delete comment</button>
                                </div>
                            )}
                        </div>
                    )) : (
                        <p style={{ fontSize: '1.6rem', color: 'var(--light-color)', padding: '1rem' }}>No comments yet. Be the first!</p>
                    )}
                </div>
            </section>
        </>
    );
}

export default function WatchVideoPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</div>}>
            <WatchVideoContent />
        </Suspense>
    );
}
