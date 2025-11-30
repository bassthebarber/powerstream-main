import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import css from '../../styles/Gallery.module.css';

const PUBLIC_MEDIA = import.meta.env.VITE_SUPABASE_MEDIA_PUBLIC_URL; // bucket public base

export default function GalleryView({ table }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setItems(data || []);
    };
    fetchMedia();
  }, [table]);

  return (
    <div className={css.galleryContainer}>
      {items.map((m) => {
        const url = `${PUBLIC_MEDIA}/${m.media_url}`; // full public URL
        return m.media_type === 'image' ? (
          <div className={css.item} key={m.id}><img src={url} alt="" /></div>
        ) : (
          <div className={css.item} key={m.id}><video src={url} controls /></div>
        );
      })}
    </div>
  );
}


