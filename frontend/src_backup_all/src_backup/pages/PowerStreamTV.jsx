// src/pages/tv/PowerStreamTV.jsx
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import Shelf from "../../components/ui/Shelf";
import VideoCard from "../../components/ui/VideoCard";
import HlsPlayer from "../../components/player/HlsPlayer";

export default function PowerStreamTV() {
  const [liveRows, setLiveRows] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [films, setFilms] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null); // {title, src, poster}

  useEffect(() => {
    (async () => {
      // LIVE: join station + live config
      const { data: live } = await supabase
        .from("station_live") // station_id, hls_url
        .select("hls_url, stations (name, logo_path)")
        .limit(20);
      setLiveRows(
        (live || []).map((r) => ({
          id: r.hls_url,
          title: r.stations?.name || "Live",
          thumb: r.stations?.logo_path || "/logos/powerstream-logo.png",
          src: r.hls_url,
        }))
      );

      // EPISODES
      const { data: eps } = await supabase
        .from("media_items")
        .select("*")
        .eq("type", "episode")
        .order("created_at", { ascending: false })
        .limit(24);
      setEpisodes(eps || []);

      // FILMS
      const { data: mov } = await supabase
        .from("media_items")
        .select("*")
        .eq("type", "film")
        .order("created_at", { ascending: false })
        .limit(24);
      setFilms(mov || []);
    })();
  }, []);

  return (
    <div className="page page-tv">
      <h2>PowerStream TV</h2>

      {nowPlaying && (
        <div className="player-wrap">
          <div className="player-head">
            <div className="section-title">{nowPlaying.title}</div>
            <button className="btn" onClick={() => setNowPlaying(null)}>Close</button>
          </div>
          <HlsPlayer src={nowPlaying.src} poster={nowPlaying.poster} />
        </div>
      )}

      <Shelf
        title="Live Now"
        items={liveRows}
        renderCard={(it) => (
          <VideoCard
            thumb={it.thumb}
            title={it.title}
            onClick={() => setNowPlaying({ title: it.title, src: it.src, poster: it.thumb })}
          />
        )}
      />

      <Shelf
        title="Latest Episodes"
        items={episodes}
        renderCard={(it) => (
          <VideoCard
            thumb={it.thumb_path || "/images/placeholder-episode.jpg"}
            title={it.title}
            subtitle={it.category}
            onClick={() =>
              setNowPlaying({
                title: it.title,
                src: it.playback_url || it.file_url,
                poster: it.thumb_path,
              })
            }
          />
        )}
      />

      <Shelf
        title="Latest Films"
        items={films}
        renderCard={(it) => (
          <VideoCard
            thumb={it.thumb_path || "/images/placeholder-film.jpg"}
            title={it.title}
            subtitle={it.category}
            onClick={() =>
              setNowPlaying({
                title: it.title,
                src: it.playback_url || it.file_url,
                poster: it.thumb_path,
              })
            }
          />
        )}
      />
    </div>
  );
}


