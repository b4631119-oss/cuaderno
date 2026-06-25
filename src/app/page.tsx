"use client";

import { useState } from "react";
import Cover from "../components/Cover";
import NotebookPage from "../components/NotebookPage";

export default function Home() {
  const [opened, setOpened] = useState(false);

  if (!opened) return <Cover onOpen={() => setOpened(true)} />;

  return <NotebookPage />;
}