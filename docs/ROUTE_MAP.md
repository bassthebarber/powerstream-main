# PowerStream Route Map

## Last Updated: December 2024

This document maps all API routes for the PowerStream platform.

---

## 🔵 MAIN BACKEND (Port 5001)

**Entry Point**: `backend/server.js` → `backend/src/app.js`  
**Route Registration**: `backend/src/loaders/MasterCircuitBoard.js`

### Health Endpoints
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/health` | GET | Health check | ✅ Mounted |
| `/health` | GET | Health check | ✅ Mounted |

### Authentication (`/api/auth`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/auth/register` | POST | authController.register | ✅ Mounted |
| `/api/auth/login` | POST | authController.login | ✅ Mounted |
| `/api/auth/refresh` | POST | authController.refreshToken | ✅ Mounted |
| `/api/auth/logout` | POST | authController.logout | ✅ Mounted |
| `/api/auth/me` | GET | authController.getMe | ✅ Mounted |

### PowerFeed (`/api/powerfeed`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/powerfeed/posts` | GET | powerFeedController.getPosts | ✅ Mounted |
| `/api/powerfeed/posts` | POST | powerFeedController.createPost | ✅ Mounted |
| `/api/powerfeed/posts/:id/react` | POST | powerFeedController.reactToPost | ✅ Mounted |
| `/api/powerfeed/posts/:id/comment` | POST | powerFeedController.commentOnPost | ✅ Mounted |

### PowerGram (`/api/powergram`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/powergram` | GET | powerGramController.getGrams | ✅ Mounted |
| `/api/powergram` | POST | powerGramController.createGram | ✅ Mounted |
| `/api/powergram/:id/like` | POST | powerGramController.likeGram | ✅ Mounted |
| `/api/powergram/:id/comment` | POST | powerGramController.commentOnGram | ✅ Mounted |
| `/api/powergram/:id/comments` | GET | powerGramController.getGramComments | ✅ Mounted |

### PowerReel (`/api/powerreel`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/powerreel` | GET | powerReelController.getReels | ✅ Mounted |
| `/api/powerreel` | POST | powerReelController.createReel | ✅ Mounted |
| `/api/powerreel/:id/like` | POST | powerReelController.likeReel | ✅ Mounted |
| `/api/powerreel/:id/comment` | POST | powerReelController.commentOnReel | ✅ Mounted |
| `/api/powerreel/:id/view` | POST | powerReelController.incrementView | ✅ Mounted |
| `/api/powerreel/:id/comments` | GET | powerReelController.getReelComments | ✅ Mounted |

### PowerLine/Chat (`/api/powerline`, `/api/chat`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/powerline/conversations` | GET | ChatController.listChats | ✅ Mounted |
| `/api/powerline/conversations/:id` | GET | ChatController.getChat | ✅ Mounted |
| `/api/powerline/conversations` | POST | ChatController.createChat | ✅ Mounted |
| `/api/powerline/messages/:conversationId` | GET | chatmessageController.listMessages | ✅ Mounted |
| `/api/powerline/messages/:conversationId` | POST | chatmessageController.sendMessage | ✅ Mounted |
| `/api/chat` | GET | ChatController.listChats | ✅ Mounted |
| `/api/chat/:chatId/messages` | GET | chatmessageController.listMessages | ✅ Mounted |
| `/api/chat/:chatId/messages` | POST | chatmessageController.sendMessage | ✅ Mounted |

### Stories (`/api/stories`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/stories` | GET | storyController.listStories | ✅ Mounted |
| `/api/stories` | POST | storyController.createStory | ✅ Mounted |
| `/api/stories/:id` | GET | storyController.getStory | ✅ Mounted |

### Upload (`/api/upload`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/upload` | POST | uploadRoutes (Cloudinary) | ✅ Mounted |
| `/api/upload/health` | GET | Health check | ✅ Mounted |

### TV Stations (`/api/tv-stations`, `/api/ps-tv`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/tv-stations` | GET | tvStationController.listStations | ✅ Mounted |
| `/api/tv-stations/:id` | GET | tvStationController.getStation | ✅ Mounted |
| `/api/ps-tv/schedule` | GET | psTvController.getSchedule | ✅ Mounted |

### Users (`/api/users`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/users/me` | GET | userController.getMe | ✅ Mounted |
| `/api/users/:id` | GET | userController.getUser | ✅ Mounted |
| `/api/users/:id/follow` | POST | userController.follow | 🟡 May not exist |
| `/api/users/suggested` | GET | userController.getSuggested | 🟡 May not exist |

### Studio Sessions (via Main Backend) (`/api/studio/sessions`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/sessions` | GET | studioSessionController.list | ✅ Mounted |
| `/api/studio/sessions/:id` | GET | studioSessionController.get | ✅ Mounted |
| `/api/studio/sessions/save` | POST | studioSessionController.save | ✅ Mounted |

---

## 🟠 STUDIO BACKEND (Port 5100)

**Entry Point**: `backend/recordingStudio/RecordingStudioServer.js`

### Health Endpoints
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/studio-health` | GET | Health check | ✅ Mounted |
| `/studio-env-check` | GET | Environment check | ✅ Mounted |
| `/api/health` | GET | Health check | ✅ Mounted |
| `/health` | GET | Health check | ✅ Mounted |
| `/api/studio/health` | GET | Studio-specific health | ✅ Mounted |

### Main Studio Routes (`/api/studio`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/*` | * | studioRoutes | ✅ Mounted |

### Recording (`/api/studio/record`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/record/start` | POST | Start recording | ✅ Mounted |
| `/api/studio/record/stop` | POST | Stop recording | ✅ Mounted |
| `/api/studio/record/status` | GET | Recording status | ✅ Mounted |

