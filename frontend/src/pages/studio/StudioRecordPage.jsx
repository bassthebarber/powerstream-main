// frontend/src/pages/studio/StudioRecordPage.jsx
// Record Booth - World-Class Professional Recording Studio
// No Limit East Houston Edition - Engineer & Producer Platform
import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../lib/api.js";
import RecordingControls from "./components/RecordingControls";
import "../../styles/studio-unified.css";
import "../../styles/record-controls.css";

// ============ CONSTANTS ============

// Professional Effects Presets
const FX_PRESETS = {
  vocal: { name: "Vocal", reverb: 25, delay: 15, comp: 4, eq: { low: -2, mid: 3, high: 2 }, deEsser: 40 },
  hiphop: { name: "Hip-Hop", reverb: 15, delay: 10, comp: 6, eq: { low: 4, mid: -1, high: 3 }, deEsser: 50 },
  rnb: { name: "R&B", reverb: 35, delay: 20, comp: 3, eq: { low: 2, mid: 2, high: 4 }, deEsser: 30 },
  trap: { name: "Trap", reverb: 20, delay: 25, comp: 5, eq: { low: 5, mid: 0, high: 4 }, deEsser: 35 },
  podcast: { name: "Podcast", reverb: 5, delay: 0, comp: 5, eq: { low: 0, mid: 4, high: 0 }, deEsser: 60 },
  raw: { name: "Raw/Dry", reverb: 0, delay: 0, comp: 2, eq: { low: 0, mid: 0, high: 0 }, deEsser: 0 },
};

// No Limit East Houston Authorized Users
const NL_EAST_HOUSTON = {
  label: "No Limit East Houston",
  owners: ["Marcus", "Gangsta"],
  authorizedEngineers: [],
  authorizedProducers: [],
};

