import { useEffect, useRef, useState, useCallback } from "react";

export type FlightPhase = "waiting" | "flying" | "crashed";

export interface HistoryEntry {
  id: string;
  multiplier: number;
  time: string;
}

export interface ActiveBet {
  oddsId: string;
  oddsLabel: string;
  amount: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
}

export interface PlayerBet {
  id: string;
  username: string;
  amount: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
  time: string;
}

const WAIT_DURATION = 5;
const CRASH_PAUSE = 2.5;

function randomMultiplier(): number {
  const roll = Math.random();
  if (roll < 0.35) return Number((1.0 + Math.random() * 0.5).toFixed(2));
  if (roll < 0.55) return Number((1.5 + Math.random() * 1.0).toFixed(2));
  if (roll < 0.75) return Number((2.5 + Math.random() * 2.5).toFixed(2));
  if (roll < 0.90) return Number((5.0 + Math.random() * 10.0).toFixed(2));
  return Number((15.0 + Math.random() * 85.0).toFixed(2));
}

function generateInitialHistory(): HistoryEntry[] {
  const now = new Date();
  return Array.from({ length: 15 }, (_, i) => ({
    id: `r${1000 - i}`,
    multiplier: randomMultiplier(),
    time: new Date(now.getTime() - (i + 1) * 30000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }));
}

function generatePlayerBets(): PlayerBet[] {
  const usernames = ["Player***21", "User***87", "Lucky***45", "Bet***99", "Win***33", "Star***12", "Pro***56", "Ace***78"];
  return Array.from({ length: 8 + Math.floor(Math.random() * 5) }, (_, i) => ({
    id: `bet-${i}-${Date.now()}`,
    username: usernames[Math.floor(Math.random() * usernames.length)],
    amount: [5, 10, 25, 50, 100, 250][Math.floor(Math.random() * 6)],
    cashedOut: false,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }));
}

export function useGameSimulation() {
  const [phase, setPhase] = useState<FlightPhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [countdown, setCountdown] = useState(WAIT_DURATION);
  const [history, setHistory] = useState<HistoryEntry[]>(generateInitialHistory);
  const [roundNumber, setRoundNumber] = useState(1001);
  const [onlinePlayers, setOnlinePlayers] = useState(1248);
  const [playerBets, setPlayerBets] = useState<PlayerBet[]>([]);
  const [bets, setBets] = useState<ActiveBet[]>([]);

  const phaseRef = useRef<FlightPhase>("waiting");
  const countdownRef = useRef(countdown);
  const startRef = useRef<number | null>(null);
  const flightStartRef = useRef<number | null>(null);
  const crashTimeRef = useRef<number | null>(null);
  const lastMultiplierRef = useRef(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers(prev => Math.max(800, Math.min(2000, prev + Math.floor(Math.random() * 20) - 10)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === "waiting") setPlayerBets(generatePlayerBets());
  }, [phase]);

  const placeBet = useCallback((oddsId: string, oddsLabel: string, amount: number) => {
    if (phase !== "waiting") return false;
    setBets(prev => [...prev, { oddsId, oddsLabel, amount, cashedOut: false }]);
    return true;
  }, [phase]);

  const cashOut = useCallback((oddsId: string) => {
    if (phase !== "flying") return null;
    const currentMultiplier = lastMultiplierRef.current;
    setBets(prev => prev.map(bet => bet.oddsId === oddsId ? { ...bet, cashedOut: true, cashoutMultiplier: currentMultiplier } : bet));
    return currentMultiplier;
  }, [phase]);

  const cancelBet = useCallback((oddsId: string) => {
    if (phase !== "waiting") return false;
    setBets(prev => prev.filter(bet => bet.oddsId !== oddsId));
    return true;
  }, [phase]);

  const clearBets = useCallback(() => setBets([]), []);

  // COLLISION TRIGGER - called from FlamingoScene when crow hits flamingo
  const triggerCollision = useCallback(() => {
    if (phaseRef.current !== "flying") return;
    
    phaseRef.current = "crashed";
    setPhase("crashed");
    setMultiplier(lastMultiplierRef.current);
    crashTimeRef.current = performance.now();

    setHistory(prev => [{
      id: `r${roundNumber}`,
      multiplier: lastMultiplierRef.current,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }, ...prev].slice(0, 20));
    
    setRoundNumber(prev => prev + 1);
  }, [roundNumber]);

  useEffect(() => {
    let raf = 0;

    const tick = (time: number) => {
      if (!startRef.current) startRef.current = time;

      if (phaseRef.current === "waiting") {
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
          lastMultiplierRef.current = 1;
        }
      }

      // Flying phase - just increase multiplier, collision handled in 3D scene
      if (phaseRef.current === "flying" && flightStartRef.current) {
        const elapsed = (time - flightStartRef.current) / 1000;
        const growth = Math.pow(1.06, elapsed * 2);
        const nextMultiplier = Number(Math.max(1, growth).toFixed(2));
        lastMultiplierRef.current = nextMultiplier;
        setMultiplier(nextMultiplier);
      }

      // Crashed phase - wait then restart
      if (phaseRef.current === "crashed" && crashTimeRef.current) {
        if ((time - crashTimeRef.current) / 1000 >= CRASH_PAUSE) {
          phaseRef.current = "waiting";
          setPhase("waiting");
          setMultiplier(1);
          lastMultiplierRef.current = 1;
          setCountdown(WAIT_DURATION);
          countdownRef.current = WAIT_DURATION;
          startRef.current = time;
          flightStartRef.current = null;
          crashTimeRef.current = null;
          clearBets();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clearBets]);

  return { phase, multiplier, countdown, history, roundNumber, onlinePlayers, playerBets, bets, placeBet, cashOut, cancelBet, triggerCollision };
}
