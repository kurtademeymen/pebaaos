"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dynamic responsive mesh gradients */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 mix-blend-screen dark:opacity-30 dark:mix-blend-color-dodge pointer-events-none"
        animate={{
          x: mousePosition.x - 400 + 100,
          y: mousePosition.y - 400 - 100,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 2 }}
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0) 70%)",
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-50 mix-blend-screen dark:opacity-20 dark:mix-blend-color-dodge pointer-events-none"
        animate={{
          x: mousePosition.x - 300 - 300,
          y: mousePosition.y - 300 + 200,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 3.5 }}
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0) 70%)",
        }}
      />
      <motion.div
        className="absolute top-1/4 left-1/4 w-[1000px] h-[1000px] rounded-full blur-[150px] opacity-20 bg-primary/30 mix-blend-multiply dark:mix-blend-overlay"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
