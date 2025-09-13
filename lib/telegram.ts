import type { TelegramUser } from "@/types"

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void
        expand(): void
        close(): void
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
          start_param?: string
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          show(): void
          hide(): void
          enable(): void
          disable(): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
        }
        HapticFeedback: {
          impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void
          notificationOccurred(type: "error" | "success" | "warning"): void
          selectionChanged(): void
        }
        showAlert(message: string): void
        showConfirm(message: string, callback: (confirmed: boolean) => void): void
      }
    }
  }
}

export class TelegramWebApp {
  private static instance: TelegramWebApp
  private isInitialized = false

  static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp()
    }
    return TelegramWebApp.instance
  }

  initialize(): Promise<{ user: TelegramUser | null; startParam?: string }> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve({ user: null })
        return
      }

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()

        const user = window.Telegram.WebApp.initDataUnsafe.user || null
        const startParam = window.Telegram.WebApp.initDataUnsafe.start_param

        this.isInitialized = true
        console.log("[v0] Telegram WebApp initialized:", { user, startParam })

        resolve({ user, startParam })
      } else {
        console.log("[v0] Telegram WebApp not available")
        resolve({ user: null })
      }
    })
  }

  getInitData(): string {
    return window.Telegram?.WebApp.initData || ""
  }

  showAlert(message: string): void {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showConfirm(message, resolve)
      } else {
        resolve(confirm(message))
      }
    })
  }

  hapticFeedback(type: "light" | "medium" | "heavy" | "success" | "error" | "warning" = "light"): void {
    if (window.Telegram?.WebApp.HapticFeedback) {
      if (type === "success" || type === "error" || type === "warning") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type)
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type)
      }
    }
  }

  close(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close()
    }
  }

  isAvailable(): boolean {
    return !!window.Telegram?.WebApp && this.isInitialized
  }
}

export const telegramWebApp = TelegramWebApp.getInstance()
