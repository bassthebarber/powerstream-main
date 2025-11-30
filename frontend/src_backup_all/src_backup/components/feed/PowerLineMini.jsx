import React from "react";
import css from "../../styles/Feed.module.css";
import { Link } from "react-router-dom";

export default function PowerLineMini() {
  return (
    <Link to="/powerline" className={css.powerlineMini}>
      <img src="/logos/powerlinelogo.png" alt="PowerLine" />
      <div>
        <strong>PowerLine</strong>
        <span>DMs & calls</span>
      </div>
    </Link>
  );
}


