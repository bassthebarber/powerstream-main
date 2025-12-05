// backend/controllers/stationGeoRegistry.js

const stationGeoRegistry = {
  registry: [],

  registerStation: (name, state) => {
    const station = {
      id: stationGeoRegistry.registry.length + 1,
      name,
      state,
      registeredAt: new Date().toISOString()
    };
    stationGeoRegistry.registry.push(station);
    return station;
  },

  getStationsByState: (state) => {
    return stationGeoRegistry.registry.filter(s => s.state === state);
  },

  getAllStations: () => {
    return stationGeoRegistry.registry;
  }
};

export default stationGeoRegistry;
