# Bonfire D&D 5e HUD — Master Technical Specification

## 1. Visual Language & Design System
- **Core Aesthetic**: Dark-fantasy, CRPG-inspired UI (aged bronze, obsidian/slate surfaces, amber and molten gold highlights, ruby and sapphire accents).
- **Layering Architecture (9-Slice Cavities)**:
  - **Layer 0 (Background)**: Dark chamber base (`#0d0b12` to `#16121f`).
  - **Layer 1 (Dynamic Content)**: Pure CSS progress bars, state fills, and interactive canvas elements.
  - **Layer 2 (Frame Vector/PNG)**: Hollow asset overlays set to `absolute inset-0 pointer-events-none z-10`.
  - **Layer 3 (Foreground)**: Crisp display typography, numeric readouts, and interactive touch points at `z-20`.
- **Statefulness Principle**: At rest, components are dark and archival. Interaction (hover, selection, combat triggers) brings them alive with molten gold or arcane glows.
- **Hierarchy Tiers**:
  - **Tier 1 (Primary)**: HP, XP/Level, AC (full ornamentation and brightness).
  - **Tier 2 (Secondary)**: Initiative, Speed, Hit Dice, Death Saves, Inspiration (20–30% reduced contrast/brightness at rest).

## 2. Infrastructure & Data Pipelines
- **Authentication**: Firebase Auth (Google Sign-In & Email/Password).
- **Database & Real-time Sync**: Cloud Firestore with real-time snapshot listeners for instant DM-to-player updates.
- **Session Audio Storage**:
  - Direct streaming from external cloud folders (Google Drive / public audio URLs).
  - Client-side IndexedDB caching for offline access, waveform data, and session playback.
- **Dice Engine & Fallbacks**:
  - `@3d-dice/dice-box` / Three.js engine wrapped in strict `try/catch` handlers.
  - Silent mathematical fallback on WebGL failure; root `<ErrorBoundary>` to safeguard the view tree.

## 3. Core Modules
- **Character Overview / HUD**: Dynamic HP thresholds (Green -> Yellow -> Red), Skyrim-style trailing damage ghost bar, semantic XP controls (`[ DEDUCT ] [ Amount ] [ AWARD ]`), CRPG inventory, weapons, and spellbook rows.
- **Campaign Hub**: Active and archived chronicles, 6-character campaign join codes, vault-to-campaign character imports, shared party loot ledger, and quest logs.
- **DM Command View**:
  - Live party vitals telemetry (HP, AC, Spell Slots, Passive Perception, active conditions).
  - Combat encounter runner with drag-and-drop initiative queue and inline HP modification.
  - Complete 5e SRD monster compendium + account-level DM Bestiary Vault for custom and Gemini-generated creatures.
  - Secret DM roll console and private note ledger.
- **Session Chronicler**: Multi-modal Gemini audio transcription analyzer, summary generator, loot ledger, combat report, and party perspective switcher.

## 4. Verification & Testing Standards
- All code must pass `bun run lint && bun run build` with zero TypeScript errors.
- Unit and smoke tests required for math engines (XP progression, HP adjustments, dice roll parsers).

### Visual Asset Invariant & Protection Rules
- **Frozen Assets (`/public/assets/...` & `src/config/assets.ts`)**: Never replace, overwrite, or delete existing image frames, heart medallions, XP crests, or AC shield assets.
- **Preserve Verified Cutout Logic**: Do not modify coordinate mappings, aspect ratios, or cavity containers in `HitPointsBar.tsx`, `ExperienceBar.tsx`, or `VitalsStrip.tsx` unless specifically instructed.
- **Extension Only**: All new views (Campaign Hub, DM View, Vaults) must consume existing textures/frames from `assets.ts` or use layered CSS shaders that match them, without altering legacy HUD components.
