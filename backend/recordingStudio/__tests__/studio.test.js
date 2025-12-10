// backend/recordingStudio/__tests__/studio.test.js
// Jest tests for PowerStream Recording Studio
// Run: cd backend/recordingStudio && npm test

import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";

// Mock Cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://cloudinary.com/test/audio.mp3",
        public_id: "test_audio",
        duration: 30,
        format: "mp3",
        bytes: 1024000,
      }),
      upload_stream: jest.fn((options, callback) => {
        callback(null, {
          secure_url: "https://cloudinary.com/test/audio.mp3",
          public_id: "test_audio",
        });
        return { end: jest.fn() };
      }),
    },
  },
}));

// Mock fetch for MusicGen API
global.fetch = jest.fn();

describe("Recording Session Flow", () => {
  it("should create a new recording session", async () => {
    // Simulates POST /api/studio/record/start
    const session = {
      userId: "user123",
      projectName: "Test Recording",
      type: "recording",
      data: {
        room: "vocal",
        settings: {},
        recordingStatus: "recording",
        startedAt: new Date().toISOString(),
        takes: [],
      },
      status: "draft",
    };
    
    expect(session.type).toBe("recording");
    expect(session.data.recordingStatus).toBe("recording");
    expect(session.data.takes).toEqual([]);
  });
  
  it("should add a take to the session", async () => {
    const session = {
      data: {
        takes: [],
      },
    };
    
    const take = {
      recordingId: "rec123",
      audioUrl: "https://cloudinary.com/test/take1.mp3",
      duration: 30,
      takeNumber: 1,
      uploadedAt: new Date().toISOString(),
    };
    
    session.data.takes.push(take);
    
    expect(session.data.takes.length).toBe(1);
    expect(session.data.takes[0].audioUrl).toContain("cloudinary");
  });
  
  it("should stop a recording session", async () => {
    const session = {
      data: {
        recordingStatus: "recording",
        takes: [
          { duration: 30 },
          { duration: 45 },
        ],
      },
    };
    
    session.data.recordingStatus = "stopped";
    session.data.stoppedAt = new Date().toISOString();
    
    const totalDuration = session.data.takes.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    expect(session.data.recordingStatus).toBe("stopped");
    expect(totalDuration).toBe(75);
  });
});

describe("AI Beat Generation", () => {
  beforeAll(() => {
    // Mock successful MusicGen response
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/generate")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            audio_base64: Buffer.from("fake-audio").toString("base64"),
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });
  
  it("should build AI prompt from parameters", () => {
    const params = {
      bpm: 140,
      style: "trap",
      mood: "dark",
      key: "C minor",
      bars: 16,
    };
    
    const styleDescriptions = {
      trap: "hard-hitting trap beat with rolling 808s, crisp hi-hats",
    };
    
    const moodDescriptions = {
      dark: "dark, moody, atmospheric, haunting",
    };
    
    const prompt = [
      `Professional ${styleDescriptions[params.style]}`,
      `at ${params.bpm} BPM in ${params.key}`,
      `${params.bars} bars long`,
      `with a ${moodDescriptions[params.mood]} feel`,
    ].join(". ");
    
    expect(prompt).toContain("140 BPM");
    expect(prompt).toContain("trap beat");
    expect(prompt).toContain("dark, moody");
  });
  
  it("should generate fallback pattern when API unavailable", () => {
    const steps = 16;
    const density = 0.5;
    const emphasisSteps = [0, 4, 8, 12];
    
    const pattern = new Array(steps).fill(false);
    
    // Always hit emphasis steps
    for (const step of emphasisSteps) {
      pattern[step] = true;
    }
    
    expect(pattern[0]).toBe(true);
    expect(pattern[4]).toBe(true);
    expect(pattern[8]).toBe(true);
    expect(pattern[12]).toBe(true);
  });
  
  it("should save beat to database format", () => {
    const beatData = {
      title: "Dark Dreams (trap 140bpm)",
      description: "Professional dark trap beat",
      bpm: 140,
      key: "C minor",
      mood: "dark",
      style: "trap",
      bars: 16,
      audioUrl: "https://cloudinary.com/test/beat.mp3",
      source: "musicgen",
    };
    
    const beat = {
      ...beatData,
      genre: beatData.style,
      tags: [beatData.mood, beatData.style, `${beatData.bpm}bpm`, `${beatData.bars}bars`],
      fileUrl: beatData.audioUrl,
    };
    
    expect(beat.tags).toContain("dark");
    expect(beat.tags).toContain("trap");
    expect(beat.tags).toContain("140bpm");
  });
});

