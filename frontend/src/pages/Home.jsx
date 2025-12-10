import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isLoggedIn } from "../utils/auth.js";

const gold = "#ffb84d";
const WELCOME_PLAYED_KEY = "ps_welcome_played";

const Home = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const [showPlayButton, setShowPlayButton] = useState(false);

  const logoSrc = "/logos/powerstream-logo.png";
  const audioSrc = "/welcome-message.mp3";

  // Try to auto-play welcome message once per session
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const hasPlayed = localStorage.getItem(WELCOME_PLAYED_KEY);
    if (!hasPlayed) {
      // Try to auto-play on first visit
      audio
        .play()
        .then(() => {
          localStorage.setItem(WELCOME_PLAYED_KEY, "true");
        })
        .catch(() => {
          // Browser blocked autoplay - show play button
          setShowPlayButton(true);
        });
    }
  }, []);

  const handlePlayWelcome = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => {
        localStorage.setItem(WELCOME_PLAYED_KEY, "true");
        setShowPlayButton(false);
      });
    }
  };

  const handleNavigate = (path) => {
    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const buttonStyle = {
    borderRadius: "999px",
    border: `2px solid ${gold}`,
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",
    background: "transparent",
    color: gold,
    fontWeight: 600,
    fontSize: "15px",
    boxShadow: "0 0 12px rgba(255, 184, 77, 0.4)",
    transition: "all 0.2s ease",
  };

  const iconStyle = {
    height: "18px",
    width: "18px",
    objectFit: "contain",
  };

  const logoStyle = {
    width: "200px",
    height: "200px",
    objectFit: "contain",
    animation: "powerstream-spin 6s linear infinite",
    filter: "drop-shadow(0 0 20px rgba(255, 184, 77, 0.5))",
  };

  // keyframes for animation injected into the page once
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes powerstream-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: gold,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Welcome audio */}
      <audio ref={audioRef} src={audioSrc} />

      {/* Play button if autoplay was blocked */}
      {showPlayButton && (
        <button
          onClick={handlePlayWelcome}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 16px",
            background: gold,
            color: "#000",
            border: "none",
            borderRadius: "999px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          🔊 Tap to hear welcome
        </button>
      )}

      {/* Spinning logo */}
      <div style={{ marginBottom: "32px" }}>
        <img src={logoSrc} alt="PowerStream" style={logoStyle} />
      </div>

      {/* Title + tagline in gold */}
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "900",
          marginBottom: "12px",
          color: gold,
          textAlign: "center",
          background: `linear-gradient(90deg, ${gold}, #ffda5c)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Welcome to PowerStream
      </h1>
      <p
        style={{
          fontSize: "16px",
          marginBottom: "48px",
          color: "#ffda5c",
          textAlign: "center",
          opacity: 0.9,
        }}
      >
        Stream Audio • Video • Live TV • Chat • Community
      </p>

      {/* Navigation buttons grid - 8 buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "20px",
          maxWidth: "1000px",
          width: "100%",
          padding: "0 24px",
        }}
      >
        {/* 1. PowerFeed */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/powerfeed")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img
            src="/logos/powerfeedlogo.png"
            alt="PowerFeed"
            style={iconStyle}
          />
          <span>PowerFeed</span>
        </button>
        
        {/* 2. PowerGram */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/powergram")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img
            src="/logos/powergramlogo.png"
            alt="PowerGram"
            style={iconStyle}
          />
          <span>PowerGram</span>
        </button>
        
        {/* 3. PowerReel */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/powerreel")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img
            src="/logos/powerreellogo.png"
            alt="PowerReel"
            style={iconStyle}
          />
          <span>PowerReel</span>
        </button>
        
        {/* 4. PowerLine */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/powerline")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img
            src="/logos/powerlinelogo.png"
            alt="PowerLine"
            style={iconStyle}
          />
          <span>PowerLine</span>
        </button>
        
        {/* 5. TV Stations */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/tv-stations")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img
            src="/logos/worldwidetvlogo.png"
            alt="TV Stations"
            style={iconStyle}
          />
          <span>TV Stations</span>
        </button>
        
        {/* 6. Southern Power Network */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/southern-power")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img
            src="/logos/southernpowernetworklogo.png"
            alt="Southern Power Network"
            style={iconStyle}
          />
          <span>Southern Power Network</span>
        </button>
        
        {/* 7. PS TV */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/ps-tv")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img src={logoSrc} alt="PS TV" style={iconStyle} />
          <span>PS TV</span>
        </button>
        
        {/* 8. AI Studio */}
        <button 
          style={buttonStyle} 
          onClick={() => handleNavigate("/studio")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 184, 77, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 184, 77, 0.4)";
          }}
        >
          <img src={logoSrc} alt="AI Studio" style={iconStyle} />
          <span>AI Studio</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
