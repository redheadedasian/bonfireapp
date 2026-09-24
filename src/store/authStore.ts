import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BonfireUser, CloudSyncStatus, FirebaseConfigCustom } from '../types/auth';
import { 
  getEffectiveFirebaseConfig, 
  saveCustomFirebaseConfig, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  subscribeToAuthChanges,
  isFirebaseConfigured
} from '../services/firebase';
import { 
  saveCharacterToCloud, 
  getUserCharacters, 
  archiveCloudCharacter, 
  deleteCloudCharacter, 
  StoredCloudCharacter 
} from '../services/cloudCharacterVault';
import { CharacterState } from '../types';

interface AuthState {
  user: BonfireUser | null;
  isAuthenticated: boolean;
  isFirebaseReady: boolean;
  syncStatus: CloudSyncStatus;
  userCharacters: StoredCloudCharacter[];
  activeCloudCharacterId: string | null;
  lastSyncedAt: number | null;
  errorMessage: string | null;

  // Actions
  initAuth: () => void;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  setGuestUser: () => void;
  setDemoUser: (role: 'dm' | 'player') => void;
  saveCustomConfig: (config: FirebaseConfigCustom | null) => void;
  
  // Cloud Vault Actions
  syncCurrentCharacterToCloud: (character: CharacterState) => Promise<string | null>;
  fetchUserCharacters: () => Promise<void>;
  archiveCharacter: (charId: string, isArchived: boolean) => Promise<void>;
  deleteCharacterFromCloud: (charId: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isFirebaseReady: isFirebaseConfigured(),
      syncStatus: 'idle',
      userCharacters: [],
      activeCloudCharacterId: null,
      lastSyncedAt: null,
      errorMessage: null,

      initAuth: () => {
        set({ isFirebaseReady: isFirebaseConfigured() });
        subscribeToAuthChanges((user) => {
          if (user) {
            set({ user, isAuthenticated: true, syncStatus: 'synced' });
            get().fetchUserCharacters();
          } else {
            // Keep local guest user if not explicitly logged out
            if (get().user?.isAnonymous) {
              set({ isAuthenticated: true });
            } else {
              set({ user: null, isAuthenticated: false, syncStatus: 'idle' });
            }
          }
        });
      },

      setGuestUser: () => {
        const guest: BonfireUser = {
          uid: 'guest_' + Math.random().toString(36).substring(2, 9),
          email: null,
          displayName: 'Wandering Adventurer (Local)',
          photoURL: null,
          isAnonymous: true
        };
        set({ user: guest, isAuthenticated: true, syncStatus: 'offline' });
      },

      setDemoUser: (role: 'dm' | 'player') => {
        if (role === 'dm') {
          const dmUser: BonfireUser = {
            uid: 'dm_user_001',
            email: 'master.eldritch@bonfire.realm',
            displayName: 'Master Eldritch (Dungeon Master)',
            photoURL: null,
            isAnonymous: false
          };
          set({ user: dmUser, isAuthenticated: true, syncStatus: 'synced' });
        } else {
          const playerUser: BonfireUser = {
            uid: 'player_user_001',
            email: 'thorin.preston@bonfire.realm',
            displayName: 'Preston (Thorin Ironforge)',
            photoURL: null,
            isAnonymous: false
          };
          set({ user: playerUser, isAuthenticated: true, syncStatus: 'synced' });
        }
      },

      saveCustomConfig: (config) => {
        saveCustomFirebaseConfig(config);
        set({ isFirebaseReady: Boolean(config) });
      },

      signInGoogle: async () => {
        try {
          set({ syncStatus: 'syncing', errorMessage: null });
          const user = await loginWithGoogle();
          set({ user, isAuthenticated: true, syncStatus: 'synced' });
          await get().fetchUserCharacters();
        } catch (err: any) {
          set({ errorMessage: err.message || 'Google sign-in failed', syncStatus: 'error' });
          throw err;
        }
      },

      signInEmail: async (email, pass) => {
        try {
          set({ syncStatus: 'syncing', errorMessage: null });
          const user = await loginWithEmail(email, pass);
          set({ user, isAuthenticated: true, syncStatus: 'synced' });
          await get().fetchUserCharacters();
        } catch (err: any) {
          set({ errorMessage: err.message || 'Email sign-in failed', syncStatus: 'error' });
          throw err;
        }
      },

      signUpEmail: async (email, pass) => {
        try {
          set({ syncStatus: 'syncing', errorMessage: null });
          const user = await registerWithEmail(email, pass);
          set({ user, isAuthenticated: true, syncStatus: 'synced' });
          await get().fetchUserCharacters();
        } catch (err: any) {
          set({ errorMessage: err.message || 'Sign-up failed', syncStatus: 'error' });
          throw err;
        }
      },

      signOut: async () => {
        try {
          await logoutUser();
          set({ 
            user: null, 
            isAuthenticated: false, 
            userCharacters: [], 
            activeCloudCharacterId: null,
            syncStatus: 'idle' 
          });
        } catch (err: any) {
          console.error('Sign out error:', err);
        }
      },

      syncCurrentCharacterToCloud: async (character: CharacterState) => {
        const user = get().user;
        if (!user || user.isAnonymous) {
          set({ syncStatus: 'offline' });
          return null;
        }

        try {
          set({ syncStatus: 'syncing' });
          const existingId = get().activeCloudCharacterId || undefined;
          const charId = await saveCharacterToCloud(
            user.uid, 
            character, 
            existingId, 
            user.displayName || 'Hero'
          );
          set({ 
            activeCloudCharacterId: charId, 
            syncStatus: 'synced', 
            lastSyncedAt: Date.now() 
          });
          await get().fetchUserCharacters();
          return charId;
        } catch (err: any) {
          console.error('Cloud sync error:', err);
          set({ syncStatus: 'error', errorMessage: err.message || 'Sync failed' });
          return null;
        }
      },

      fetchUserCharacters: async () => {
        const user = get().user;
        if (!user || user.isAnonymous) return;
        try {
          const chars = await getUserCharacters(user.uid);
          set({ userCharacters: chars });
        } catch (err: any) {
          console.error('Fetch cloud characters error:', err);
        }
      },

      archiveCharacter: async (charId: string, isArchived: boolean) => {
        try {
          await archiveCloudCharacter(charId, isArchived);
          await get().fetchUserCharacters();
        } catch (err) {
          console.error('Archive error:', err);
        }
      },

      deleteCharacterFromCloud: async (charId: string) => {
        try {
          await deleteCloudCharacter(charId);
          if (get().activeCloudCharacterId === charId) {
            set({ activeCloudCharacterId: null });
          }
          await get().fetchUserCharacters();
        } catch (err) {
          console.error('Delete character error:', err);
        }
      },

      clearError: () => set({ errorMessage: null })
    }),
    {
      name: 'bonfire-auth-storage-v1',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeCloudCharacterId: state.activeCloudCharacterId,
        lastSyncedAt: state.lastSyncedAt
      })
    }
  )
);
