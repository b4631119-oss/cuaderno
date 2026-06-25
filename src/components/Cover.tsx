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
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-8">
      <div
        className="relative w-[320px] min-h-[440px] border-2 rounded-sm flex flex-col items-center px-9 pt-11 pb-9"
        style={{ background: color.bg, borderColor: color.border }}
      >
        {/* Кнопка палитры */}
        <button
          className="absolute top-3 right-3 text-lg opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: color.text }}
          onClick={() => setShowPalette((p) => !p)}
          aria-label="Изменить цвет обложки"
        >
          🎨
        </button>

        {/* Выбор цвета */}
        {showPalette && (
          <div className="flex gap-2 flex-wrap justify-center mb-4">
            {COLORS.map((c, i) => (
              <button
                key={i}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c.bg,
                  borderColor: i === colorIdx ? color.text : "transparent",
                  transform: i === colorIdx ? "scale(1.15)" : undefined,
                }}
                onClick={() => {
                  setColorIdx(i);
                  setShowPalette(false);
                }}
                aria-label={c.label}
              />
            ))}
          </div>
        )}

        {/* Заголовок */}
        <h1
          className="text-xl font-medium tracking-[4px] uppercase mb-12 text-center"
          style={{ color: color.text }}
        >
          ТЕТРАДЬ
        </h1>

        {/* Поля */}
        <div className="w-full flex flex-col gap-6">
          {[
            { label: "для", value: subject, onChange: setSubject },
            { label: "имя", value: firstName, onChange: setFirstName },
            { label: "фамилия", value: lastName, onChange: setLastName },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-end gap-2">
              <span className="text-[13px] pb-0.5 whitespace-nowrap" style={{ color: color.text }}>
                {label}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={40}
                className="flex-1 bg-transparent border-0 border-b outline-none text-[13px] pb-0.5 rounded-none"
                style={{ borderBottomColor: color.border, color: color.text }}
              />
            </div>
          ))}
        </div>

        {/* Кнопка открыть */}
        <button
          className="mt-auto w-full border rounded-md py-2.5 text-sm tracking-wide mt-12 hover:opacity-70 transition-opacity"
          style={{ borderColor: color.border, color: color.text }}
          onClick={onOpen}
        >
          открыть тетрадь →
        </button>
      </div>
    </div>
  );
}