// frontend/src/components/tv/StationCard.jsx
// Golden TV Subsystem - Station Card Component
import { useNavigate } from 'react-router-dom';
import './tv.css';

const StationCard = ({ station }) => {
  const navigate = useNavigate();

  const goToStation = () => {
    navigate(`/${station.slug}`);
  };

  const accentColor = station.theme?.accentColor || '#FFD700';
  const bgColor = station.theme?.backgroundColor || '#1a1a1a';

  return (
    <div 
      className="station-card" 
      onClick={goToStation}
      style={{
        '--accent-color': accentColor,
        '--bg-color': bgColor
      }}
    >
      <div className="station-card-header">
        {station.logoUrl ? (
          <img
            src={station.logoUrl}
            alt={station.name}
            className="station-card-logo"
          />
        ) : (
          <div className="station-card-logo-placeholder">
            {station.name.charAt(0)}
          </div>
        )}
        <h2 className="station-card-title">{station.name}</h2>
      </div>
      
      {station.description && (
        <p className="station-card-description">{station.description}</p>
      )}
      
      <button className="station-card-button">
        <span className="station-card-button-icon">▶</span>
        Watch Station
      </button>
    </div>
  );
};

export default StationCard;


