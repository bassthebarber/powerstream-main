// frontend/src/components/home/HomeCards.jsx
import React, { useEffect, useState } from "react";
import styles from "../../styles/HomeCards.module.css";
import { supabase } from "../../lib/supabaseClient.jsx";
import fallback from "../../data/homeCards.json"; // fallback content

export default function HomeCards(){
  const [cards, setCards] = useState(fallback);  // show something immediately

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("home_cards")
        .select("slug,title,blurb,logo_url,route,sort")
        .order("sort", { ascending: true });
      if (!mounted) return;
      if (!error && data && data.length) setCards(data);
      // if error or empty, fallback stays in place
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className={styles.wrap}>
      <div className={styles.grid}>
        {cards.map(c => (
          <a key={c.slug} href={c.route} className={styles.card}>
            <div className={styles.header}>
              <img src={c.logo_url} alt="" className={styles.cardLogo}/>
              <h3 className={styles.cardTitle}>{c.title}</h3>
            </div>
            <p className={styles.blurb}>{c.blurb}</p>
          </a>
        ))}
      </div>
    </section>
  );
}


