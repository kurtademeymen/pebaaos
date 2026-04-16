import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { UserProfile } from "@/types";

const usersCollection = collection(db, "users");

export const addUser = async (profile: Omit<UserProfile, "id" | "createdAt" | "isApproved" | "isVisible">) => {
  const newProfile = {
    ...profile,
    isApproved: false,
    isVisible: true,
    createdAt: serverTimestamp(),
  };
  return await addDoc(usersCollection, newProfile);
};

export const getApprovedUsers = async () => {
  const q = query(
    usersCollection,
    where("isApproved", "==", true),
    where("isVisible", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const getUserById = async (id: string) => {
  // Try ID first from personalProfiles
  const personalById = await getDoc(doc(db, "personalProfiles", id)).catch(() => null);
  if (personalById && personalById.exists()) return { id: personalById.id, ...personalById.data() } as UserProfile;

  // Try username from personalProfiles
  const pQuery = await getDocs(query(collection(db, "personalProfiles"), where("username", "==", id)));
  if (!pQuery.empty) return { id: pQuery.docs[0].id, ...pQuery.docs[0].data() } as UserProfile;

  // Try ID first from teamProfiles
  const teamById = await getDoc(doc(db, "teamProfiles", id)).catch(() => null);
  if (teamById && teamById.exists()) return { id: teamById.id, ...teamById.data() } as UserProfile;

  // Try username from teamProfiles
  const tQuery = await getDocs(query(collection(db, "teamProfiles"), where("username", "==", id)));
  if (!tQuery.empty) return { id: tQuery.docs[0].id, ...tQuery.docs[0].data() } as UserProfile;

  return null;
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const updateUser = async (id: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, "users", id);
  await updateDoc(docRef, data);
};

export const deleteUser = async (id: string) => {
  const docRef = doc(db, "users", id);
  await deleteDoc(docRef);
};
