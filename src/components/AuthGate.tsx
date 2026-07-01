"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../lib/auth-errors";

import { User } from "firebase/auth"; 

interface AuthGateProps {
  onSuccess: (user: User) => void; 
  onCancel: () => void;
  accentColor: string;
}

export default function AuthGate({ onSuccess, onCancel, accentColor }: AuthGateProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let loggedInUser: User;
      if (mode === "login") {
        loggedInUser = await login(email, password);
      } else {
        loggedInUser = await register(email, password);
      }
      onSuccess(loggedInUser);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors text-xl"
          onClick={onCancel}
          aria-label="Закрыть"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-1" style={{ color: accentColor }}>
          {mode === "login" ? "Вход в тетрадь" : "Новая тетрадь"}
        </h2>
        <p className="text-sm text-neutral-400 text-center mb-6">
          {mode === "login"
            ? "Войди, чтобы продолжить с того места, где остановился"
            : "Зарегистрируйся, чтобы тетрадь сохранялась"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="px-3 py-2.5 border border-neutral-200 rounded-lg outline-none focus:border-neutral-400 transition-colors text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 font-medium">Пароль</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3 py-2.5 border border-neutral-200 rounded-lg outline-none focus:border-neutral-400 transition-colors text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{ background: accentColor }}
          >
            {loading
              ? "Подождите..."
              : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 transition-colors text-center w-full"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}