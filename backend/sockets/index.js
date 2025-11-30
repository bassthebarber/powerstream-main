// backend/sockets/index.js
import presenceSocket from "./presenceSocket.js";
import streamStatusSocket from "./streamStatusSocket.js";
// If you have these already, import and register them too:
// import civicSocket from "./civicSocket.js";
// import noLimitSocket from "./noLimitSocket.js";
// import tgtSocket from "./tgtSocket.js";

export default function registerSockets(io) {
  presenceSocket(io);
  streamStatusSocket(io);
  // civicSocket(io);
  // noLimitSocket(io);
  // tgtSocket(io);
}
