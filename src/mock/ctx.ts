import { createContext, useContext, useEffect, useRef } from 'react'
import type { Scenario, ScreenId } from './data'

export type AuthKind = 'over14' | 'under14' | 'overseas'
export type ConvType = 'merged' | 'creator' | 'donor'

export type Account = { pw: string; nick: string; tag: string; twoFA?: boolean; joined: string; status?: '정상' | '탈퇴유예' }

export type Session = {
  accounts: Record<string, Account>
  converted: boolean
  authPurpose: 'signup' | 'conv' | 'findId' | 'findPw'
  authKind?: AuthKind
  convType?: ConvType
  convPlatform: string
  convIds: { creator?: string; donor?: string }
  convToonId?: string
  nickname: string
  createdId?: string
  findPwTarget?: string
  loggedIn?: string
  overseasSends: number
  overseasNumber?: string
  findIdEmpty?: boolean
  pendingLogin?: string
  tfaMethod: 'phone' | 'email'
  linked: Record<string, string>
}

export type PassOutcome = { label: string; value: string; tone?: 'ok' | 'fail' }
export type PassReq = { title: string; desc: string; outcomes?: PassOutcome[]; onResult: (v: string) => void }
export type OAuthReq = { platform: string; outcomes: PassOutcome[]; onResult: (v: string) => void }
export type AlertReq = { msg: string; onOk?: () => void }

export type Ctx = {
  scenario: Scenario
  variant: string
  session: Session
  patch: (p: Partial<Session>) => void
  go: (s: ScreenId, note?: string) => void
  back: () => void
  toast: (m: string) => void
  alert: (a: AlertReq) => void
  pass: (p: PassReq) => void
  oauth: (o: OAuthReq) => void
  sim: { event: string; n: number }
  log: (m: string) => void
}

export const MockCtx = createContext<Ctx | null>(null)
export const useMock = () => {
  const c = useContext(MockCtx)
  if (!c) throw new Error('no ctx')
  return c
}

/** run handler whenever the sidebar fires a simulation event */
export function useSim(handler: (event: string) => void) {
  const { sim } = useMock()
  const ref = useRef(handler)
  ref.current = handler
  const seen = useRef(sim.n)
  useEffect(() => {
    if (sim.n !== seen.current) {
      seen.current = sim.n
      ref.current(sim.event)
    }
  }, [sim])
}
