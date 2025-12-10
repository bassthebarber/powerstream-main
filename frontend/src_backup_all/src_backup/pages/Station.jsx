import React from 'react';
import { useParams } from 'react-router-dom';

export default function Station() {
  const { id } = useParams();
  return (
    <div>
      <h2>TV Station: {id}</h2>
      <p>This is a dynamic TV station page.</p>
    </div>
  );
}


