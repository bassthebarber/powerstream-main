import React from "react";
import LogoTile from "../../components/ui/LogoTile.jsx";
import css from "../../styles/NetworkHub.module.css";

export default function Network(){
  return (
    <div className={css.wrap}>
      <div className={css.center}>
        <img src="/logos/southernpowernetwork.png" alt="" className={css.brand}/>
        <h2>Southern Power Network</h2>
        <p className={css.sub}>Select a station below</p>
      </div>

      <div className={css.grid}>
        <LogoTile to="/tv/nolimit" img="/logos/nolimiteasthoustonlogo.png" title="No Limit East Houston"/>
        <LogoTile to="/tv/texasgottalent" img="/logos/texasgottalentlogo.png" title="Texas Got Talent"/>
        <LogoTile to="/tv/civicconnect" img="/logos/civicconnectlogo.png" title="Civic Connect"/>
        <LogoTile to="/tv/spn" img="/logos/southernpowernetwork.png" title="SPN"/>
      </div>
    </div>
  );
}


