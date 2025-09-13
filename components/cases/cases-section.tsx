"use client"

import { useState, useEffect } from "react"
import { TelegramGiftsService } from "@/lib/telegram-gifts"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { CaseOpeningWheel } from "./case-opening-wheel"
import type { TelegramGift } from "@/types/telegram-gifts"

interface Case {
  id: string
  name: string
  price_ton: number
  image_url: string
  description: string
  case_rewards: Array<{
    probability: number
    telegram_gifts: TelegramGift
  }>
}

export function CasesSection() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [loading, setLoading] = useState(true)

  const giftsService = new TelegramGiftsService()

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await giftsService.getCases()
        setCases(data)
      } catch (error) {
        console.error("Failed to load cases:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [])

  const handleOpenCase = async (): Promise<TelegramGift> => {
    if (!selectedCase) throw new Error("No case selected")

    setIsOpening(true)
    try {
      // For demo purposes, we'll simulate case opening without user authentication
      // In production, you'd need proper user authentication
      const result = await giftsService.openCase(selectedCase.id, "demo-user")
      return result
    } finally {
      setIsOpening(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-white/10 rounded-lg" />
          </GlassCard>
        ))}
      </div>
    )
  }

  if (selectedCase) {
    const rewards = selectedCase.case_rewards.map((cr) => ({
      ...cr.telegram_gifts,
      probability: cr.probability,
    }))

    return (
      <div className="space-y-6">
        <Button onClick={() => setSelectedCase(null)} variant="ghost" className="text-gray-400 hover:text-white">
          ← Назад к кейсам
        </Button>

        <CaseOpeningWheel
          rewards={rewards}
          onOpen={handleOpenCase}
          isOpening={isOpening}
          caseName={selectedCase.name}
          casePrice={selectedCase.price_ton}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Mystery Cases</h1>
        <p className="text-gray-400">Открывай кейсы и получай подарки Telegram</p>
      </div>

      {/* Free vs Paid Tabs */}
      <div className="flex gap-2">
        <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3">Paid</Button>
        <Button variant="outline" className="flex-1 border-white/20 text-gray-400 rounded-2xl py-3 bg-transparent">
          Free
        </Button>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cases.map((caseItem) => (
          <GlassCard key={caseItem.id} className="p-4 cursor-pointer hover:bg-white/10 transition-colors">
            <button onClick={() => setSelectedCase(caseItem)} className="w-full text-left">
              <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <img
                  src={caseItem.image_url || "/placeholder.svg"}
                  alt={caseItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-white font-semibold">{caseItem.price_ton}</span>
                </div>

                <h3 className="text-white font-medium">{caseItem.name}</h3>
                <p className="text-gray-400 text-sm">{caseItem.description}</p>
              </div>
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
