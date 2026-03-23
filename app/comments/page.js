'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// For this demo, we use static comments as the user wanted "view comments option working".
// In a full implementation, these would be fetched from Firestore.
const staticUserComments = [
    { title: 'awesome tutorial!', topic: 'complete HTML tutorial (part 01)' },
    { title: 'amazing way of teaching!', topic: 'complete CSS tutorial (part 02)' },
    { title: 'loved it, thanks for the tutorial', topic: 'complete JS tutorial (part 05)' },
    { title: 'this is what I have been looking for!', topic: 'complete PHP tutorial (part 01)' },
    { title: 'very helpful, saved me a lot of time!', topic: 'complete Bootstrap tutorial (part 03)' },
    { title: 'great explanation of flexbox', topic: 'complete CSS tutorial (part 04)' },
];

export default function CommentsPage() {
    const { user, loading, userData } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;
    if (!user) return null;

    // We can simulate having up to userData.comments if we want, or just slice the static list
    const displayCount = Math.min(userData?.comments || staticUserComments.length, staticUserComments.length);
    const commentsToShow = staticUserComments.slice(0, displayCount || 0);

    return (
        <section className="comments">
            <h1 className="heading">your comments</h1>

            {commentsToShow.length === 0 ? (
                <p className="empty">you have not added any comments yet!</p>
            ) : (
                <div className="box-container">
                    {commentsToShow.map((comment, index) => (
                        <div className="box" key={index}>
                            <div className="comment-box">{comment.title}</div>
                            <div className="flex">
                                <div><i className="fas fa-video"></i><span>{comment.topic}</span></div>
                            </div>
                            <form className="flex-btn" onSubmit={e => e.preventDefault()}>
                                <input type="submit" value="edit comment" className="inline-option-btn" />
                                <input type="submit" value="delete comment" className="inline-delete-btn" />
                                <Link href="/watch-video" className="inline-btn">view video</Link>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
