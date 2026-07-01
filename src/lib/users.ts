import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// Интерфейс, описывающий одну страницу тетради
export interface UserPage {
  title: string;     // Заголовок страницы
  content: string;   // Текстовое содержимое страницы
}

// Расширенный профиль пользователя, теперь включает массив страниц
export interface UserProfile {
  firstName: string;
  lastName: string;
  subject: string;
  coverColorBg: string;
  coverColorBorder: string;
  coverColorText: string;
  coverImage: string | null; 
  pages?: UserPage[]; // Опциональный массив страниц тетради
}

// Функция сохранения полного профиля пользователя (используется при настройке обложки)
export async function saveUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true }); // Используем merge: true, чтобы случайно не стереть другие поля при обновлении
}

// Функция сохранения исключительно страниц тетради (используется для автосохранения при вводе текста)
export async function saveUserPages(
  uid: string,
  pages: UserPage[]
): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    pages,
    updatedAt: serverTimestamp(),
  });
}

// Функция загрузки профиля пользователя (включая сохранённые страницы) из Firestore
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}