// frontend/src/pages/stations/StationPages.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StationList from '../../components/StationList';
import StationCore from '../../components/StationCore';
import CreateStation from './CreateStation';
import ManageStation from './ManageStation';
import StationDashboard from './StationDashboard';

export default function StationPages() {
  return (
    <Routes>
      <Route path="/" element={<StationList />} />
      <Route path="/:stationId" element={<StationCore />} />
      <Route path="/create" element={<CreateStation />} />
      <Route path="/manage/:stationId" element={<ManageStation />} />
      <Route path="/dashboard/:stationId" element={<StationDashboard />} />
    </Routes>
  );
}
