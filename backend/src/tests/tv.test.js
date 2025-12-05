// backend/src/tests/tv.test.js
// TV/Streaming functionality tests
import { describe, it, expect } from "@jest/globals";

describe("TV Station Service", () => {
  describe("Station Model", () => {
    it("should have required station fields", () => {
      const station = {
        _id: "station_123",
        owner: "user_123",
        name: "PowerStream Sports",
        slug: "powerstream-sports",
        category: "sports",
        isLive: false,
        isPublic: true,
        viewerCount: 0,
      };

      expect(station._id).toBeDefined();
      expect(station.owner).toBeDefined();
      expect(station.name).toBeDefined();
      expect(station.slug).toBeDefined();
    });

    it("should generate slug from name", () => {
      const generateSlug = (name) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      };

      expect(generateSlug("PowerStream Sports")).toBe("powerstream-sports");
      expect(generateSlug("My Cool Station!")).toBe("my-cool-station");
      expect(generateSlug("  Spaces  ")).toBe("spaces");
      expect(generateSlug("Numbers123")).toBe("numbers123");
    });
  });

  describe("Station Categories", () => {
    const CATEGORIES = [
      "music",
      "sports",
      "news",
      "entertainment",
      "religious",
      "kids",
      "movies",
      "documentary",
      "lifestyle",
      "gaming",
      "education",
    ];

    it("should have valid categories", () => {
      expect(CATEGORIES).toContain("music");
      expect(CATEGORIES).toContain("sports");
      expect(CATEGORIES).toContain("news");
    });

    it("should filter stations by category", () => {
      const stations = [
        { _id: "1", category: "music" },
        { _id: "2", category: "sports" },
        { _id: "3", category: "music" },
        { _id: "4", category: "news" },
      ];

      const musicStations = stations.filter(s => s.category === "music");
      expect(musicStations).toHaveLength(2);
    });
  });

  describe("Live Status", () => {
    it("should update live status correctly", () => {
      const station = {
        isLive: false,
        status: "ready",
        viewerCount: 0,
      };

      // Go live
      const goLive = (s) => ({
        ...s,
        isLive: true,
        status: "live",
      });

      const liveStation = goLive(station);
      expect(liveStation.isLive).toBe(true);
      expect(liveStation.status).toBe("live");

      // Go offline
      const goOffline = (s) => ({
        ...s,
        isLive: false,
        status: "offline",
        viewerCount: 0,
      });

      const offlineStation = goOffline(liveStation);
      expect(offlineStation.isLive).toBe(false);
      expect(offlineStation.status).toBe("offline");
      expect(offlineStation.viewerCount).toBe(0);
    });

    it("should filter live stations", () => {
      const stations = [
        { _id: "1", isLive: true, isPublic: true },
        { _id: "2", isLive: false, isPublic: true },
        { _id: "3", isLive: true, isPublic: true },
        { _id: "4", isLive: true, isPublic: false },
      ];

      const livePublicStations = stations.filter(
        s => s.isLive && s.isPublic
      );
      expect(livePublicStations).toHaveLength(2);
    });
  });

  describe("Viewer Count", () => {
    it("should track viewer count", () => {
      const station = {
        viewerCount: 100,
        peakViewers: 150,
        totalViews: 1000,
      };

      const updateViewers = (s, count) => ({
        ...s,
        viewerCount: count,
        totalViews: s.totalViews + 1,
        peakViewers: Math.max(s.peakViewers, count),
      });

      const updated = updateViewers(station, 200);
      expect(updated.viewerCount).toBe(200);
      expect(updated.peakViewers).toBe(200); // New peak
      expect(updated.totalViews).toBe(1001);
    });

    it("should sort stations by viewer count", () => {
      const stations = [
        { _id: "1", viewerCount: 100 },
        { _id: "2", viewerCount: 500 },
        { _id: "3", viewerCount: 200 },
      ];

      const sorted = [...stations].sort((a, b) => b.viewerCount - a.viewerCount);
      
      expect(sorted[0]._id).toBe("2");
      expect(sorted[1]._id).toBe("3");
      expect(sorted[2]._id).toBe("1");
    });
  });

  describe("Stream Session", () => {
    it("should create stream session", () => {
      const session = {
        _id: "session_123",
        userId: "user_123",
        stationId: "station_123",
        streamKey: "sk_abc123",
        status: "pending",
        startedAt: null,
        endedAt: null,
        duration: 0,
      };

      expect(session.status).toBe("pending");
      expect(session.startedAt).toBeNull();
    });

    it("should start stream session", () => {
      const startSession = (session) => ({
        ...session,
        status: "live",
        startedAt: new Date(),
      });

      const session = { status: "pending", startedAt: null };
      const started = startSession(session);

      expect(started.status).toBe("live");
      expect(started.startedAt).toBeInstanceOf(Date);
    });

    it("should calculate session duration", () => {
      const startedAt = new Date("2024-01-01T10:00:00Z");
      const endedAt = new Date("2024-01-01T11:30:00Z");
      
      const durationMs = endedAt - startedAt;
      const durationSeconds = Math.floor(durationMs / 1000);
      
      // 1.5 hours = 5400 seconds
      expect(durationSeconds).toBe(5400);
    });
  });

  describe("Network Affiliation", () => {
    const NETWORKS = [
      "Southern Power Syndicate",
      "PowerStream Network",
      "Independent",
    ];

    it("should have valid networks", () => {
      expect(NETWORKS).toContain("Southern Power Syndicate");
      expect(NETWORKS).toContain("Independent");
    });

    it("should filter by network", () => {
      const stations = [
        { _id: "1", network: "Southern Power Syndicate" },
        { _id: "2", network: "Independent" },
        { _id: "3", network: "Southern Power Syndicate" },
      ];

      const spsStations = stations.filter(
        s => s.network === "Southern Power Syndicate"
      );
      expect(spsStations).toHaveLength(2);
    });
  });
});

describe("TV Guide", () => {
  it("should generate TV guide for a date", () => {
    const schedule = [
      { stationId: "1", title: "Morning Show", startTime: "06:00", endTime: "09:00" },
      { stationId: "1", title: "News", startTime: "09:00", endTime: "10:00" },
      { stationId: "2", title: "Sports Center", startTime: "06:00", endTime: "08:00" },
    ];

    const getGuideForStation = (stationId) => 
      schedule
        .filter(s => s.stationId === stationId)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const station1Guide = getGuideForStation("1");
    expect(station1Guide).toHaveLength(2);
    expect(station1Guide[0].title).toBe("Morning Show");
  });

  it("should find current show", () => {
    const currentTime = "07:30";
    const schedule = [
      { title: "Morning Show", startTime: "06:00", endTime: "09:00" },
      { title: "News", startTime: "09:00", endTime: "10:00" },
    ];

    const isShowNow = (show, time) => 
      time >= show.startTime && time < show.endTime;

    const currentShow = schedule.find(s => isShowNow(s, currentTime));
    expect(currentShow.title).toBe("Morning Show");
  });
});

