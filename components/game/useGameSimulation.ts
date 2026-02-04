import { useEffect, useRef, useState } from "react";

import { initialHistory } from "@/lib/data";

export type FlightPhase = "waiting" | "flying" | "crashed";

const WAIT_DURATION = 4.5;
const CRASH_PAUSE = 2.2;

function randomCrashPoint() {
  const roll = Math.random();
  const weighted = Math.pow(1 - roll, 3);
  const base = 1.15 + weighted * 34;
  return Math.max(1.1, Number(base.toFixed(2)));
}

export function useGameSimulation() {
  const [phase, setPhase] = useState<FlightPhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [countdown, setCountdown] = useState(Math.ceil(WAIT_DURATION));
  const [history, setHistory] = useState(initialHistory);

  const phaseRef = useRef<FlightPhase>("waiting");
  const crashRef = useRef(randomCrashPoint());
  const countdownRef = useRef(countdown);
  const startRef = useRef<number | null>(null);
  const flightStartRef = useRef<number | null>(null);
  const crashTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;

    const tick = (time: number) => {
      if (!startRef.current) {
        startRef.current = time;
      }

      const currentPhase = phaseRef.current;

      if (currentPhase === "waiting") {
        const elapsed = (time - startRef.current) / 1000;
        const remaining = Math.max(0, WAIT_DURATION - elapsed);
        const nextCountdown = Math.max(1, Math.ceil(remaining));

        if (nextCountdown !== countdownRef.current) {
          countdownRef.current = nextCountdown;
          setCountdown(nextCountdown);
        }

        if (remaining <= 0) {
          phaseRef.current = "flying";
          setPhase("flying");
          flightStartRef.current = time;
          setMultiplier(1);
        }
      }

      if (phaseRef.current === "flying" && flightStartRef.current) {
        const elapsed = (time - flightStartRef.current) / 1000;
        const growth = 1 + elapsed * 0.95 + elapsed * elapsed * 0.18;
        const nextMultiplier = Number(growth.toFixed(2));

        if (nextMultiplier >= crashRef.current) {
          phaseRef.current = "crashed";
          setPhase("crashed");
          setMultiplier(crashRef.current);
          crashTimeRef.current = time;

          const roundTime = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });

          setHistory((prev) => {
            const entry = {
              id: `r${Date.now()}`,
              multiplier: crashRef.current,
              time: roundTime
            };
            return [entry, ...prev].slice(0, 14);
          });
        } else {
          setMultiplier(nextMultiplier);
        }
      }

      if (phaseRef.current === "crashed" && crashTimeRef.current) {
        const elapsed = (time - crashTimeRef.current) / 1000;
        if (elapsed >= CRASH_PAUSE) {
          phaseRef.current = "waiting";
          setPhase("waiting");
          setMultiplier(1);
          setCountdown(Math.ceil(WAIT_DURATION));
          countdownRef.current = Math.ceil(WAIT_DURATION);
          crashRef.current = randomCrashPoint();
          startRef.current = time;
          flightStartRef.current = null;
          crashTimeRef.current = null;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return {
    phase,
    multiplier,
    countdown,
    history
  };
}
