// frontend/src/studio/engine/RecordingEngine.js
// Audio Recording Engine for PowerStream Studio

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

class RecordingEngineClass {
  constructor() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = 0;
    this.duration = 0;
    
    // Callbacks
    this.onStart = null;
    this.onStop = null;
    this.onData = null;
    this.onLevelUpdate = null;
    this.onError = null;
    
    // Animation frame for level monitoring
    this.levelAnimationFrame = null;
  }
  
  // Initialize audio context and get microphone stream
  async init() {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // Create audio context for level metering
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      
      return true;
    } catch (err) {
      console.error("[RecordingEngine] Init error:", err);
      if (this.onError) {
        this.onError(err.message || "Failed to access microphone");
      }
      return false;
    }
  }
  
  // Start recording
  async start() {
    if (this.isRecording) return;
    
    // Initialize if not already done
    if (!this.stream) {
      const success = await this.init();
      if (!success) return;
    }
    
    // Check if stream is still active
    if (this.stream.getTracks().length === 0 || !this.stream.active) {
      const success = await this.init();
      if (!success) return;
    }
    
    // Create MediaRecorder
    const options = { mimeType: "audio/webm;codecs=opus" };
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e) {
      // Fallback to default
      this.mediaRecorder = new MediaRecorder(this.stream);
    }
    
    this.chunks = [];
    this.startTime = Date.now();
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
        if (this.onData) {
          this.onData(e.data);
        }
      }
    };
    
    this.mediaRecorder.onstart = () => {
      this.isRecording = true;
      this.isPaused = false;
      if (this.onStart) {
        this.onStart();
      }
      this._startLevelMonitoring();
    };
    
    this.mediaRecorder.onerror = (e) => {
      console.error("[RecordingEngine] Recording error:", e);
      if (this.onError) {
        this.onError("Recording failed");
      }
    };
    
    // Request data every 250ms
    this.mediaRecorder.start(250);
  }
  
  // Stop recording and return blob
  async stop() {
    if (!this.mediaRecorder || !this.isRecording) return null;
    
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.isPaused = false;
        this.duration = (Date.now() - this.startTime) / 1000;
        this._stopLevelMonitoring();
        
        // Create blob from chunks
        const blob = new Blob(this.chunks, { type: "audio/webm" });
        
        if (this.onStop) {
          this.onStop(blob, this.duration);
        }
        
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  // Pause recording
  pause() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }
  
  // Resume recording
  resume() {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }
  
  // Start level monitoring for UI
  _startLevelMonitoring() {
    const update = () => {
      if (!this.isRecording || !this.analyser) return;
      
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const level = rms / 255; // Normalize to 0-1
      
      if (this.onLevelUpdate) {
        this.onLevelUpdate(level);
      }
      
      this.levelAnimationFrame = requestAnimationFrame(update);
    };
    
    update();
  }
  
  _stopLevelMonitoring() {
    if (this.levelAnimationFrame) {
      cancelAnimationFrame(this.levelAnimationFrame);
      this.levelAnimationFrame = null;
    }
  }
  
  // Get current recording duration
  getCurrentDuration() {
    if (!this.isRecording) return this.duration;
    return (Date.now() - this.startTime) / 1000;
  }
  
  // Upload recording to backend
  async upload(blob, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, `recording_${Date.now()}.webm`);
      formData.append("title", metadata.title || `Take ${metadata.takeNumber || 1}`);
      formData.append("takeNumber", metadata.takeNumber || 1);
      formData.append("type", metadata.type || "vocal");
      formData.append("durationSeconds", this.duration.toString());
      formData.append("notes", metadata.notes || "");
      
      if (metadata.projectId) {
        formData.append("projectId", metadata.projectId);
      }
      
      const res = await fetch(`${API_BASE}/api/studio/recordings`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[RecordingEngine] Upload error:", err);
      return { success: false, error: err.message };
    }
  }
  
  // Delete a recording from backend
  async deleteRecording(id) {
    try {
      const res = await fetch(`${API_BASE}/api/studio/recordings/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err) {
      console.error("[RecordingEngine] Delete error:", err);
      return { success: false, error: err.message };
    }
  }
  
  // Cleanup
  destroy() {
    this._stopLevelMonitoring();
    
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.mediaRecorder = null;
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.chunks = [];
    this.isRecording = false;
  }
}

// Export singleton instance
export const recordingEngine = new RecordingEngineClass();

export default recordingEngine;



