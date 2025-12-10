// backend/models/StationModel.js
// Re-export the main Station model to avoid duplicate model registration
// All Station model imports should use this or backend/models/Station.js

import Station from './Station.js';

export default Station;
