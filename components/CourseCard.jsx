import Link from 'next/link';

export default function CourseCard({ tutorImg, thumb, title, date, videos = '10 videos', href = '/playlist', tutorName = 'Tutor' }) {
    return (
        <div className="box">
            <div className="tutor">
                <img src={tutorImg} alt="tutor" />
                <div className="info">
                    <h3>{tutorName}</h3>
                    <span>{date || '1-1-2025'}</span>
                </div>
            </div>
            <div className="thumb">
                <img src={thumb} alt={title} />
                <span>{videos}</span>
            </div>
            <h3 className="title">{title}</h3>
            <Link href={href} className="inline-btn">view playlist</Link>
        </div>
    );
}
