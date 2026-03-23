'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { uploadFile } from '@/lib/uploadFile';

export default function TeacherProfile() {
    const { user, userData } = useAuth();
    const [form, setForm] = useState({
        firstName: '', lastName: '', expertise: '', bio: '', phone: '', website: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (userData) {
            setForm({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                expertise: userData.expertise || '',
                bio: userData.bio || '',
                phone: userData.phone || '',
                website: userData.website || '',
            });
            setPhotoPreview(userData.photoURL || user?.photoURL || '');
        }
    }, [userData, user]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.firstName.trim()) return setMsg('First name is required');
        setLoading(true);
        setMsg('');

        try {
            let photoURL = userData?.photoURL || user?.photoURL || '';

            if (photoFile) {
                const path = `${user.uid}/${Date.now()}_${photoFile.name}`;
                photoURL = await uploadFile('avatars', photoFile, path);
            }

            await updateDoc(doc(db, 'users', user.uid), {
                firstName: form.firstName,
                lastName: form.lastName,
                expertise: form.expertise,
                bio: form.bio,
                phone: form.phone,
                website: form.website,
                photoURL: photoURL,
                updatedAt: new Date().toISOString(),
            });

            await updateProfile(auth.currentUser, {
                displayName: `${form.firstName} ${form.lastName}`.trim(),
                photoURL: photoURL,
            });

            const newName = `${form.firstName} ${form.lastName}`.trim();
            const playlistsSnap = await getDocs(query(collection(db, 'playlists'), where('teacherId', '==', user.uid)));
            for (const pl of playlistsSnap.docs) {
                await updateDoc(doc(db, 'playlists', pl.id), { teacherName: newName, teacherPhoto: photoURL });
            }
            const videosSnap = await getDocs(query(collection(db, 'videos'), where('teacherId', '==', user.uid)));
            for (const v of videosSnap.docs) {
                await updateDoc(doc(db, 'videos', v.id), { teacherName: newName, teacherPhoto: photoURL });
            }

            setMsg('Profile updated successfully!');
        } catch (err) {
            setMsg('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', fontSize: '1.6rem', padding: '1.2rem 1.4rem',
        borderRadius: '.5rem', backgroundColor: 'var(--light-bg)',
        color: 'var(--black)', border: 'var(--border)',
    };

    const labelStyle = {
        fontSize: '1.5rem', color: 'var(--light-color)',
        marginBottom: '.5rem', display: 'block',
    };

    return (
        <section className="admin-dashboard">
            <h1 className="heading">edit profile</h1>

            <div style={{
                background: 'var(--white)', borderRadius: '.5rem',
                padding: '3rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)',
            }}>
                {msg && (
                    <p style={{
                        color: msg.includes('success') ? '#27ae60' : '#e74c3c',
                        marginBottom: '2rem', fontSize: '1.6rem', fontWeight: 600,
                        padding: '1rem', borderRadius: '.5rem',
                        background: msg.includes('success') ? '#d4edda' : '#f8d7da',
                    }}>
                        <i className={`fas ${msg.includes('success') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                            style={{ marginRight: '.5rem' }}></i>
                        {msg}
                    </p>
                )}

                {/* Photo Section */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '14rem', height: '14rem', borderRadius: '50%', overflow: 'hidden',
                        border: '.3rem solid var(--main-color)', margin: '0 auto 1.5rem',
                    }}>
                        <img
                            src={photoPreview || '/images/pic-1.jpg'}
                            alt="profile" referrerPolicy="no-referrer"
                            onError={(e) => e.target.src = '/images/pic-1.jpg'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <label className="inline-btn" style={{ cursor: 'pointer', fontSize: '1.4rem', display: 'inline-block' }}>
                        <i className="fas fa-camera" style={{ marginRight: '.5rem' }}></i>
                        Change Photo
                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                    </label>
                    <p style={{ fontSize: '1.2rem', color: 'var(--light-color)', marginTop: '.5rem' }}>JPG, PNG (max 5MB)</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>First Name <span style={{ color: 'var(--red)' }}>*</span></label>
                            <input type="text" placeholder="First name" required maxLength={50} style={inputStyle}
                                value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name</label>
                            <input type="text" placeholder="Last name" maxLength={50} style={inputStyle}
                                value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Expertise / Role</label>
                        <input type="text" placeholder="e.g. Web Developer, UI Designer" maxLength={100} style={inputStyle}
                            value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Bio / About</label>
                        <textarea placeholder="Tell students about yourself..." maxLength={500} rows={4}
                            value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input type="tel" placeholder="Phone number" maxLength={20} style={inputStyle}
                                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Website</label>
                            <input type="url" placeholder="https://yourwebsite.com" maxLength={200} style={inputStyle}
                                value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                        </div>
                    </div>

                    <p style={{ fontSize: '1.3rem', color: 'var(--light-color)', marginBottom: '2rem' }}>
                        <i className="fas fa-envelope" style={{ marginRight: '.5rem' }}></i>
                        Email: <strong>{user?.email}</strong> (cannot be changed)
                    </p>

                    <button type="submit" className="inline-btn" disabled={loading}
                        style={{ fontSize: '1.6rem', padding: '1.2rem 4rem', opacity: loading ? 0.6 : 1 }}>
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin" style={{ marginRight: '.5rem' }}></i> Saving...</>
                        ) : (
                            <><i className="fas fa-save" style={{ marginRight: '.5rem' }}></i> Save Changes</>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}
