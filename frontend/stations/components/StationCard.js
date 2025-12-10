// frontend/src/stations/components/StationCard.js
import React from "react";
import { useNavigate } from "react-router-dom";

const StationCard = ({ station }) => {
  const navigate = useNavigate();

  if (!station) return null;

  const handleViewStation = () => {
    navigate(`/stations/${station._id}`);
  };

  return (
    <div style={styles.card}>
      {/* Station Logo */}
      <div style={styles.logoContainer}>
        <img
          src={station.logo || "/default-station-logo.png"}
          alt={`${station.name} Logo`}
          style={styles.logo}
        />
      </div>

      {/* Station Info */}
      <div style={styles.info}>
        <h3 style={styles.name}>{station.name}</h3>
        <p style={styles.description}>
          {station.description || "No description available."}
        </p>
      </div>

      {/* View Button */}
      <button style={styles.button} onClick={handleViewStation}>
        View Station
      </button>
    </div>
  );
};

const styles = {
  card: {
    background: "#111",
    color: "#fff",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "250px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    margin: "10px"
  },
  logoContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px"
  },
  logo: {
    width: "100%",
    maxWidth: "120px",
    height: "auto",
    borderRadius: "6px",
    objectFit: "cover"
  },
  info: {
    textAlign: "center",
    marginBottom: "12px"
  },
  name: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "6px 0"
  },
  description: {
    fontSize: "14px",
    color: "#bbb"
  },
  button: {
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default StationCard;
