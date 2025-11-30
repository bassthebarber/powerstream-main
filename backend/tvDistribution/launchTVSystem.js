// launchTVSystem.js
import { syncTVContentToAI } from './backend/services/tvSyncAI.js';


export function launchTVSystem(contentList) {
return contentList.map(content => syncTVContentToAI(content));
}