'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/lib/uploadFile';

export default function UpdatePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            setEmail(user.email || '');
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) {
                const d = snap.data();
                setFirstName(d.firstName || '');
                setLastName(d.lastName || '');
                setBio(d.bio || '');
                setPhone(d.phone || '');
                setPhotoURL(d.photoURL || user.photoURL || '');
            }
        };
        loadProfile();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setMsg({ text: '', type: '' });

        try {
            let newPhotoURL = photoURL;

            // Upload new photo if selected
            if (photoFile) {
                newPhotoURL = await uploadFile('avatars', photoFile, `${user.uid}_${Date.now()}`);
            }

            const fullName = `${firstName} ${lastName}`.trim();

            // Update Firestore user doc
            await updateDoc(doc(db, 'users', user.uid), {
                firstName,
                lastName,
                bio,
                phone,
                photoURL: newPhotoURL,
            });

            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                displayName: fullName,
                photoURL: newPhotoURL,
            });

            // Update all comments by this user with the new name/photo
            const commentsSnap = await getDocs(query(collection(db, 'comments'), where('userId', '==', user.uid)));
            if (commentsSnap.size > 0) {
                const batch = writeBatch(db);
                commentsSnap.forEach(d => {
                    batch.update(d.ref, { userName: fullName, userPhoto: newPhotoURL });
                });
                await batch.commit();
            }

            // Update password if provided
            if (newPass) {
                if (newPass !== confirmPass) {
                    setMsg({ text: 'New passwords do not match!', type: 'error' });
                    setSaving(false);
                    return;
                }
                if (!oldPass) {
                    setMsg({ text: 'Please enter your current password to change it.', type: 'error' });
                    setSaving(false);
                    return;
                }
                const cred = EmailAuthProvider.credential(user.email, oldPass);
                await reauthenticateWithCredential(auth.currentUser, cred);
                await updatePassword(auth.currentUser, newPass);
                setOldPass(''); setNewPass(''); setConfirmPass('');
            }

            setPhotoURL(newPhotoURL);
            setPhotoFile(null);
            setMsg({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            console.error('Update failed:', err);
            setMsg({ text: err.message || 'Update failed. Try again.', type: 'error' });
        }
        setSaving(false);
    };

    if (loading) return <p style={{ padding: '2rem', fontSize: '1.8rem' }}>Loading...</p>;
    if (!user) return null;

    const inputStyle = {
        width: '100%', padding: '1.2rem', fontSize: '1.5rem',
        border: 'var(--border)', borderRadius: '.5rem',
        backgroundColor: 'var(--light-bg)', color: 'var(--black)',
    };

    const labelStyle = {
        display: 'block', fontSize: '1.4rem', color: 'var(--light-color)', marginBottom: '.5rem',
    };

    return (
        <section className="user-profile" style={{ paddingBottom: '4rem' }}>
            <h1 className="heading">update profile</h1>

            <div style={{ maxWidth: '60rem', margin: '0 auto', background: 'var(--white)', borderRadius: '.5rem', padding: '3rem', boxShadow: '0 .1rem .4rem rgba(0,0,0,.08)' }}>

                {msg.text && (
                    <div style={{
                        padding: '1.2rem 1.5rem', borderRadius: '.5rem', marginBottom: '2rem', fontSize: '1.4rem',
                        background: msg.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: msg.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${msg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} style={{ marginRight: '.5rem' }}></i>
                        {msg.text}
                    </div>
                )}

                {/* Photo Preview */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src={photoFile ? URL.createObjectURL(photoFile) : (photoURL || '/images/pic-1.jpg')}
                        alt="profile"
                        referrerPolicy="no-referrer"
                        style={{ width: '12rem', height: '12rem', borderRadius: '50%', objectFit: 'cover', border: '.3rem solid var(--main-color)' }}
                        onError={(e) => e.target.src = '/images/pic-1.jpg'}
                    />
                    <div style={{ marginTop: '1rem' }}>
                        <label className="inline-option-btn" style={{ cursor: 'pointer', fontSize: '1.3rem', display: 'inline-block' }}>
                            <i className="fas fa-camera" style={{ marginRight: '.5rem' }}></i> Change Photo
                            <input type="file" accept="image/*" hidden onChange={e => setPhotoFile(e.target.files[0])} />
                        </label>
                    </div>
                </div>

                <form onSubmit={handleUpdate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Email</label>
                        <input type="email" value={email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Phone</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>

                    {/* Password Section */}
                    <div style={{ borderTop: 'var(--border)', paddingTop: '2rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.6rem', color: 'var(--black)', marginBottom: '1.5rem' }}>
                            <i className="fas fa-lock" style={{ marginRight: '.5rem', color: 'var(--main-color)' }}></i>
                            Change Password <span style={{ fontSize: '1.2rem', color: 'var(--light-color)' }}>(optional)</span>
                        </h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Current Password</label>
                            <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)}
                                placeholder="Enter current password" style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                                    placeholder="New password" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm Password</label>
                                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                                    placeholder="Confirm new password" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="inline-btn" disabled={saving} style={{ fontSize: '1.6rem', width: '100%', marginTop: '1rem' }}>
                        {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </section>
    );
}
