"use client"

import { useState, useEffect } from "react"
import { TonConnectProvider } from "@/components/wallet/ton-connect-provider"
import { WalletButton } from "@/components/wallet/wallet-button"
import { WalletOperations } from "@/components/wallet/wallet-operations"
import { CasesGrid } from "@/components/cases/cases-grid"
import { UserProfile } from "@/components/profile/user-profile"
import { InventoryGrid } from "@/components/inventory/inventory-grid"
import { TransactionHistory } from "@/components/profile/transaction-history"
import { ReferralSystem } from "@/components/referral/referral-system"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { telegramWebApp } from "@/lib/telegram"
import { apiClient } from "@/lib/api"
import type { TelegramUser, UserState, InventoryItem } from "@/types"
import { Coins, Package, Users, Settings, Loader2 } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [userState, setUserState] = useState<UserState>({
    tg_user: null,
    balance: 0,
    inventory: [],
    walletConnected: false,
    firstTime: true,
    totalEarned: 0,
    casesOpened: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("cases")

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setLoading(true)

      // Initialize Telegram WebApp
      const { user: tgUser, startParam } = await telegramWebApp.initialize()

      if (tgUser) {
        setUser(tgUser)
        setUserState((prev) => ({ ...prev, tg_user: tgUser }))

        // Try to initialize user with backend
        try {
          const response = await apiClient.initializeUser({
            tg_id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            init_data: telegramWebApp.getInitData(),
            referral_code: startParam,
          })

          if (response.success && response.data) {
            setUserState(response.data)
          } else {
            // Load from localStorage as fallback
            loadFromLocalStorage()
          }
        } catch (error) {
          console.error("[v0] Backend initialization failed:", error)
          loadFromLocalStorage()
        }
      } else {
        // Demo mode for development
        setUser({
          id: 12345,
          first_name: "Demo",
          last_name: "User",
          username: "demo_user",
        })
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error("[v0] App initialization error:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem("ton_user_state")
      if (saved) {
        const savedState = JSON.parse(saved)
        setUserState((prev) => ({ ...prev, ...savedState }))
      }
    } catch (error) {
      console.error("[v0] Failed to load from localStorage:", error)
    }
  }

  const saveToLocalStorage = (newState: UserState) => {
    try {
      localStorage.setItem("ton_user_state", JSON.stringify(newState))
    } catch (error) {
      console.error("[v0] Failed to save to localStorage:", error)
    }
  }

  const handleBalanceUpdate = (newBalance: number) => {
    const updatedState = { ...userState, balance: newBalance }
    setUserState(updatedState)
    saveToLocalStorage(updatedState)
  }

  const handleInventoryUpdate = (newItem: InventoryItem) => {
    const updatedState = {
      ...userState,
      inventory: [...userState.inventory, newItem],
      totalEarned: userState.totalEarned + newItem.value,
      casesOpened: userState.casesOpened + 1,
    }
    setUserState(updatedState)
    saveToLocalStorage(updatedState)
  }

  const handleFirstTimeUpdate = () => {
    const updatedState = { ...userState, firstTime: false }
    setUserState(updatedState)
    saveToLocalStorage(updatedState)
  }

  const handleWalletConnect = (address: string) => {
    const updatedState = {
      ...userState,
      walletConnected: true,
      walletAddress: address,
      balance: userState.balance + 0.2, // Welcome bonus
    }
    setUserState(updatedState)
    saveToLocalStorage(updatedState)
  }

  const handleWalletDisconnect = () => {
    const updatedState = {
      ...userState,
      walletConnected: false,
      walletAddress: undefined,
    }
    setUserState(updatedState)
    saveToLocalStorage(updatedState)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">TON Mystery Cases</h2>
            <p className="text-muted-foreground">Загрузка приложения...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-bold mb-2">TON Mystery Cases</h2>
            <p className="text-muted-foreground text-center">Откройте приложение в Telegram для полного функционала</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TonConnectProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TON Mystery Cases
                  </CardTitle>
                  <CardDescription>Добро пожаловать, {user.first_name}!</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-400">{userState.balance.toFixed(2)} TON</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WalletButton onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} className="w-full" />
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="cases" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Кейсы
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Профиль
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Инвентарь
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Рефералы
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              <CasesGrid
                userId={user.id}
                userBalance={userState.balance}
                isFirstTime={userState.firstTime}
                onBalanceUpdate={handleBalanceUpdate}
                onInventoryUpdate={handleInventoryUpdate}
                onFirstTimeUpdate={handleFirstTimeUpdate}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <UserProfile user={user} userState={userState} />
              <WalletOperations userId={user.id} balance={userState.balance} onBalanceUpdate={handleBalanceUpdate} />
              <TransactionHistory userId={user.id} />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <InventoryGrid inventory={userState.inventory} />
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              <ReferralSystem userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TonConnectProvider>
  )
}
