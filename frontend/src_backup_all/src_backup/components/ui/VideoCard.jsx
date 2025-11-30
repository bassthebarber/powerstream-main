// src/components/ui/VideoCard.jsx
export default function VideoCard({ thumb, title, subtitle, onClick }) {
  return (
    <button className="shelf-card" onClick={onClick}>
      <img src={thumb} alt={title} className="shelf-thumb" />
      <div className="shelf-meta">
        <div className="shelf-title">{title}</div>
        {subtitle && <div className="shelf-sub">{subtitle}</div>}
      </div>
    </button>
  );
}


