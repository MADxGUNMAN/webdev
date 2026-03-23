'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';

const SEED_CATEGORIES = [
    { name: 'development', icon: 'fas fa-code', order: 0 },
    { name: 'business', icon: 'fas fa-chart-simple', order: 1 },
    { name: 'design', icon: 'fas fa-pen', order: 2 },
    { name: 'marketing', icon: 'fas fa-chart-line', order: 3 },
    { name: 'music', icon: 'fas fa-music', order: 4 },
    { name: 'photography', icon: 'fas fa-camera', order: 5 },
    { name: 'software', icon: 'fas fa-cog', order: 6 },
    { name: 'science', icon: 'fas fa-vial', order: 7 },
    { name: 'data science', icon: 'fas fa-database', order: 8 },
    { name: 'mobile apps', icon: 'fas fa-mobile-screen', order: 9 },
    { name: 'cyber security', icon: 'fas fa-shield-halved', order: 10 },
    { name: 'AI & ML', icon: 'fas fa-robot', order: 11 },
];

const SEED_TOPICS = [
    { name: 'HTML', icon: 'fab fa-html5', order: 0 },
    { name: 'CSS', icon: 'fab fa-css3', order: 1 },
    { name: 'JavaScript', icon: 'fab fa-js', order: 2 },
    { name: 'React', icon: 'fab fa-react', order: 3 },
    { name: 'PHP', icon: 'fab fa-php', order: 4 },
    { name: 'Bootstrap', icon: 'fab fa-bootstrap', order: 5 },
    { name: 'Node.js', icon: 'fab fa-node-js', order: 6 },
    { name: 'Python', icon: 'fab fa-python', order: 7 },
    { name: 'Angular', icon: 'fab fa-angular', order: 8 },
    { name: 'Vue.js', icon: 'fab fa-vuejs', order: 9 },
    { name: 'Git', icon: 'fab fa-git-alt', order: 10 },
    { name: 'Docker', icon: 'fab fa-docker', order: 11 },
];

export default function SeedPage() {
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const seedData = async () => {
        setLoading(true);
        setMsg('Seeding...');

        // Check if already seeded
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.size > 0) {
            setMsg('Data already exists! Delete existing data first from Admin > Home Content.');
            setLoading(false);
            return;
        }

        for (const cat of SEED_CATEGORIES) {
            await addDoc(collection(db, 'categories'), cat);
        }
        for (const topic of SEED_TOPICS) {
            await addDoc(collection(db, 'topics'), topic);
        }

        setMsg(`Seeded ${SEED_CATEGORIES.length} categories and ${SEED_TOPICS.length} topics!`);
        setLoading(false);
    };

    return (
        <section className="admin-dashboard">
            <h1 className="heading">seed home content</h1>
            <div style={{ background: 'var(--white)', padding: '3rem', borderRadius: '.5rem', maxWidth: '60rem' }}>
                <p style={{ fontSize: '1.6rem', color: 'var(--black)', marginBottom: '2rem' }}>
                    This will populate the <strong>categories</strong> and <strong>topics</strong> collections with initial data.
                    Only run this once.
                </p>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--black)', marginBottom: '1rem' }}>Categories to add:</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2rem' }}>
                    {SEED_CATEGORIES.map((c, i) => (
                        <span key={i} style={{ background: 'var(--light-bg)', padding: '.5rem 1rem', borderRadius: '.3rem', fontSize: '1.3rem' }}>
                            <i className={c.icon} style={{ marginRight: '.3rem' }}></i> {c.name}
                        </span>
                    ))}
                </div>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--black)', marginBottom: '1rem' }}>Topics to add:</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2rem' }}>
                    {SEED_TOPICS.map((t, i) => (
                        <span key={i} style={{ background: 'var(--light-bg)', padding: '.5rem 1rem', borderRadius: '.3rem', fontSize: '1.3rem' }}>
                            <i className={t.icon} style={{ marginRight: '.3rem' }}></i> {t.name}
                        </span>
                    ))}
                </div>
                <button className="inline-btn" onClick={seedData} disabled={loading} style={{ fontSize: '1.6rem' }}>
                    {loading ? 'Seeding...' : 'Seed Database'}
                </button>
                {msg && <p style={{ marginTop: '1.5rem', fontSize: '1.5rem', color: 'var(--main-color)' }}>{msg}</p>}
            </div>
        </section>
    );
}
