import { useCallback, useMemo, useRef, useState } from 'react'
import { TEST, type Scenario, type ScreenId } from './data'
import { MockCtx, type AlertReq, type Ctx, type OAuthReq, type PassReq, type Session } from './ctx'
import { SCREENS } from './screens'
import { Btn, Modal, PLATFORMS, PlatformDot, Toast } from './ui'

function freshSession(sc: Scenario): Session {
  return {
    accounts: {
      [TEST.id]: { pw: TEST.pw, nick: '송송송', tag: 'a23b7c', joined: '2022-04-08', twoFA: sc.id === 'B2', status: '정상' },
      tunaking: { pw: TEST.pw, nick: '참치왕', tag: 'k9t2x1', joined: '2025-12-12', status: '정상' },
      yam34song: { pw: TEST.pw, nick: '얌송', tag: 'y34s0n', joined: '2022-04-08', status: '정상' },
      yam12song: { pw: TEST.pw, nick: '얌얌', tag: 'y12s0n', joined: '2024-01-10', status: '탈퇴유예' },
    },
    converted: sc.group === 'B' || sc.group === 'D' || sc.group === 'A',
    authPurpose: 'signup',
    convPlatform: 'youtube',
    convIds: {},
    nickname: '',
    overseasSends: 0,
    tfaMethod: 'phone',
    linked: {},
  }
}

type LogItem = { t: string; screen: ScreenId; note?: string }

