import React, { useEffect, useRef } from 'react';

const VoiceVisualizer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div>
      <h2>Voice Visualizer</h2>
      <canvas ref={canvasRef} width={400} height={100} />
    </div>
  );
};

export default VoiceVisualizer;


