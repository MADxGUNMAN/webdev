'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import TeacherCard from '@/components/TeacherCard';

export default function TeachersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for approved teachers
        const unsub = onSnapshot(query(
            collection(db, 'users'),
            where('role', '==', 'teacher'),
            where('teacherStatus', '==', 'approved')
        ), async (snap) => {
            const teacherList = [];
            for (const d of snap.docs) {
                const data = d.data();
                const playlistSnap = await getDocs(query(collection(db, 'playlists'), where('teacherId', '==', d.id)));
                const videoSnap = await getDocs(query(collection(db, 'videos'), where('teacherId', '==', d.id)));
                let totalLikes = 0;
                videoSnap.forEach(v => { totalLikes += v.data().likes || 0; });

                teacherList.push({
                    id: d.id,
                    img: data.photoURL || '/images/pic-1.jpg',
                    name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Teacher',
                    role: data.expertise || 'developer',
                    playlists: playlistSnap.size,
                    videos: videoSnap.size,
                    likes: totalLikes,
                });
            }
            setTeachers(teacherList);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const filtered = teachers.filter(t =>
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="teachers">
            <h1 className="heading">expert teachers</h1>

            <form className="search-tutor" onSubmit={e => e.preventDefault()}>
                <input
                    type="text"
                    placeholder="search tutors..."
                    maxLength={100}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="fas fa-search"></button>
            </form>

            <div className="box-container">
                <div className="box offer">
                    <h3>become a tutor</h3>
                    <p>Share your knowledge and inspire learners worldwide! Become a tutor on our platform and connect with students eager to learn from your expertise.</p>
                    <Link href="/register" className="inline-btn">get started</Link>
                </div>

                {loading ? (
                    <p style={{ padding: '2rem', fontSize: '1.6rem', color: 'var(--light-color)' }}>Loading teachers...</p>
                ) : filtered.length > 0 ? (
                    filtered.map(t => (
                        <TeacherCard
                            key={t.id}
                            img={t.img}
                            name={t.name}
                            role={t.role}
                            playlists={t.playlists}
                            videos={t.videos}
                            likes={t.likes}
                            href={`/teacher-profile?id=${t.id}`}
                        />
                    ))
                ) : (
                    <p style={{ padding: '2rem', fontSize: '1.6rem', color: 'var(--light-color)' }}>No teachers found.</p>
                )}
            </div>
        </section>
    );
}
