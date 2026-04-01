'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type MobileChatChromeValue = {
  /** True below the lg breakpoint when a thread is open (not the all-chats list). */
  activeMobileConversation: boolean
  setActiveMobileConversation: (active: boolean) => void
}

const MobileChatChromeContext = createContext<MobileChatChromeValue | null>(null)

export function MobileChatChromeProvider({ children }: { children: ReactNode }) {
  const [activeMobileConversation, setActive] = useState(false)
  const setActiveMobileConversation = useCallback((active: boolean) => {
    setActive(active)
  }, [])

  const value = useMemo(
    () => ({ activeMobileConversation, setActiveMobileConversation }),
    [activeMobileConversation, setActiveMobileConversation],
  )

  return (
    <MobileChatChromeContext.Provider value={value}>{children}</MobileChatChromeContext.Provider>
  )
}

export function useMobileChatChrome(): MobileChatChromeValue {
  const ctx = useContext(MobileChatChromeContext)
  if (!ctx) {
    return {
      activeMobileConversation: false,
      setActiveMobileConversation: () => {},
    }
  }
  return ctx
}
