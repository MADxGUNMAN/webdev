'use client';
import { useEffect, useState } from 'react';
import ReviewCard from '@/components/ReviewCard';
import JsonLd from '@/components/JsonLd';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const SITE_URL = 'https://www.webdevcodes.xyz';

export default function AboutPage() {
    const { user, userData } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [stars, setStars] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [aboutData, setAboutData] = useState(null);

    // Real-time about page config
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'siteConfig', 'aboutPage'), snap => {
            if (snap.exists()) setAboutData(snap.data());
        });
        return () => unsub();
    }, []);

    // Real-time reviews
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'reviews'), snap => {
            setReviews(
                snap.docs.map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
            );
        });
        return () => unsub();
    }, []);

    // Check if user already reviewed
    useEffect(() => {
        if (!user) { setHasReviewed(false); return; }
        getDocs(query(collection(db, 'reviews'), where('userId', '==', user.uid)))
            .then(snap => setHasReviewed(snap.size > 0));
    }, [user, reviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reviewText.trim() || !user) return;
        setSubmitting(true);
        const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || user.displayName || 'Student';
        await addDoc(collection(db, 'reviews'), {
            name: fullName,
            text: reviewText.trim(),
            stars: Number(stars),
            img: user.photoURL || '',
            userId: user.uid,
            order: reviews.length,
            createdAt: new Date().toISOString(),
        });
        setReviewText('');
        setStars(5);
        setSubmitting(false);
    };

    const heading = aboutData?.heading || 'why choose us?';
    const description = aboutData?.description || '';
    const stats = aboutData?.stats || [];

    useEffect(() => {
        document.title = 'About Us – WebDev Codes';
    }, []);

    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length).toFixed(1) : 0;

    const aboutSchema = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: heading,
        description: description,
        url: `${SITE_URL}/about`,
        mainEntity: {
            '@type': 'EducationalOrganization',
            name: 'WebDev Codes',
            url: SITE_URL,
            ...(reviews.length > 0 && {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: avgRating,
                    reviewCount: reviews.length,
                    bestRating: 5,
                    worstRating: 1,
                },
                review: reviews.slice(0, 10).map(r => ({
                    '@type': 'Review',
                    author: { '@type': 'Person', name: r.name },
                    reviewRating: { '@type': 'Rating', ratingValue: r.stars || 5, bestRating: 5 },
                    reviewBody: r.text,
                    ...(r.createdAt && { datePublished: r.createdAt }),
                })),
            }),
        },
    };

    return (
        <>
            <JsonLd data={aboutSchema} />
            <section className="about">
                <div className="row">
                    <div className="image">
                        <img src="/images/about-img.svg" alt="about" />
                    </div>
                    <div className="content">
                        <h3>{heading}</h3>
                        <p>{description}</p>
                        <a href="/courses" className="inline-btn">our courses</a>
                    </div>
                </div>

                <div className="box-container">
                    {stats.map((s, i) => (
                        <div className="box" key={i}>
                            <i className={`fas ${s.icon}`}></i>
                            <div><h3>{s.value}</h3><p>{s.label}</p></div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="reviews">
                <h1 className="heading">student&apos;s reviews</h1>

                {user && !hasReviewed && (
                    <form onSubmit={handleSubmit} style={{ maxWidth: '80rem', margin: '0 auto 3rem', background: 'var(--white)', padding: '2.5rem', borderRadius: '.5rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>
                        <h3 style={{ fontSize: '2rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                            <i className="fas fa-pen" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>
                            Leave a Review
                        </h3>
                        <textarea
                            placeholder="Share your experience with our platform..."
                            maxLength={500}
                            rows={5}
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            required
                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.5rem', border: 'var(--border)', borderRadius: '.5rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)', resize: 'vertical' }}
                        ></textarea>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '1.5rem', color: 'var(--light-color)' }}>Rating:</label>
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <i key={n}
                                        className="fas fa-star"
                                        style={{ fontSize: '2.2rem', cursor: 'pointer', color: n <= stars ? '#f1c40f' : '#555', transition: 'color .2s' }}
                                        onClick={() => setStars(n)}
                                    ></i>
                                ))}
                            </div>
                            <span style={{ fontSize: '1.4rem', color: 'var(--light-color)' }}>{stars} / 5</span>
                        </div>
                        <button type="submit" className="inline-btn" disabled={submitting} style={{ fontSize: '1.5rem' }}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}

                {user && hasReviewed && (
                    <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--light-color)', marginBottom: '2rem' }}>
                        <i className="fas fa-check-circle" style={{ color: '#2ecc71', marginRight: '.5rem' }}></i>
                        Thank you for your review!
                    </p>
                )}

                {!user && (
                    <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--light-color)', marginBottom: '2rem' }}>
                        <a href="/login" style={{ color: 'var(--main-color)' }}>Login</a> to leave a review.
                    </p>
                )}

                <div className="box-container">
                    {reviews.length > 0 ? reviews.map(r => (
                        <div key={r.id} style={{ position: 'relative' }}>
                            <ReviewCard name={r.name} text={r.text} img={r.img || '/images/pic-1.jpg'} stars={r.stars || 4.5} />
                            {user && r.userId === user.uid && (
                                <button className="inline-delete-btn" onClick={async () => {
                                    if (!confirm('Delete your review?')) return;
                                    await deleteDoc(doc(db, 'reviews', r.id));
                                }} style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.2rem', padding: '.5rem 1rem' }}>
                                    <i className="fas fa-trash" style={{ marginRight: '.4rem' }}></i>Delete
                                </button>
                            )}
                        </div>
                    )) : (
                        <p style={{ fontSize: '1.6rem', color: 'var(--light-color)', padding: '2rem' }}>No reviews yet. Be the first!</p>
                    )}
                </div>
            </section>
        </>
    );
}
