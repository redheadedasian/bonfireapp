// Authentication & Cloud Sync Types for Bonfire D&D 5e

export interface BonfireUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  providerId?: string;
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface CloudCharacterMetadata {
  id: string;
  name: string;
  class: string;
  level: number;
  species: string;
  portraitUrl?: string;
  ownerId: string;
  ownerName?: string;
  isArchived: boolean;
  dmShareCode: string;
  isSharedWithParty: boolean;
  updatedAt: number;
  createdAt: number;
}

export interface FirebaseConfigCustom {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
