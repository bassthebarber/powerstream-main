const sovereignKeys = [
  'southern-power-syndicate',
  'black-ops-protected',
  process.env.SOVEREIGN_KEY
];

export const enforceSovereignLaws = (key) => {
  return sovereignKeys.includes(key);
};
