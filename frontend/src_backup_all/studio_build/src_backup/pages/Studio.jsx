import BeatPlayer from "../components/recordingStudio/BeatPlayer";
import BuyBeatForm from "../components/recordingStudio/BuyBeatForm";

export default function StudioPage() {
  const beat = {
    id: "abc123",
    title: "Southern Power Anthem",
    audioUrl: "/beats/southern-power-anthem.mp3", // make sure this file is served by your build or CDN
    artwork: "/art/southern-power.jpg",
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <BeatPlayer
        src={beat.audioUrl}
        title={beat.title}
        artwork={beat.artwork}
      />

      <BuyBeatForm beatId={beat.id} beatTitle={beat.title} />
    </div>
  );
}
