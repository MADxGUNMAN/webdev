export default function ReviewCard({ text, img, name = 'Tutor', stars = 4.5 }) {
    const fullStars = Math.floor(stars);
    const half = stars % 1 >= 0.5;

    return (
        <div className="box">
            <p>{text}</p>
            <div className="student">
                <img src={img} alt={name} />
                <div>
                    <h3>{name}</h3>
                    <div className="stars">
                        {Array.from({ length: fullStars }).map((_, i) => (
                            <i key={i} className="fas fa-star"></i>
                        ))}
                        {half && <i className="fas fa-star-half-alt"></i>}
                    </div>
                </div>
            </div>
        </div>
    );
}
