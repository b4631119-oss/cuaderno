"use client";
import { useState } from "react";
import Cover from "../components/Cover";

export default function Home() {
  const [opened, setOpened] = useState(false);

  if (!opened) return <Cover onOpen={() => setOpened(true)} />;

  return <div>что то</div>;
}