import { finalizeRoyaltySplit } from './smartContractEngine.js';


export function syncPayrollToAllSystems({ department, entityId, totalRevenue, staff }) {
return staff.map(person => ({
entity: entityId,
department,
userId: person.userId,
payout: (person.cut / 100) * totalRevenue
}));
}