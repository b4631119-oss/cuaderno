"use client";

import { useState, useEffect, useRef } from "react"; // Импортировали useRef
import { useAuth } from "../context/AuthContext";
import { getUserProfile, saveUserPages, UserProfile } from "../lib/users"; // Импортировали saveUserPages
import Cover from "../components/Cover";

export default function NotebookPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCover, setShowCover] = useState(false);

  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState([
    { title: "Страница 1", content: "Напишите что-нибудь..." },
  ]);

  // Реф для отслеживания того, загружены ли данные из базы данных.
  // Это нужно, чтобы автосохранение не срабатывало при первом открытии страницы.
  const isLoadedRef = useRef(false);

  // Загружаем профиль пользователя и сохранённые страницы
  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        // Если в базе сохранены страницы, загружаем их вместо дефолтных
        if (p.pages && p.pages.length > 0) {
          setPages(p.pages);
        }
      }
      // Ставим таймаут на следующий тик, чтобы переключить флаг ПОСЛЕ
      // того, как React обновит стейт страниц из базы данных.
      setTimeout(() => {
        isLoadedRef.current = true;
      }, 0);
    });
  }, [user]);

  // Эффект автоматического сохранения страниц в Firestore.
  // Запускается при каждом изменении контента страниц, но с дебаунсом в 1.5 сек.
  useEffect(() => {
    if (!user || !isLoadedRef.current) return;

    const saveTimeout = setTimeout(() => {
      saveUserPages(user.uid, pages).catch((err) => {
        console.error("Ошибка автосохранения страниц:", err);
      });
    }, 1500); // Сохраняем через 1.5 секунды после окончания ввода

    return () => clearTimeout(saveTimeout);
  }, [pages, user]);

  const updateContent = (newContent: string) => {
    const updated = [...pages];
    updated[index].content = newContent;
    setPages(updated);
  };

  const updateTitle = (newTitle: string) => {
    const updated = [...pages];
    updated[index].title = newTitle;
    setPages(updated);
  };

  const currentPage = pages[index];

  // Если нажали "посмотреть обложку" — рендерим Cover,
  // кнопка "Открыть" внутри него вернёт обратно
  if (showCover) {
    return <Cover onOpen={() => setShowCover(false)} />;
  }

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : user?.email ?? "";

  const subject = profile?.subject ?? "";

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex flex-col">

      {/* ── Шапка ─────────────────────────────────────────────── */}
      <header className="w-full bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">

        {/* Левая часть — имя и предмет */}
        <div className="flex flex-col">
          {displayName && (
            <span className="text-sm font-medium text-neutral-700 leading-tight">
              {displayName}
            </span>
          )}
          {subject && (
            <span className="text-xs text-neutral-400 leading-tight">
              {subject}
            </span>
          )}
        </div>

        {/* Правая часть — кнопки */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCover(true)}
            className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100 border border-neutral-200"
          >
            📓 обложка
          </button>
          <button
            onClick={logout}
            className="text-xs text-neutral-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-neutral-200"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* ── Тетрадь ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white shadow-xl rounded-sm overflow-hidden"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          {/* Линованный фон */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)",
              backgroundPositionY: "48px",
            }}
          />

          {/* Красная вертикальная линия */}
          <div className="absolute left-16 top-0 bottom-0 w-px bg-red-300" />

          <div className="relative z-10 p-6 pl-20 pt-8">
            {/* Заголовок страницы */}
            <input
              type="text"
              value={currentPage.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none text-neutral-800 mb-6 placeholder:text-neutral-300"
              placeholder="Заголовок..."
            />

            {/* Текст */}
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none text-neutral-700 text-base leading-8 placeholder:text-neutral-300"
              style={{ minHeight: "calc(100vh - 260px)", lineHeight: "32px" }}
              value={currentPage.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Начни писать..."
            />
          </div>
        </div>
      </div>

      {/* ── Навигация по страницам ────────────────────────────── */}
      <footer className="w-full bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          Страница {index + 1} из {pages.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← назад
          </button>
          <button
            onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
            disabled={index === pages.length - 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            вперёд →
          </button>
          <button
            onClick={() => {
              setPages([
                ...pages,
                { title: `Страница ${pages.length + 1}`, content: "" },
              ]);
              setIndex(pages.length);
            }}
            className="px-3 py-1.5 text-sm rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            + страница
          </button>
        </div>
      </footer>
    </div>
  );
}