"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame, MessageCircle, ShieldCheck } from "lucide-react";

import { FlamingoScene } from "@/components/game/FlamingoScene";
import { useGameSimulation } from "@/components/game/useGameSimulation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollAreaViewport, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialChat, topBets } from "@/lib/data";

const betPresets = [5, 25, 100, 250];

export default function Home() {
  const { phase, multiplier, countdown, history } = useGameSimulation();

  const formattedMultiplier = multiplier.toFixed(2);
  const statusText =
    phase === "waiting"
      ? `Next flight in ${countdown}s`
      : phase === "flying"
        ? "Flamingo is airborne"
        : "Flight ended";

  const statusTone =
    phase === "flying" ? "text-aqua-300" : phase === "waiting" ? "text-sun-400" : "text-flare-400";

  return (
    <div className="min-h-screen px-4 pb-10 pt-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-flare-500 text-white shadow-flare">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Flamingo Odds</p>
              <h1 className="font-display text-2xl">Aviator-style Flight</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="sun" className="badge-glow">
              Verified Fairness
            </Badge>
            <Button variant="secondary" size="sm">
              <ShieldCheck className="h-4 w-4" />
              Provably Fair
            </Button>
            <Button size="sm">
              Wallet 1,214.40
            </Button>
          </div>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="flex flex-col gap-4">
            <Card className="p-4">
              <CardHeader className="mb-4">
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Flight History
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flare-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-flare-500" />
                  </span>
                  Live feed
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((round) => {
                    const color =
                      round.multiplier >= 10
                        ? "text-flare-400"
                        : round.multiplier >= 2.5
                          ? "text-aqua-300"
                          : "text-slate-300";
                    return (
                      <div
                        key={round.id}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-midnight-800/60 px-3 py-2 text-sm"
                      >
                        <span className={`font-display ${color}`}>{round.multiplier.toFixed(2)}x</span>
                        <span className="text-xs text-slate-400">{round.time}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="flex flex-col gap-6">
            <Card className="relative overflow-hidden p-6">
              <div className="absolute inset-0 game-grid opacity-40" />
              <div className="absolute inset-0 bg-hero-glow" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="aqua">Round #109</Badge>
                    <p className={`text-sm font-semibold ${statusTone}`}>{statusText}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span className="rounded-full border border-white/10 px-3 py-1">Live</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">1.0s delay</span>
                  </div>
                </div>

                <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 bg-midnight-800/60">
                  <div className="absolute inset-0 bg-flare-glow opacity-60" />
                  <div className="absolute inset-0">
                    <FlamingoScene phase={phase} multiplier={multiplier} />
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Current multiplier
                    </p>
                    <p className="multiplier-text font-display text-6xl text-aqua-200">
                      {formattedMultiplier}x
                    </p>
                    <p className={`mt-2 text-sm ${statusTone}`}>{statusText}</p>
                  </div>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-midnight-800/70 px-4 py-2 text-xs text-slate-300 shadow-glass">
                    <span className="inline-flex h-2 w-2 rounded-full bg-aqua-300" />
                    Auto cash-out ready
                  </div>
                  <div className="absolute bottom-6 right-6 rounded-2xl bg-midnight-800/70 px-4 py-2 text-xs text-slate-300 shadow-glass">
                    Max multiplier today: 32.4x
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {["Primary Bet", "Side Bet"].map((label, index) => (
                <Card key={label} className="p-6">
                  <CardHeader>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <Badge variant={index === 0 ? "aqua" : "flare"}>Live</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Input defaultValue={index === 0 ? "5.00" : "2.50"} />
                      <div className="flex flex-col gap-2">
                        <Button variant="secondary" size="sm">
                          +
                        </Button>
                        <Button variant="secondary" size="sm">
                          -
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {betPresets.map((preset) => (
                        <Button key={preset} variant="ghost" size="sm">
                          {preset}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-midnight-800/70 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Auto cash-out
                        </p>
                        <p className="text-sm text-slate-200">2.50x target</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Potential win</span>
                      <span className="font-semibold text-aqua-200">12.50</span>
                    </div>
                    <Button variant={index === 0 ? "default" : "flare"} className="w-full">
                      Place bet
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <Card className="p-5">
              <CardHeader className="mb-4">
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Command Center
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MessageCircle className="h-4 w-4" />
                  Live chat and activity
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="chat">
                  <TabsList className="w-full justify-between">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="rounds">Rounds</TabsTrigger>
                    <TabsTrigger value="bets">Top Bets</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat">
                    <ScrollArea className="h-[280px]">
                      <ScrollAreaViewport className="space-y-4 pr-3">
                        {initialChat.map((message) => (
                          <div key={message.id} className="rounded-2xl border border-white/5 bg-midnight-800/60 p-3">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-semibold text-slate-200">{message.user}</span>
                              <span>{message.time}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-200">{message.message}</p>
                          </div>
                        ))}
                      </ScrollAreaViewport>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                    <div className="mt-4 flex gap-2">
                      <Input placeholder="Type your message" />
                      <Button size="sm">
                        Send
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="rounds">
                    <div className="space-y-3">
                      {history.slice(0, 6).map((round) => (
                        <div
                          key={round.id}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-midnight-800/60 px-4 py-3"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Round</p>
                            <p className="text-sm text-slate-200">{round.id}</p>
                          </div>
                          <span className="font-display text-lg text-aqua-200">
                            {round.multiplier.toFixed(2)}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="bets">
                    <div className="space-y-3">
                      {topBets.map((bet) => (
                        <div
                          key={bet.id}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-midnight-800/60 px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-100">{bet.user}</p>
                            <p className="text-xs text-slate-400">Stake {bet.stake}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-base text-flare-400">
                              {bet.multiplier.toFixed(1)}x
                            </p>
                            <p className="text-xs text-slate-400">Target</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="p-5">
              <CardHeader className="mb-4">
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Quick Stats
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Active players</span>
                  <span className="font-semibold text-slate-100">1,248</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Highest multiplier</span>
                  <span className="font-semibold text-flare-400">32.4x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Longest streak</span>
                  <span className="font-semibold text-aqua-300">8 rounds</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
