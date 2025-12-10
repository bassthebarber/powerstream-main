// frontend/src/components/PlatformMeta.jsx

import React from 'react';
import { Helmet } from 'react-helmet';

const PlatformMeta = () => {
  return (
    <Helmet>
      <title>PowerStream</title>
      <meta name="description" content="PowerStream: Your All-in-One Streaming Platform" />
      <meta property="og:title" content="PowerStream" />
      <meta property="og:image" content="/logos/powerstream-logo.png" />
    </Helmet>
  );
};

export default PlatformMeta;


