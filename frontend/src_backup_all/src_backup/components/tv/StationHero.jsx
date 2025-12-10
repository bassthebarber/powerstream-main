import React from "react";
import styles from "../../styles/TVStations.module.css";
import BrandLogo from "../Brand/BrandLogo";

export default function StationHero({ brand, title, subtitle, logoSize = 180 }) {
  return (
    <header className={styles.stationHeader}>
      <BrandLogo name={brand} size={logoSize} className={styles.stationLogo} />
      <div className={styles.titleWrap}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}


