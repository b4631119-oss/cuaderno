import { doc, setDoc, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserPage {
  id?: string; // Теперь у каждой страницы будет свой ID документа
  title: string;
  content: string;
  createdAt?: number; // Временная метка для сортировки
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

// 1. Сохранение профиля (теперь строго БЕЗ массива страниц)
export async function saveUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// 2. НОВАЯ: Сохранение ОДНОЙ конкретной страницы в подколлекцию users/{uid}/pages/{pageId}
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

// 3. НОВАЯ: Получение ВСЕХ страниц из подколлекции (для загрузки при старте)
export async function getUserPages(uid: string): Promise<UserPage[]> {
  const querySnapshot = await getDocs(collection(db, "users", uid, "pages"));
  const pages: UserPage[] = [];
  
  querySnapshot.forEach((docSnap) => {
    pages.push({
      id: docSnap.id,
      ...docSnap.data(),
    } as UserPage);
  });

  // Сортируем страницы по createdAt (если есть), с фолбеком на ID для старых страниц
  return pages.sort((a, b) => {
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    if (timeA !== timeB) return timeA - timeB;
    return (a.id || "").localeCompare(b.id || "");
  });
}

// 4. НОВАЯ: Генерация уникального ID для страницы на основе встроенных механизмов Firestore
export function generatePageId(uid?: string): string {
  const path = uid ? `users/${uid}/pages` : "temp";
  return doc(collection(db, path)).id;
}