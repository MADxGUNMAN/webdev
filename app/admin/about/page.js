'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function AdminAboutPage() {
    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [stats, setStats] = useState([]);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'siteConfig', 'aboutPage'), snap => {
            if (snap.exists()) {
                const d = snap.data();
                setHeading(d.heading || '');
                setDescription(d.description || '');
                setStats(d.stats || []);
            }
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        await setDoc(doc(db, 'siteConfig', 'aboutPage'), { heading, description, stats });
        setMsg('Saved successfully!');
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
    };

    const updateStat = (index, field, value) => {
        const updated = [...stats];
        updated[index] = { ...updated[index], [field]: value };
        setStats(updated);
    };

    const addStat = () => {
        setStats([...stats, { icon: 'fa-star', value: '0', label: 'New Stat' }]);
    };

    const removeStat = (index) => {
        setStats(stats.filter((_, i) => i !== index));
    };

    const inputStyle = { width: '100%', padding: '1rem', fontSize: '1.4rem', border: 'var(--border)', borderRadius: '.5rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)' };
    const labelStyle = { fontSize: '1.3rem', color: 'var(--light-color)', display: 'block', marginBottom: '.5rem' };

    return (
        <section style={{ padding: '2rem' }}>
            <h1 className="heading">manage about page</h1>

            {msg && (
                <div style={{ maxWidth: '70rem', margin: '0 auto 2rem', padding: '1rem 1.5rem', borderRadius: '.5rem', background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', fontSize: '1.4rem' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '.5rem' }}></i>{msg}
                </div>
            )}

            <div style={{ maxWidth: '70rem', margin: '0 auto' }}>
                {/* Heading & Description */}
                <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: '.5rem', marginBottom: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                        <i className="fas fa-heading" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Content
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Heading</label>
                        <input type="text" value={heading} onChange={e => setHeading(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                </div>

                {/* Stats Boxes */}
                <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: '.5rem', marginBottom: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                        <i className="fas fa-chart-bar" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Stats Boxes
                    </h3>
                    {stats.map((s, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < stats.length - 1 ? 'var(--border)' : 'none' }}>
                            <div>
                                <label style={labelStyle}>Icon Class</label>
                                <input type="text" value={s.icon} onChange={e => updateStat(i, 'icon', e.target.value)} style={inputStyle} placeholder="fa-graduation-cap" />
                            </div>
                            <div>
                                <label style={labelStyle}>Value</label>
                                <input type="text" value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} style={inputStyle} placeholder="+10k" />
                            </div>
                            <div>
                                <label style={labelStyle}>Label</label>
                                <input type="text" value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} style={inputStyle} placeholder="online courses" />
                            </div>
                            <button className="inline-delete-btn" onClick={() => removeStat(i)} style={{ fontSize: '1.2rem', padding: '.8rem 1rem', marginBottom: '.2rem' }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                    <button className="inline-option-btn" onClick={addStat} style={{ fontSize: '1.3rem' }}>
                        <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i>Add Stat
                    </button>
                </div>

                <button className="inline-btn" onClick={handleSave} disabled={saving} style={{ fontSize: '1.6rem', width: '100%' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </section>
    );
}
