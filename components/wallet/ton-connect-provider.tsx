"use client"

import { TonConnectUIProvider } from "@tonconnect/ui-react"
import type { ReactNode } from "react"

interface TonConnectProviderProps {
  children: ReactNode
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  const manifestUrl =
    process.env.NODE_ENV === "production"
      ? "https://ton-mystery-cases.vercel.app/tonconnect-manifest.json"
      : "/tonconnect-manifest.json"

  return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>
}
