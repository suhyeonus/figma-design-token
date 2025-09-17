"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      type="button"
      className="px-md py-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 transition-colors"
      onClick={() => setIsDark((v) => !v)}
    >
      {isDark ? "라이트 모드" : "다크 모드"}
    </button>
  );
}


