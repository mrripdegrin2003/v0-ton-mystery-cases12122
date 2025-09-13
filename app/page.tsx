"use client"

import { useState, useEffect } from "react"
import { TonConnectProvider } from "@/components/wallet/ton-connect-provider"
import { CasesSection } from "@/components/cases/cases-section"
import { UpgradeSection } from "@/components/upgrade/upgrade-section"
import { ProfileSection } from "@/components/profile/profile-section"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { OnlineStats } from "@/components/stats/online-stats"
import { telegramWebApp } from "@/lib/telegram"
import { createClient } from "@/lib/supabase/client"
import type { TelegramUser } from "@/types"

export default function HomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [activeTab, setActiveTab] = useState<"cases" | "upgrade" | "profile">("cases")
  const [balance, setBalance] = useState(0)
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeApp()

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.disableVerticalSwipes?.()
      window.Telegram.WebApp.expand()

      // Убираем кнопку закрытия в правом верхнем углу
      const style = document.createElement("style")
      style.textContent = `
        .tgme_widget_login_button { display: none !important; }
        .tg-spoiler { display: none !important; }
      `
      document.head.appendChild(style)
    }
  }, [])

  const initializeApp = async () => {
    try {
      console.log("[v0] Initializing Telegram WebApp...")

      const { user: tgUser } = await telegramWebApp.initialize()

      if (tgUser && window.Telegram?.WebApp.initData) {
        console.log("[v0] Real Telegram user detected:", tgUser)
        setUser(tgUser)
        await initializeUserInDatabase(tgUser)
      } else {
        console.log("[v0] Demo mode - no Telegram data")
        // Demo mode для тестирования
        const demoUser = {
          id: 12345,
          first_name: "Demo",
          last_name: "User",
          username: "demo_user",
        }
        setUser(demoUser)
        await initializeUserInDatabase(demoUser)
      }
    } catch (error) {
      console.error("[v0] App initialization error:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeUserInDatabase = async (tgUser: TelegramUser) => {
    try {
      const supabase = createClient()

      const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", tgUser.id).single()

      if (!existingUser) {
        console.log("[v0] Creating new user in database")
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            telegram_id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            balance: 0, // Начальный баланс 0
            is_online: true,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        setBalance(0)
      } else {
        console.log("[v0] Existing user found, updating online status")
        await supabase
          .from("users")
          .update({
            is_online: true,
            last_seen: new Date().toISOString(),
          })
          .eq("telegram_id", tgUser.id)

        setBalance(existingUser.balance || 0)
      }

      const { data: userInventory } = await supabase
        .from("user_inventory")
        .select(`
          *,
          telegram_gifts (
            id,
            name,
            emoji,
            price_ton,
            rarity,
            image_url
          )
        `)
        .eq("user_id", tgUser.id)

      console.log("[v0] User inventory loaded:", userInventory)
      setInventory(userInventory || [])
    } catch (error) {
      console.error("[v0] Database initialization error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <TonConnectProvider>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Header with balance */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-white font-medium">{balance.toFixed(2)} TON</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
          </div>
        </div>

        <OnlineStats />

        {/* Main content */}
        <div className="relative z-10 px-4 pb-24">
          {activeTab === "cases" && (
            <CasesSection
              user={user}
              balance={balance}
              onBalanceUpdate={setBalance}
              onInventoryUpdate={(newItem) => setInventory((prev) => [...prev, newItem])}
            />
          )}

          {activeTab === "upgrade" && (
            <UpgradeSection
              user={user}
              inventory={inventory}
              balance={balance}
              onBalanceUpdate={setBalance}
              onInventoryUpdate={setInventory}
            />
          )}

          {activeTab === "profile" && (
            <ProfileSection user={user} balance={balance} inventory={inventory} onBalanceUpdate={setBalance} />
          )}
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </TonConnectProvider>
  )
}
