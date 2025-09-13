"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"

interface RecentWin {
  id: string
  username: string
  gift_name: string
  gift_value: number
  timestamp: string
}

export function RecentWins() {
  const [recentWins, setRecentWins] = useState<RecentWin[]>([])

  useEffect(() => {
    const generateFakeWins = () => {
      const usernames = ["Alex", "Maria", "John", "Anna", "Mike", "Kate", "Tom", "Lisa"]
      const gifts = [
        { name: "🎁 Premium Gift", value: 5.2 },
        { name: "💎 Diamond Gift", value: 12.8 },
        { name: "🌟 Star Gift", value: 3.1 },
        { name: "🎪 Deluxe Gift", value: 8.7 },
        { name: "🎨 Artist Gift", value: 15.3 },
        { name: "🚀 Rocket Gift", value: 25.0 },
      ]

      const wins: RecentWin[] = []
      for (let i = 0; i < 10; i++) {
        const randomUser = usernames[Math.floor(Math.random() * usernames.length)]
        const randomGift = gifts[Math.floor(Math.random() * gifts.length)]
        wins.push({
          id: `win-${i}`,
          username: randomUser,
          gift_name: randomGift.name,
          gift_value: randomGift.value,
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        })
      }
      return wins
    }

    setRecentWins(generateFakeWins())

    const interval = setInterval(() => {
      setRecentWins(generateFakeWins())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <GlassCard className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-400 font-medium text-sm">Последние выигрыши</span>
      </div>

      <div className="space-y-2 max-h-32 overflow-hidden">
        {recentWins.slice(0, 4).map((win, index) => (
          <div
            key={win.id}
            className="flex items-center justify-between text-xs animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{win.username}</span>
              <span className="text-gray-400">выиграл</span>
              <span className="text-blue-400">{win.gift_name}</span>
            </div>
            <span className="text-yellow-400 font-medium">{win.gift_value} TON</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
