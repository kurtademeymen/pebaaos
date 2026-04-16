import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { UserProfile, PersonalProfile, TeamProfile, ReferenceKey } from "@/types";

/**
 * REFERENCE KEYS
 */
export async function getReferenceKey(code: string) {
  const q = query(collection(db, "referenceKeys"), where("code", "==", code));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data() as ReferenceKey;
  return { id: snapshot.docs[0].id, ...data };
}

export async function createReferenceKey(adminUid: string, role: "admin" | "user" = "user") {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const docRef = doc(collection(db, "referenceKeys"));
  await setDoc(docRef, {
    code,
    isUsed: false,
    createdBy: adminUid,
    role,
    createdAt: serverTimestamp()
  });
  return code;
}

export async function markKeyAsUsed(keyId: string, usedByUid: string) {
  await updateDoc(doc(db, "referenceKeys", keyId), {
    isUsed: true,
    usedBy: usedByUid
  });
}

export async function getAllReferenceKeys() {
  const snapshot = await getDocs(query(collection(db, "referenceKeys"), orderBy("createdAt", "desc")));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReferenceKey));
}

/**
 * PROFILES
 */
export async function createProfile(profileData: Omit<UserProfile, "id" | "createdAt" | "isApproved" | "isVisible">) {
  if (!auth.currentUser) throw new Error("Giriş yapmalısınız.");
  const collectionName = profileData.profileType === "personal" ? "personalProfiles" : "teamProfiles";
  
  // Uniqueness check for username
  if (profileData.username) {
    const pUsernameCheck = await getDocs(query(collection(db, "personalProfiles"), where("username", "==", profileData.username)));
    const tUsernameCheck = await getDocs(query(collection(db, "teamProfiles"), where("username", "==", profileData.username)));
    if (!pUsernameCheck.empty || !tUsernameCheck.empty) {
      throw new Error(`"${profileData.username}" kullanıcı adı başkası tarafından alınmış. Lütfen başka bir tane seçin.`);
    }
  }

  const existing = await getDocs(query(collection(db, collectionName), where("uid", "==", auth.currentUser.uid)));
  
  if (profileData.profileType === "personal") {
    if (!existing.empty) {
      throw new Error("Zaten bir kişisel profiliniz var. En fazla 1 kişisel profil oluşturabilirsiniz.");
    }
  } else {
    // Team profiles constraint
    if (existing.docs.length >= 3) {
      throw new Error("Öğrenci hesapları en fazla 3 tane ekip ilanı (proje) oluşturabilir.");
    }
  }
  
  const docRef = doc(collection(db, collectionName));
  const dataToSave = {
    ...profileData,
    isApproved: false, // Must be approved by admin
    isVisible: true,
    createdAt: serverTimestamp()
  };
  await setDoc(docRef, dataToSave);
  return { id: docRef.id, ...dataToSave };
}

export async function getMyProfiles(uid: string) {
  const pDocs = await getDocs(query(collection(db, "personalProfiles"), where("uid", "==", uid)));
  const tDocs = await getDocs(query(collection(db, "teamProfiles"), where("uid", "==", uid)));
  
  const personal = pDocs.empty ? null : { id: pDocs.docs[0].id, ...(pDocs.docs[0].data() as PersonalProfile) };
  const teamList = tDocs.empty ? [] : tDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamProfile));

  return { personal, teams: teamList };
}

export async function deleteProfile(profileId: string, type: "personal" | "team") {
  const collectionName = type === "personal" ? "personalProfiles" : "teamProfiles";
  await deleteDoc(doc(db, collectionName, profileId));
}

export async function getPublicProfiles(type: "personal" | "team") {
  const collectionName = type === "personal" ? "personalProfiles" : "teamProfiles";
  const q = query(
    collection(db, collectionName),
    where("isApproved", "==", true),
    where("isVisible", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
}

export async function getAdminPendingProfiles(type: "personal" | "team") {
  const collectionName = type === "personal" ? "personalProfiles" : "teamProfiles";
  const snapshot = await getDocs(query(collection(db, collectionName), where("isApproved", "==", false)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
}

export async function getAllProfiles(type: "personal" | "team") {
  const collectionName = type === "personal" ? "personalProfiles" : "teamProfiles";
  const snapshot = await getDocs(query(collection(db, collectionName), orderBy("createdAt", "desc")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
}

export async function adminApproveProfile(profileId: string, type: "personal" | "team", status: boolean) {
  const collectionName = type === "personal" ? "personalProfiles" : "teamProfiles";
  await updateDoc(doc(db, collectionName, profileId), { isApproved: status });
}

export async function adminToggleVisibility(profileId: string, type: "personal" | "team", status: boolean) {
  const collectionName = type === "personal" ? "personalProfiles" : "teamProfiles";
  await updateDoc(doc(db, collectionName, profileId), { isVisible: status });
}
