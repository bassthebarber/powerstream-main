// backend/src/services/brain.service.js
// Brain Mode Service - Command processing and intent recognition
import { logger } from "../config/logger.js";
import Event from "../domain/models/Event.model.js";

/**
 * Navigation destinations mapping
 */
const NAVIGATION_MAP = {
  // Main apps
  home: { route: "/", app: "main" },
  feed: { route: "/feed", app: "feed" },
  powerfeed: { route: "/feed", app: "feed" },
  gram: { route: "/gram", app: "gram" },
  powergram: { route: "/gram", app: "gram" },
  reel: { route: "/reel", app: "reel" },
  reels: { route: "/reel", app: "reel" },
  powerreel: { route: "/reel", app: "reel" },
  chat: { route: "/line", app: "chat" },
  powerline: { route: "/line", app: "chat" },
  messages: { route: "/line", app: "chat" },
  
  // TV
  tv: { route: "/tv", app: "tv" },
  television: { route: "/tv", app: "tv" },
  "power tv": { route: "/tv", app: "tv" },
  stations: { route: "/tv/stations", app: "tv" },
  live: { route: "/tv/live", app: "tv" },
  
  // Studio
  studio: { route: "/studio", app: "studio" },
  "ai studio": { route: "/studio", app: "studio" },
  record: { route: "/studio/record", app: "studio" },
  mix: { route: "/studio/mix", app: "studio" },
  beats: { route: "/studio/beats", app: "studio" },
  "beat store": { route: "/studio/beats", app: "studio" },
  
  // User
  profile: { route: "/profile", app: "main" },
  settings: { route: "/settings", app: "main" },
  coins: { route: "/coins", app: "coins" },
  wallet: { route: "/coins", app: "coins" },
};

/**
 * Available intents with descriptions
 */
const AVAILABLE_INTENTS = [
  // Navigation
  { intent: "navigate", description: "Go to a page or app", examples: ["go to feed", "open studio", "show me tv"] },
  
  // Content
  { intent: "create_post", description: "Create a new post", examples: ["new post", "create a post"] },
  { intent: "upload_media", description: "Upload a photo or video", examples: ["upload a photo", "share a video"] },
  { intent: "go_live", description: "Start a live stream", examples: ["go live", "start streaming"] },
  
  // Social
  { intent: "send_message", description: "Send a message", examples: ["message [name]", "dm [name]"] },
  { intent: "follow_user", description: "Follow a user", examples: ["follow [name]"] },
  
  // Studio
  { intent: "start_recording", description: "Start recording", examples: ["start recording", "record now"] },
  { intent: "generate_beat", description: "Generate a beat", examples: ["make a beat", "generate a trap beat"] },
  
  // TV
  { intent: "create_station", description: "Create a TV station", examples: ["create a station", "new channel"] },
  
  // Coins
  { intent: "check_balance", description: "Check coin balance", examples: ["check my balance", "how many coins"] },
  { intent: "send_tip", description: "Send a tip", examples: ["tip [amount] to [name]"] },
];

/**
 * Brain Mode Service
 */
