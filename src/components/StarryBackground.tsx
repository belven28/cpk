/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";

interface StarProp {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export function StarryBackground({ isDark = true }: { isDark?: boolean }) {
  const [stars, setStars] = useState<StarProp[]>([]);

  useEffect(() => {
    const generated: StarProp[] = Array.from({ length: 45 }).map((_, i) => {
      const sizeStr = `${Math.random() * 2 + 1}px`;
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: sizeStr,
        duration: `${Math.random() * 4 + 3}s`,
        delay: `${Math.random() * 3}s`,
      };
    });
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark violet & celestial gradient overlay */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? "bg-gradient-to-b from-[#060815] via-[#04060d] to-[#010206] opacity-100" : "opacity-0"}`} />
      
      {/* Soft Moon glow from right/top corner */}
      <div className={`absolute right-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none transition-opacity duration-1000 ${isDark ? "opacity-100" : "opacity-30"}`} />
      <div className={`absolute left-[-5%] bottom-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none transition-opacity duration-1000 ${isDark ? "opacity-100" : "opacity-30"}`} />

      {/* Twinkled Stars */}
      <div className={`transition-opacity duration-1000 ${isDark ? "opacity-100" : "opacity-30"}`}>
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
              backgroundColor: Math.random() > 0.3 ? "#fffdf0" : "#fbbf24", // amber/gold stars
              boxShadow: "0 0 6px rgba(253, 253, 240, 0.4)",
            }}
          />
        ))}
      </div>
      
      {/* Traditional elegant floating bamboo leaves decoration or celestial clouds outlines */}
      <div className={`absolute right-[5%] bottom-[10%] opacity-15 select-none pointer-events-none transition-all duration-1000 ${isDark ? "text-amber-300" : "text-amber-700/60"}`}>
        <svg width="200" height="300" viewBox="0 0 100 150" fill="none" className="currentColor">
          <path d="M10 130 C 20 100, 30 80, 50 60 C 40 75, 25 90, 10 130" stroke="currentColor" strokeWidth="0.5" />
          <path d="M30 140 C 45 110, 55 90, 80 70 C 65 85, 50 100, 30 140" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 150 C 60 125, 75 110, 95 95 C 80 110, 65 125, 50 150" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 90 C 35 70, 40 50, 70 30 C 50 45, 35 60, 20 90" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className={`absolute left-[3%] top-[12%] opacity-15 select-none pointer-events-none transition-all duration-1000 ${isDark ? "text-indigo-300" : "text-purple-800/60"}`}>
        <svg width="150" height="250" viewBox="0 0 100 150" fill="none" className="currentColor">
          <path d="M90 20 C 70 40, 50 60, 30 90 C 45 75, 65 60, 90 20" stroke="currentColor" strokeWidth="0.5" />
          <path d="M80 50 C 60 70, 45 90, 20 120 C 35 105, 55 90, 80 50" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
