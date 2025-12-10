import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import styles from '../../styles/Gallery.module.css';

export default function UploadGallery({ table, folder = 'gallery' }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!files.length) return;
    setBusy(true); setStatus('Uploading...');

    try {
      const user = (await supabase.auth.getUser()).data.user || { id: null };

      for (const file of files) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `${folder}/${fileName}`;

        const { error: upErr, data: upData } = await supabase.storage
          .from('media').upload(path, file, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;

        const mediaType = file.type.includes('video') ? 'video' : 'image';

        const { error: insErr } = await supabase.from(table).insert({
          user_id: user?.id,
          media_url: upData.path,           // path within bucket
          media_type: mediaType,
        });
        if (insErr) throw insErr;
      }
      setStatus('✅ Upload complete.');
      setFiles([]);
    } catch (e) {
      console.error(e);
      setStatus('❌ Upload failed. Check console.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.toolbar}>
      <input type="file" multiple accept="image/*,video/*"
             onChange={(e)=>setFiles(Array.from(e.target.files || []))} />
      <button onClick={handleUpload} disabled={busy || !files.length}>
        {busy ? 'Uploading…' : 'Upload'}
      </button>
      <span className={styles.status}>{status}</span>
    </div>
  );
}


