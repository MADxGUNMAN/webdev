'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function AdminContactFooterPage() {
    // Contact
    const [phones, setPhones] = useState([]);
    const [emails, setEmails] = useState([]);
    const [address, setAddress] = useState('');
    const [addressLink, setAddressLink] = useState('');
    // Footer
    const [copyrightYear, setCopyrightYear] = useState('2025');
    const [name, setName] = useState('');
    const [nameLink, setNameLink] = useState('');
    const [extraText, setExtraText] = useState('');
    // Developer
    const [devUrl, setDevUrl] = useState('');
    const [devLabel, setDevLabel] = useState('developers');

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const unsub1 = onSnapshot(doc(db, 'siteConfig', 'contactInfo'), snap => {
            if (snap.exists()) {
                const d = snap.data();
                setPhones(d.phones || []);
                setEmails(d.emails || []);
                setAddress(d.address || '');
                setAddressLink(d.addressLink || '');
            }
        });
        const unsub2 = onSnapshot(doc(db, 'siteConfig', 'footer'), snap => {
            if (snap.exists()) {
                const d = snap.data();
                setCopyrightYear(d.copyrightYear || '2025');
                setName(d.name || '');
                setNameLink(d.nameLink || '');
                setExtraText(d.extraText || '');
            }
        });
        const unsub3 = onSnapshot(doc(db, 'siteConfig', 'developers'), snap => {
            if (snap.exists()) {
                const d = snap.data();
                setDevUrl(d.url || '');
                setDevLabel(d.label || 'developers');
            }
        });
        return () => { unsub1(); unsub2(); unsub3(); };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        await Promise.all([
            setDoc(doc(db, 'siteConfig', 'contactInfo'), { phones, emails, address, addressLink }),
            setDoc(doc(db, 'siteConfig', 'footer'), { copyrightYear, name, nameLink, extraText }),
            setDoc(doc(db, 'siteConfig', 'developers'), { url: devUrl, label: devLabel }),
        ]);
        setMsg('Saved successfully!');
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
    };

    const inputStyle = { width: '100%', padding: '1rem', fontSize: '1.4rem', border: 'var(--border)', borderRadius: '.5rem', backgroundColor: 'var(--light-bg)', color: 'var(--black)' };
    const labelStyle = { fontSize: '1.3rem', color: 'var(--light-color)', display: 'block', marginBottom: '.5rem' };
    const cardStyle = { background: 'var(--white)', padding: '2rem', borderRadius: '.5rem', marginBottom: '2rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' };
    const titleStyle = { fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1.5rem' };

    return (
        <section style={{ padding: '2rem' }}>
            <h1 className="heading">manage contact &amp; footer</h1>

            {msg && (
                <div style={{ maxWidth: '70rem', margin: '0 auto 2rem', padding: '1rem 1.5rem', borderRadius: '.5rem', background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', fontSize: '1.4rem' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '.5rem' }}></i>{msg}
                </div>
            )}

            <div style={{ maxWidth: '70rem', margin: '0 auto' }}>
                {/* Phone Numbers */}
                <div style={cardStyle}>
                    <h3 style={titleStyle}>
                        <i className="fas fa-phone" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Phone Numbers
                    </h3>
                    {phones.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <input type="text" value={p} onChange={e => { const u = [...phones]; u[i] = e.target.value; setPhones(u); }} style={inputStyle} />
                            <button className="inline-delete-btn" onClick={() => setPhones(phones.filter((_, j) => j !== i))} style={{ fontSize: '1.2rem', padding: '.8rem 1rem', flexShrink: 0 }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                    <button className="inline-option-btn" onClick={() => setPhones([...phones, ''])} style={{ fontSize: '1.3rem' }}>
                        <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i>Add Phone
                    </button>
                </div>

                {/* Email Addresses */}
                <div style={cardStyle}>
                    <h3 style={titleStyle}>
                        <i className="fas fa-envelope" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Email Addresses
                    </h3>
                    {emails.map((e, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <input type="email" value={e} onChange={ev => { const u = [...emails]; u[i] = ev.target.value; setEmails(u); }} style={inputStyle} />
                            <button className="inline-delete-btn" onClick={() => setEmails(emails.filter((_, j) => j !== i))} style={{ fontSize: '1.2rem', padding: '.8rem 1rem', flexShrink: 0 }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                    <button className="inline-option-btn" onClick={() => setEmails([...emails, ''])} style={{ fontSize: '1.3rem' }}>
                        <i className="fas fa-plus" style={{ marginRight: '.5rem' }}></i>Add Email
                    </button>
                </div>

                {/* Office Address */}
                <div style={cardStyle}>
                    <h3 style={titleStyle}>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Office Address
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Address Text</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Google Maps Link</label>
                        <input type="text" value={addressLink} onChange={e => setAddressLink(e.target.value)} style={inputStyle} />
                    </div>
                </div>

                {/* Footer */}
                <div style={cardStyle}>
                    <h3 style={titleStyle}>
                        <i className="fas fa-copyright" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Footer
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Copyright Year</label>
                            <input type="text" value={copyrightYear} onChange={e => setCopyrightYear(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Display Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Name Link (URL)</label>
                            <input type="text" value={nameLink} onChange={e => setNameLink(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Extra Text</label>
                            <input type="text" value={extraText} onChange={e => setExtraText(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '1.3rem', color: 'var(--light-color)' }}>
                        Preview: &copy; copyright {copyrightYear} by <span style={{ color: 'var(--main-color)' }}>{name}</span> | {extraText}
                    </div>
                </div>

                {/* Developer Link */}
                <div style={cardStyle}>
                    <h3 style={titleStyle}>
                        <i className="fas fa-laptop-code" style={{ marginRight: '.8rem', color: 'var(--main-color)' }}></i>Developer Button
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Button Label</label>
                            <input type="text" value={devLabel} onChange={e => setDevLabel(e.target.value)} style={inputStyle} placeholder="developers" />
                        </div>
                        <div>
                            <label style={labelStyle}>Button URL</label>
                            <input type="text" value={devUrl} onChange={e => setDevUrl(e.target.value)} style={inputStyle} placeholder="https://example.com" />
                        </div>
                    </div>
                </div>

                <button className="inline-btn" onClick={handleSave} disabled={saving} style={{ fontSize: '1.6rem', width: '100%' }}>
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </section>
    );
}
