export const processMatrixCommand = (input = '') => {
  const msg = input.toLowerCase();

  if (msg.includes('go dark')) return { action: 'blackout', override: true };
  if (msg.includes('show home')) return { action: 'renderHome', scene: 'homepage' };
  if (msg.includes('launch tv')) return { action: 'renderTVGuide', scene: 'tv' };
  if (msg.includes('trigger matrix')) return { action: 'matrixInit' };

  return null;
};
