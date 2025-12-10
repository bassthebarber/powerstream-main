// frontend/api/streamAPI.js
import { fetchStreamData } from '../utils/fetchStreamData';
import { startStream } from '../utils/startStream';
import { stopStream } from '../utils/stopStream';
import { sendStreamMessage } from '../utils/sendStreamMessage';

export const StreamAPI = {
  fetchStreamData,
  startStream,
  stopStream,
  sendStreamMessage
};


