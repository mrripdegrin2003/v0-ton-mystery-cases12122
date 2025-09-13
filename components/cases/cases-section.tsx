"use client"

import { useState, useEffect } from "react"
import { TelegramGiftsService } from "@/lib/telegram-gifts"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { CaseOpeningWheel } from "./case-opening-wheel"
import { RecentWins } from "./recent-wins"
import type { TelegramGift } from "@/types/telegram-gifts"
import type { TelegramUser } from "@/types"

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

interface CasesSectionProps {
  user: TelegramUser | null
  balance: number
  onBalanceUpdate: (newBalance: number) => void
  onInventoryUpdate: (newItem: any) => void
}

export function CasesSection({ user, balance, onBalanceUpdate, onInventoryUpdate }: CasesSectionProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"paid" | "free">("paid")

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

    if (balance < selectedCase.price_ton) {
      throw new Error("Недостаточно средств")
    }

    setIsOpening(true)
    try {
      const result = await giftsService.openCase(selectedCase.id, user?.id.toString() || "demo-user")

      onBalanceUpdate(balance - selectedCase.price_ton)
      onInventoryUpdate({
        id: Date.now(),
        gift: result,
        opened_at: new Date().toISOString(),
        case_name: selectedCase.name,
      })

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
          userBalance={balance}
        />
      </div>
    )
  }

  const filteredCases = cases.filter((caseItem) =>
    activeTab === "free" ? caseItem.price_ton === 0 : caseItem.price_ton > 0,
  )

  return (
    <div className="space-y-6">
      <RecentWins />

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Mystery Cases</h1>
        <p className="text-gray-400">Открывай кейсы и получай НФТ подарки Telegram</p>
      </div>

      <div className="flex gap-2 bg-gray-800/50 p-1 rounded-2xl">
        <Button
          onClick={() => setActiveTab("paid")}
          className={`flex-1 rounded-xl py-3 transition-all ${
            activeTab === "paid"
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Платные
        </Button>
        <Button
          onClick={() => setActiveTab("free")}
          className={`flex-1 rounded-xl py-3 transition-all ${
            activeTab === "free"
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Бесплатные
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="relative">
            <GlassCard className="p-4 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/10">
              <button onClick={() => setSelectedCase(caseItem)} className="w-full text-left">
                <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative">
                  <img
                    src={caseItem.image_url || "/placeholder.svg?height=120&width=120&query=mystery case gift box"}
                    alt={caseItem.name}
                    className="w-full h-full object-cover"
                  />
                  {caseItem.price_ton > 1 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="text-white font-semibold">
                        {caseItem.price_ton === 0 ? "FREE" : `${caseItem.price_ton} TON`}
                      </span>
                    </div>
                    {caseItem.price_ton > balance && caseItem.price_ton > 0 && (
                      <span className="text-red-400 text-xs">Недостаточно</span>
                    )}
                  </div>

                  <h3 className="text-white font-medium text-sm">{caseItem.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2">{caseItem.description}</p>
                </div>
              </button>
            </GlassCard>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {activeTab === "free" ? "Бесплатные кейсы скоро появятся!" : "Платные кейсы загружаются..."}
          </p>
        </div>
      )}
    </div>
  )
}
