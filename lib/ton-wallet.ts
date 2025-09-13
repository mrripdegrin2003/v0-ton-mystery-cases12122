import { type TonConnect, TonConnectUI } from "@tonconnect/ui-react"

export class TONWalletManager {
  private tonConnect: TonConnect | null = null
  private tonConnectUI: TonConnectUI | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeTonConnect()
    }
  }

  private async initializeTonConnect() {
    try {
      this.tonConnectUI = new TonConnectUI({
        manifestUrl: "/tonconnect-manifest.json",
        buttonRootId: "ton-connect-button",
      })

      // Listen for wallet connection changes
      this.tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
          console.log("[v0] Wallet connected:", wallet.account.address)
        } else {
          console.log("[v0] Wallet disconnected")
        }
      })
    } catch (error) {
      console.error("[v0] Failed to initialize TON Connect:", error)
    }
  }

  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!this.tonConnectUI) {
        throw new Error("TON Connect UI not initialized")
      }

      const connectedWallet = await this.tonConnectUI.connectWallet()

      if (connectedWallet) {
        return {
          success: true,
          address: connectedWallet.account.address,
        }
      }

      return { success: false, error: "Connection cancelled" }
    } catch (error) {
      console.error("[v0] Wallet connection error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (this.tonConnectUI) {
        await this.tonConnectUI.disconnect()
      }
    } catch (error) {
      console.error("[v0] Wallet disconnection error:", error)
    }
  }

  async sendTransaction(
    to: string,
    amount: number,
    comment?: string,
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      if (!this.tonConnectUI?.wallet) {
        throw new Error("Wallet not connected")
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: to,
            amount: (amount * 1e9).toString(), // Convert to nanotons
            payload: comment ? btoa(comment) : undefined,
          },
        ],
      }

      const result = await this.tonConnectUI.sendTransaction(transaction)

      return {
        success: true,
        hash: result.boc,
      }
    } catch (error) {
      console.error("[v0] Transaction error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      }
    }
  }

  getConnectedWallet() {
    return this.tonConnectUI?.wallet || null
  }

  isConnected(): boolean {
    return !!this.tonConnectUI?.wallet
  }

  getAddress(): string | null {
    return this.tonConnectUI?.wallet?.account.address || null
  }
}

// Singleton instance
export const tonWalletManager = new TONWalletManager()
