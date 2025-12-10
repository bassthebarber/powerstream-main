import React from "react";
import "./../station.css";

function SectionTitle({ children }) {
  return <h3 className="ps-section-title">{children}</h3>;
}

function VideoGrid({ items }) {
  return (
    <div className="ps-card-grid">
      {items.map((v) => (
        <div key={v.id} className="ps-card">
          <div className="ps-card-thumb" />
          <div className="ps-card-body">
            <div className="ps-card-title">{v.title}</div>
            <div className="ps-card-sub">{v.duration}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AudioList({ items }) {
  return (
    <div className="ps-audio-list">
      {items.map((a) => (
        <div key={a.id} className="ps-audio-row">
          <div className="ps-audio-meta">
            <span className="ps-audio-title">{a.title}</span>
            <span className="ps-dot">•</span>
            <span className="ps-audio-len">{a.length}</span>
          </div>
          <button className="ps-btn ps-btn-ghost" type="button">Play</button>
        </div>
      ))}
    </div>
  );
}

function ScheduleTable({ rows }) {
  return (
    <div className="ps-table-wrap">
      <table className="ps-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Program</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.date}-${i}`}>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>{r.program}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StationScaffold({
  title,
  logoSrc,
  accentColor = "#d4af37",
  aboutText = "Station description coming soon.",
}) {
  const videos = [
    { id: 1, title: "Teaser Trailer", duration: "00:30" },
    { id: 2, title: "Artist Spotlight", duration: "04:12" },
    { id: 3, title: "Behind the Scenes", duration: "03:06" },
    { id: 4, title: "Live Clip", duration: "02:21" },
    { id: 5, title: "Interview", duration: "05:44" },
    { id: 6, title: "Promo", duration: "00:45" },
  ];

  const audios = [
    { id: 1, title: "Intro Theme", length: "0:38" },
    { id: 2, title: "Feature Track 1", length: "3:42" },
    { id: 3, title: "Feature Track 2", length: "4:07" },
    { id: 4, title: "Snippet A", length: "1:02" },
    { id: 5, title: "Snippet B", length: "0:56" },
    { id: 6, title: "Outro Theme", length: "0:28" },
  ];

  const schedule = [
    { date: "Mon", time: "7:00 PM", program: "Headliner Hour" },
    { date: "Tue", time: "8:00 PM", program: "New Talent Showcase" },
    { date: "Wed", time: "6:30 PM", program: "Community Voices" },
    { date: "Thu", time: "9:00 PM", program: "Live Session" },
    { date: "Fri", time: "8:00 PM", program: "Weekly Recap" },
  ];

  return (
    <div className="ps-station">
      <header className="ps-hero">
        <img className="ps-hero-logo" src={logoSrc} alt={title} />
        <h1 className="ps-hero-title" style={{ color: accentColor }}>{title}</h1>
        <p className="ps-hero-sub">{aboutText}</p>
      </header>

      <div className="ps-actions">
        <button className="ps-btn">Upload Video</button>
        <button className="ps-btn">Upload Audio</button>
      </div>

      <section className="ps-section">
        <SectionTitle>Video</SectionTitle>
        <VideoGrid items={videos} />
      </section>

      <section className="ps-section">
        <SectionTitle>Audio</SectionTitle>
        <AudioList items={audios} />
      </section>

      <section className="ps-section">
        <SectionTitle>Schedule</SectionTitle>
        <ScheduleTable rows={schedule} />
      </section>
    </div>
  );
}


