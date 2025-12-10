export function finalizeRoyaltySplit({ trackId, participants, amount }) {
const split = participants.map(p => ({
userId: p.userId,
amount: (amount * p.percentage) / 100
}));
return {
status: 'success',
trackId,
breakdown: split
};
}