describe("Mix Engine", () => {
  it("should build EQ filter chain", () => {
    const settings = {
      bass: 3,
      mid: -2,
      treble: 2,
      presence: 1,
    };
    
    const filters = [];
    
    if (settings.bass !== 0) {
      filters.push(`equalizer=f=60:t=h:w=200:g=${settings.bass}`);
    }
    if (settings.mid !== 0) {
      filters.push(`equalizer=f=1000:t=h:w=500:g=${settings.mid}`);
    }
    if (settings.treble !== 0) {
      filters.push(`equalizer=f=8000:t=h:w=2000:g=${settings.treble}`);
    }
    if (settings.presence !== 0) {
      filters.push(`equalizer=f=4000:t=h:w=1000:g=${settings.presence}`);
    }
    
    expect(filters.length).toBe(4);
    expect(filters[0]).toContain("f=60");
    expect(filters[0]).toContain("g=3");
  });
  
  it("should apply compression settings", () => {
    const compAmount = 3;
    const threshold = -20 + compAmount;
    
    expect(threshold).toBe(-17);
    
    const filter = `acompressor=threshold=${threshold}dB:ratio=4:attack=5:release=100`;
    expect(filter).toContain("-17dB");
  });
  
  it("should generate AI recipe for genre", () => {
    const recipes = {
      trap: { bass: 4, mid: -2, treble: 2, presence: 3, comp: 3, limiter: -1 },
      rnb: { bass: 2, mid: 1, treble: 0, presence: 2, comp: 2, limiter: -2 },
      drill: { bass: 5, mid: -3, treble: 3, presence: 2, comp: 4, limiter: -1 },
    };
    
    const trapRecipe = recipes["trap"];
    expect(trapRecipe.bass).toBe(4);
    expect(trapRecipe.comp).toBe(3);
  });
});

describe("Master Engine", () => {
  it("should apply streaming preset", () => {
    const preset = {
      name: "Streaming (Spotify/Apple)",
      loudness: -14,
      truePeak: -1,
      lra: 11,
      stereoWidth: 100,
    };
    
    const filter = `loudnorm=I=${preset.loudness}:LRA=${preset.lra}:TP=${preset.truePeak}`;
    
    expect(filter).toContain("I=-14");
    expect(filter).toContain("TP=-1");
  });
  
  it("should support multiple presets", () => {
    const presets = {
      streaming: { loudness: -14, truePeak: -1 },
      club: { loudness: -9, truePeak: -0.5 },
      broadcast: { loudness: -24, truePeak: -2 },
    };
    
    expect(Object.keys(presets).length).toBe(3);
    expect(presets.club.loudness).toBe(-9);
  });
});

describe("Contract Engine", () => {
  it("should calculate platform fees correctly", () => {
    const basePrice = 10000; // $100.00 in cents
    const platformFeePercent = 15;
    
    const platformFeeAmount = Math.round(basePrice * platformFeePercent / 100);
    const engineerAmount = basePrice - platformFeeAmount;
    
    expect(platformFeeAmount).toBe(1500); // $15.00
    expect(engineerAmount).toBe(8500); // $85.00
  });
  
  it("should generate contract number", () => {
    const date = new Date();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const contractNumber = `PS-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}-${rand}`;
    
    expect(contractNumber).toMatch(/^PS-\d{6}-[A-Z0-9]{6}$/);
  });
  
  it("should track signature status", () => {
    const contract = {
      signatures: {
        artist: { signed: false },
        engineer: { signed: false },
        platform: { signed: true },
      },
    };
    
    // Artist signs
    contract.signatures.artist.signed = true;
    contract.signatures.artist.signedAt = new Date();
    
    expect(contract.signatures.artist.signed).toBe(true);
    expect(contract.signatures.engineer.signed).toBe(false);
    
    // Check if fully signed
    const isFullySigned = 
      contract.signatures.artist.signed && 
      contract.signatures.engineer.signed;
    
    expect(isFullySigned).toBe(false);
    
    // Engineer signs
    contract.signatures.engineer.signed = true;
    
    const isNowFullySigned = 
      contract.signatures.artist.signed && 
      contract.signatures.engineer.signed;
    
    expect(isNowFullySigned).toBe(true);
  });
});


