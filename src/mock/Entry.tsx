import { useState } from 'react'
import { DOC_ISSUES, GROUPS, SCENARIOS, TEST, type Scenario } from './data'

type Tab = 'cases' | 'doc' | 'issues'

export function Entry({ onStart }: { onStart: (s: Scenario, variant: string) => void }) {
  const [tab, setTab] = useState<Tab>('cases')
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-line pb-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[12px] font-semibold tracking-[0.04em] text-accent">TOO_UI설계서 v3.3 · 공통 p.18–82</span>
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink [text-wrap:balance]">투네이션 계정 플로우 목업</h1>
            <p className="max-w-[62ch] text-[14px] leading-relaxed text-mute">
              진행할 케이스를 고르면 해당 케이스의 테스트 데이터로 로그인 화면부터 시작합니다. 왼쪽 패널에서 현재 단계, 설계서 페이지, 검증 포인트를 확인하고 오류 상황은 ⚡ 버튼으로 재현합니다.
            </p>
          </div>
          <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 rounded-lg border border-line bg-panel px-3.5 py-2.5 font-mono text-[12px]">
            <dt className="text-faint">ID</dt>
            <dd className="text-ink">{TEST.id}</dd>
            <dt className="text-faint">PW</dt>
            <dd className="text-ink">{TEST.pw}</dd>
            <dt className="text-faint">인증번호</dt>
            <dd className="text-ink">{TEST.code}</dd>
          </dl>
        </div>
        <nav className="flex gap-1" role="tablist">
          {(
            [
              ['cases', '케이스 선택'],
              ['doc', '진행 시나리오'],
              ['issues', `설계서 확인 사항 ${DOC_ISSUES.length}`],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-md px-3 py-1.5 text-[13.5px] font-semibold ${tab === k ? 'bg-ink text-bg' : 'text-mute hover:bg-panel hover:text-ink'}`}
            >
              {l}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'cases' && <Cases onStart={onStart} />}
      {tab === 'doc' && <Doc onStart={onStart} />}
      {tab === 'issues' && <Issues />}
    </div>
  )
}

function Cases({ onStart }: { onStart: (s: Scenario, v: string) => void }) {
  return (
    <div className="flex flex-col gap-8">
      {GROUPS.map((g) => {
        const list = SCENARIOS.filter((s) => s.group === g.id)
        return (
          <section key={g.id} className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[34px] font-bold leading-none text-line-strong">{g.id}</span>
              <h2 className="text-[16px] font-bold text-ink">{g.title}</h2>
              <p className="text-[12.5px] leading-snug text-mute">{g.desc}</p>
              <span className="font-mono text-[11.5px] text-faint">{g.pages}</span>
            </div>
            <div className={`grid gap-3 sm:grid-cols-2 ${list.length === 3 ? 'xl:grid-cols-3' : ''}`}>
              {list.map((s) => (
                <article key={s.id} className="group flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-panel p-4 transition-colors hover:border-accent">
                  <button type="button" onClick={() => onStart(s, s.variants?.[0].id ?? '')} className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-semibold text-accent">{s.code}</span>
                      <span className="font-mono text-[11px] text-faint">{s.steps.length}단계</span>
                    </div>
                    <h3 className="text-[15px] font-bold leading-snug text-ink [text-wrap:balance]">{s.title}</h3>
                    <p className="text-[12.5px] leading-snug text-mute">{s.condition}</p>
                  </button>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {s.variants ? (
                      s.variants.map((v) => (
                        <button key={v.id} type="button" onClick={() => onStart(s, v.id)} className="rounded-md border border-line px-2 py-1 text-[11.5px] font-medium text-mute hover:border-accent hover:text-accent">
                          {v.label} →
                        </button>
                      ))
                    ) : (
                      <button type="button" onClick={() => onStart(s, '')} className="rounded-md border border-line px-2 py-1 text-[11.5px] font-medium text-mute group-hover:border-accent group-hover:text-accent">
                        시작 →
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Doc({ onStart }: { onStart: (s: Scenario, v: string) => void }) {
  return (
    <div className="flex flex-col gap-8">
      {GROUPS.map((g) => (
        <section key={g.id} className="flex flex-col gap-4">
          <h2 className="flex items-baseline gap-2 border-b border-line pb-2 text-[17px] font-bold text-ink">
            <span className="font-mono text-accent">{g.id}</span> {g.title}
            <span className="font-mono text-[12px] font-normal text-faint">{g.pages}</span>
          </h2>
          {SCENARIOS.filter((s) => s.group === g.id).map((s) => (
            <div key={s.id} className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[15px] font-bold text-ink">
                  <span className="mr-2 font-mono text-[13px] text-accent">{s.code}</span>
                  {s.title}
                </h3>
                <button type="button" onClick={() => onStart(s, s.variants?.[0].id ?? '')} className="text-[12.5px] font-semibold text-accent hover:underline">
                  목업으로 진행 →
                </button>
              </div>
              <p className="text-[13px] text-mute">
                전제: {s.condition} · 시작: {s.hint}
              </p>
              {s.variants && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-mute">
                  {s.variants.map((v) => (
                    <li key={v.id}>
                      <b className="font-semibold text-ink">{v.label}</b> — {v.desc}
                    </li>
                  ))}
                </ul>
              )}
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-panel text-left text-[11.5px] uppercase tracking-[0.06em] text-faint">
                      <th className="w-10 px-3 py-2 font-semibold">#</th>
                      <th className="w-48 px-3 py-2 font-semibold">화면</th>
                      <th className="w-20 px-3 py-2 font-semibold">설계서</th>
                      <th className="px-3 py-2 font-semibold">기대 결과 · 검증 포인트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.steps.map((st, i) => (
                      <tr key={i} className="border-t border-line align-top">
                        <td className="px-3 py-2 font-mono tabular-nums text-faint">{i + 1}</td>
                        <td className="px-3 py-2 font-semibold text-ink">{st.title}</td>
                        <td className="px-3 py-2 font-mono text-mute">{st.page}</td>
                        <td className="px-3 py-2 text-mute">
                          {st.checks.join(' / ')}
                          {st.sims && <span className="ml-1 text-warn">· 예외 재현: {st.sims.map((x) => x.label).join(', ')}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

function Issues() {
  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-mute">설계서 본문과 History, 또는 페이지 사이에 서로 다르게 적힌 항목입니다. 목업은 오른쪽 열의 기준으로 동작합니다.</p>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-panel text-left text-[11.5px] uppercase tracking-[0.06em] text-faint">
              <th className="w-40 px-3 py-2 font-semibold">위치</th>
              <th className="px-3 py-2 font-semibold">내용</th>
              <th className="w-56 px-3 py-2 font-semibold">목업 적용</th>
            </tr>
          </thead>
          <tbody>
            {DOC_ISSUES.map((d) => (
              <tr key={d.title} className="border-t border-line align-top">
                <td className="px-3 py-2.5 font-mono text-[12px] text-mute">{d.page}</td>
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-ink">{d.title}</p>
                  <p className="text-mute">{d.detail}</p>
                </td>
                <td className="px-3 py-2.5 text-ink">{d.applied}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
