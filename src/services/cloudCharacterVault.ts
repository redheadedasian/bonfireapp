import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { CharacterState } from '../types';
import { CloudCharacterMetadata } from '../types/auth';

const CHARACTERS_COLLECTION = 'bonfire_characters';

export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface StoredCloudCharacter {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  class: string;
  level: number;
  species: string;
  portraitUrl?: string;
  isArchived: boolean;
  dmShareCode: string;
  isSharedWithParty: boolean;
  characterData: CharacterState;
  updatedAt: number;
  createdAt: number;
}

export async function saveCharacterToCloud(
  userId: string, 
  character: CharacterState, 
  existingId?: string,
  ownerName?: string
): Promise<string> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error('Cloud database is not configured. Saved to local storage.');
  }

  const charId = existingId || 'char_' + Math.random().toString(36).substring(2, 11);
  const docRef = doc(db, CHARACTERS_COLLECTION, charId);
  
  // Check if existing doc has a share code
  let shareCode = generateShareCode();
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data() as StoredCloudCharacter;
      if (data.dmShareCode) {
        shareCode = data.dmShareCode;
      }
    }
  } catch (err) {
    // Continue with new code
  }

  const payload: StoredCloudCharacter = {
    id: charId,
    ownerId: userId,
    ownerName: ownerName || 'Hero',
    name: character.name,
    class: character.class,
    level: character.level,
    species: character.species || 'Adventurer',
    portraitUrl: character.portraitUrl || '',
    isArchived: false,
    dmShareCode: shareCode,
    isSharedWithParty: true,
    characterData: character,
    updatedAt: Date.now(),
    createdAt: Date.now()
  };

  await setDoc(docRef, payload, { merge: true });
  return charId;
}

export async function getUserCharacters(userId: string): Promise<StoredCloudCharacter[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];

  try {
    const q = query(
      collection(db, CHARACTERS_COLLECTION),
      where('ownerId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: StoredCloudCharacter[] = [];
    snap.forEach((d) => {
      list.push(d.data() as StoredCloudCharacter);
    });
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('[Bonfire Cloud] Failed to fetch user characters:', err);
    return [];
  }
}

export async function getCharacterByShareCode(code: string): Promise<StoredCloudCharacter | null> {
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const cleanCode = code.trim().toUpperCase();
    const q = query(
      collection(db, CHARACTERS_COLLECTION),
      where('dmShareCode', '==', cleanCode)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as StoredCloudCharacter;
  } catch (err) {
    console.error('[Bonfire Cloud] Error finding character by share code:', err);
    return null;
  }
}

export async function archiveCloudCharacter(charId: string, isArchived: boolean): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) return;
  const docRef = doc(db, CHARACTERS_COLLECTION, charId);
  await setDoc(docRef, { isArchived, updatedAt: Date.now() }, { merge: true });
}

export async function deleteCloudCharacter(charId: string): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) return;
  const docRef = doc(db, CHARACTERS_COLLECTION, charId);
  await deleteDoc(docRef);
}

export function subscribeToCharacterUpdates(
  charId: string, 
  onUpdate: (character: StoredCloudCharacter | null) => void
): () => void {
  const db = getFirebaseFirestore();
  if (!db) {
    onUpdate(null);
    return () => {};
  }
  const docRef = doc(db, CHARACTERS_COLLECTION, charId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as StoredCloudCharacter);
    } else {
      onUpdate(null);
    }
  }, (err) => {
    console.error('[Bonfire Cloud] Character subscription error:', err);
  });
}
