import Link from 'next/link';

export default function TeacherCard({ img, name = 'Tutor', role = 'developer', playlists = 4, videos = 18, likes = 1208, href = '/teacher-profile' }) {
    return (
        <div className="box">
            <div className="tutor">
                <img src={img} alt={name} referrerPolicy="no-referrer"
                    style={{ width: '5rem', height: '5rem', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => e.target.src = '/images/pic-1.jpg'} />
                <div>
                    <h3>{name}</h3>
                    <span>{role}</span>
                </div>
            </div>
            <p>total playlists : <span>{playlists}</span></p>
            <p>total videos : <span>{videos}</span></p>
            <p>total likes : <span>{likes}</span></p>
            <Link href={href} className="inline-btn">view profile</Link>
        </div>
    );
}
