"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Cover from "../components/Cover";
import NotebookPage from "../components/NotebookPage";

export default function Home() {
  const { user, loading } = useAuth();
  const [opened, setOpened] = useState(false);


  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-200">
        <p className="text-neutral-400 text-sm">загрузка...</p>
      </div>
    );
  }

 
  if (user || opened) {
    return <NotebookPage />;
  }

  return <Cover onOpen={() => setOpened(true)} />;
}