"use client";

import { useState } from "react";

export default function NotebookPage() {
  const [index, setIndex] = useState(0);
  
  // Состояние для страниц
  const [pages, setPages] = useState([
    { title: "Страница 1", content: "Напишите что-нибудь..." }
  ]);

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

  return (
    <div className="min-h-screen w-full bg-neutral-200 flex items-center justify-center p-4">
      <div className="relative w-full h-screen bg-white shadow-2xl notebook-grid p-12 overflow-hidden">
        
        {/* Красная линия */}
        <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-300" />
        
        {/* Редактируемый заголовок */}
        <input
          type="text"
          value={currentPage.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="text-3xl font-bold ml-12 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-400 outline-none transition"
        />
        
        {/* Редактируемый текст */}
        <textarea
          className="w-full h-[70%] mt-6 ml-12 text-xl leading-loose border-none outline-none resize-none bg-transparent"
          value={currentPage.content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Напишите что-нибудь..."
          style={{ lineHeight: "2" }}
        />

        {/* Навигация */}
        <div className="absolute bottom-8 right-8 flex gap-4">
          <button 
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={index === 0}
          >
            Назад
          </button>
          <button 
            onClick={() => setIndex(i => Math.min(pages.length - 1, i + 1))}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={index === pages.length - 1}
          >
            Вперед
          </button>
          
          {/* Кнопка добавления страницы */}
          <button 
            onClick={() => {
              setPages([...pages, { 
                title: `Страница ${pages.length + 1}`, 
                content: "" 
              }]);
              setIndex(pages.length);
            }}
            className="px-4 py-2 bg-green-200 rounded hover:bg-green-300 transition"
          >
            +
          </button>
        </div>

        {/* Счетчик страниц */}
        <div className="absolute bottom-8 left-12 text-sm text-gray-400">
          Страница {index + 1} из {pages.length}
        </div>
      </div>
    </div>
  );
}