const brainService = {
  /**
   * Process a voice/text command
   */
  async processCommand(userId, command, context = {}) {
    const normalizedCommand = command.toLowerCase().trim();
    
    logger.debug(`Brain processing command: "${normalizedCommand}" for user ${userId}`);
    
    // Try to match intent
    const intent = this.matchIntent(normalizedCommand);
    
    if (!intent) {
      return {
        success: false,
        intent: "unknown",
        message: "I didn't understand that command. Try 'help' for available commands.",
        suggestions: ["go to feed", "open studio", "check my balance"],
      };
    }
    
    // Execute the intent
    const result = await this.executeIntent(userId, intent, normalizedCommand, context);
    
    return {
      success: true,
      intent: intent.name,
      ...result,
    };
  },
  
  /**
   * Match command to an intent
   */
  matchIntent(command) {
    // Navigation patterns
    const navPatterns = [
      /^(go to|open|show me|navigate to|take me to)\s+(.+)/i,
      /^(.+)\s+(page|screen|app)$/i,
    ];
    
    for (const pattern of navPatterns) {
      const match = command.match(pattern);
      if (match) {
        return { name: "navigate", target: match[2] || match[1] };
      }
    }
    
    // Content creation patterns
    if (/^(create|new|make)\s+(a\s+)?post/i.test(command)) {
      return { name: "create_post" };
    }
    
    if (/^(upload|share)\s+(a\s+)?(photo|video|image)/i.test(command)) {
      return { name: "upload_media" };
    }
    
    if (/^(go live|start streaming|start broadcast)/i.test(command)) {
      return { name: "go_live" };
    }
    
    // Social patterns
    const messageMatch = command.match(/^(message|dm|text)\s+(.+)/i);
    if (messageMatch) {
      return { name: "send_message", target: messageMatch[2] };
    }
    
    const followMatch = command.match(/^follow\s+(.+)/i);
    if (followMatch) {
      return { name: "follow_user", target: followMatch[1] };
    }
    
    // Studio patterns
    if (/^(start recording|record now|begin recording)/i.test(command)) {
      return { name: "start_recording" };
    }
    
    const beatMatch = command.match(/^(make|generate|create)\s+(a\s+)?(.+\s+)?beat/i);
    if (beatMatch) {
      return { name: "generate_beat", style: beatMatch[3]?.trim() };
    }
    
    // Coins patterns
    if (/^(check|show|what.s)\s+(my\s+)?balance/i.test(command)) {
      return { name: "check_balance" };
    }
    
    const tipMatch = command.match(/^tip\s+(\d+)\s+(to|coins to)\s+(.+)/i);
    if (tipMatch) {
      return { name: "send_tip", amount: parseInt(tipMatch[1]), target: tipMatch[3] };
    }
    
    // Help
    if (/^(help|what can you do|commands)/i.test(command)) {
      return { name: "help" };
    }
    
    return null;
  },
  
  /**
   * Execute a matched intent
   */
  async executeIntent(userId, intent, command, context) {
    switch (intent.name) {
      case "navigate":
        return this.handleNavigation(intent.target);
        
      case "create_post":
        return {
          action: "open_modal",
          modal: "create_post",
          message: "Opening post composer...",
        };
        
      case "upload_media":
        return {
          action: "open_modal",
          modal: "upload_media",
          message: "Ready to upload media...",
        };
        
      case "go_live":
        return {
          action: "open_modal",
          modal: "go_live",
          message: "Preparing live stream...",
        };
        
      case "send_message":
        return {
          action: "navigate_with_params",
          route: "/line",
          params: { recipient: intent.target },
          message: `Opening chat with ${intent.target}...`,
        };
        
      case "follow_user":
        return {
          action: "api_call",
          endpoint: "/api/users/follow",
          method: "POST",
          body: { username: intent.target },
          message: `Following ${intent.target}...`,
        };
        
      case "start_recording":
        return {
          action: "navigate",
          route: "/studio/record",
          autoStart: true,
          message: "Opening recording studio...",
        };
        
      case "generate_beat":
        return {
          action: "navigate_with_params",
          route: "/studio/beats",
          params: { generate: true, style: intent.style },
          message: intent.style 
            ? `Generating ${intent.style} beat...`
            : "Opening beat generator...",
        };
        
      case "check_balance":
        return {
          action: "api_call",
          endpoint: "/api/coins/balance",
          method: "GET",
          displayAs: "notification",
          message: "Checking your balance...",
        };
        
      case "send_tip":
        return {
          action: "api_call",
          endpoint: "/api/coins/tip",
          method: "POST",
          body: { amount: intent.amount, username: intent.target },
          message: `Sending ${intent.amount} coins to ${intent.target}...`,
        };
        
      case "help":
        return {
          action: "show_help",
          intents: AVAILABLE_INTENTS,
          message: "Here's what I can do...",
        };
        
      default:
        return {
          action: "none",
          message: "I understood but can't do that yet.",
        };
    }
  },
  
  /**
   * Handle navigation command
   */
  handleNavigation(target) {
    const normalized = target.toLowerCase().trim();
    const destination = NAVIGATION_MAP[normalized];
    
    if (destination) {
      return {
        action: "navigate",
        route: destination.route,
        app: destination.app,
        message: `Going to ${target}...`,
      };
    }
    
    // Fuzzy match
    const keys = Object.keys(NAVIGATION_MAP);
    const fuzzyMatch = keys.find(k => 
      k.includes(normalized) || normalized.includes(k)
    );
    
    if (fuzzyMatch) {
      const dest = NAVIGATION_MAP[fuzzyMatch];
      return {
        action: "navigate",
        route: dest.route,
        app: dest.app,
        message: `Going to ${fuzzyMatch}...`,
      };
    }
    
    return {
      action: "search",
      query: target,
      message: `Searching for "${target}"...`,
    };
  },
  
  /**
   * Process navigation command directly
   */
  async processNavigation(command) {
    const normalized = command.toLowerCase().trim();
    
    // Try direct match
    const destination = NAVIGATION_MAP[normalized];
    if (destination) {
      return {
        destination: destination.route,
        app: destination.app,
        recognized: true,
      };
    }
    
    // Try to extract destination from command
    const navPatterns = [
      /^(go to|open|show|navigate to)\s+(.+)/i,
    ];
    
    for (const pattern of navPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        const target = match[2].trim();
        const dest = NAVIGATION_MAP[target];
        if (dest) {
          return {
            destination: dest.route,
            app: dest.app,
            recognized: true,
          };
        }
      }
    }
    
    return {
      destination: null,
      recognized: false,
      suggestions: Object.keys(NAVIGATION_MAP).slice(0, 10),
    };
  },
  
  /**
   * Execute an automation action
   */
  async executeAction(userId, action, params = {}) {
    logger.debug(`Brain executing action: ${action} for user ${userId}`);
    
    // Actions are stubs for now - can be expanded
    const actions = {
      create_post: async () => ({
        success: true,
        modal: "create_post",
        prefill: params,
      }),
      
      start_stream: async () => ({
        success: true,
        redirect: "/studio/live",
        autoStart: true,
      }),
      
      generate_beat: async () => ({
        success: true,
        redirect: "/studio/beats",
        params: { generate: true, ...params },
      }),
    };
    
    if (actions[action]) {
      return await actions[action]();
    }
    
    return {
      success: false,
      message: `Unknown action: ${action}`,
    };
  },
  
  /**
   * Get available intents
   */
  getAvailableIntents() {
    return AVAILABLE_INTENTS;
  },
  
  /**
   * Get command history for user
   */
  async getCommandHistory(userId, limit = 50) {
    try {
      const events = await Event.find({
        userId,
        type: { $in: ["brain_command", "brain_navigation", "brain_action"] },
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      return events.map(e => ({
        id: e._id,
        type: e.type,
        command: e.metadata?.command,
        intent: e.metadata?.intent,
        success: e.metadata?.success,
        timestamp: e.createdAt,
      }));
    } catch (err) {
      logger.error("Failed to get command history:", err.message);
      return [];
    }
  },
  
  /**
   * Submit feedback on a command
   */
  async submitFeedback(userId, commandId, feedback) {
    logger.info(`Brain feedback from user ${userId} on command ${commandId}:`, feedback);
    // Store feedback for ML training (future)
    return true;
  },
};

export default brainService;




