"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { saveSinglePage, getUserPages, UserPage } from "../lib/users";
import Cover from "../components/Cover";

export default function NotebookPage() {
  const { user, profile, logout } = useAuth();
  const [showCover, setShowCover] = useState(false);

  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState<UserPage[]>([
  { id: "page_0", title: "Страница 1", content: "" },
]);

  const isLoadedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  
  const pagesRef = useRef(pages);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const CELL = 24;

  // Загружаем страницы из подколлекции ОДИН РАЗ при старте приложения, когда зашёл юзер
  useEffect(() => {
    if (!user) return;

    getUserPages(user.uid).then((dbPages) => {
      if (dbPages.length > 0) {
        setPages(dbPages);
        pagesRef.current = dbPages;
      }
      isLoadedRef.current = true; // Разрешаем автосохранение после загрузки
    }).catch(console.error);
  }, [user]);

  // Функция сохранения: теперь отправляет ТОЛЬКО ТЕКУЩУЮ страницу
  const triggerSave = () => {
    if (!user || !isLoadedRef.current) return;
    
    // Синхронизируем локальный стейт React
    setPages([...pagesRef.current]);
    
    // Берем текущую страницу
    const currentPage = pagesRef.current[index];
    const pageId = currentPage.id || `page_${index}`;
    
    // Пушим в Firebase только её! Тяжёлый массив больше не гоняется по сети
    saveSinglePage(user.uid, pageId, {
      title: currentPage.title,
      content: currentPage.content,
    }).catch(console.error);
  };

  const runDebounceSave = () => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, 1500);
  };

  function handleContentInput() {
    if (!contentRef.current) return;
    pagesRef.current[index].content = contentRef.current.innerText;
    runDebounceSave();
  }

  function handleTitleInput() {
    if (!titleRef.current) return;
    pagesRef.current[index].title = titleRef.current.innerText.replace(/\n/g, "");
    runDebounceSave();
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      contentRef.current?.focus();
    }
  }

  useEffect(() => {
    if (contentRef.current) contentRef.current.innerText = pages[index]?.content ?? "";
    if (titleRef.current) titleRef.current.innerText = pages[index]?.title ?? "";
  }, [index, pages]);

  const changePage = (newIndex: number) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    triggerSave(); // Мгновенно сохраняем старую страницу перед уходом
    setIndex(newIndex);
  };

  const createNewPage = () => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    triggerSave(); 

    const nextIdx = pagesRef.current.length;
    const newPages = [
      ...pagesRef.current, 
      { id: `page_${nextIdx}`, title: `Страница ${nextIdx + 1}`, content: "" }
    ];
    pagesRef.current = newPages;
    setPages(newPages);
    setIndex(nextIdx);
  };

  if (showCover) return <Cover onOpen={() => setShowCover(false)} />;

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : user?.email ?? "";
  const subject = profile?.subject ?? "";

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <header className="w-full bg-white border-b border-neutral-200 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-20">
        <div className="flex flex-col">
          {displayName && (
            <span className="text-sm font-medium text-neutral-700 leading-tight">{displayName}</span>
          )}
          {subject && (
            <span className="text-xs text-neutral-400 leading-tight mt-0.5">{subject}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
              triggerSave(); 
              setShowCover(true);
            }}
            className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 border border-neutral-200 flex items-center gap-1"
          >
            <span>📓</span>
            <span className="hidden sm:inline">обложка</span>
          </button>
          <button
            onClick={() => {
              if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
              triggerSave();
              logout();
            }}
            className="text-xs text-neutral-500 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-neutral-200"
          >
            <span className="hidden sm:inline">Выйти</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-auto bg-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(209,213,219,0.65) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(209,213,219,0.65) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-red-400 opacity-50 pointer-events-none"
          style={{ left: `${CELL * 4}px` }}
        />
        <div
          className="relative z-10 min-h-full"
          style={{
            paddingLeft: `${CELL * 4 + 8}px`,
            paddingRight: `${CELL}px`,
            paddingTop: `${CELL}px`,
            paddingBottom: `${CELL * 2}px`,
          }}
        >
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTitleInput}
            onKeyDown={handleTitleKeyDown}
            className="w-full font-bold text-neutral-900 outline-none"
            style={{
              fontSize: "22px",
              lineHeight: `${CELL}px`,
              minHeight: `${CELL * 2}px`,
              whiteSpace: "nowrap",
              overflowX: "auto",
              overflowY: "hidden",
            }}
            data-placeholder="Заголовок..."
          />

          <div
            style={{
              height: "2px",
              background: "#262626",
              marginBottom: `${CELL - 2}px`,
            }}
          />
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentInput}
            className="w-full text-neutral-800 outline-none"
            style={{
              fontSize: "14px",
              lineHeight: `${CELL}px`,
              minHeight: `${CELL * 20}px`,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "'Courier New', Courier, monospace",
            }}
            data-placeholder="Начни писать..."
          />
        </div>
      </div>

      <footer className="w-full bg-white border-t border-neutral-200 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-20">
        <span className="text-xs text-neutral-400 font-medium">
          {index + 1} / {pages.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changePage(Math.max(0, index - 1))}
            disabled={index === 0}
            className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >←</button>
          <button
            onClick={() => changePage(Math.min(pages.length - 1, index + 1))}
            disabled={index === pages.length - 1}
            className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >→</button>
          <button
            onClick={createNewPage}
            className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            + <span className="hidden sm:inline">страница</span>
          </button>
        </div>
      </footer>

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #d1d5db;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}