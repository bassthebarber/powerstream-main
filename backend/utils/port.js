import http from 'http';

export async function pickPort(preferred = 5001, maxTries = 10) {
  const tryPort = p => new Promise(res => {
    const srv = http.createServer(()=>{});
    srv.once('error', () => res(false));
    srv.listen(p, () => srv.close(() => res(true)));
  });

  let port = Number(process.env.PORT || preferred);
  for (let i = 0; i < maxTries; i++) {
    if (await tryPort(port)) return port;
    console.log(`🟠 Port ${port} in use, trying ${port + 1}…`);
    port++;
  }
  throw new Error('No free port found');
}
