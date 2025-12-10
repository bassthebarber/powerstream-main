import React, { useEffect, useRef, useState } from 'react';

const StudioMeters = () => {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    let audioContext, analyser, mic, dataArray;
    const getMic = async () => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(mic);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);

      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setLevel(avg);
        requestAnimationFrame(update);
      };
      update();
    };
    getMic();
  }, []);

  return (
    <div className="studioPanel meters-panel">
      <h2>🎚️ Audio Meters</h2>
      <div className="meter-bar">
        <div className="meter-level" style={{ height: `${Math.min(level, 100)}%` }}></div>
      </div>
      <p>Level: {Math.round(level)}</p>
    </div>
  );
};

export default StudioMeters;