### Session Management (`/api/studio/session`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/session/*` | * | studioSessionRoutes | ✅ Mounted |

### Lyrics (`/api/studio/lyrics`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/lyrics/generate` | POST | AI lyrics generation | 🟡 Needs AI key |

### Mastering (`/api/studio/master`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/master/apply` | POST | Apply mastering | ✅ Mounted |
| `/api/studio/master/presets` | GET | Get presets | ✅ Mounted |

### Mix (`/api/mix`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/mix/apply` | POST | Apply mix settings | ✅ Mounted |
| `/api/mix/ai-recipe` | POST | AI mix suggestions | 🟡 Needs AI key |

### Library (`/api/library`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/library/all` | GET | Get all items | ✅ Mounted |
| `/api/library/beats` | GET | Get beats | ✅ Mounted |
| `/api/library/recordings` | GET | Get recordings | ✅ Mounted |
| `/api/library/mixes` | GET | Get mixes | ✅ Mounted |

### Beat Store (`/api/studio/beats`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/beats` | GET | List beats | ✅ Mounted |
| `/api/studio/beats/:id` | GET | Get beat | ✅ Mounted |
| `/api/studio/beats` | POST | Create beat | ✅ Mounted |
| `/api/studio/beats/:id/purchase` | POST | Purchase beat | 🟡 Needs Stripe |

### AI Beat Generation (`/api/studio/ai`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/ai/generate` | POST | Generate beat | 🟡 Needs MusicGen |
| `/api/studio/ai/styles` | GET | Get available styles | ✅ Mounted |

### AI Mastering (`/api/studio/ai/master`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/ai/master/analyze` | POST | Analyze audio | 🟡 Needs AI key |
| `/api/studio/ai/master/apply` | POST | Apply AI mastering | 🟡 Needs AI key |

### Beat Lab (`/api/beatlab`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/beatlab/generate` | POST | Generate beat pattern | 🟡 Needs MusicGen |
| `/api/beatlab/save` | POST | Save beat | ✅ Mounted |
| `/api/beatlab/patterns` | GET | Get patterns | ✅ Mounted |

### Export (`/api/export`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/export/*` | * | uploadRoutes | ✅ Mounted |

### Royalty (`/api/royalty`, `/api/royalties`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/royalty/*` | * | royaltyRoutes | ✅ Mounted |
| `/api/royalties/*` | * | royaltyRoutes | ✅ Mounted |

### TV Export (`/api/studio/tv`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/tv/*` | * | tvExportRoutes | ✅ Mounted |

### Voice (`/api/studio/voice`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/voice/*` | * | voiceRoutes | ✅ Mounted |

### Admin Producers (`/api/studio/admin/producers`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/admin/producers/*` | * | adminProducerRoutes | ✅ Mounted |

### Live Room (`/api/studio/live-room`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/live-room/*` | * | liveRoomRoutes | 🟡 Partial |

### Studio Jobs (`/api/studio/jobs`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/jobs` | GET | List jobs | ✅ Mounted |
| `/api/studio/jobs` | POST | Create job | ✅ Mounted |
| `/api/studio/jobs/:id` | GET | Get job | ✅ Mounted |
| `/api/studio/jobs/:id/apply` | POST | Apply for job | ✅ Mounted |

### Studio Contracts (`/api/studio/contracts`)
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/studio/contracts` | GET | List contracts | ✅ Mounted |
| `/api/studio/contracts` | POST | Create contract | ✅ Mounted |
| `/api/studio/contracts/:id` | GET | Get contract | ✅ Mounted |
| `/api/studio/contracts/:id/sign` | POST | Sign contract | ✅ Mounted |

### Other Studio Routes
| Route | Method | Handler | Status |
|-------|--------|---------|--------|
| `/api/intake/*` | * | intakeRoutes | ✅ Mounted |
| `/api/payroll/*` | * | payrollRoutes | ✅ Mounted |
| `/api/employees/*` | * | employeeRoutes | ✅ Mounted |
| `/api/beats/*` | * | beatRoutes | ✅ Mounted |
| `/api/collabs/*` | * | collabRoutes | ✅ Mounted |
| `/api/samples/*` | * | sampleRoutes | ✅ Mounted |
| `/api/mixing/*` | * | mixingRoutes | ✅ Mounted |
| `/api/winners/*` | * | winnerRoutes | ✅ Mounted |
| `/api/upload/*` | * | uploadRoutes | ✅ Mounted |
| `/api/recordings/*` | * | recordingsRoutes | ✅ Mounted |
| `/api/devices/*` | * | deviceRoutes | ✅ Mounted |
| `/api/auth/*` | * | authRoutes (studio) | ✅ Mounted |

---

## 🔴 DEAD/UNMOUNTED ROUTES

Routes that are defined but not currently mounted or have issues:

| Route | Expected Location | Issue |
|-------|-------------------|-------|
| `/api/users/suggested` | Main backend | May not be implemented |
| `/api/users/:id/follow` | Main backend | May not be implemented |
| `/api/search` | Main backend | Not implemented |

---

## 📡 SOCKET.IO NAMESPACES

### Main Backend (Port 5001)
| Namespace | Events | Status |
|-----------|--------|--------|
| `/chat` | `chat:join`, `chat:leave`, `chat:message`, `chat:typing` | ✅ Working |

### Studio Backend (Port 5100)
| Namespace | Events | Status |
|-----------|--------|--------|
| Default (`/`) | `join_room`, `chat_message`, `ai_query`, `meter_update` | ✅ Working |

---

*This route map was generated from codebase analysis. Last updated: December 2024*
