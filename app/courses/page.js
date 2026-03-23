'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import CourseCard from '@/components/CourseCard';
import Link from 'next/link';

export default function CoursesPage() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(query(collection(db, 'playlists'), where('status', '==', 'active')), snap => {
            setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    if (loading) return (
        <section className="courses">
            <h1 className="heading">our courses</h1>
            <p style={{ padding: '2rem', fontSize: '1.8rem', color: 'var(--light-color)' }}>Loading courses...</p>
        </section>
    );

    return (
        <section className="courses">
            <h1 className="heading">our courses</h1>
            <div className="box-container">
                {playlists.length > 0 ? playlists.map(pl => (
                    <CourseCard
                        key={pl.id}
                        tutorImg={pl.teacherPhoto || '/images/pic-1.jpg'}
                        thumb={pl.thumbnail || '/images/pic-1.jpg'}
                        title={pl.title}
                        date={pl.createdAt ? new Date(pl.createdAt).toLocaleDateString() : ''}
                        videos={`${pl.videoCount || 0} videos`}
                        href={`/playlist?id=${pl.id}`}
                        tutorName={pl.teacherName}
                    />
                )) : (
                    <p style={{ fontSize: '1.8rem', color: 'var(--light-color)', padding: '2rem' }}>
                        No courses available yet. Check back soon!
                    </p>
                )}
            </div>
        </section>
    );
}
