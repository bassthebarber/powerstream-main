import SystemStatus from '../models/SystemStatus.js';
export const saveState = (key, value) => SystemStatus.findOneAndUpdate({key},{value},{upsert:true,new:true});
export const loadState = async key => (await SystemStatus.findOne({key}))?.value;