export function Runner({ scenario, variant, onVariant, onExit }: { scenario: Scenario; variant: string; onVariant: (v: string) => void; onExit: () => void }) {
  const [hist, setHist] = useState<ScreenId[]>(['login'])
  const [session, setSession] = useState<Session>(() => freshSession(scenario))
  const [stepIdx, setStepIdx] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [alertReq, setAlertReq] = useState<AlertReq | null>(null)
  const [passReq, setPassReq] = useState<PassReq | null>(null)
  const [oauthReq, setOauthReq] = useState<OAuthReq | null>(null)
  const [sim, setSim] = useState({ event: '', n: 0 })
  const [log, setLog] = useState<LogItem[]>([{ t: stamp(), screen: 'login', note: '케이스 시작' }])
  const [epoch, setEpoch] = useState(0)
  const toastTimer = useRef<number | undefined>(undefined)
  const screen = hist[hist.length - 1]
  const steps = scenario.steps

  const locate = useCallback(
    (s: ScreenId, from: number) => {
      const c = steps.map((st, i) => (st.screens.includes(s) ? i : -1)).filter((i) => i >= 0)
      if (!c.length) return from
      return c.sort((a, b) => Math.abs(a - from) - Math.abs(b - from) || b - a)[0]
    },
    [steps],
  )

  const pushLog = (screen: ScreenId, note?: string) => setLog((l) => [{ t: stamp(), screen, note }, ...l].slice(0, 60))

  const go = useCallback(
    (s: ScreenId, note?: string) => {
      setHist((h) => [...h, s])
      setStepIdx((cur) => {
        const n = locate(s, cur)
        setMaxStep((m) => Math.max(m, n))
        return n
      })
      pushLog(s, note)
    },
    [locate],
  )
  const back = useCallback(() => {
    setHist((h) => {
      if (h.length < 2) return h
      const nh = h.slice(0, -1)
      const s = nh[nh.length - 1]
      setStepIdx((cur) => locate(s, cur))
      pushLog(s, '뒤로가기')
      return nh
    })
  }, [locate])

  const toast = useCallback((m: string) => {
    setToastMsg(m)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const reset = () => {
    setHist(['login'])
    setSession(freshSession(scenario))
    setStepIdx(0)
    setMaxStep(0)
    setLog([{ t: stamp(), screen: 'login', note: '처음부터 다시' }])
    setEpoch((e) => e + 1)
  }

  const ctx: Ctx = useMemo(
    () => ({
      scenario,
      variant,
      session,
      patch: (p) => setSession((s) => ({ ...s, ...p })),
      go,
      back,
      toast,
      alert: setAlertReq,
      pass: setPassReq,
      oauth: setOauthReq,
      sim,
      log: (m) => pushLog(screen, m),
    }),
    [scenario, variant, session, go, back, toast, sim, screen],
  )

  const S = SCREENS[screen]
  const cur = steps[stepIdx]
  const done = stepIdx === steps.length - 1 && maxStep === steps.length - 1 && hist.length > 1
  const fire = (event: string) => setSim((x) => ({ event, n: x.n + 1 }))

  return (
    <div className="grid min-h-full gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* -------- scenario panel -------- */}
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-4">
          <button type="button" onClick={onExit} className="self-start text-[12.5px] font-medium text-mute hover:text-ink">
            ← 케이스 선택으로
          </button>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[12px] font-semibold text-accent">{scenario.code}</span>
            <h2 className="text-[17px] font-bold leading-snug text-ink [text-wrap:balance]">{scenario.title}</h2>
            <p className="text-[12.5px] text-mute">{scenario.condition}</p>
          </div>
          {scenario.variants && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">하위 케이스 · 변경 시 처음부터</span>
              <div className="flex flex-wrap gap-1.5">
                {scenario.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      if (v.id === variant) return
                      onVariant(v.id)
                    }}
                    className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${v.id === variant ? 'border-accent bg-accent-soft text-accent' : 'border-line text-mute hover:text-ink'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-mute">{scenario.variants.find((v) => v.id === variant)?.desc}</p>
            </div>
          )}
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-[12.5px] leading-snug text-ink">{scenario.hint}</p>
        </div>

        <ol className="flex flex-col rounded-xl border border-line bg-panel p-2">
          {steps.map((st, i) => {
            const state = i === stepIdx ? 'now' : i <= maxStep ? 'done' : 'todo'
            return (
              <li key={i} className={`flex flex-col gap-2 rounded-lg px-2.5 py-2 ${state === 'now' ? 'bg-accent-soft' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-[22px] shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold ${
                      state === 'now' ? 'bg-accent text-on-accent' : state === 'done' ? 'bg-ok-soft text-ok' : 'border border-line text-faint'
                    }`}
                  >
                    {state === 'done' ? '✓' : i + 1}
                  </span>
                  <span className={`min-w-0 flex-1 text-[13.5px] ${state === 'todo' ? 'text-mute' : 'font-semibold text-ink'}`}>{st.title}</span>
                  <span className="shrink-0 font-mono text-[11px] text-faint">{st.page}</span>
                </div>
                {state === 'now' && (
                  <div className="flex flex-col gap-2 pl-[32px]">
                    <ul className="flex flex-col gap-1">
                      {st.checks.map((ch) => (
                        <li key={ch} className="flex gap-1.5 text-[12.5px] leading-snug text-mute">
                          <span className="text-accent">·</span>
                          {ch}
                        </li>
                      ))}
                    </ul>
                    {st.sims && (
                      <div className="flex flex-wrap gap-1.5">
                        {st.sims.map((s) => (
                          <button key={s.event} type="button" onClick={() => fire(s.event)} className="rounded-md border border-warn/40 bg-warn-soft px-2 py-1 text-[11.5px] font-semibold text-warn hover:border-warn">
                            ⚡ {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-2 rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">테스트 데이터</span>
            {screen === 'login' && (
              <button type="button" onClick={() => fire('fillLogin')} className="text-[12px] font-semibold text-accent hover:underline">
                로그인 정보 채우기
              </button>
            )}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
            <dt className="text-faint">ID</dt>
            <dd className="text-ink">{TEST.id}</dd>
            <dt className="text-faint">PW</dt>
            <dd className="text-ink">{session.accounts[TEST.id]?.pw}</dd>
            <dt className="text-faint">인증번호</dt>
            <dd className="text-ink">{TEST.code}</dd>
            {session.createdId && (
              <>
                <dt className="text-faint">생성 ID</dt>
                <dd className="text-ink">
                  {session.createdId} / {session.accounts[session.createdId]?.pw}
                </dd>
              </>
            )}
          </dl>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-line bg-panel p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">진행 기록</span>
          <ul className="flex max-h-44 flex-col gap-1 overflow-y-auto">
            {log.map((l, i) => (
              <li key={i} className="flex gap-2 text-[12px] leading-snug">
                <span className="shrink-0 font-mono tabular-nums text-faint">{l.t}</span>
                <span className="min-w-0 text-mute">
                  <b className="font-semibold text-ink">{SCREENS[l.screen].name}</b>
                  {l.note && ` · ${l.note}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* -------- device -------- */}
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-[13px]">
            <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11.5px] font-semibold text-bg">{cur?.page}</span>
            <span className="truncate font-semibold text-ink">{S.name}</span>
            {done && <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[12px] font-semibold text-ok">시나리오 완료</span>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={back} disabled={hist.length < 2} className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-mute hover:text-ink disabled:opacity-40">
              이전 화면
            </button>
            <button type="button" onClick={reset} className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-mute hover:text-ink">
              처음부터
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-[0_30px_60px_-30px_rgba(10,20,60,.35)]">
          <div className="flex items-center gap-3 border-b border-line px-3 py-2">
            <span className="flex gap-1.5" aria-hidden>
              <i className="size-2.5 rounded-full bg-[#FF5F57]" />
              <i className="size-2.5 rounded-full bg-[#FEBC2E]" />
              <i className="size-2.5 rounded-full bg-[#28C840]" />
            </span>
            <span className="min-w-0 flex-1 truncate rounded-md bg-bg px-3 py-1 font-mono text-[11.5px] text-mute">{S.path}</span>
          </div>
          <div className="relative min-h-[640px] bg-p-page">
            <header className="flex items-center justify-between border-b border-p-line/70 bg-white px-5 py-3">
              <span className="text-[17px] font-black tracking-[-0.03em] text-brand">TOONATION</span>
              <span className="text-[12.5px] text-p-mute">{session.loggedIn ? `${session.accounts[session.loggedIn]?.nick} 님` : '한국어 ›'}</span>
            </header>
            <div className="px-4 py-8 sm:px-8">
              <MockCtx.Provider value={ctx}>
                <S.C key={`${epoch}-${hist.length}-${screen}`} />
              </MockCtx.Provider>
            </div>

            {passReq && (
              <Modal>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#E8282B] text-[12px] font-black text-white">PASS</span>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-p-ink">{passReq.title}</span>
                      <span className="text-[11.5px] text-p-faint">외부 인증 앱 · 목업</span>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-p-mute">{passReq.desc}</p>
                  <div className="flex flex-col gap-2">
                    {(passReq.outcomes ?? [
                      { label: '인증 완료', value: 'ok', tone: 'ok' as const },
                      { label: '인증 실패', value: 'fail', tone: 'fail' as const },
                    ]).map((o) => (
                      <Btn
                        key={o.value}
                        kind={o.tone === 'ok' ? 'primary' : 'ghost'}
                        onClick={() => {
                          const r = passReq
                          setPassReq(null)
                          pushLog(screen, `${r.title} · ${o.label}`)
                          r.onResult(o.value)
                        }}
                      >
                        {o.label}
                      </Btn>
                    ))}
                  </div>
                </div>
              </Modal>
            )}
            {oauthReq && (
              <Modal onClose={() => setOauthReq(null)}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <PlatformDot id={oauthReq.platform} size={36} />
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-p-ink">{PLATFORMS.find((p) => p.id === oauthReq.platform)?.name} 로그인</span>
                      <span className="text-[11.5px] text-p-faint">OAuth · 목업</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {oauthReq.outcomes.map((o) => (
                      <Btn
                        key={o.value}
                        kind={o.tone === 'ok' ? 'primary' : 'ghost'}
                        className="text-[14px]"
                        onClick={() => {
                          const r = oauthReq
                          setOauthReq(null)
                          pushLog(screen, `OAuth · ${o.label}`)
                          r.onResult(o.value)
                        }}
                      >
                        {o.label}
                      </Btn>
                    ))}
                  </div>
                </div>
              </Modal>
            )}
            {alertReq && (
              <Modal>
                <div className="flex flex-col gap-4 text-center">
                  <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-p-ink">{alertReq.msg}</p>
                  <Btn
                    onClick={() => {
                      const a = alertReq
                      setAlertReq(null)
                      a.onOk?.()
                    }}
                  >
                    확인
                  </Btn>
                </div>
              </Modal>
            )}
            <Toast msg={toastMsg} />
          </div>
        </div>
      </section>
    </div>
  )
}

function stamp() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
