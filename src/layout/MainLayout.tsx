// src/layout/MainLayout.tsx
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

export default function MainLayout({ children }: { children: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (desktop + mobile sliding) */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar setOpen={setOpen} />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
