"use client"

import { useState, useEffect } from "react"
import { TelegramGiftsService } from "@/lib/telegram-gifts"
import type { OnlineStats } from "@/types/telegram-gifts"
import { GlassCard } from "@/components/ui/glass-card"
import { Users, Trophy } from "lucide-react"

export function OnlineStatsWidget() {
  const [stats, setStats] = useState<OnlineStats | null>(null)
  const giftsService = new TelegramGiftsService()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await giftsService.getOnlineStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to load stats:", error)
      }
    }

    loadStats()

    // Update stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  return (
    <div className="space-y-4">
      {/* Online Users */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <Users className="w-5 h-5 text-green-400" />
          <span className="text-white font-medium">{stats.online_users} онлайн</span>
        </div>
      </GlassCard>

      {/* Recent Wins */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-medium">Последние выигрыши</span>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {stats.recent_wins.slice(0, 5).map((win) => (
            <div key={win.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <img src={win.gift.image || "/placeholder.svg"} alt={win.gift.name} className="w-8 h-8 rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{win.username}</p>
                <p className="text-xs text-gray-400">
                  {win.upgrade ? "Upgrade" : win.case_name} • {win.gift.price_ton} TON
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
