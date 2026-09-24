# Project Roadmap & TODOs

This document tracks planned features, completed milestones, and upcoming architectural capabilities for the Bonfire D&D 5e companion application.

---

## Completed Milestones

### 1. Session Chronicler & Audio Analyzer (Completed)
* **Goal**: Full-featured chronicler hub for recording history, audio session uploads, transcription, and AI-driven campaign analysis powered by the Gemini API.
* **Accomplished Features**:
  - **Two-Column Chronicler Hub**: 30% Left Archive Rail with search, filters, and status badges; 70% Right Interactive Stage with custom dark-gold audio player.
  - **Interactive Audio Synchronization**: Synchronized audio scrubber with -15s/+15s skips, variable playback speeds (0.75x - 2x), and instant jump-to-timestamp from both the story timeline and raw transcript lines.
  - **Perspective Switcher**: Switch between "Entire Campaign / Party Overview" and personalized hero spotlights (e.g., Thorin Ironforge) with clutch rolls, spellcraft performance, and character dialogue highlights.
  - **Structured Campaign Breakdown**: Executive narrative summary, chronological story timeline, NPC lore accordions, combat logs with casualties, loot & spoils ledger, and unresolved quest objectives.
  - **File Ingestion & Gemini Processing**: Drag-and-drop file upload supporting MP3, M4A, WAV, WebM, and OGG formats with Gemini multi-modal schema parsing.
  - **Local Persistence via IndexedDB**: Persistent storage for audio metadata, blobs, and structured chronicler reports across page refreshes and offline sessions.
  - **Strict Design Standards**: Free of emojis; styled with refined dark fantasy typography and Lucide React vector icons.

---

### 2. Ability Score Graphic Frame Integration (Completed)
* **Goal**: Overlay live ability scores (STR, DEX, CON, INT, WIS, CHA), modifiers, and labels directly on top of the custom fantasy tablet frame asset.
* **Accomplished Features**:
  - **Asset Integration**: Downloaded and optimized the vector/PNG frame asset in `/public/ability_frame.png` and `/public/ability_frame.svg`.
  - **Precision Layer Coordinates**: Formatted the top label zone (y ≈ 13.2%), central hero modifier display (y ≈ 41.5%), and lower score badge (y ≈ 82%) for alignment.
  - **Interactive D20 Rolling**: Clicking any ability tablet triggers an immediate roll request via the 3D dice system.
  - **Edit Mode Support**: Inline numeric score editor in edit mode with instant modifier recalculations.

---

## Upcoming Milestones

### 3. User Authentication & Cloud Character Vault (Planned)
* **Goal**: Enable players to log in, keep their characters safely saved in the cloud, and share characters with friends across devices.
* **Key Features**:
  - **Authentication**: Sign up and login via Firebase Authentication (Email/Password or Google Sign-In).
  - **Cloud Character Vault**: Persistent cloud database (Cloud Firestore) storing user characters, inventories, spellbooks, and custom notes.
  - **Cross-Device Sync**: Real-time synchronization allowing seamless transitions between PC, laptop, tablet, and mobile during live sessions.
  - **Multi-Character Management**: Roster view to create, duplicate, switch between, and archive multiple characters.
  - **Privacy & Permissions**: Secure rules ensuring players only modify their own characters, with optional read-only party sharing for the Dungeon Master.

---

### 3. Visual UI Atlas Integration (Awaiting Uploaded Assets)
* **Goal**: Overlay application values directly on top of sliced graphic assets from `bonfire assets 3.png` once exported into `/public`.
* **Key Components**:
  - HP Bar & Health Plate with heart medallion.
  - Sub-Vitals (Initiative, Speed, Hit Dice, Death Saves, Heroic Inspiration).
  - AC Shield and Medallion Frames.
  - Ability Score Tablets (STR, DEX, CON, INT, WIS, CHA).
  - Item Slots (Empty, Filled, Magic, Selected) & Section Dividers.
