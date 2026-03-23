'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;
    if (!user) return null;

    return (
        <section className="user-profile">
            <h1 className="heading">your profile</h1>
            <div className="info">
                <div className="user">
                    <img src={user.photoURL || '/images/pic-1.jpg'} alt="profile" />
                    <h3>{user.displayName || 'Ansari Souaib'}</h3>
                    <p>student</p>
                    <Link href="/update" className="inline-btn">update profile</Link>
                </div>
                <div className="box-container">
                    <div className="box">
                        <div className="flex">
                            <i className="fas fa-bookmark"></i>
                            <div><span>{userData?.savedPlaylists?.length || 0}</span><p>saved playlist</p></div>
                        </div>
                        <Link href="/courses" className="inline-btn">view playlists</Link>
                    </div>
                    <div className="box">
                        <div className="flex">
                            <i className="fas fa-heart"></i>
                            <div><span>{userData?.likedVideos?.length || 0}</span><p>videos liked</p></div>
                        </div>
                        <Link href="/courses" className="inline-btn">view liked</Link>
                    </div>
                    <div className="box">
                        <div className="flex">
                            <i className="fas fa-comment"></i>
                            <div><span>{userData?.comments || 0}</span><p>videos comments</p></div>
                        </div>
                        <Link href="/comments" className="inline-btn">view comments</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
