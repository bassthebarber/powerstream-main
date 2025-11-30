// backend/tvDistribution/contracts/labelRoyaltyContract.js
export function generateLabelRoyaltyContract({ labelName, artistName, platformCut = 20, labelCut = 50 }) {
return {
agreementTitle: `Royalty Agreement for ${labelName} / ${artistName}`,
terms: `The platform (No Limit East Houston / PowerStream) receives ${platformCut}% per transaction. The label receives ${labelCut}% and is responsible for payouts to artists.`,
date: new Date().toISOString(),
};
}