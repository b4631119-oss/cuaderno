import { doc, setDoc, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserPage {
  id?: string; // Теперь у каждой страницы будет свой ID документа
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
  pageData: { title: string; content: string }
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

  // Сортируем страницы по ID (page_0, page_1, page_2...), чтобы они не перемешивались
  return pages.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
}