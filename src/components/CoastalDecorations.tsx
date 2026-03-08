import { motion, AnimatePresence } from "framer-motion";

// Floating background bubbles — soft, semi-transparent
export function FloatingBubbles() {
  const bubbles = [
    { size: 80, x: "10%", delay: 0, duration: 10 },
    { size: 60, x: "25%", delay: 2, duration: 12 },
    { size: 100, x: "50%", delay: 1, duration: 9 },
    { size: 40, x: "70%", delay: 3, duration: 11 },
    { size: 70, x: "85%", delay: 0.5, duration: 10 },
    { size: 50, x: "40%", delay: 4, duration: 8 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            bottom: "-10%",
            background: `radial-gradient(circle, hsl(200 50% 82% / 0.07), hsl(200 50% 82% / 0.02))`,
          }}
          animate={{
            y: [0, -800],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Wave SVG divider
export function WaveDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
        <path
          d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1100,80 1150,50 1200,60 L1200,120 L0,120 Z"
          className="fill-sky-deep"
        />
      </svg>
    </div>
  );
}

// Stagger container for scroll-reveal children
export function StaggerContainer({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ staggerChildren: 0.1, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// Shell icon
export function ShellIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-5 h-5 ${className}`}>
      <path d="M12 2C6.5 2 2 8 2 14c0 4.4 4.5 8 10 8s10-3.6 10-8c0-6-4.5-12-10-12z" />
      <path d="M12 2v20M7 6c1 3 2 8 5 14M17 6c-1 3-2 8-5 14" />
    </svg>
  );
}

// Wave icon
export function WaveIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-5 h-5 ${className}`}>
      <path d="M2 12c2-2 4-4 6-4s4 4 6 4 4-4 6-4" />
      <path d="M2 17c2-2 4-4 6-4s4 4 6 4 4-4 6-4" opacity={0.5} />
    </svg>
  );
}

// Loading wave dots
export function WaveLoader() {
  return (
    <div className="flex items-center gap-1.5 justify-center py-8">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-sky-deep"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Confetti sparkle burst
export function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 150 + 50),
    color: [
      "hsl(12 73% 77%)",    // coral
      "hsl(200 50% 82%)",   // sky
      "hsl(38 52% 85%)",    // champagne
      "hsl(166 35% 78%)",   // seafoam
    ][i % 4],
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotation }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.id % 3 === 0 ? "50%" : "2px",
              position: "absolute",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
