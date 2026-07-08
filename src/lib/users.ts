import { doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserPage {
  id?: string;
  title: string;
  content: string;
  createdAt?: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  subject: string;
  coverColorBg: string;
  coverColorBorder: string;
  coverColorText: string;
  coverImage: string | null;
}

// Сохранение профиля обложки
export async function saveUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Загрузка профиля — нужна для Cover.tsx при перезаходе
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// Сохранение одной страницы в подколлекцию users/{uid}/pages/{pageId}
export async function saveSinglePage(
  uid: string,
  pageId: string,
  pageData: { title: string; content: string; createdAt?: number }
): Promise<void> {
  await setDoc(doc(db, "users", uid, "pages", pageId), {
    ...pageData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Загрузка всех страниц из подколлекции
export async function getUserPages(uid: string): Promise<UserPage[]> {
  const querySnapshot = await getDocs(collection(db, "users", uid, "pages"));
  const pages: UserPage[] = [];
  querySnapshot.forEach((docSnap) => {
    pages.push({ id: docSnap.id, ...docSnap.data() } as UserPage);
  });
  // Сортируем по createdAt, фолбек на id
  return pages.sort((a, b) => {
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    if (timeA !== timeB) return timeA - timeB;
    return (a.id || "").localeCompare(b.id || "");
  });
}

// Генерация уникального ID для новой страницы
export function generatePageId(uid?: string): string {
  const path = uid ? `users/${uid}/pages` : "temp";
  return doc(collection(db, path)).id;
}

// Совместимость со старым NotebookPage если он ещё использует saveUserPages
export async function saveUserPages(
  uid: string,
  pages: Array<{ title: string; content: string }>
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    pages,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}