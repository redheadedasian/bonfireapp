import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Campaign } from '../types/campaign';

const CAMPAIGNS_COLLECTION = 'bonfire_campaigns';

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatBannerImageUrl(url?: string): string {
  if (!url || !url.trim()) {
    // High-res fantasy landscape matching the user's mockup
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80';
  }
  const trimmed = url.trim();
  
  // Google Drive link handling
  const gDriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
  }

  return trimmed;
}

export async function saveCampaignToCloud(campaign: Campaign): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    // Graceful offline fallback
    return;
  }

  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    await setDoc(docRef, {
      ...campaign,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn('[Bonfire Cloud] Failed to sync campaign to Firestore:', err);
  }
}

export async function fetchUserCampaignsFromCloud(userId: string): Promise<Campaign[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];

  try {
    const q = query(
      collection(db, CAMPAIGNS_COLLECTION),
      where('dmUserId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: Campaign[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Campaign);
    });
    return list;
  } catch (err) {
    console.error('[Bonfire Cloud] Failed to fetch campaigns:', err);
    return [];
  }
}
