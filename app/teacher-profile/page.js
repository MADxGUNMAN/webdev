'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import CourseCard from '@/components/CourseCard';
import JsonLd from '@/components/JsonLd';

const SITE_URL = 'https://www.webdevcodes.xyz';

function TeacherProfileContent() {
    const params = useSearchParams();
    const teacherId = params.get('id');
    const [teacher, setTeacher] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [stats, setStats] = useState({ playlists: 0, videos: 0, likes: 0 });
    const [loading, setLoading] = useState(true);

    // Real-time teacher data
    useEffect(() => {
        if (!teacherId) { setLoading(false); return; }
        const unsub = onSnapshot(doc(db, 'users', teacherId), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setTeacher({
                    id: snap.id,
                    name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Teacher',
                    photoURL: data.photoURL || '/images/pic-1.jpg',
                    role: data.expertise || 'developer',
                    bio: data.bio || '',
                });
            }
            setLoading(false);
        });
        return () => unsub();
    }, [teacherId]);

    // Dynamic title
    useEffect(() => {
        if (teacher?.name) {
            document.title = `${teacher.name} – WebDev Codes`;
        }
    }, [teacher]);

    // Real-time playlists
    useEffect(() => {
        if (!teacherId) return;
        const unsub = onSnapshot(query(collection(db, 'playlists'), where('teacherId', '==', teacherId), where('status', '==', 'active')), (snap) => {
            setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setStats(prev => ({ ...prev, playlists: snap.size }));
        });
        return () => unsub();
    }, [teacherId]);

    // Real-time video stats
    useEffect(() => {
        if (!teacherId) return;
        const unsub = onSnapshot(query(collection(db, 'videos'), where('teacherId', '==', teacherId)), (snap) => {
            let totalLikes = 0;
            snap.forEach(v => { totalLikes += v.data().likes || 0; });
            setStats(prev => ({ ...prev, videos: snap.size, likes: totalLikes }));
        });
        return () => unsub();
    }, [teacherId]);

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading profile...</p>;
    if (!teacher) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Teacher not found.</p>;

    const profileSchema = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: `${SITE_URL}/teacher-profile?id=${teacher.id}`,
        mainEntity: {
            '@type': 'Person',
            name: teacher.name,
            image: teacher.photoURL,
            jobTitle: teacher.role,
            ...(teacher.bio && { description: teacher.bio }),
            worksFor: { '@type': 'Organization', name: 'WebDev Codes', url: SITE_URL },
        },
    };

    return (
        <>
            <JsonLd data={profileSchema} />
            <section className="teacher-profile">
                <h1 className="heading">profile details</h1>
                <div className="details">
                    <div className="tutor">
                        <img src={teacher.photoURL} alt={teacher.name} referrerPolicy="no-referrer"
                            onError={(e) => e.target.src = '/images/pic-1.jpg'} />
                        <h3>{teacher.name}</h3>
                        <span>{teacher.role}</span>
                    </div>
                    {teacher.bio && (
                        <p style={{ fontSize: '1.5rem', color: 'var(--light-color)', textAlign: 'center', maxWidth: '60rem', margin: '1rem auto' }}>
                            {teacher.bio}
                        </p>
                    )}
                    <div className="flex">
                        <p>total playlists : <span>{stats.playlists}</span></p>
                        <p>total videos : <span>{stats.videos}</span></p>
                        <p>total likes : <span>{stats.likes}</span></p>
                    </div>
                </div>
            </section>

            <section className="courses">
                <h1 className="heading">{teacher.name}&apos;s courses</h1>
                <div className="box-container">
                    {playlists.length > 0 ? playlists.map(pl => (
                        <CourseCard
                            key={pl.id}
                            tutorImg={teacher.photoURL}
                            thumb={pl.thumbnail || '/images/pic-1.jpg'}
                            title={pl.title}
                            date={pl.createdAt ? new Date(pl.createdAt).toLocaleDateString() : ''}
                            videos={`${pl.videoCount || 0} videos`}
                            href={`/playlist?id=${pl.id}`}
                            tutorName={teacher.name}
                        />
                    )) : (
                        <p style={{ fontSize: '1.6rem', color: 'var(--light-color)', padding: '2rem' }}>No courses yet.</p>
                    )}
                </div>
            </section>
        </>
    );
}

export default function TeacherProfilePage() {
    return (
        <Suspense fallback={<p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>}>
            <TeacherProfileContent />
        </Suspense>
    );
}
