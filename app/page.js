'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';

export default function HomePage() {
  const { userData } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, 'playlists'), where('status', '==', 'active'), limit(6)), snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsub2 = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    const unsub3 = onSnapshot(collection(db, 'topics'), snap => {
      setTopics(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  return (
    <>
      <section className="home-grid">
        <h1 className="heading">quick options</h1>
        <div className="box-container">

          <div className="box">
            <h3 className="title">likes and comments</h3>
            <p className="likes">total likes : <span>{userData?.likedVideos?.length || 0}</span></p>
            <Link href="/courses" className="inline-btn">view likes</Link>
            <p className="likes">total comments : <span>{userData?.comments || 0}</span></p>
            <Link href="/courses" className="inline-btn">view comments</Link>
            <p className="likes">saved playlists : <span>{userData?.savedPlaylists?.length || 0}</span></p>
            <Link href="/courses" className="inline-btn">view playlists</Link>
          </div>

          <div className="box">
            <h3 className="title">top categories</h3>
            <div className="flex">
              {categories.length > 0 ? categories.map(c => (
                <Link key={c.id} href="/courses"><i className={c.icon}></i><span>{c.name}</span></Link>
              )) : (
                <p style={{ fontSize: '1.4rem', color: 'var(--light-color)' }}>No categories yet</p>
              )}
            </div>
          </div>

          <div className="box">
            <h3 className="title">popular topics</h3>
            <div className="flex">
              {topics.length > 0 ? topics.map(t => (
                <Link key={t.id} href="/courses"><i className={t.icon}></i><span>{t.name}</span></Link>
              )) : (
                <p style={{ fontSize: '1.4rem', color: 'var(--light-color)' }}>No topics yet</p>
              )}
            </div>
          </div>

          <div className="box">
            <h3 className="title">become a tutor</h3>
            <p className="tutor">Share your knowledge and inspire learners worldwide!</p>
            <Link href="/register" className="inline-btn">get started</Link>
          </div>

        </div>
      </section>

      <section className="courses">
        <h1 className="heading">our courses</h1>
        <div className="box-container">
          {loading ? (
            <p style={{ fontSize: '1.8rem', color: 'var(--light-color)', padding: '2rem' }}>Loading courses...</p>
          ) : courses.length > 0 ? (
            courses.map(pl => (
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
            ))
          ) : (
            <p style={{ fontSize: '1.8rem', color: 'var(--light-color)', padding: '2rem' }}>
              No courses available yet. Check back soon!
            </p>
          )}
        </div>
        {courses.length > 0 && (
          <div className="more-btn">
            <Link href="/courses" className="inline-option-btn">view all courses</Link>
          </div>
        )}
      </section>
    </>
  );
}
