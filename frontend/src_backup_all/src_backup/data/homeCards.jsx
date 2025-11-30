import { supabase } from '../lib/supabaseClient';
import localCards from '../data/homecards.json';

export async function getHomeCards() {
  try {
    const { data, error } = await supabase
      .from('home_cards')
      .select('slug,title,blurb,logo_url,route,sort')
      .order('sort', { ascending: true });

    if (error) throw error;
    if (data && data.length) return data;
  } catch (_) { /* fall back */ }

  // adapt JSON keys => DB shape
  return localCards.map((c, i) => ({
    slug: c.slug,
    title: c.title,
    blurb: c.blurb ?? '',
    logo_url: c.logo ?? '',
    route: c.href ?? '/',
    sort: typeof c.sort === 'number' ? c.sort : i
  }));
}


