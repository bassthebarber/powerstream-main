import React from "react";

export default function ReelPlayer({ videoUrl }) {
  return (
    <video controls width="100%">
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}


