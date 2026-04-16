import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  arrayRemove
} from "firebase/firestore";

export interface Conversation {
  id: string;
  participants: string[]; // array of UIDs [uid1, uid2]
  lastMessage: string;
  lastMessageAt: any;
  updatedAt: any;
  unreadBy?: string[];
}

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  createdAt: any;
}

/**
 * Find an existing conversation between two users or create a new one.
 */
export async function getOrCreateConversation(currentUserUid: string, targetUid: string): Promise<string> {
  const conversationsRef = collection(db, "conversations");
  
  // First query where currentUser is essentially in participants
  const q = query(conversationsRef, where("participants", "array-contains", currentUserUid));
  const snap = await getDocs(q);
  
  let existingId: string | null = null;

  snap.forEach((d) => {
    const data = d.data() as Conversation;
    // Check if the other user is also in this specific conversation
    if (data.participants.includes(targetUid) && data.participants.length === 2) {
      existingId = d.id;
    }
  });

  if (existingId) return existingId;

  // Create new conversation
  const newRef = doc(conversationsRef);
  await setDoc(newRef, {
    participants: [currentUserUid, targetUid],
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadBy: []
  });

  return newRef.id;
}

/**
 * Send a message inside a conversation
 */
export async function sendMessage(conversationId: string, text: string, senderId: string) {
  if (!text.trim()) return;

  const messagesRef = collection(db, "conversations", conversationId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp()
  });

  // Update the parent conversation details
  const convRef = doc(db, "conversations", conversationId);
  const convSnap = await getDoc(convRef);
  let unreadBy: string[] = [];
  if (convSnap.exists()) {
    const data = convSnap.data() as Conversation;
    unreadBy = data.participants.filter(uid => uid !== senderId);
  }

  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadBy
  });
}

/**
 * Mark a conversation as read by removing the user's uid from the unreadBy array
 */
export async function markAsRead(conversationId: string, uid: string) {
  const convRef = doc(db, "conversations", conversationId);
  await updateDoc(convRef, {
    unreadBy: arrayRemove(uid)
  });
}

/**
 * Get Display Name of participant by their UID
 */
export async function getChatParticipantName(uid: string) {
  const pQ = query(collection(db, "personalProfiles"), where("uid", "==", uid));
  const pSnap = await getDocs(pQ);
  if (!pSnap.empty) {
    return pSnap.docs[0].data().displayName;
  }

  const tQ = query(collection(db, "teamProfiles"), where("uid", "==", uid));
  const tSnap = await getDocs(tQ);
  if (!tSnap.empty) {
    return tSnap.docs[0].data().teamName;
  }

  return "Gizli veya Silinmiş Hesap";
}
