export const assessViralPotential = (views, likes) => {
  const ratio = likes / (views || 1);
  return views > 1000 && ratio > 0.25;
};
