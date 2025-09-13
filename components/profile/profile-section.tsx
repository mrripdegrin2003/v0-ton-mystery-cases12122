"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Users, Package, TrendingUp, Gift, Copy, Check } from "lucide-react"
import { useTelegramHaptics } from "@/hooks/use-telegram-haptics"
import type { TelegramGift } from "@/types/telegram-gifts"

interface UserProfile {
  id: string
  username?: string
  first_name?: string
  avatar_url?: string
  ton_balance: number
}

interface UserStats {
  total_cases_opened: number
  total_spent: number
  total_won_value: number
  upgrade_attempts: number
  successful_upgrades: number
  inventory_count: number
}

interface InventoryItem {
  id: string
  gift_id: string
  quantity: number
  telegram_gifts: TelegramGift
}

export function ProfileSection() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)

  const supabase = createClient()
  const { triggerImpact, triggerNotification } = useTelegramHaptics()

  useEffect(() => {
    loadUserData()
    generateReferralCode()
  }, [])

  const loadUserData = async () => {
    try {
      // For demo purposes, using mock data
      // In production, you'd get the authenticated user
      const mockUser: UserProfile = {
        id: "demo-user",
        username: "demo_user",
        first_name: "Demo",
        avatar_url: "/placeholder.svg?height=80&width=80",
        ton_balance: 2.45,
      }

      const mockStats: UserStats = {
        total_cases_opened: 15,
        total_spent: 8.5,
        total_won_value: 12.3,
        upgrade_attempts: 5,
        successful_upgrades: 2,
        inventory_count: 23,
      }

      setUser(mockUser)
      setStats(mockStats)

      // Load inventory
      const { data: inventoryData } = await supabase
        .from("user_inventory")
        .select(`
          *,
          telegram_gifts (*)
        `)
        .eq("user_id", "demo-user")
        .order("acquired_at", { ascending: false })

      setInventory(inventoryData || [])
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }

  const generateReferralCode = () => {
    // Generate a simple referral code
    const code = `TON${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setReferralCode(code)
  }

  const handleConnectWallet = async () => {
    setIsConnectingWallet(true)
    triggerImpact("medium")

    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 2000))
      triggerNotification("success")
    } catch (error) {
      triggerNotification("error")
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(`https://t.me/tonmysterycases_bot?start=${referralCode}`)
      setCopied(true)
      triggerImpact("light")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (!user || !stats) {
    return (
      <div className="space-y-4">
        <GlassCard className="p-6 animate-pulse">
          <div className="h-20 bg-white/10 rounded-lg" />
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.first_name || "User"} />
            <AvatarFallback className="bg-blue-500 text-white text-xl">
              {user.first_name?.[0] || user.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user.first_name || user.username || "Anonymous"}</h2>
            <p className="text-gray-400">@{user.username || "anonymous"}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Баланс</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <span className="text-white text-2xl font-bold">{user.ton_balance.toFixed(2)} TON</span>
              </div>
            </div>
            <Button
              onClick={handleConnectWallet}
              disabled={isConnectingWallet}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              {isConnectingWallet ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Подключение...
                </div>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Подключить кошелек
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Package className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-white font-semibold">{stats.inventory_count}</p>
            <p className="text-gray-400 text-xs">Предметов</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-white font-semibold">{stats.total_cases_opened}</p>
            <p className="text-gray-400 text-xs">Кейсов открыто</p>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-2xl p-1">
          <TabsTrigger
            value="inventory"
            className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Инвентарь
          </TabsTrigger>
          <TabsTrigger
            value="referrals"
            className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Рефералы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Мой инвентарь</h3>
              <Badge variant="secondary">{inventory.length} предметов</Badge>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Инвентарь пуст</p>
                <p className="text-gray-500 text-sm">Открывайте кейсы, чтобы получить предметы</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {inventory.map((item) => {
                  const rarityColors = {
                    common: "border-gray-500/30 bg-gray-500/10",
                    rare: "border-blue-500/30 bg-blue-500/10",
                    epic: "border-purple-500/30 bg-purple-500/10",
                    legendary: "border-yellow-500/30 bg-yellow-500/10",
                  }

                  return (
                    <div
                      key={item.id}
                      className={`relative p-3 rounded-xl border ${
                        rarityColors[item.telegram_gifts.rarity as keyof typeof rarityColors]
                      }`}
                    >
                      <img
                        src={
                          item.telegram_gifts.image ||
                          `/placeholder.svg?height=64&width=64&query=${item.telegram_gifts.name || "/placeholder.svg"}`
                        }
                        alt={item.telegram_gifts.name}
                        className="w-16 h-16 mx-auto rounded-lg mb-2"
                      />
                      <p className="text-white text-xs font-medium text-center mb-1 truncate">
                        {item.telegram_gifts.name}
                      </p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">T</span>
                        </div>
                        <span className="text-blue-400 text-xs">{item.telegram_gifts.price_ton}</span>
                      </div>
                      {item.quantity > 1 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{item.quantity}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>

          {/* Detailed Stats */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Статистика</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Потрачено всего:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-white font-semibold">{stats.total_spent.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Стоимость инвентаря:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-white font-semibold">{stats.total_won_value.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Успешных апгрейдов:</span>
                <span className="text-white font-semibold">
                  {stats.successful_upgrades}/{stats.upgrade_attempts}
                </span>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <GlassCard className="p-6">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Реферальная программа</h3>
              <p className="text-gray-400 text-sm">Зарабатывайте 10% от депозитов ваших друзей</p>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Заработано с рефералов</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <span className="text-white text-2xl font-bold">0.00 TON</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-white font-medium mb-2">Ваша реферальная ссылка:</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-blue-400 text-sm font-mono truncate">
                      https://t.me/tonmysterycases_bot?start={referralCode}
                    </p>
                  </div>
                  <Button onClick={copyReferralCode} size="sm" className="bg-blue-500 hover:bg-blue-600 rounded-xl">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white text-xl font-bold">0</p>
                  <p className="text-gray-400 text-sm">Приглашено друзей</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white text-xl font-bold">10%</p>
                  <p className="text-gray-400 text-sm">Комиссия</p>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl py-3">
                <Users className="w-5 h-5 mr-2" />
                Пригласить друзей
              </Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