export default function StudioRecordPage() {
  // ============ CORE RECORDING STATE ============
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // ============ TAKES & PLAYBACK ============
  const [takes, setTakes] = useState([]);
  const [selectedTake, setSelectedTake] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  
  // ============ BEAT / INSTRUMENTAL ============
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [beatLibrary, setBeatLibrary] = useState([]);
  const [beatPlaying, setBeatPlaying] = useState(false);
  const [beatVolume, setBeatVolume] = useState(80);
  const [showBeatBrowser, setShowBeatBrowser] = useState(false);
  const [showBeatGenerator, setShowBeatGenerator] = useState(false);
  const [generatingBeat, setGeneratingBeat] = useState(false);
  const [beatGenPrompt, setBeatGenPrompt] = useState("");
  const [beatGenBpm, setBeatGenBpm] = useState(140);
  const [beatGenStyle, setBeatGenStyle] = useState("trap");
  
  // ============ INPUT/OUTPUT SETTINGS ============
  const [inputGain, setInputGain] = useState(75);
  const [outputVolume, setOutputVolume] = useState(80);
  const [vocalVolume, setVocalVolume] = useState(85);
  const [monitoring, setMonitoring] = useState(true);
  const [lowLatency, setLowLatency] = useState(true);
  
  // ============ EFFECTS ============
  const [fxEnabled, setFxEnabled] = useState(true);
  const [activePreset, setActivePreset] = useState("hiphop");
  const [fxSettings, setFxSettings] = useState(FX_PRESETS.hiphop);
  const [autoTune, setAutoTune] = useState(false);
  const [noiseGate, setNoiseGate] = useState(true);
  
  // ============ TIMING ============
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [bpm, setBpm] = useState(140);
  const [countIn, setCountIn] = useState(true);
  
  // ============ PRODUCER/ENGINEER MODE ============
  const [engineerMode, setEngineerMode] = useState(false);
  const [currentEngineer, setCurrentEngineer] = useState(null);
  const [showEngineerPanel, setShowEngineerPanel] = useState(false);
  const [projectNotes, setProjectNotes] = useState("");
  
  // Engineer Access Code System
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [pluggedIn, setPluggedIn] = useState(false);
  const [engineerSession, setEngineerSession] = useState(null);
  const [engineerPermissions, setEngineerPermissions] = useState(null);
  const [plugInError, setPlugInError] = useState("");
  const [plugInLoading, setPlugInLoading] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  
  // ============ REFS ============
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const levelRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const beatPlayerRef = useRef(null);
  const metronomeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // ============ INITIALIZATION ============
  useEffect(() => {
    loadBeatLibrary();
    loadSavedTakes();
    return () => cleanup();
  }, []);

  const cleanup = () => {
    clearInterval(timerRef.current);
    clearInterval(levelRef.current);
    clearInterval(metronomeRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (beatPlayerRef.current) {
      beatPlayerRef.current.pause();
    }
  };
  
  // ============ ENGINEER ACCESS CODE SYSTEM ============
  const handlePlugIn = async () => {
    if (!accessCodeInput || accessCodeInput.length !== 6) {
      setPlugInError("Enter a valid 6-character access code");
      return;
    }
    
    setPlugInLoading(true);
    setPlugInError("");
    
    try {
      const res = await api.post("/engineer/plug-in", { code: accessCodeInput.toUpperCase() });
      
      if (res.data?.ok) {
        setPluggedIn(true);
        setEngineerMode(true);
        setEngineerSession(res.data.sessionId);
        setEngineerPermissions(res.data.permissions);
        setCurrentEngineer({
          role: res.data.role,
          name: res.data.assignedName || res.data.role,
          labelSlug: res.data.labelSlug,
        });
        setAccessCodeInput("");
        showSuccess(`🔌 Plugged in as ${res.data.role}!`);
        
        // Save session to localStorage for persistence
        localStorage.setItem("engineerSession", JSON.stringify({
          sessionId: res.data.sessionId,
          role: res.data.role,
          permissions: res.data.permissions,
          labelSlug: res.data.labelSlug,
        }));
      } else {
        setPlugInError(res.data?.error || "Failed to plug in");
      }
    } catch (err) {
      setPlugInError(err.response?.data?.error || "Invalid access code");
    } finally {
      setPlugInLoading(false);
    }
  };
  
  const handleUnplug = async () => {
    try {
      await api.post("/engineer/unplug", { sessionId: engineerSession });
    } catch (err) {
      console.warn("Unplug error:", err);
    }
    
    setPluggedIn(false);
    setEngineerMode(false);
    setEngineerSession(null);
    setEngineerPermissions(null);
    setCurrentEngineer(null);
    localStorage.removeItem("engineerSession");
    showSuccess("🔌 Unplugged from studio");
  };
  
  const handleGenerateCode = async (role = "engineer") => {
    try {
      const res = await api.post("/engineer/codes/generate", {
        labelSlug: "no-limit-east-houston",
        role,
        assignedName: "",
      });
      
      if (res.data?.ok) {
        setGeneratedCodes(prev => [
          { code: res.data.code, role: res.data.role, expiresAt: res.data.expiresAt, createdAt: new Date() },
          ...prev
        ]);
        showSuccess(`Code generated: ${res.data.code}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate code");
    }
  };
  
  // Check for saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("engineerSession");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Verify session is still valid
        api.get(`/engineer/status?sessionId=${session.sessionId}`).then(res => {
          if (res.data?.pluggedIn) {
            setPluggedIn(true);
            setEngineerMode(true);
            setEngineerSession(session.sessionId);
            setEngineerPermissions(res.data.permissions);
            setCurrentEngineer({
              role: res.data.role,
              labelSlug: res.data.labelSlug,
            });
          } else {
            localStorage.removeItem("engineerSession");
          }
        }).catch(() => {
          localStorage.removeItem("engineerSession");
        });
      } catch {
        localStorage.removeItem("engineerSession");
      }
    }
  }, []);

  const loadBeatLibrary = async () => {
    try {
      // Load from studio library API
      const res = await api.get("/studio/library?type=beat&limit=20");
      if (res.data?.items) {
        setBeatLibrary(res.data.items.map(b => ({
          id: b._id || b.id,
          title: b.name || b.title,
          bpm: b.bpm || 120,
          producer: b.producer || "PowerStream",
          url: b.url || b.audioUrl,
          genre: b.genre || "Hip-Hop",
        })));
      }
    } catch {
      // Use demo beats if API unavailable
      setBeatLibrary([
        { id: "demo1", title: "Trap Soul", bpm: 140, producer: "PowerStream", url: "/audio/demo-beat.mp3", genre: "Trap" },
        { id: "demo2", title: "Houston Bounce", bpm: 135, producer: "No Limit East Houston", url: "/audio/demo-beat.mp3", genre: "Hip-Hop" },
        { id: "demo3", title: "Smooth R&B", bpm: 90, producer: "Studio Pro", url: "/audio/demo-beat.mp3", genre: "R&B" },
        { id: "demo4", title: "Dark Drill", bpm: 145, producer: "East Side", url: "/audio/demo-beat.mp3", genre: "Drill" },
        { id: "demo5", title: "Screw City", bpm: 70, producer: "H-Town", url: "/audio/demo-beat.mp3", genre: "Chopped & Screwed" },
      ]);
    }
  };

  const loadSavedTakes = () => {
    // Load from localStorage for persistence
    const saved = localStorage.getItem("studio_takes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTakes(parsed.filter(t => t.audioUrl)); // Only keep takes with valid audio
      } catch {
        setTakes([]);
      }
    }
  };

  const saveTakesToStorage = (newTakes) => {
    // Save to localStorage (without blob data)
    const toSave = newTakes.map(t => ({
      id: t.id,
      name: t.name,
      duration: t.duration,
      audioUrl: t.audioUrl,
      createdAt: t.createdAt,
      beatUsed: t.beatUsed,
    }));
    localStorage.setItem("studio_takes", JSON.stringify(toSave));
  };

  // ============ AUDIO LEVEL METER ============
  useEffect(() => {
    if (isRecording && !isPaused && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      levelRef.current = setInterval(() => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const level = (avg / 255) * 100;
        setMicLevel(level);
        setPeakLevel(prev => Math.max(prev * 0.99, level)); // Slow decay
        setWaveformData(prev => [...prev, level].slice(-150));
      }, 40);
    } else if (!isRecording) {
      setMicLevel(0);
    }
    return () => clearInterval(levelRef.current);
  }, [isRecording, isPaused]);

  // ============ RECORDING TIMER ============
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 0.1);
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // ============ METRONOME ============
  useEffect(() => {
    if (metronomeEnabled && isRecording && !isPaused) {
      const interval = (60 / bpm) * 1000;
      metronomeRef.current = setInterval(() => playClick(), interval);
    }
    return () => clearInterval(metronomeRef.current);
  }, [metronomeEnabled, isRecording, isPaused, bpm]);

  const playClick = () => {
    const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.stop(ctx.currentTime + 0.08);
  };

  // ============ HELPERS ============
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ============ FX PRESETS ============
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    setFxSettings(FX_PRESETS[presetKey]);
  };

  // ============ BEAT CONTROLS ============
  const handleSelectBeat = (beat) => {
    setSelectedBeat(beat);
    setShowBeatBrowser(false);
    if (beat.bpm) setBpm(beat.bpm);
    showSuccess(`Beat selected: ${beat.title}`);
  };

  const handlePlayBeat = async () => {
    if (!selectedBeat) return;
    
    if (beatPlaying) {
      beatPlayerRef.current?.pause();
      setBeatPlaying(false);
    } else {
      // Get the best available URL
      let beatUrl = selectedBeat.url || 
                    selectedBeat.stems?.full || 
                    selectedBeat.stems?.master ||
                    selectedBeat.stems?.drums;
      
      if (!beatUrl) {
        setError("No audio URL available for this beat");
        return;
      }
      
      // Handle URL correctly:
      // - Blob URLs (blob:http://...) should be used as-is
      // - HTTP URLs should be used as-is
      // - Relative URLs (/api/...) need the base prepended
      let fullUrl = beatUrl;
      if (beatUrl.startsWith("blob:")) {
        // Blob URL - use directly
        fullUrl = beatUrl;
      } else if (beatUrl.startsWith("http://") || beatUrl.startsWith("https://")) {
        // Full HTTP URL - use directly
        fullUrl = beatUrl;
      } else if (beatUrl.startsWith("/")) {
        // Relative URL - prepend API base
        fullUrl = `http://localhost:5001${beatUrl}`;
      }
      
      console.log("[Beat] Playing:", fullUrl);
      
      // Create new audio player
      if (beatPlayerRef.current) {
        beatPlayerRef.current.pause();
        beatPlayerRef.current = null;
      }
      
      beatPlayerRef.current = new Audio(fullUrl);
      beatPlayerRef.current.loop = true;
      beatPlayerRef.current.volume = beatVolume / 100;
      
      beatPlayerRef.current.onerror = (e) => {
        console.error("[Beat] Audio error:", e);
        setError("Could not play beat - try uploading a different file");
        setBeatPlaying(false);
      };
      
      try {
        await beatPlayerRef.current.play();
        setBeatPlaying(true);
        setError(null);
        console.log("[Beat] Playback started");
      } catch (err) {
        console.error("[Beat] Play error:", err);
        setError("Could not play beat - " + (err.message || "unknown error"));
      }
    }
  };

  const handleBeatVolumeChange = (val) => {
    setBeatVolume(val);
    if (beatPlayerRef.current) {
      beatPlayerRef.current.volume = val / 100;
    }
  };

  const handleUploadBeat = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const url = URL.createObjectURL(file);
      const newBeat = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        bpm: 120,
        producer: "Uploaded",
        url,
        genre: "Custom",
        isLocal: true,
      };
      setBeatLibrary(prev => [newBeat, ...prev]);
      setSelectedBeat(newBeat);
      showSuccess("Beat uploaded successfully!");
    } catch (err) {
      setError("Failed to upload beat");
    } finally {
      setLoading(false);
    }
  };

  // ============ AI BEAT GENERATOR ============
  const handleGenerateBeat = async () => {
    if (!beatGenPrompt.trim()) {
      setError("Please enter a description for your beat");
      return;
    }
    
    setGeneratingBeat(true);
    setError(null);
    
    try {
      const res = await api.post("/beat/generate", {
        prompt: beatGenPrompt,
        tempo: beatGenBpm,
        genre: beatGenStyle,
        mood: beatGenPrompt.includes("dark") ? "dark" : "uplifting",
      });
      
      if (res.data?.success && res.data?.stems) {
        // Get the full beat URL (prepend API base for relative URLs)
        const fullUrl = res.data.stems?.full || res.data.stems?.master;
        const beatUrl = fullUrl?.startsWith("http") ? fullUrl : `http://localhost:5001${fullUrl}`;
        
        const newBeat = {
          id: Date.now().toString(),
          title: `AI ${beatGenStyle.charAt(0).toUpperCase() + beatGenStyle.slice(1)} - ${beatGenBpm}bpm`,
          bpm: beatGenBpm,
          producer: "PowerStream AI",
          url: beatUrl,
          genre: beatGenStyle,
          stems: res.data.stems,
        };
        setBeatLibrary(prev => [newBeat, ...prev]);
        setSelectedBeat(newBeat);
        setShowBeatGenerator(false);
        showSuccess("AI beat generated! Click play to hear it.");
      } else {
        throw new Error("Generation failed - no stems returned");
      }
    } catch (err) {
      console.error("Beat generation error:", err);
      // Fallback: generate a beat URL directly
      const fallbackUrl = `http://localhost:5001/api/beat/stems/full.wav?tempo=${beatGenBpm}&t=${Date.now()}`;
      const newBeat = {
        id: Date.now().toString(),
        title: `AI ${beatGenStyle.charAt(0).toUpperCase() + beatGenStyle.slice(1)} - ${beatGenBpm}bpm`,
        bpm: beatGenBpm,
        producer: "PowerStream AI",
        url: fallbackUrl,
        genre: beatGenStyle,
      };
      setBeatLibrary(prev => [newBeat, ...prev]);
      setSelectedBeat(newBeat);
      setShowBeatGenerator(false);
      showSuccess("Beat generated!");
    } finally {
      setGeneratingBeat(false);
    }
  };

  // ============ RECORDING CONTROLS ============
  const handleRecord = async () => {
    setError(null);
    
    if (isRecording) {
      // STOP RECORDING
      setLoading(true);
      try {
        if (mediaRecorderRef.current?.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        setPeakLevel(0);
        
        // Stop beat if playing
        if (beatPlaying) {
          beatPlayerRef.current?.pause();
          beatPlayerRef.current.currentTime = 0;
          setBeatPlaying(false);
        }
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // START RECORDING
      setLoading(true);
      setRecordingTime(0);
      setWaveformData([]);
      
      try {
        // Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: noiseGate,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 2,
          }
        });
        streamRef.current = stream;
        
        // Setup audio context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000,
          latencyHint: lowLatency ? "interactive" : "balanced",
        });
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        // Monitoring
        if (monitoring) {
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = outputVolume / 100;
          source.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          gainNodeRef.current = gainNode;
        }
        
        // Count-in
        if (countIn && metronomeEnabled) {
          for (let i = 0; i < 4; i++) {
            playClick();
            await new Promise(r => setTimeout(r, (60 / bpm) * 1000));
          }
        }
        
        // Start beat playback
        if (selectedBeat?.url && !beatPlaying) {
          handlePlayBeat();
        }
        
        // Setup MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/mp4';
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 256000,
        });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const duration = recordingTime;
          
          if (duration > 0.5) { // Minimum 0.5 seconds
            const takeNumber = takes.length + 1;
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const newTake = {
              id: Date.now().toString(),
              name: `Take ${takeNumber}`,
              duration,
              audioUrl,
              blob: audioBlob,
              createdAt: new Date().toISOString(),
              beatUsed: selectedBeat?.title || null,
            };
            
            const updatedTakes = [newTake, ...takes];
            setTakes(updatedTakes);
            setSelectedTake(newTake);
            saveTakesToStorage(updatedTakes);
            showSuccess(`Take ${takeNumber} recorded!`);
          }
        };
        
        mediaRecorder.start(500);
        setIsRecording(true);
        setIsPaused(false);
        
      } catch (err) {
        setError("Microphone access denied: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (beatPlayerRef.current) beatPlayerRef.current.play();
      } else {
        mediaRecorderRef.current.pause();
        if (beatPlayerRef.current) beatPlayerRef.current.pause();
      }
    }
    setIsPaused(!isPaused);
  };

  // ============ PLAYBACK CONTROLS ============
  const handlePlayTake = (take) => {
    if (!take) {
      setError("No take selected");
      return;
    }
    
    // Get the audio URL - prefer blob, then saved URL
    const audioUrl = take.audioUrl || take.savedUrl;
    
    if (!audioUrl) {
      setError("No audio available for this take - it may have been lost after page refresh");
      return;
    }
    
    console.log("[Take] Playing:", take.name, audioUrl.substring(0, 50) + "...");
    
    // Stop any existing playback
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      setPlaybackDuration(audio.duration);
      console.log("[Take] Duration:", audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      setPlaybackTime(audio.currentTime);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlaybackTime(0);
      setBeatPlaying(false);
      beatPlayerRef.current?.pause();
    });
    
    audio.addEventListener('error', (e) => {
      console.error("[Take] Playback error:", e);
      setError("Failed to play - audio may be corrupted or expired");
      setIsPlaying(false);
    });
    
    audio.volume = vocalVolume / 100;
    audio.play().then(() => {
      setIsPlaying(true);
      setSelectedTake(take);
      
      // Also play beat if available
      if (selectedBeat?.url) {
        if (beatPlayerRef.current) {
          beatPlayerRef.current.currentTime = 0;
          beatPlayerRef.current.volume = beatVolume / 100;
          beatPlayerRef.current.play();
          setBeatPlaying(true);
        }
      }
    }).catch(err => {
      setError("Playback error: " + err.message);
    });
  };

  const handleStopPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (beatPlayerRef.current) {
      beatPlayerRef.current.pause();
      beatPlayerRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setBeatPlaying(false);
    setPlaybackTime(0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * playbackDuration;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = time;
    }
    if (beatPlayerRef.current) {
      beatPlayerRef.current.currentTime = time;
    }
    setPlaybackTime(time);
  };

  // ============ TAKE MANAGEMENT ============
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const handleDeleteTake = (take) => {
    // Stop playback if this take is playing
    if (selectedTake?.id === take.id) {
      handleStopPlayback();
      setSelectedTake(null);
    }
    
    // Revoke blob URL to free memory
    if (take.audioUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(take.audioUrl);
    }
    
    const updatedTakes = takes.filter(t => t.id !== take.id);
    setTakes(updatedTakes);
    saveTakesToStorage(updatedTakes);
    setDeleteConfirmId(null);
    showSuccess("Take deleted");
  };
  
  const handleClearAllTakes = () => {
    if (!confirm("Delete ALL takes? This cannot be undone.")) return;
    
    // Stop playback
    handleStopPlayback();
    setSelectedTake(null);
    
    // Revoke all blob URLs
    takes.forEach(take => {
      if (take.audioUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(take.audioUrl);
      }
    });
    
    setTakes([]);
    localStorage.removeItem("studio_takes");
    showSuccess("All takes cleared");
  };

  const handleDownloadTake = (take) => {
    const a = document.createElement('a');
    a.href = take.audioUrl;
    a.download = `${take.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess("Download started");
  };

  const handleRenameTake = (take) => {
    const newName = prompt("Enter new name:", take.name);
    if (newName && newName !== take.name) {
      const updatedTakes = takes.map(t => t.id === take.id ? { ...t, name: newName } : t);
      setTakes(updatedTakes);
      saveTakesToStorage(updatedTakes);
    }
  };

  const handleSaveTake = async (take) => {
    setLoading(true);
    try {
      // Upload to server
      const formData = new FormData();
      formData.append("file", take.blob);
      formData.append("name", take.name);
      formData.append("type", "recording");
      
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data?.url) {
        const updatedTakes = takes.map(t => 
          t.id === take.id ? { ...t, savedUrl: res.data.url, saved: true } : t
        );
        setTakes(updatedTakes);
        showSuccess("Saved to library!");
      }
    } catch (err) {
      setError("Save failed - " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ WAVEFORM COMPONENT ============
  const Waveform = ({ data, width = 500, height = 60, color = "#ffb84d", progress = 0 }) => (
    <div style={{ position: 'relative', width, height, background: 'rgba(0,0,0,0.4)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Progress overlay */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${progress}%`,
        background: 'rgba(255,184,77,0.2)',
        transition: 'width 0.1s linear',
      }} />
      {/* Waveform bars */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 4px', gap: 2 }}>
        {data.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#555', fontSize: 12 }}>
            No audio data
          </div>
        ) : (
          data.map((val, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 2,
                maxWidth: 6,
                height: `${Math.max(val * 0.8, 4)}%`,
                background: i < (progress / 100 * data.length) ? color : 'rgba(255,255,255,0.3)',
                borderRadius: 1,
              }}
            />
          ))
        )}
      </div>
    </div>
  );

  // ============ RENDER ============
  return (
    <div>
      {/* HEADER */}
      <div className="studio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="studio-header-title">🎙️ Record Booth</h1>
          <p className="studio-header-subtitle">No Limit East Houston • Professional Recording</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span className="studio-card-badge studio-card-badge--green">48kHz / 24-bit</span>
            <span className="studio-card-badge">Stereo</span>
            <span className={`studio-card-badge ${fxEnabled ? 'studio-card-badge--gold' : ''}`}>
              FX: {activePreset}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`studio-btn ${engineerMode ? 'studio-btn--primary' : pluggedIn ? 'studio-btn--success' : 'studio-btn--outline'}`}
            onClick={() => {
              setShowEngineerPanel(!showEngineerPanel);
              // Scroll to panel after it opens
              if (!showEngineerPanel) {
                setTimeout(() => {
                  document.getElementById('engineer-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
            style={pluggedIn ? { background: 'linear-gradient(135deg, #00c864, #00a854)', color: '#fff' } : {}}
          >
            {pluggedIn ? '🔌 Plugged In' : '👷 Engineer Mode'}
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="studio-card" style={{ background: "rgba(255,68,68,0.15)", borderColor: "#ff4444", marginBottom: 16 }}>
          <div style={{ color: "#ff6666", display: 'flex', justifyContent: 'space-between' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="studio-card" style={{ background: "rgba(0,200,100,0.15)", borderColor: "#00c864", marginBottom: 16 }}>
          <div style={{ color: "#00c864" }}>✅ {successMsg}</div>
        </div>
      )}

      {/* BEAT PLAYER SECTION */}
      <div className="studio-card" style={{ marginBottom: 16 }}>
        <div className="studio-card-header">
          <h3 className="studio-card-title">🎵 Instrumental / Beat</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="studio-btn studio-btn--outline" onClick={() => setShowBeatBrowser(true)}>
              📁 Beat Store
            </button>
            <button className="studio-btn studio-btn--outline" onClick={() => setShowBeatGenerator(true)}>
              🤖 AI Generate
            </button>
            <label className="studio-btn studio-btn--secondary" style={{ cursor: 'pointer' }}>
              ⬆️ Upload
              <input type="file" accept="audio/*" hidden onChange={handleUploadBeat} />
            </label>
          </div>
        </div>
        
        {selectedBeat ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <button
                className={`studio-btn ${beatPlaying ? 'studio-btn--primary' : 'studio-btn--secondary'}`}
                style={{ width: 50, height: 50, borderRadius: '50%', fontSize: 20 }}
                onClick={handlePlayBeat}
              >
                {beatPlaying ? '⏸' : '▶'}
              </button>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedBeat.title}</div>
                <div style={{ color: '#888', fontSize: 13 }}>
                  {selectedBeat.producer} • {selectedBeat.bpm} BPM • {selectedBeat.genre}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
              <span style={{ fontSize: 12, color: '#888' }}>🔊</span>
              <input
                type="range"
                className="studio-slider"
                min="0"
                max="100"
                value={beatVolume}
                onChange={(e) => handleBeatVolumeChange(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 12, width: 35 }}>{beatVolume}%</span>
            </div>
            <button
              className="studio-btn studio-btn--outline"
              onClick={() => setSelectedBeat(null)}
              style={{ fontSize: 12 }}
            >
              ✕ Remove
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎹</div>
            <div>No beat selected - Choose from Beat Store or Upload</div>
          </div>
        )}
      </div>

      {/* MAIN RECORDING AREA */}
      <div className="studio-card studio-card--highlight" style={{ marginBottom: 16, textAlign: 'center' }}>
        {/* Waveform */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <Waveform
            data={waveformData}
            width={Math.min(700, window.innerWidth - 80)}
            height={70}
            color={isRecording ? "#ff4444" : "#ffb84d"}
            progress={0}
          />
        </div>
        
        {/* VU Meter */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 3, height: 80 }}>
            {[...Array(30)].map((_, i) => {
              const threshold = (i / 30) * 100;
              const isActive = micLevel > threshold;
              const color = i < 20 ? "#00c864" : i < 26 ? "#ffb84d" : "#ff4444";
              return (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: `${(i + 1) * 2.5}px`,
                    background: isActive ? color : "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    transition: "background 0.03s",
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
            Level: <span style={{ color: micLevel > 90 ? '#ff4444' : '#ffb84d', fontWeight: 700 }}>{Math.round(micLevel)} dB</span>
            {' • '}Peak: {Math.round(peakLevel)} dB
          </div>
        </div>

        {/* Time Display */}
        <div style={{
          fontSize: 52,
          fontWeight: 900,
          fontFamily: "monospace",
          color: isRecording ? (isPaused ? "#ffb84d" : "#ff4444") : "#fff",
          marginBottom: 20,
          textShadow: isRecording && !isPaused ? "0 0 30px rgba(255,68,68,0.5)" : "none",
        }}>
          {formatTime(recordingTime)}
        </div>

        {/* Transport Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {isRecording && (
            <button className="studio-btn studio-btn--round" style={{ width: 50, height: 50, background: '#333' }} onClick={handleRecord}>
              ⏹
            </button>
          )}
          
          <button
            className="studio-btn studio-btn--round"
            style={{
              width: 80,
              height: 80,
              fontSize: 32,
              background: isRecording ? "linear-gradient(135deg, #ff4444, #cc0000)" : "linear-gradient(135deg, #ff4444, #ff6666)",
              boxShadow: isRecording ? "0 0 40px rgba(255,68,68,0.6)" : "0 0 20px rgba(255,68,68,0.3)",
            }}
            onClick={handleRecord}
            disabled={loading}
          >
            {loading ? "⏳" : isRecording ? "⏺" : "⏺"}
          </button>

          {isRecording && (
            <button className="studio-btn studio-btn--round studio-btn--secondary" style={{ width: 50, height: 50 }} onClick={handlePause}>
              {isPaused ? "▶" : "⏸"}
            </button>
          )}
        </div>

        <div style={{ color: '#888', fontSize: 13 }}>
          {loading ? "Initializing..." : isRecording ? (isPaused ? "⏸ Paused" : "🔴 Recording...") : "🎤 Ready to record"}
        </div>

        {/* Recording Controls Component */}
        <RecordingControls
          isRecording={isRecording}
          hasTake={takes.length > 0 && selectedTake !== null}
          onStart={handleRecord}
          onStop={handleRecord}
          onPlay={() => selectedTake && handlePlayTake(selectedTake)}
          onDelete={() => selectedTake && handleDeleteTake(selectedTake)}
          onSave={() => selectedTake && handleSaveTake(selectedTake)}
        />
      </div>

      {/* CONTROLS GRID */}
      <div className="studio-grid studio-grid--3" style={{ marginBottom: 16 }}>
        {/* Input Controls */}
        <div className="studio-card">
          <h3 className="studio-card-title">🎚️ Input / Monitor</h3>
          <div style={{ marginBottom: 12 }}>
            <label className="studio-label">Mic Gain</label>
            <input type="range" className="studio-slider" min="0" max="100" value={inputGain} onChange={e => setInputGain(Number(e.target.value))} />
            <div className="studio-slider-value">{inputGain}%</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="studio-label">Monitor Volume</label>
            <input type="range" className="studio-slider" min="0" max="100" value={outputVolume} onChange={e => setOutputVolume(Number(e.target.value))} />
            <div className="studio-slider-value">{outputVolume}%</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className={`studio-chip ${monitoring ? 'studio-chip--active' : ''}`} onClick={() => setMonitoring(!monitoring)}>🎧 Monitor</button>
            <button className={`studio-chip ${lowLatency ? 'studio-chip--active' : ''}`} onClick={() => setLowLatency(!lowLatency)}>⚡ Low Latency</button>
            <button className={`studio-chip ${noiseGate ? 'studio-chip--active' : ''}`} onClick={() => setNoiseGate(!noiseGate)}>🔇 Gate</button>
          </div>
        </div>

        {/* Effects */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">✨ Effects</h3>
            <button className={`studio-chip ${fxEnabled ? 'studio-chip--active' : ''}`} onClick={() => setFxEnabled(!fxEnabled)} style={{ fontSize: 11 }}>
              {fxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {Object.keys(FX_PRESETS).map(key => (
              <button key={key} className={`studio-chip ${activePreset === key ? 'studio-chip--active' : ''}`} onClick={() => applyPreset(key)} style={{ fontSize: 10 }}>
                {FX_PRESETS[key].name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className={`studio-chip ${autoTune ? 'studio-chip--active' : ''}`} onClick={() => setAutoTune(!autoTune)}>🎵 AutoTune</button>
          </div>
        </div>

        {/* Timing */}
        <div className="studio-card">
          <h3 className="studio-card-title">⏱️ Timing</h3>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <button className={`studio-chip ${metronomeEnabled ? 'studio-chip--active' : ''}`} onClick={() => setMetronomeEnabled(!metronomeEnabled)}>🥁 Click</button>
            <button className={`studio-chip ${countIn ? 'studio-chip--active' : ''}`} onClick={() => setCountIn(!countIn)}>📢 Count-In</button>
          </div>
          <div>
            <label className="studio-label">BPM: {bpm}</label>
            <input type="range" className="studio-slider" min="60" max="200" value={bpm} onChange={e => setBpm(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* TAKES LIBRARY */}
      <div className="studio-card">
        <div className="studio-card-header">
          <h3 className="studio-card-title">📼 Takes ({takes.length})</h3>
          {takes.length > 0 && (
            <button 
              className="studio-btn" 
              style={{ background: 'rgba(255,0,0,0.15)', color: '#ff6b6b', fontSize: 11, padding: '4px 10px' }}
              onClick={handleClearAllTakes}
            >
              🗑️ Clear All
            </button>
          )}
        </div>
        
        {takes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No recordings yet</div>
            <div style={{ fontSize: 13 }}>Hit record to capture your first take</div>
          </div>
        ) : (
          <div className="studio-file-list">
            {takes.map(take => (
              <div
                key={take.id}
                className={`studio-file-item ${selectedTake?.id === take.id ? 'studio-file-item--selected' : ''}`}
                style={{
                  background: selectedTake?.id === take.id ? 'rgba(255,184,77,0.1)' : undefined,
                  borderLeft: selectedTake?.id === take.id ? '3px solid #ffb84d' : '3px solid transparent',
                }}
              >
                <div className="studio-file-info" style={{ cursor: 'pointer' }} onClick={() => setSelectedTake(take)}>
                  <span style={{ fontSize: 24 }}>
                    {isPlaying && selectedTake?.id === take.id ? '🔊' : take.saved ? '☁️' : '🎵'}
                  </span>
                  <div>
                    <div className="studio-file-name">
                      {take.name}
                      {take.saved && <span style={{ color: '#4caf50', fontSize: 11, marginLeft: 6 }}>✓ Saved</span>}
                    </div>
                    <div className="studio-file-size">
                      ⏱ {formatTime(take.duration)} {take.beatUsed && `• 🎹 ${take.beatUsed}`}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons or Delete confirmation */}
                {deleteConfirmId === take.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,0,0,0.1)', padding: '4px 8px', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: '#ff6b6b' }}>Delete?</span>
                    <button 
                      className="studio-btn" 
                      style={{ background: '#ff4444', color: '#fff', padding: '4px 10px', fontSize: 11 }}
                      onClick={() => handleDeleteTake(take)}
                    >
                      Yes
                    </button>
                    <button 
                      className="studio-btn studio-btn--outline" 
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isPlaying && selectedTake?.id === take.id ? (
                      <button className="studio-btn studio-btn--secondary" onClick={handleStopPlayback}>⏹ Stop</button>
                    ) : (
                      <button className="studio-btn studio-btn--primary" onClick={() => handlePlayTake(take)}>▶ Play</button>
                    )}
                    <button className="studio-btn studio-btn--outline" onClick={() => handleDownloadTake(take)} title="Download">⬇️</button>
                    <button 
                      className="studio-btn studio-btn--outline" 
                      onClick={() => handleSaveTake(take)} 
                      title="Save to Cloud"
                      disabled={take.saved}
                      style={take.saved ? { opacity: 0.5 } : {}}
                    >
                      ☁️
                    </button>
                    <button className="studio-btn studio-btn--outline" onClick={() => handleRenameTake(take)} title="Rename">✏️</button>
                    <button 
                      className="studio-btn" 
                      style={{ background: 'rgba(255,0,0,0.2)', color: '#ff6666' }} 
                      onClick={() => setDeleteConfirmId(take.id)} 
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Playback Controls */}
        {selectedTake && (
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Now Playing: {selectedTake.name}</div>
            <div
              style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, cursor: 'pointer', marginBottom: 8 }}
              onClick={handleSeek}
            >
              <div style={{ height: '100%', width: `${(playbackTime / playbackDuration) * 100 || 0}%`, background: '#ffb84d', borderRadius: 4, transition: 'width 0.1s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
              <span>{formatTime(playbackTime)}</span>
              <span>{formatTime(playbackDuration)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <span style={{ fontSize: 12, color: '#888' }}>Vocal:</span>
              <input type="range" className="studio-slider" min="0" max="100" value={vocalVolume} onChange={e => {
                setVocalVolume(Number(e.target.value));
                if (audioPlayerRef.current) audioPlayerRef.current.volume = e.target.value / 100;
              }} style={{ flex: 1 }} />
              <span style={{ fontSize: 12, width: 35 }}>{vocalVolume}%</span>
            </div>
          </div>
        )}
      </div>

      {/* BEAT BROWSER MODAL */}
      {showBeatBrowser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1a1a1f', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '80vh', overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>🎹 Beat Store</h3>
              <button onClick={() => setShowBeatBrowser(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
              {beatLibrary.map(beat => (
                <div
                  key={beat.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => handleSelectBeat(beat)}
                >
                  <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #ffb84d, #ff8800)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    🎵
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{beat.title}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{beat.producer} • {beat.bpm} BPM • {beat.genre}</div>
                  </div>
                  <button className="studio-btn studio-btn--primary" onClick={(e) => { e.stopPropagation(); handleSelectBeat(beat); }}>
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI BEAT GENERATOR MODAL */}
      {showBeatGenerator && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1a1a1f', borderRadius: 16, maxWidth: 500, width: '100%' }}>
            <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>🤖 AI Beat Generator</h3>
              <button onClick={() => setShowBeatGenerator(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label className="studio-label">Describe your beat:</label>
                <textarea
                  value={beatGenPrompt}
                  onChange={e => setBeatGenPrompt(e.target.value)}
                  placeholder="Dark trap beat with heavy 808s and hi-hats..."
                  style={{ width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#fff', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="studio-label">Style</label>
                  <select
                    value={beatGenStyle}
                    onChange={e => setBeatGenStyle(e.target.value)}
                    style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  >
                    <option value="trap">Trap</option>
                    <option value="hiphop">Hip-Hop</option>
                    <option value="rnb">R&B</option>
                    <option value="drill">Drill</option>
                    <option value="boom-bap">Boom Bap</option>
                  </select>
                </div>
                <div>
                  <label className="studio-label">BPM: {beatGenBpm}</label>
                  <input type="range" className="studio-slider" min="60" max="180" value={beatGenBpm} onChange={e => setBeatGenBpm(Number(e.target.value))} />
                </div>
              </div>
              <button
                className="studio-btn studio-btn--primary"
                style={{ width: '100%' }}
                onClick={handleGenerateBeat}
                disabled={generatingBeat}
              >
                {generatingBeat ? '⏳ Generating...' : '🎵 Generate Beat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENGINEER/PRODUCER PANEL */}
      {showEngineerPanel && (
        <div id="engineer-panel" className="studio-card" style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(139,69,19,0.2), rgba(255,184,77,0.1))', borderColor: '#8b4513' }}>
          <div className="studio-card-header">
            <h3 className="studio-card-title" style={{ color: '#ffb84d' }}>
              👷 No Limit East Houston - Engineer & Producer Suite
            </h3>
            {pluggedIn ? (
              <span className="studio-card-badge" style={{ background: '#00c864', color: '#000' }}>
                🔌 Plugged In
              </span>
            ) : (
              <span className="studio-card-badge studio-card-badge--gold">Access Required</span>
            )}
          </div>
          
          {/* NOT PLUGGED IN - Show Access Code Entry */}
          {!pluggedIn ? (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h4 style={{ margin: '0 0 8px', color: '#fff' }}>Engineer Access Required</h4>
              <p style={{ color: '#888', marginBottom: 20, fontSize: 13 }}>
                Enter your 6-character access code provided by No Limit administrators.
              </p>
              
              <div style={{ maxWidth: 300, margin: '0 auto' }}>
                <input
                  type="text"
                  value={accessCodeInput}
                  onChange={e => setAccessCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="XXXXXX"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 24,
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    letterSpacing: 8,
                    background: 'rgba(0,0,0,0.4)',
                    border: plugInError ? '2px solid #ff4444' : '2px solid rgba(255,184,77,0.3)',
                    borderRadius: 12,
                    color: '#ffb84d',
                    outline: 'none',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handlePlugIn()}
                />
                
                {plugInError && (
                  <div style={{ color: '#ff6666', marginTop: 8, fontSize: 13 }}>
                    ⚠️ {plugInError}
                  </div>
                )}
                
                <button
                  className="studio-btn studio-btn--primary"
                  onClick={handlePlugIn}
                  disabled={plugInLoading || accessCodeInput.length !== 6}
                  style={{ width: '100%', marginTop: 16, padding: '14px 24px', fontSize: 16 }}
                >
                  {plugInLoading ? '⏳ Connecting...' : '🔌 Plug In'}
                </button>
              </div>
              
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, textAlign: 'left' }}>
                <h5 style={{ margin: '0 0 8px', color: '#ffb84d', fontSize: 13 }}>
                  🔑 How to get an access code:
                </h5>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#888', fontSize: 12 }}>
                  <li>Contact No Limit East Houston administrators</li>
                  <li>Marcus or Gangsta can generate codes for approved engineers</li>
                  <li>Codes expire after 7 days for security</li>
                </ul>
              </div>
            </div>
          ) : (
            /* PLUGGED IN - Show Engineer Tools */
            <>
              <div style={{ padding: '12px 16px', background: 'rgba(0,200,100,0.1)', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#00c864', fontWeight: 700 }}>
                    ✓ Connected as {currentEngineer?.role?.toUpperCase()}
                  </span>
                  {currentEngineer?.name && (
                    <span style={{ color: '#888', marginLeft: 8 }}>({currentEngineer.name})</span>
                  )}
                </div>
                <button
                  className="studio-btn"
                  onClick={handleUnplug}
                  style={{ background: 'rgba(255,0,0,0.2)', color: '#ff6666', padding: '6px 12px', fontSize: 12 }}
                >
                  🔌 Unplug
                </button>
              </div>
              
              <div className="studio-grid studio-grid--2" style={{ marginBottom: 16 }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: '0 0 12px', color: '#ffb84d' }}>🎛️ Engineer Tools</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button 
                      className="studio-btn studio-btn--secondary"
                      disabled={!engineerPermissions?.canMix}
                      style={!engineerPermissions?.canMix ? { opacity: 0.5 } : {}}
                    >
                      🔊 Master EQ
                    </button>
                    <button 
                      className="studio-btn studio-btn--secondary"
                      disabled={!engineerPermissions?.canMix}
                      style={!engineerPermissions?.canMix ? { opacity: 0.5 } : {}}
                    >
                      📈 Dynamic Processor
                    </button>
                    <button 
                      className="studio-btn studio-btn--secondary"
                      disabled={!engineerPermissions?.canMaster}
                      style={!engineerPermissions?.canMaster ? { opacity: 0.5 } : {}}
                    >
                      🌊 Stereo Enhancer
                    </button>
                    <button 
                      className="studio-btn studio-btn--secondary"
                      disabled={!engineerPermissions?.canControlSession}
                      style={!engineerPermissions?.canControlSession ? { opacity: 0.5 } : {}}
                    >
                      🎚️ Mix Console
                    </button>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: '0 0 12px', color: '#ffb84d' }}>🎹 Producer Tools</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button 
                      className="studio-btn studio-btn--secondary"
                      disabled={!engineerPermissions?.canAccessAI}
                      style={!engineerPermissions?.canAccessAI ? { opacity: 0.5 } : {}}
                    >
                      🤖 AI Melody Generator
                    </button>
                    <button 
                      className="studio-btn studio-btn--secondary"
                      disabled={!engineerPermissions?.canAccessAI}
                      style={!engineerPermissions?.canAccessAI ? { opacity: 0.5 } : {}}
                    >
                      🥁 Drum Pattern AI
                    </button>
                    <button className="studio-btn studio-btn--secondary">🎵 Sample Chopper</button>
                    <button className="studio-btn studio-btn--secondary">📊 Arrangement Assistant</button>
                  </div>
                </div>
              </div>
              
              {/* Mastering Section - Only for master_engineers */}
              {engineerPermissions?.canMaster && (
                <div style={{ background: 'rgba(255,184,77,0.1)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 12px', color: '#ffb84d' }}>🎖️ Mastering Suite</h4>
                  <div className="studio-grid studio-grid--4">
                    <button className="studio-btn studio-btn--primary">📀 Master Track</button>
                    <button className="studio-btn studio-btn--secondary">📊 LUFS Meter</button>
                    <button className="studio-btn studio-btn--secondary">🔊 Limiter</button>
                    <button className="studio-btn studio-btn--secondary">💿 Export Master</button>
                  </div>
                </div>
              )}
              
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: '0 0 12px', color: '#ffb84d' }}>📝 Session Notes</h4>
                <textarea
                  value={projectNotes}
                  onChange={e => setProjectNotes(e.target.value)}
                  placeholder="Add notes for this session..."
                  style={{ width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#fff', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,184,77,0.1)', borderRadius: 8, fontSize: 12, color: '#888' }}>
                <strong style={{ color: '#ffb84d' }}>Label:</strong> {currentEngineer?.labelSlug || "no-limit-east-houston"}<br />
                <strong style={{ color: '#ffb84d' }}>Role:</strong> {currentEngineer?.role}<br />
                <strong style={{ color: '#ffb84d' }}>Permissions:</strong>{' '}
                {engineerPermissions?.canMix && <span style={{ color: '#00c864' }}>Mix </span>}
                {engineerPermissions?.canMaster && <span style={{ color: '#00c864' }}>Master </span>}
                {engineerPermissions?.canExport && <span style={{ color: '#00c864' }}>Export </span>}
                {engineerPermissions?.canAccessAI && <span style={{ color: '#00c864' }}>AI </span>}
              </div>
            </>
          )}
          
          {/* ADMIN CODE GENERATOR - Only show for admins */}
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,184,77,0.2)', paddingTop: 16 }}>
            <button
              className="studio-btn studio-btn--outline"
              onClick={() => setShowCodeGenerator(!showCodeGenerator)}
              style={{ width: '100%', fontSize: 13 }}
            >
              🔑 Admin: Generate Access Codes
            </button>
            
            {showCodeGenerator && (
              <div style={{ marginTop: 16, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
                <h5 style={{ margin: '0 0 12px', color: '#ffb84d' }}>Generate New Access Code</h5>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button className="studio-btn studio-btn--secondary" onClick={() => handleGenerateCode("engineer")}>
                    👷 Engineer
                  </button>
                  <button className="studio-btn studio-btn--secondary" onClick={() => handleGenerateCode("producer")}>
                    🎹 Producer
                  </button>
                  <button className="studio-btn studio-btn--secondary" onClick={() => handleGenerateCode("mixer")}>
                    🎚️ Mixer
                  </button>
                  <button className="studio-btn studio-btn--primary" onClick={() => handleGenerateCode("master_engineer")}>
                    🎖️ Master Engineer
                  </button>
                  <button className="studio-btn" style={{ background: 'linear-gradient(135deg, #ffb84d, #ff8c00)', color: '#000' }} onClick={() => handleGenerateCode("full_access")}>
                    ⭐ Full Access
                  </button>
                </div>
                
                {generatedCodes.length > 0 && (
                  <div>
                    <h6 style={{ margin: '0 0 8px', color: '#888', fontSize: 12 }}>Recently Generated:</h6>
                    {generatedCodes.slice(0, 5).map((c, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '8px 12px', 
                        background: 'rgba(255,184,77,0.1)', 
                        borderRadius: 6, 
                        marginBottom: 4,
                        fontFamily: 'monospace'
                      }}>
                        <span style={{ color: '#ffb84d', fontWeight: 700, letterSpacing: 2 }}>{c.code}</span>
                        <span style={{ color: '#888', fontSize: 12 }}>{c.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
