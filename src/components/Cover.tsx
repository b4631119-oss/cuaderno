"use client";

import { useState, useRef } from "react";
import AuthGate from "../components/AuthGate";
import { useAuth } from "../context/AuthContext";
import { saveUserProfile } from "../lib/users";

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
  const { user } = useAuth();
  const [colorIdx, setColorIdx] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);

  const color = COLORS[colorIdx];

  const coverStyle = bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderColor: "rgba(0,0,0,0.3)",
      }
    : { background: color.bg, borderColor: color.border };

  const textColor = bgImage ? "#ffffff" : color.text;
  const textShadow = bgImage ? "0 1px 4px rgba(0,0,0,0.6)" : undefined;
  const borderColor = bgImage ? "rgba(255,255,255,0.7)" : color.border;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result as string);
      setShowPalette(false);
    };
    reader.readAsDataURL(file);
  }
  function applyUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) {
      setUrlError(true);
      return;
    }
    setBgImage(url);
    setUrlError(false);
    setShowUrlInput(false);
    setUrlInput("");
    setShowPalette(false);
  }
  function resetBg() {
    setBgImage(null);
    setUrlInput("");
    setUrlError(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Вызывается после успешного входа/регистрации внутри AuthGate
  async function handleAuthSuccess() {
    if (user) {
      setSaving(true);
      try {
        await saveUserProfile(user.uid, {
          firstName,
          lastName,
          subject,
          coverColorBg: color.bg,
          coverColorBorder: color.border,
          coverColorText: color.text,
          coverImage: bgImage,
        });
      } catch (err) {
        // Не блокируем переход внутрь тетради даже если сохранение не удалось —
        // человек уже залогинен, страница откроется, просто без оформления
        console.error("Не удалось сохранить профиль обложки:", err);
      } finally {
        setSaving(false);
      }
    }
    onOpen();
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-200">
      <div
        className="relative w-full h-screen border-l-8 border-y-2 border-r-2 rounded-none flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-300"
        style={coverStyle}
        onClick={() => {
          if (showPalette) {
            setShowPalette(false);
            setShowUrlInput(false);
          }
        }}
      >
        {bgImage && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}

        <div className="relative z-10 w-full flex flex-col items-center">
          <button
            className="absolute top-0 right-0 text-2xl md:text-3xl hover:scale-110 transition-transform p-2 rounded-full bg-black/5 backdrop-blur-xs"
            style={{ color: textColor }}
            onClick={(e) => {
              e.stopPropagation();
              setShowPalette((p) => !p);
              setShowUrlInput(false);
            }}
            aria-label="Изменить оформление обложки"
          >
            🎨
          </button>

          {showPalette && (
            <div
              className="absolute top-14 right-0 flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-xl min-w-[220px] z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-neutral-400 uppercase tracking-wider">цвет</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: c.bg,
                      borderColor: i === colorIdx && !bgImage ? "#000" : "transparent",
                    }}
                    onClick={() => {
                      setColorIdx(i);
                      resetBg();
                      setShowPalette(false);
                    }}
                    aria-label={c.label}
                  />
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-2 flex flex-col gap-2">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">фото</p>

                <button
                  className="text-sm text-left px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  📁 загрузить с устройства
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />

                <button
                  className="text-sm text-left px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  onClick={() => setShowUrlInput((v) => !v)}
                >
                  🔗 вставить ссылку на фото
                </button>

                {showUrlInput && (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError(false);
                      }}
                      className={`text-sm px-2 py-1.5 border rounded-lg outline-none transition-colors text-black ${
                        urlError ? "border-red-400" : "border-neutral-300 focus:border-neutral-500"
                      }`}
                      onKeyDown={(e) => e.key === "Enter" && applyUrl()}
                    />
                    {urlError && (
                      <p className="text-xs text-red-500">введи корректную ссылку</p>
                    )}
                    <button
                      className="text-sm bg-neutral-800 text-white rounded-lg py-1.5 hover:bg-neutral-700 transition-colors"
                      onClick={applyUrl}
                    >
                      применить
                    </button>
                  </div>
                )}

                {bgImage && (
                  <button
                    className="text-sm text-red-500 text-left px-3 py-1 hover:underline"
                    onClick={() => {
                      resetBg();
                      setShowPalette(false);
                    }}
                  >
                    ✕ убрать фото
                  </button>
                )}
              </div>
            </div>
          )}

          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-[8px] md:tracking-[12px] uppercase mb-20 md:mb-28 text-center mt-8"
            style={{ color: textColor, textShadow }}
          >
            ТЕТРАДЬ
          </h1>

          <div className="w-full max-w-[320px] md:max-w-[480px] flex flex-col gap-10 md:gap-12">
            {[
              { label: "для", value: subject, onChange: setSubject },
              { label: "имя", value: firstName, onChange: setFirstName },
              { label: "фамилия", value: lastName, onChange: setLastName },
            ].map(({ label, value, onChange }) => (
              <div key={label} className="flex items-end gap-4 md:gap-6">
                <span
                  className="text-base md:text-lg font-semibold uppercase whitespace-nowrap"
                  style={{ color: textColor, textShadow }}
                >
                  {label}:
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 bg-transparent border-0 border-b-2 outline-none text-xl md:text-2xl pb-1.5 md:pb-2 font-mono tracking-wide transition-all focus:border-opacity-100 border-opacity-60"
                  style={{ borderBottomColor: borderColor, color: textColor, textShadow }}
                />
              </div>
            ))}
          </div>

          <button
            className="mt-20 md:mt-28 w-full max-w-[320px] md:max-w-[400px] border-l-8 border-r-2 border-y-2 rounded py-4 md:py-5 text-base md:text-lg uppercase tracking-widest font-bold hover:bg-black/10 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ borderColor, color: textColor, textShadow }}
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              if (user) {
                handleAuthSuccess();
              } else {
                setShowAuth(true);
              }
            }}
          >
            {saving ? "Сохраняем..." : "Открыть тетрадь →"}
          </button>
        </div>
      </div>

      {showAuth && (
        <AuthGate
          accentColor={color.border}
          onCancel={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}