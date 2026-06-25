"use client";

import { useState } from "react";

const COLORS = [
  { bg: "#8fbc5a", border: "#3B6D11", text: "#173404", label: "зелёный" },
  { bg: "#7fb3d3", border: "#185FA5", text: "#042C53", label: "синий" },
  { bg: "#e8a87c", border: "#854F0B", text: "#412402", label: "оранжевый" },
  { bg: "#c9a0dc", border: "#534AB7", text: "#26215C", label: "фиолетовый" },
  { bg: "#f0a0a0", border: "#A32D2D", text: "#501313", label: "красный" },
  { bg: "#d3d1c7", border: "#5F5E5A", text: "#2C2C2A", label: "серый" },
];

interface CoverProps {
  onOpen: () => void;
}

export default function Cover({ onOpen }: CoverProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const color = COLORS[colorIdx];

  return (
    // Внешний контейнер: занимает весь экран, убираем padding
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-200">
      
      {/* Обложка: 
          w-full h-full - занимает весь экран
          Убрали p-4, max-w, aspect
          rounded-r-xl -> rounded-none (теперь тетрадь на весь экран)
          Корректировка теней: shadow-inner + shadow-lg по краям
      */}
      <div
        className="relative w-full h-screen border-l-8 border-y-2 border-r-2 rounded-none shadow-[inner_0_0_20px_rgba(0,0,0,0.1),_0_0_30px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center p-8 md:p-12 transition-colors duration-300"
        style={{ background: color.bg, borderColor: color.border }}
      >
        {/* Кнопка палитры - перемещена в верхний правый угол с padding */}
        <button
          className="absolute top-6 right-6 text-2xl md:text-3xl hover:scale-110 transition-transform"
          style={{ color: color.text }}
          onClick={() => setShowPalette((p) => !p)}
        >
          🎨
        </button>

        {/* Выбор цвета: адаптивный, по центру над тетрадью */}
        {showPalette && (
          <div className="absolute top-16 right-6 md:top-24 md:right-12 flex flex-row gap-3 p-3 bg-white/95 rounded-full shadow-xl">
            {COLORS.map((c, i) => (
              <button
                key={i}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c.bg,
                  borderColor: i === colorIdx ? "#000" : "transparent",
                }}
                onClick={() => {
                  setColorIdx(i);
                  setShowPalette(false);
                }}
              />
            ))}
          </div>
        )}

        {/* Заголовок: адаптивный, крупнее на больших экранах */}
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-[8px] md:tracking-[12px] uppercase mb-20 md:mb-28 text-center"
          style={{ color: color.text }}
        >
          ТЕТРАДЬ
        </h1>

        {/* Поля: Flexbox центрирование и адаптивная ширина */}
        <div className="w-full max-w-[320px] md:max-w-[480px] flex flex-col gap-10 md:gap-12">
          {[
            { label: "для", value: subject, onChange: setSubject },
            { label: "имя", value: firstName, onChange: setFirstName },
            { label: "фамилия", value: lastName, onChange: setLastName },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-end gap-4 md:gap-6">
              <span className="text-base md:text-lg font-semibold uppercase whitespace-nowrap" style={{ color: color.text }}>
                {label}:
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-transparent border-0 border-b-2 outline-none text-xl md:text-2xl pb-1.5 md:pb-2 font-mono tracking-wide"
                style={{ borderBottomColor: color.border, color: color.text }}
              />
            </div>
          ))}
        </div>

        {/* Кнопка "Открыть": адаптивная ширина, крупнее, прижата к низу */}
        <button
          className="mt-20 md:mt-28 w-full max-w-[320px] md:max-w-[400px] border-l-8 border-r-2 border-y-2 rounded py-4 md:py-5 text-base md:text-lg uppercase tracking-widest font-bold hover:bg-black/5 transition-all active:scale-[0.98]"
          style={{ borderColor: color.border, color: color.text, transitionProperty: "background, border, color, transform" }}
          onClick={onOpen}
        >
          Открыть тетрадь →
        </button>
      </div>
    </div>
  );
}