"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  Send,
  Volume2,
  VolumeX,
  ChevronDown,
  Minus,
  Plus,
  Zap
} from "lucide-react";

import { FlamingoScene } from "@/components/game/FlamingoScene";
import { useGameSimulation } from "@/components/game/useGameSimulation";
import { initialChat, getMultiplierColorClass, formatCurrency } from "@/lib/data";

const BET_PRESETS = [5, 25, 50, 100];

interface BetPanelProps {
  panelId: string;
  phase: "waiting" | "flying" | "crashed";
  multiplier: number;
  onPlaceBet: (id: string, label: string, amount: number) => boolean;
  onCashOut: (id: string) => number | null;
  onCancel: (id: string) => boolean;
  activeBet?: {
    amount: number;
    cashedOut: boolean;
    cashoutMultiplier?: number;
  };
}

function BetPanel({ 
  panelId, 
  phase, 
  multiplier, 
  onPlaceBet, 
  onCashOut, 
  onCancel,
  activeBet 
}: BetPanelProps) {
  const [amount, setAmount] = useState(5);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState(2);
  const [hasBet, setHasBet] = useState(false);

  // Auto cashout logic
  useEffect(() => {
    if (autoCashout && hasBet && !activeBet?.cashedOut && phase === "flying") {
      if (multiplier >= autoCashoutValue) {
        const result = onCashOut(panelId);
        if (result) {
          setHasBet(false);
        }
      }
    }
  }, [multiplier, autoCashout, autoCashoutValue, hasBet, activeBet, phase, onCashOut, panelId]);

  // Reset bet state when round ends
  useEffect(() => {
    if (phase === "waiting") {
      setHasBet(false);
    }
  }, [phase]);

  const handlePlaceBet = () => {
    if (onPlaceBet(panelId, `Bet ${panelId}`, amount)) {
      setHasBet(true);
    }
  };

  const handleCashOut = () => {
    const result = onCashOut(panelId);
    if (result) {
      setHasBet(false);
    }
  };

  const handleCancel = () => {
    if (onCancel(panelId)) {
      setHasBet(false);
    }
  };

  const adjustAmount = (delta: number) => {
    setAmount(prev => Math.max(1, Math.min(10000, prev + delta)));
  };

  const potentialWin = hasBet && activeBet ? (activeBet.amount * multiplier).toFixed(2) : (amount * 2).toFixed(2);

  return (
    <div className="bet-panel p-4 space-y-3">
      {/* Amount input section */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => adjustAmount(-1)}
          className="w-9 h-9 flex items-center justify-center bg-[#0a1628]/80 border border-[#6ff0ff]/10 rounded-lg text-white/70 hover:text-white hover:border-[#6ff0ff]/30 transition"
          disabled={phase === "flying" && hasBet}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            className="bet-input w-full h-10 px-4 rounded-lg text-center text-lg font-mono"
            disabled={phase === "flying" && hasBet}
          />
        </div>
        
        <button 
          onClick={() => adjustAmount(1)}
          className="w-9 h-9 flex items-center justify-center bg-[#0a1628]/80 border border-[#6ff0ff]/10 rounded-lg text-white/70 hover:text-white hover:border-[#6ff0ff]/30 transition"
          disabled={phase === "flying" && hasBet}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick bet buttons */}
      <div className="flex gap-2">
        {BET_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className="quick-bet-btn flex-1"
            disabled={phase === "flying" && hasBet}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Main action button */}
      {phase === "waiting" && !hasBet && (
        <button 
          onClick={handlePlaceBet}
          className="btn-bet w-full h-12 rounded-lg text-sm font-bold"
        >
          BET
        </button>
      )}

      {phase === "waiting" && hasBet && (
        <button 
          onClick={handleCancel}
          className="btn-cancel w-full h-12 rounded-lg text-sm font-bold text-white"
        >
          CANCEL
        </button>
      )}

      {phase === "flying" && hasBet && !activeBet?.cashedOut && (
        <button 
          onClick={handleCashOut}
          className="btn-cashout w-full h-12 rounded-lg text-sm font-bold text-white"
        >
          CASH OUT {formatCurrency(amount * multiplier)}
        </button>
      )}

      {phase === "flying" && !hasBet && (
        <button 
          disabled
          className="btn-bet w-full h-12 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed"
        >
          WAITING FOR NEXT ROUND
        </button>
      )}

      {phase === "crashed" && (
        <button 
          disabled
          className="w-full h-12 rounded-lg text-sm font-bold bg-red-900/50 text-red-300/80 cursor-not-allowed border border-red-500/30"
        >
          {hasBet && !activeBet?.cashedOut ? "CRASHED! BET LOST" : "COLLISION - ROUND ENDED"}
        </button>
      )}

      {/* Auto cashout section */}
      <div className="flex items-center justify-between bg-[#0a1628]/60 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Auto Cash Out</span>
          <button
            onClick={() => setAutoCashout(!autoCashout)}
            className={`w-10 h-5 rounded-full transition-colors ${
              autoCashout ? "bg-[#6ff0ff]/40" : "bg-[#1a365d]/60"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
              autoCashout ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={autoCashoutValue}
            onChange={(e) => setAutoCashoutValue(Math.max(1.01, Number(e.target.value)))}
            step="0.1"
            className="w-16 h-7 bg-[#041020] border border-[#6ff0ff]/10 rounded text-center text-sm font-mono text-white"
          />
          <span className="text-xs text-white/60">x</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { 
    phase, 
    multiplier, 
    countdown, 
    history, 
    roundNumber,
    onlinePlayers,
    playerBets,
    bets,
    placeBet,
    cashOut,
    cancelBet,
    triggerCollision
  } = useGameSimulation();

  const [activeTab, setActiveTab] = useState<"all" | "my" | "top">("all");
  const [chatMessages, setChatMessages] = useState(initialChat);
  const [chatInput, setChatInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Send chat message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      user: "You",
      message: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
    
    // Scroll to bottom
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Get active bets for panels
  const getBetForPanel = (panelId: string) => {
    return bets.find(b => b.oddsId === panelId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#6ff0ff]/10 bg-[#041527]/90 backdrop-blur">
        <div className="flex items-center gap-6">
          <h1 className="header-logo">FLAMINGO</h1>
          
          {/* How to play / Rules */}
          <button className="hidden md:flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition">
            <span>How to Play</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sound toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-white/50 hover:text-white/80 transition"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          {/* Balance */}
          <div className="balance-display flex items-center gap-2">
            <span className="text-xs text-white/60">ETB</span>
            <span className="text-lg font-bold text-white">1,214.40</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left sidebar - History */}
        <aside className="hidden lg:flex flex-col w-[100px] border-r border-[#6ff0ff]/10 bg-[#041020]/80">
          <div className="p-2 border-b border-[#6ff0ff]/10">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-[10px] text-white/50">LIVE</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {history.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={idx === 0 ? { opacity: 0, y: -10 } : false}
                animate={{ opacity: 1, y: 0 }}
                className={`history-badge ${getMultiplierColorClass(entry.multiplier)}`}
              >
                {entry.multiplier.toFixed(2)}x
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Center - Game area */}
        <main className="flex-1 flex flex-col">
          {/* Game canvas */}
          <div className="relative flex-1 min-h-[350px] game-area overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 game-grid opacity-30" />
            
            {/* 3D Scene */}
            <div className="absolute inset-0">
              <FlamingoScene phase={phase} multiplier={multiplier} onCollision={triggerCollision} />
            </div>

            {/* Multiplier display - positioned lower to not hide flamingo */}
            <div className="absolute inset-x-0 bottom-8 flex items-end justify-center pointer-events-none pb-4">
              <AnimatePresence mode="wait">
                {phase === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center relative"
                  >
                    {/* Countdown pulse rings */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.div
                        key={countdown}
                        className="w-40 h-40 rounded-full border border-[#6ff0ff]/30"
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                    
                    <div className="text-sm text-[#6ff0ff]/80 mb-2 uppercase tracking-[0.3em]">
                      Next Flight
                    </div>
                    <motion.div 
                      className="multiplier-display text-7xl md:text-8xl text-white font-bold"
                      key={countdown}
                      initial={{ scale: 1.2, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {countdown}
                    </motion.div>
                    <motion.div 
                      className="mt-4 flex items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6ff0ff]/10 border border-[#6ff0ff]/20">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                        <span className="text-xs text-white/70">Round #{roundNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff4d92]/10 border border-[#ff4d92]/20">
                        <Zap className="w-3 h-3 text-[#ff4d92]" />
                        <span className="text-xs text-white/70">Place your bets!</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {phase === "flying" && (
                  <motion.div
                    key="flying"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    {/* Pulsing ring effect at high multipliers */}
                    {multiplier > 2 && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-48 h-48 rounded-full border-2"
                          style={{ 
                            borderColor: multiplier > 5 ? '#ff4d92' : '#6ff0ff',
                            boxShadow: `0 0 ${20 + multiplier * 3}px ${multiplier > 5 ? '#ff4d92' : '#6ff0ff'}`
                          }}
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className={`multiplier-display text-6xl md:text-8xl font-bold ${
                        multiplier > 10 ? 'text-[#ff4d92]' : 
                        multiplier > 5 ? 'text-[#ffd36b]' : 
                        'text-white'
                      }`}
                      animate={{ 
                        scale: multiplier > 5 ? [1, 1.05, 1] : [1, 1.02, 1]
                      }}
                      transition={{ 
                        duration: multiplier > 5 ? 0.2 : 0.3, 
                        repeat: Infinity 
                      }}
                    >
                      {multiplier.toFixed(2)}x
                    </motion.div>
                    
                    {/* Danger indicator */}
                    {multiplier > 2 && (
                      <motion.div 
                        className="mt-3 flex items-center justify-center gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Danger level dots */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.floor(multiplier / 2)) }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: i < 2 ? '#22c55e' : i < 4 ? '#ffd36b' : '#ff4d92' }}
                              animate={{ 
                                scale: [1, 1.4, 1],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{ 
                                duration: 0.3, 
                                repeat: Infinity,
                                delay: i * 0.08
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Status text */}
                        <motion.span 
                          className={`text-xs font-bold uppercase tracking-wider ${
                            multiplier > 10 ? 'text-[#ff4d92]' : 
                            multiplier > 5 ? 'text-[#ffd36b]' : 
                            'text-[#22c55e]'
                          }`}
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          {multiplier > 10 ? 'EXTREME DANGER!' : 
                           multiplier > 5 ? 'HIGH RISK!' : 
                           multiplier > 3 ? 'DODGING CROWS' : 
                           'FLYING...'}
                        </motion.span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {phase === "crashed" && (
                  <motion.div
                    key="crashed"
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative"
                  >
                    {/* Explosion rings */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      {[1, 2, 3].map((ring) => (
                        <motion.div
                          key={ring}
                          className="absolute w-32 h-32 rounded-full border-2 border-[#ff4d92]"
                          initial={{ scale: 0.5, opacity: 1 }}
                          animate={{ 
                            scale: [0.5, 2 + ring * 0.5],
                            opacity: [0.8, 0]
                          }}
                          transition={{ 
                            duration: 0.8,
                            delay: ring * 0.1,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </motion.div>
                    
                    <motion.div 
                      className="text-2xl text-[#ff4d92] mb-2 font-bold tracking-widest"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    >
                      COLLISION!
                    </motion.div>
                    <motion.div
                      className="text-sm text-white/60 mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Hit by a crow at
                    </motion.div>
                    <motion.div 
                      className="multiplier-display multiplier-crashed text-6xl md:text-7xl font-bold"
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                    >
                      {multiplier.toFixed(2)}x
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Online players indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#041527]/80 backdrop-blur rounded-full px-3 py-1.5">
              <Users className="w-4 h-4 text-[#6ff0ff]" />
              <span className="text-sm text-white/80">{onlinePlayers.toLocaleString()}</span>
            </div>

            {/* Round info */}
            <div className="absolute top-4 left-4 bg-[#041527]/80 backdrop-blur rounded-full px-3 py-1.5">
              <span className="text-xs text-white/60">Round #{roundNumber}</span>
            </div>
          </div>

          {/* Bet panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-[#041020]/90 border-t border-[#6ff0ff]/10">
            <BetPanel
              panelId="bet1"
              phase={phase}
              multiplier={multiplier}
              onPlaceBet={placeBet}
              onCashOut={cashOut}
              onCancel={cancelBet}
              activeBet={getBetForPanel("bet1")}
            />
            <BetPanel
              panelId="bet2"
              phase={phase}
              multiplier={multiplier}
              onPlaceBet={placeBet}
              onCashOut={cashOut}
              onCancel={cancelBet}
              activeBet={getBetForPanel("bet2")}
            />
          </div>
        </main>

        {/* Right sidebar - Bets & Chat */}
        <aside className="hidden xl:flex flex-col w-[320px] border-l border-[#6ff0ff]/10 bg-[#041020]/80">
          {/* Tabs */}
          <div className="flex border-b border-[#6ff0ff]/10">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 text-xs font-medium transition ${
                activeTab === "all" ? "tab-active" : "tab-inactive"
              }`}
            >
              All Bets ({playerBets.length})
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`flex-1 py-3 text-xs font-medium transition ${
                activeTab === "my" ? "tab-active" : "tab-inactive"
              }`}
            >
              My Bets
            </button>
            <button
              onClick={() => setActiveTab("top")}
              className={`flex-1 py-3 text-xs font-medium transition ${
                activeTab === "top" ? "tab-active" : "tab-inactive"
              }`}
            >
              Top
            </button>
          </div>

          {/* Bets list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: "200px" }}>
            {activeTab === "all" && playerBets.map((bet) => (
              <div 
                key={bet.id}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  bet.cashedOut ? "bg-[#22c55e]/10" : "bg-[#0a1628]/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/70">{bet.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/50">{bet.amount.toFixed(2)}</span>
                  {bet.cashedOut && (
                    <span className="text-[#22c55e] font-mono">
                      {bet.cashoutMultiplier?.toFixed(2)}x
                    </span>
                  )}
                  {bet.cashedOut && (
                    <span className="text-[#22c55e] font-bold">
                      {(bet.amount * (bet.cashoutMultiplier || 1)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {activeTab === "my" && (
              <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm">
                <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                <p>Your bets will appear here</p>
              </div>
            )}

            {activeTab === "top" && (
              <div className="space-y-2">
                {history.slice(0, 5).map((entry, idx) => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-[#0a1628]/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#ffd36b] font-bold">#{idx + 1}</span>
                      <span className="text-white/70">Round {entry.id}</span>
                    </div>
                    <span className={`font-mono font-bold ${getMultiplierColorClass(entry.multiplier).replace('history-', 'text-')}`}>
                      {entry.multiplier.toFixed(2)}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat section */}
          <div className="border-t border-[#6ff0ff]/10 flex flex-col" style={{ height: "280px" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#6ff0ff]/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#6ff0ff]" />
                <span className="text-xs font-medium text-white/80">Live Chat</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="online-dot" />
                <span className="text-[10px] text-white/50">{onlinePlayers} online</span>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-2"
            >
              {chatMessages.map((msg) => (
                <div key={msg.id} className="chat-message">
                  <div className="flex items-center justify-between mb-1">
                    <span className="chat-username">{msg.user}</span>
                    <span className="text-[10px] text-white/30">{msg.time}</span>
                  </div>
                  <p className="chat-text">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div className="p-3 border-t border-[#6ff0ff]/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-9 px-3 bg-[#0a1628]/80 border border-[#6ff0ff]/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[#6ff0ff]/30 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-9 h-9 flex items-center justify-center bg-[#6ff0ff]/20 hover:bg-[#6ff0ff]/30 border border-[#6ff0ff]/20 rounded-lg transition"
                >
                  <Send className="w-4 h-4 text-[#6ff0ff]" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile history bar - visible on smaller screens */}
      <div className="lg:hidden flex items-center gap-2 p-2 overflow-x-auto border-t border-[#6ff0ff]/10 bg-[#041020]/90">
        <div className="flex items-center gap-1 px-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[10px] text-white/50 whitespace-nowrap">HISTORY</span>
        </div>
        {history.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            className={`history-badge shrink-0 ${getMultiplierColorClass(entry.multiplier)}`}
          >
            {entry.multiplier.toFixed(2)}x
          </div>
        ))}
      </div>
    </div>
  );
}
