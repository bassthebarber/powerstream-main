// frontend/src/hooks/useGallerySocket.jsx
import { useEffect } from 'react';
import socket from '../utils/socket';

const useGallerySocket = (onNewUpload) => {
  useEffect(() => {
    socket.on('new-gallery-upload', onNewUpload);

    return () => {
      socket.off('new-gallery-upload', onNewUpload);
    };
  }, [onNewUpload]);
};

export default useGallerySocket;


