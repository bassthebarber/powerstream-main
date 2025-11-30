export const validateSovereignKey = (key) => {
  const masterKey = process.env.SOVEREIGN_KEY || 'southern-power-syndicate';
  return key === masterKey;
};
