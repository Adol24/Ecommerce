'use client'

import { AuthProvider } from '@/hooks/useAuth'
import { RealtimeSyncProvider } from '@/components/providers/RealtimeSyncProvider'
import { StoreSettingsProvider } from '@/components/providers/StoreSettingsProvider'
import { ThemeColorInjector } from '@/components/providers/ThemeColorInjector'
import type { StoreSettings } from '@/lib/store-settings'

export function InsForgeProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode
  initialSettings?: StoreSettings
}) {
  return (
    <AuthProvider>
      <RealtimeSyncProvider>
        <StoreSettingsProvider initialSettings={initialSettings}>
          <ThemeColorInjector />
          {children}
        </StoreSettingsProvider>
      </RealtimeSyncProvider>
    </AuthProvider>
  )
}
