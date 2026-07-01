import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserPage {
  title: string;
  content: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  subject: string;
  coverColorBg: string;
  coverColorBorder: string;
  coverColorText: string;
  coverImage: string | null;
  pages?: UserPage[];
}

export async function saveUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveUserPages(
  uid: string,
  pages: UserPage[]
): Promise<void> {
 
  await setDoc(doc(db, "users", uid), {
    pages,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}