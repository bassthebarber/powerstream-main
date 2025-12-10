// hooks/useMessages.js
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useMessages(threadId = null, limit = 200) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)   // remove this line if you want global room
        .order('created_at', { ascending: true })
        .limit(limit);

      if (!error && mounted) setRows(data ?? []);
    }
    load();

    const channel = supabase
      .channel('messages-stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (!mounted) return;
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            if (threadId === null || row.thread_id === threadId) {
              setRows((r) => [...r, row]);
            }
          }
          if (payload.eventType === 'UPDATE') {
            setRows((r) => r.map((x) => (x.id === payload.new.id ? payload.new : x)));
          }
          if (payload.eventType === 'DELETE') {
            setRows((r) => r.filter((x) => x.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [threadId, limit]);

  return rows;
}
