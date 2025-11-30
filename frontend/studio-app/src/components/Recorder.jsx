import { useEffect, useRef, useState } from "react";
import { uploadToStudio } from "../api/studioApi";

export default function Recorder() {
  const recRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [blobUrl, setBlobUrl] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(s);
      const mr = new MediaRecorder(s, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => e.data && setChunks((prev) => prev.concat(e.data));
      mr.onstop = () => {
        const b = new Blob(chunks, { type: "audio/webm" });
        setChunks([]);
        setBlobUrl(URL.createObjectURL(b));
        setRecording(false);
      };
      recRef.current = mr;
    })();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    if (!recRef.current || recording) return;
    setServerUrl("");
    setBlobUrl("");
    setRecording(true);
    recRef.current.start();
  };

  const stop = () => {
    if (recRef.current && recording) recRef.current.stop();
  };

  const upload = async () => {
    if (!blobUrl) return;
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    const up = await uploadToStudio(blob, "take.webm");
    setServerUrl(up.url);
    alert("Uploaded!");
  };

  return (
    <div style={panel}>
      <h3 style={h}>Record</h3>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={btn} onClick={start} disabled={recording}>● Start</button>
        <button style={btn} onClick={stop} disabled={!recording}>■ Stop</button>
        <button style={btn} onClick={upload} disabled={!blobUrl}>⬆ Upload</button>
      </div>

      {blobUrl && (
        <div style={{ marginTop: 16 }}>
          <audio controls src={blobUrl} />
        </div>
      )}

      {serverUrl && (
        <p style={{ marginTop: 10 }}>
          Uploaded URL:{" "}
          <a href={serverUrl} target="_blank" rel="noreferrer">{serverUrl}</a>
        </p>
      )}
    </div>
  );
}

const panel = { background: "#000", color: "gold", padding: 16, borderRadius: 12 };
const h = { fontWeight: 800, margin: 0, marginBottom: 8 };
const btn = { background: "gold", color: "#000", fontWeight: 700, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer" };
