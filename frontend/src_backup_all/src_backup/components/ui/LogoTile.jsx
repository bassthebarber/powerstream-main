import React from "react";
import { useNavigate } from "react-router-dom";
import css from "../../styles/LogoTile.module.css";

export default function LogoTile({to, title, subtitle, img}){
  const go = useNavigate();
  return (
    <button className={css.tile} onClick={()=>go(to)} aria-label={title}>
      {img && <img src={img} className={css.logo} alt="" />}
      <div className={css.texts}>
        <div className={css.title}>{title}</div>
        {subtitle && <div className={css.sub}>{subtitle}</div>}
      </div>
    </button>
  );
}


