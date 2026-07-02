"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, saveUserPages, UserProfile } from "../lib/users";
import Cover from "../components/Cover";

export default function NotebookPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCover, setShowCover] = useState(false);

  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState([
    { title: "Страница 1", content: "Напишите что-нибудь..." },
  ]);

  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        if (p.pages && p.pages.length > 0) {
          setPages(p.pages);
        }
      }
      setTimeout(() => {
        isLoadedRef.current = true;
      }, 0);
    });
  }, [user]);

  useEffect(() => {
    if (!user || !isLoadedRef.current) return;
    const saveTimeout = setTimeout(() => {
      saveUserPages(user.uid, pages).catch((err) => {
        console.error("Ошибка автосохранения страниц:", err);
      });
    }, 1500);
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

  const createNewPage = () => {
    const newPages = [
      ...pages,
      { title: `Страница ${pages.length + 1}`, content: "" },
    ];
    setPages(newPages);
    // Гарантируем, что индекс переключится на только что созданную страницу
    setIndex(newPages.length - 1);
  };

  // Проверка на случай, если данные еще загружаются
  const currentPage = pages[index] || { title: "", content: "" };

  if (showCover) {
    return <Cover onOpen={() => setShowCover(false)} />;
  }

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : user?.email ?? "";

  const subject = profile?.subject ?? "";

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans select-none">
      
      {/* Шапка */}
      <header className="w-full bg-white border-b border-neutral-200 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-20">
        <div className="flex flex-col">
          {displayName && (
            <span className="text-sm font-medium text-neutral-700 leading-tight">
              {displayName}
            </span>
          )}
          {subject && (
            <span className="text-xs text-neutral-400 leading-tight mt-0.5">
              {subject}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCover(true)}
            className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 border border-neutral-200 flex items-center gap-1"
          >
            <span>📓</span> <span className="hidden sm:inline">обложка</span>
          </button>
          <button
            onClick={logout}
            className="text-xs text-neutral-500 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-neutral-200"
          >
            <span className="hidden sm:inline">Выйти</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
      </header>

      {/* ── Лист тетради — весь экран, клетка ─────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-white">
        
        {/* Клетчатый фон — 20px клетка с легкими линиями */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(209, 213, 219, 0.6) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(209, 213, 219, 0.6) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0px 0px"
          }}
        />

        {/* Красная вертикальная линия — поля */}
        <div className="absolute left-12 md:left-20 top-0 bottom-0 w-px bg-red-400 opacity-70 pointer-events-none" />

        {/* Контент поверх клетки */}
        <div className="relative z-10 h-full flex flex-col pl-16 md:pl-24 pr-4 md:pr-8 pt-[20px] pb-4 select-text">
          
          {/* Заголовок страницы — выровнен ровно по двум клеткам (40px) */}
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full text-lg md:text-xl font-bold bg-transparent border-none outline-none text-neutral-800 placeholder:text-neutral-300"
            style={{ 
              height: "40px", 
              lineHeight: "40px",
              padding: 0,
              margin: 0
            }}
            placeholder="Заголовок..."
          />

          {/* Текст — идеально попадает в клетки 20px */}
          <textarea
            className="flex-1 w-full bg-transparent border-none outline-none resize-none text-neutral-700 text-sm md:text-base placeholder:text-neutral-300 focus:ring-0"
            style={{ 
              lineHeight: "20px", 
              paddingTop: "0px", // Сброс внутренних отступов для выравнивания по клеткам
              paddingBottom: "0px",
              marginTop: "20px", // Отступ от заголовка ровно в одну клетку
              fontFamily: "monospace, sans-serif" // Моноширинный шрифт лучше всего ложится на сетку
            }}
            value={currentPage.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Начни писать..."
          />
        </div>
      </div>

      {/* ── Навигация ─────────────────────────────────────────── */}
      <footer className="w-full bg-white border-t border-neutral-200 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-20">
        <span className="text-xs text-neutral-400 font-medium">
          {index + 1} / {pages.length}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
            disabled={index === pages.length - 1}
            className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
          <button
            onClick={createNewPage}
            className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            + <span className="hidden sm:inline">страница</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
