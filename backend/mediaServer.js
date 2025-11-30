// backend/mediaServer.js (ESM)
import NodeMediaServer from 'node-media-server';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  rtmp: {
    port: Number(process.env.RTMP_PORT || 1935),
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: Number(process.env.HLS_HTTP_PORT || 8000),
    allow_origin: '*'
  },
  trans: {
    ffmpeg: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    tasks: [
      {
        app: process.env.STREAM_APP || 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: false
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

// (optional) Simple publish key check: ?key=YOUR_SECRET
const REQUIRED_KEY = process.env.STREAM_SECRET;
nms.on('prePublish', (id, streamPath, args) => {
  if (REQUIRED_KEY && args.key !== REQUIRED_KEY) {
    console.warn('[NMS] Rejecting publish (bad key)', { streamPath, from: id });
    const session = nms.getSession(id);
    if (session) session.reject();
  } else {
    console.log('[NMS] Publish OK', { streamPath });
  }
});

nms.run();
console.log('[NMS] RTMP:', config.rtmp.port, 'HTTP (HLS):', config.http.port);
