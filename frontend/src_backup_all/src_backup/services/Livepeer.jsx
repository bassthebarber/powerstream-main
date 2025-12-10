// frontend/src/services/LivePeer.jsx

export const getLivePeerStreams = async () => {
  const res = await fetch("https://livepeer.api.endpoint/streams");
  return await res.json();
};


