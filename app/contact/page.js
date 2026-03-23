'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', number: '', msg: '' });
    const [status, setStatus] = useState('');
    const [contactInfo, setContactInfo] = useState(null);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'siteConfig', 'contactInfo'), snap => {
            if (snap.exists()) setContactInfo(snap.data());
        });
        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending...');
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_key: 'c4398877-b883-4561-8b7b-f3a571810b01', ...formData }),
        });
        if (res.ok) {
            setStatus('Message sent successfully!');
            setFormData({ name: '', email: '', number: '', msg: '' });
        } else {
            setStatus('Failed to send. Please try again.');
        }
    };

    const phones = contactInfo?.phones || [];
    const emails = contactInfo?.emails || [];
    const address = contactInfo?.address || '';
    const addressLink = contactInfo?.addressLink || '#';

    return (
        <section className="contact">
            <div className="row">
                <div className="image">
                    <img src="/images/contact-img.svg" alt="contact" />
                </div>

                <form onSubmit={handleSubmit}>
                    <h3>get in touch</h3>
                    <input type="text" placeholder="enter your name" name="name" required maxLength={50} className="box"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input type="email" placeholder="enter your email" name="email" required maxLength={50} className="box"
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input type="number" placeholder="enter your number" name="number" required className="box"
                        value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                    <textarea name="msg" className="box" placeholder="enter your message" required maxLength={1000} cols={30} rows={10}
                        value={formData.msg} onChange={e => setFormData({ ...formData, msg: e.target.value })}></textarea>
                    <input type="submit" value="send message" className="inline-btn" />
                    {status && <p style={{ marginTop: '1rem', fontSize: '1.6rem', color: 'var(--main-color)' }}>{status}</p>}
                </form>
            </div>

            <div className="box-container">
                <div className="box">
                    <i className="fas fa-phone"></i>
                    <h3>phone number</h3>
                    {phones.map((p, i) => (
                        <a key={i} href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>
                    ))}
                </div>
                <div className="box">
                    <i className="fas fa-envelope"></i>
                    <h3>email address</h3>
                    {emails.map((e, i) => (
                        <a key={i} href={`mailto:${e}`}>{e}</a>
                    ))}
                </div>
                <div className="box">
                    <i className="fas fa-map-marker-alt"></i>
                    <h3>office address</h3>
                    <a href={addressLink} target="_blank" rel="noreferrer">{address}</a>
                </div>
            </div>
        </section>
    );
}
