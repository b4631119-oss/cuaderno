"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotebookPage() {
  const [index, setIndex] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-[85vh] bg-white shadow-2xl notebook-grid p-12 overflow-hidden dog-ear">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            // Эффект загиба/скручивания при смене страницы
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="h-full origin-left"
          >
            {/* Красная линия (поля) как в школьной тетради */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-300" />
            
            <h1 className="text-3xl font-bold ml-12">Страница {index + 1}</h1>
            <p className="mt-10 text-xl ml-12 leading-loose">
              Здесь текст ложится по клеточкам...
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Управление */}
        <div className="absolute bottom-8 right-8 flex gap-4">
          <button onClick={() => setIndex(i => Math.max(0, i - 1))}>Назад</button>
          <button onClick={() => setIndex(i => i + 1)}>Вперед</button>
        </div>
      </div>
    </div>
  );
}