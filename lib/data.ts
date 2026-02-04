export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  isSystem?: boolean;
}

export interface TopBet {
  id: string;
  user: string;
  stake: number;
  multiplier: number;
  won: boolean;
}

export interface LiveBet {
  id: string;
  username: string;
  amount: number;
  timestamp: string;
  cashedOut?: boolean;
  cashoutMultiplier?: number;
}

// Chat messages for the live chat
export const initialChat: ChatMessage[] = [
  {
    id: "c1",
    user: "FlightMaster",
    message: "Just hit 12x! This flamingo is on fire today 🔥",
    time: "12:31"
  },
  {
    id: "c2",
    user: "LuckyBet99",
    message: "Auto cashout at 2x is the safe play",
    time: "12:30"
  },
  {
    id: "c3",
    user: "WingRider",
    message: "Who else saw that 28x earlier?? Insane!",
    time: "12:30"
  },
  {
    id: "c4",
    user: "BetKing",
    message: "Going all in next round 💰",
    time: "12:29"
  },
  {
    id: "c5",
    user: "SkyHigh42",
    message: "This game is addictive haha",
    time: "12:29"
  },
  {
    id: "c6",
    user: "CashMaster",
    message: "Pro tip: set auto cashout and relax",
    time: "12:28"
  },
  {
    id: "c7",
    user: "FlamingoFan",
    message: "Love watching this bird fly!",
    time: "12:27"
  },
  {
    id: "c8",
    user: "NightOwl",
    message: "Finally won after 5 rounds",
    time: "12:26"
  }
];

// Top bets for leaderboard
export const topBets: TopBet[] = [
  { id: "b1", user: "Player***21", stake: 250, multiplier: 15.42, won: true },
  { id: "b2", user: "Lucky***87", stake: 100, multiplier: 8.65, won: true },
  { id: "b3", user: "Bet***45", stake: 500, multiplier: 3.21, won: true },
  { id: "b4", user: "Win***33", stake: 50, multiplier: 22.8, won: true },
  { id: "b5", user: "Star***12", stake: 150, multiplier: 5.44, won: false },
  { id: "b6", user: "Pro***56", stake: 75, multiplier: 12.1, won: true }
];

// Generate random username display
export function generateUsername(): string {
  const prefixes = ["Player", "Lucky", "Bet", "Win", "Star", "Pro", "Ace", "King", "Max", "Nova"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `${prefix}***${suffix}`;
}

// Generate random bet amount
export function generateBetAmount(): number {
  const amounts = [5, 10, 25, 50, 100, 250, 500];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

// Format currency
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Get multiplier color class based on value
export function getMultiplierColorClass(multiplier: number): string {
  if (multiplier >= 10) return "history-mega";
  if (multiplier >= 5) return "history-high";
  if (multiplier >= 2) return "history-medium";
  return "history-low";
}

// Format time for display
export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
