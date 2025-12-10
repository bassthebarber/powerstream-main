// pages/stations/[stationName].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import StationPage from '../../components/StationPage';

const DynamicStationPage = () => {
  const router = useRouter();
  const { stationName } = router.query;
  const [stationData, setStationData] = useState(null);

  useEffect(() => {
    if (stationName) {
      fetch(`/api/station/${stationName}`)
        .then((res) => res.json())
        .then((data) => setStationData(data))
        .catch((err) => console.error(err));
    }
  }, [stationName]);

  if (!stationData) return <p>Loading station...</p>;

  return <StationPage data={stationData} />;
};

export default DynamicStationPage;
