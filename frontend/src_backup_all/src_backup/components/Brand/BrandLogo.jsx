import React from "react";

/** Central logo map. Place matching files in /public/logos/ */
export default function BrandLogo({ name, size = 140, className = "" }) {
  const map = {
    powerfeed: "/logos/powerfeedlogo.png",
    powergram: "/logos/powergramlogo.png",
    powerreel: "/logos/powerreellogo.png",
    powerstream: "/logos/powerstream-logo.png",
    southernpower: "/logos/southernpowerlogo.png",
    nolimit: "/logos/nolimit.easthoustonlogo.png",
    texasgottalent: "/logos/texasgottalentlogo.png",
    civicconnect: "/logos/civicconnectlogo.png",
  };
  const src = map[(name || "").toLowerCase()] || map.powerstream;
  return <img src={src} alt={name || "logo"} style={{ width: size, height: "auto" }} className={className} />;
}


