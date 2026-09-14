import { motion, useReducedMotion } from "framer-motion";
import { Sprout } from "lucide-react";

const BRAND = "Brechó A Semente";
const PARTICLES = [
  { x: -68, y: -42, delay: 0 },
  { x: -42, y: -72, delay: 0.08 },
  { x: -18, y: -52, delay: 0.16 },
  { x: 18, y: -66, delay: 0.04 },
  { x: 44, y: -48, delay: 0.2 },
  { x: 70, y: -76, delay: 0.12 },
  { x: -82, y: -84, delay: 0.24 },
  { x: 82, y: -54, delay: 0.28 },
] as const;

const spring = { type: "spring" as const, stiffness: 100, damping: 15 };

export function SplashScreen() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-splash"
      initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: [1, 1, 0],
              scale: [1, 1, 1.1],
              filter: ["blur(0px)", "blur(0px)", "blur(10px)"],
            }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 3.2, times: [0, 0.78, 1], ease: [0.4, 0, 0.2, 1] }
      }
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: "blur(10px)",
        transition: { duration: 0.05 },
      }}
      aria-label="Brechó A Semente"
      role="status"
    >
      <motion.div
        className="relative flex flex-col items-center"
        animate={reduceMotion ? {} : { y: [0, 0, -10, 0], scale: [1, 1, 1.035, 1] }}
        transition={{ duration: 2.55, times: [0, 0.7, 0.9, 1], ease: "easeInOut" }}
      >
        <motion.div
          className="absolute top-8 size-8 rounded-full bg-seed shadow-seed"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0 }
              : { scale: [0, 1, 1.14, 1, 0.82], opacity: [0, 1, 1, 1, 0] }
          }
          transition={{ duration: 0.82, times: [0, 0.32, 0.58, 0.76, 1], ease: "easeInOut" }}
        />

        <motion.div
          className="relative flex h-28 w-44 items-center justify-center text-growth"
          initial={{ opacity: 0, scaleY: 0.25, y: 18 }}
          animate={{ opacity: [0, 0, 1, 1], scaleY: [0.25, 0.25, 1.08, 1], y: [18, 18, 0, 0] }}
          transition={{
            duration: reduceMotion ? 0 : 1.8,
            times: [0, 0.42, 0.78, 1],
            ease: "easeInOut",
          }}
        >
          <Sprout className="size-20" strokeWidth={1.65} aria-hidden="true" />

          {!reduceMotion &&
            PARTICLES.map((particle, index) => (
              <motion.span
                key={`${particle.x}-${particle.y}`}
                className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-growth-dust shadow-growth-dust"
                initial={{ x: 0, y: 12, opacity: 0, scale: 0.4 }}
                animate={{
                  x: [0, particle.x * 0.45, particle.x],
                  y: [12, particle.y * 0.4, particle.y],
                  opacity: [0, 0.85, 0],
                  scale: [0.4, index % 2 === 0 ? 1 : 0.75, 0.2],
                }}
                transition={{ duration: 0.95, delay: 0.88 + particle.delay, ease: "easeOut" }}
              />
            ))}
        </motion.div>

        <motion.h1 className="mt-1 flex flex-wrap justify-center font-display text-3xl font-bold text-growth-deep drop-shadow-growth sm:text-5xl">
          {BRAND.split("").map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className={letter === " " ? "w-[0.32em]" : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { ...spring, delay: 1.72 + index * 0.045 }
              }
            >
              {letter === " " ? "\u00a0" : letter}
            </motion.span>
          ))}
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}