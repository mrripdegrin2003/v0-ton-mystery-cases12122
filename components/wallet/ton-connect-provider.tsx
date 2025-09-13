"use client"

import { TonConnectUIProvider } from "@tonconnect/ui-react"
import type { ReactNode } from "react"

interface TonConnectProviderProps {
  children: ReactNode
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">{children}</TonConnectUIProvider>
}
