"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Cover from "../components/Cover";
import NotebookPage from "../components/NotebookPage";

export default function Home() {
  const { user, loading } = useAuth();
  const [opened, setOpened] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);
  
  // Запоминаем, был ли юзер авторизован изначально при загрузке страницы
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Если это самая первая загрузка приложения — сразу открываем тетрадь
        if (isFirstLoad.current) {
          setOpened(true);
        }
        setInitialChecked(true);
      } else {
        // Если юзер разлогинился — возвращаем обложку
        setOpened(false);
        setInitialChecked(true);
      }
      // После первой проверки переводим флаг в false
      isFirstLoad.current = false;
    }
  }, [user, loading]);

  if (loading || !initialChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-200">
        <p className="text-neutral-400 text-sm">загрузка...</p>
      </div>
    );
  }
  
  if (opened) {
    return <NotebookPage />;
  }

  return <Cover onOpen={() => setOpened(true)} />;
}