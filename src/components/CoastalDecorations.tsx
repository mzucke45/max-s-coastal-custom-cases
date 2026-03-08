import { motion } from "framer-motion";

// Floating decorative elements for backgrounds
export function FloatingBubbles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/5"
          style={{
            width: 20 + i * 15,
            height: 20 + i * 15,
            left: `${10 + i * 16}%`,
            bottom: `-${20 + i * 10}px`,
          }}
          animate={{
            y: [0, -200 - i * 80, -400 - i * 60],
            x: [0, (i % 2 ? 30 : -30), (i % 2 ? -15 : 15)],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Wave divider SVG
export function WaveDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          className="fill-background/80"
        />
      </svg>
    </div>
  );
}

// Staggered fade-up for children
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Coastal accent icons (inline SVG for lightweight rendering)
export function ShellIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-5 h-5 ${className}`}>
      <path d="M12 2C6.5 2 2 8 2 14c0 4.4 4.5 8 10 8s10-3.6 10-8c0-6-4.5-12-10-12z" />
      <path d="M12 2v20M7 6c1 3 2 8 5 14M17 6c-1 3-2 8-5 14" />
    </svg>
  );
}

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
          className="w-3 h-3 rounded-full bg-primary"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Confetti burst (triggered imperatively)
export function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = [
    "hsl(199, 65%, 48%)", // ocean
    "hsl(12, 70%, 65%)",  // coral
    "hsl(166, 35%, 78%)", // seafoam
    "hsl(45, 90%, 65%)",  // sun
    "hsl(37, 40%, 88%)",  // sand
  ];
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${30 + Math.random() * 40}%`,
            top: "40%",
          }}
          initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            y: [0, -100 - Math.random() * 100, 300 + Math.random() * 200],
            x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 300],
            rotate: [0, Math.random() * 720],
          }}
          transition={{ duration: 1.5 + Math.random() * 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
