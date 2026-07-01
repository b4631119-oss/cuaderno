import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserProfile {
  firstName: string;
  lastName: string;
  subject: string;
  coverColorBg: string;
  coverColorBorder: string;
  coverColorText: string;
  coverImage: string | null; // base64 или ссылка, либо null если выбран цвет
}

/**
 * Сохраняет профиль пользователя (данные с обложки) в Firestore.
 * Документ хранится по uid пользователя — users/{uid}
 */
export async function saveUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Загружает профиль пользователя из Firestore.
 * Возвращает null, если профиль ещё не создан.
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}