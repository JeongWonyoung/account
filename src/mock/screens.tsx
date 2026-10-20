import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TEST, type ScreenId } from './data'
import { useMock, useSim, type AuthKind, type ConvType } from './ctx'
import {
  Btn,
  BtnRow,
  Check,
  Field,
  Heading,
  Modal,
  Notice,
  PLATFORMS,
  PlatformDot,
  Radio,
  Tag,
  mmss,
  msShort,
  randTag,
  useCountdown,
  vId,
  vNickname,
  vPw,
  vPw2,
} from './ui'

/* ------------------------------------------------------------------ */
/* shared building blocks                                              */
/* ------------------------------------------------------------------ */

function Card({ eyebrow, children, wide }: { eyebrow?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-[480px]' : 'max-w-[400px]'} rounded-2xl border border-p-line/70 bg-white px-6 pb-6 pt-5 shadow-[0_1px_2px_rgba(20,30,70,.04),0_12px_32px_-18px_rgba(20,30,70,.25)]`}>
      {eyebrow && <p className="mb-5 text-center text-[13px] font-semibold text-p-mute">{eyebrow}</p>}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  )
}

const TERMS = (conv: boolean) => [
  { key: 'privacy', label: '개인정보 처리 방침', req: true },
  { key: 'donor', label: conv ? '서비스 이용약관 (도네이터)' : '통합회원 이용약관 (도네이터)', req: true },
  { key: 'creator', label: conv ? '서비스 이용약관 (크리에이터)' : '통합회원 이용약관 (크리에이터)', req: false },
  { key: 'ad', label: '광고성 정보 수신 및 마케팅 활용 동의', req: false },
]

function TermsBlock({ conv, value, onChange }: { conv: boolean; value: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void }) {
  const items = TERMS(conv)
  const all = items.every((i) => value[i.key])
  const [detail, setDetail] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-p-line p-4">
      <div className="flex flex-col gap-1 border-b border-p-line pb-3">
        <Check strong checked={all} onChange={(v) => onChange(Object.fromEntries(items.map((i) => [i.key, v])))}>
          전체 동의하기
        </Check>
        <p className="pl-[30px] text-[12px] leading-snug text-p-mute">크리에이터 서비스 약관, 광고성 정보 수신 및 마케팅 활용(선택) 동의를 포함합니다.</p>
      </div>
      {items.map((i) => (
        <div key={i.key} className="flex items-center justify-between gap-2">
          <Check checked={!!value[i.key]} onChange={(v) => onChange({ ...value, [i.key]: v })}>
            <Tag req={i.req} />
            {i.label}
          </Check>
          <button type="button" aria-label={`${i.label} 상세 보기`} onClick={() => setDetail(i.label)} className="px-1 text-p-faint hover:text-p-ink">
            ›
          </button>
        </div>
      ))}
      {detail && (
        <Modal wide onClose={() => setDetail(null)}>
          <div className="flex flex-col gap-3">
            <p className="text-[16px] font-bold text-p-ink">{detail}</p>
            <div className="max-h-48 overflow-auto rounded-lg bg-p-soft p-3 text-[12.5px] leading-relaxed text-p-mute">
              제1조 (목적) 본 약관은 주식회사 투네이션이 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              <br />
              <br />
              제2조 (정의) 이 약관에서 사용하는 용어의 정의는 다음과 같습니다. … (목업용 약관 전문 자리)
            </div>
            <Btn onClick={() => setDetail(null)}>확인</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

const termsOk = (v: Record<string, boolean>) => !!v.privacy && !!v.donor

function FindTabs({ active }: { active: 'id' | 'pw' }) {
  const { go, patch } = useMock()
  return (
    <div className="-mt-1 grid grid-cols-2 border-b border-p-line text-[14px] font-semibold">
      {(['id', 'pw'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => {
            if (t === active) return
            if (t === 'id') {
              patch({ authPurpose: 'findId' })
              go('authType', '아이디 찾기 탭')
            } else go('findPwId', '비밀번호 찾기 탭')
          }}
          className={`pb-2.5 ${t === active ? 'border-b-2 border-brand text-brand' : 'text-p-mute'}`}
        >
          {t === 'id' ? '아이디 찾기' : '비밀번호 찾기'}
        </button>
      ))}
    </div>
  )
}

function TypeBadge({ t }: { t: 'creator' | 'donor' }) {
  return (
    <span className={`inline-block rounded px-1.5 py-[1px] text-[11.5px] font-semibold ${t === 'creator' ? 'bg-brand-50 text-brand' : 'bg-[#EFFAF3] text-[#138A47]'}`}>
      {t === 'creator' ? '크리에이터' : '도네이터'}
    </span>
  )
}
const pname = (id: string) => ({ twitch: '트위치', youtube: '유튜브', kakao: '카카오', payco: '페이코', naver: '네이버' })[id] ?? id

type Row = { key: string; cells: ReactNode[] }
function PickTable({ head, rows, sel, onSel, fixed }: { head: string[]; rows: Row[]; sel: number; onSel: (i: number) => void; fixed?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-p-line">
      <table className="w-full min-w-[320px] border-collapse text-[13px]">
        <thead>
          <tr className="bg-p-soft text-left text-[12px] text-p-mute">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.key}
              onClick={() => !fixed && onSel(i)}
              className={`border-t border-p-line align-middle ${fixed ? '' : 'cursor-pointer'} ${sel === i ? 'bg-brand-50/60' : 'hover:bg-p-soft/60'}`}
            >
              <td className="w-10 px-3 py-2.5">
                <Radio on={sel === i} />
              </td>
              {r.cells.map((c, j) => (
                <td key={j} className="px-3 py-2.5 text-p-ink">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[14px]">
      <span className="shrink-0 text-p-mute">{k}</span>
      <span className="min-w-0 truncate text-right font-semibold text-p-ink">{children}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 로그인                                                              */
/* ------------------------------------------------------------------ */

function Login() {
  const c = useMock()
  const { scenario: sc, session: s } = c
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [keep, setKeep] = useState(false)
  const [t, setT] = useState({ id: false, pw: false })
  const [err, setErr] = useState<string | null>(null)

  useSim((e) => {
    if (e === 'fillLogin') {
      const target = s.createdId && s.accounts[s.createdId] ? s.createdId : s.convToonId && s.converted ? s.convToonId : TEST.id
      setId(target)
      setPw(s.accounts[target]?.pw ?? TEST.pw)
      setErr(null)
    }
  })

  const idErr = t.id && !id ? '아이디를 입력해주세요.' : null
  const pwErr = t.pw && !pw ? '비밀번호를 입력해주세요.' : err

  const submit = () => {
    const acc = s.accounts[id]
    if (!acc || acc.pw !== pw) {
      setErr('아이디 또는 비밀번호가 일치하지 않습니다.')
      c.log('로그인 실패 · 불일치')
      return
    }
    const legacy = (sc.id === 'C11' || sc.id === 'C12') && id === TEST.id && !s.converted
    if (sc.group === 'C' && id === TEST.id && !s.converted && !legacy) {
      c.toast('이 케이스는 SNS 계정 로그인으로 진행합니다. [YouTube]를 눌러 주세요.')
      return
    }
    if (legacy) return c.go('convGuide', '기존 투네이션 ID 로그인 · 통합회원 미전환')
    if (acc.twoFA) {
      c.patch({ pendingLogin: id })
      return c.go('tfaSelect', '2차 인증 ON 계정')
    }
    c.patch({ loggedIn: id })
    c.go('home', `${id} 로그인 성공`)
  }

  const sns = (p: string) => {
    c.oauth({
      platform: p,
      outcomes: [
        { label: `${TEST.snsEmail} 계정으로 계속`, value: 'ok', tone: 'ok' },
        { label: '로그인 취소', value: 'cancel' },
      ],
      onResult: (v) => {
        if (v !== 'ok') return
        const isC2 = sc.id === 'C21' || sc.id === 'C22'
        if (isC2 && !s.converted) {
          c.patch({ convPlatform: p })
          return c.go('convGuide', `${pname(p)} SNS 로그인 · 통합회원 미전환`)
        }
        const linkedTo = s.linked[p] ? (s.convToonId ?? TEST.id) : isC2 && s.converted && p === s.convPlatform ? s.convToonId : undefined
        if (linkedTo && s.accounts[linkedTo]) {
          c.patch({ loggedIn: linkedTo })
          return c.go('home', `${pname(p)} 간편 로그인`)
        }
        c.toast('이 SNS 계정에 연결된 투네이션 ID가 없습니다.')
      },
    })
  }

  return (
    <Card eyebrow="로그인">
      <Heading sub="투네이션 통합계정으로 로그인이 가능합니다.">로그인</Heading>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (id && pw) submit()
        }}
      >
        <Field id="login-id" label="아이디" placeholder="아이디 입력" value={id} error={idErr} onBlur={() => setT({ ...t, id: true })} onChange={(v) => { setId(v); setErr(null) }} />
        <Field id="login-pw" label="비밀번호" type="password" placeholder="비밀번호 입력" value={pw} error={pwErr} onBlur={() => setT({ ...t, pw: true })} onChange={(v) => { setPw(v); setErr(null) }} />
        <Check checked={keep} onChange={setKeep}>
          로그인 상태 유지
        </Check>
        <Btn type="submit" disabled={!id || !pw} className="mt-1 w-full">
          로그인
        </Btn>
      </form>
      <div className="flex items-center justify-center gap-3 text-[13px] text-p-mute">
        <button type="button" className="hover:text-p-ink" onClick={() => { c.patch({ authPurpose: 'findId' }); c.go('authType', '아이디 찾기') }}>
          아이디 찾기
        </button>
        <span className="text-p-line">|</span>
        <button type="button" className="hover:text-p-ink" onClick={() => c.go('findPwId', '비밀번호 찾기')}>
          비밀번호 찾기
        </button>
        <span className="text-p-line">|</span>
        <button type="button" className="hover:text-p-ink" onClick={() => { c.patch({ authPurpose: 'signup' }); c.go('terms', '회원가입') }}>
          회원가입
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-[12px] text-p-faint">
          <span className="h-px flex-1 bg-p-line" />
          SNS 계정으로 로그인
          <span className="h-px flex-1 bg-p-line" />
        </div>
        <div className="flex justify-center gap-3">
          {PLATFORMS.map((p) => (
            <button key={p.id} type="button" onClick={() => sns(p.id)} aria-label={`${p.name} 로그인`} className="rounded-full p-0.5 ring-brand transition hover:ring-2">
              <PlatformDot id={p.id} size={40} />
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 회원가입                                                            */
/* ------------------------------------------------------------------ */

function Terms() {
  const c = useMock()
  const [v, setV] = useState<Record<string, boolean>>({})
  return (
    <Card eyebrow="회원가입">
      <Heading>{'약관에\n동의해 주세요.'}</Heading>
      <TermsBlock conv={false} value={v} onChange={setV} />
      <Notice>크리에이터 약관에 동의하지 않고 가입하면, 스튜디오 최초 진입 시 크리에이터 약관 동의가 필요합니다.</Notice>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn disabled={!termsOk(v)} onClick={() => c.go('authType', `약관 동의 (${Object.values(v).filter(Boolean).length}/4)`)}>
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

const AUTH_OPTS: { k: AuthKind; title: string; sub: string }[] = [
  { k: 'over14', title: '국내 만14세 이상 회원', sub: '본인 명의 휴대폰으로 인증' },
  { k: 'under14', title: '국내 만14세 미만 회원', sub: '법정대리인 명의 휴대폰으로 인증' },
  { k: 'overseas', title: '해외 회원', sub: '본인 명의 휴대폰으로 인증' },
]
const EXPECT: Record<string, AuthKind> = { A1: 'over14', A2: 'under14', A3: 'overseas' }

function AuthType() {
  const c = useMock()
  const { session: s, scenario: sc } = c
  const purpose = s.authPurpose
  const [sel, setSel] = useState<AuthKind | null>(null)
  const [guardian, setGuardian] = useState(false)
  const expected = EXPECT[sc.id]

  const afterAuth = (k: AuthKind) => {
    c.patch({ authKind: k })
    if (purpose === 'signup') c.go('createId', 'PASS 인증 완료')
    else c.go('convSelectInfo', 'PASS 인증 완료')
  }
  const failToast = () => c.toast('본인인증에 실패했습니다. 다시 시도해 주세요.')

  const next = () => {
    if (!sel) return
    if (purpose === 'findId') {
      return c.pass({
        title: sel === 'overseas' ? '해외 휴대폰 인증' : 'PASS 본인인증',
        desc: '아이디 찾기 · 본인인증 결과를 선택하세요.',
        outcomes: [
          { label: '인증 완료 · 보유 ID 있음', value: 'ok', tone: 'ok' },
          { label: '인증 완료 · 조회 정보 없음', value: 'none' },
          { label: '인증 실패', value: 'fail', tone: 'fail' },
        ],
        onResult: (r) => {
          if (r === 'fail') return c.toast('본인인증 정보와 아이디가 일치하지 않습니다.')
          c.patch({ findIdEmpty: r === 'none' })
          c.go('findIdResult', r === 'none' ? '조회 정보 없음' : '보유 ID 조회')
        },
      })
    }
    if (purpose === 'findPw') {
      return c.pass({
        title: sel === 'overseas' ? '해외 휴대폰 인증' : 'PASS 본인인증',
        desc: `비밀번호 찾기 · 아이디 ${s.findPwTarget}`,
        outcomes: [
          { label: '인증 완료', value: 'ok', tone: 'ok' },
          { label: '본인인증 정보와 아이디 불일치', value: 'fail', tone: 'fail' },
        ],
        onResult: (r) => (r === 'ok' ? c.go('findPwReset', '본인인증 완료') : c.toast('본인인증 정보와 아이디가 일치하지 않습니다.')),
      })
    }
    if (sel === 'overseas') {
      c.patch({ authKind: 'overseas' })
      return c.go('overseasPhone', '해외 회원 선택')
    }
    if (sel === 'over14') {
      return c.pass({
        title: 'PASS 본인인증',
        desc: '본인 명의 휴대폰으로 인증합니다.',
        onResult: (r) => (r === 'ok' ? afterAuth('over14') : failToast()),
      })
    }
    c.pass({
      title: 'PASS 미성년자 본인인증',
      desc: '투네이션 서버에서 생년월일 기준으로 법정대리인 인증 여부를 판단합니다.',
      onResult: (r) => {
        if (r !== 'ok') return failToast()
        c.log('연령 판별 · 만 14세 미만')
        setGuardian(true)
      },
    })
  }

  const isFind = purpose === 'findId' || purpose === 'findPw'
  return (
    <Card eyebrow={purpose === 'signup' ? '회원가입' : purpose === 'conv' ? '통합회원 전환' : undefined}>
      {isFind && <FindTabs active={purpose === 'findId' ? 'id' : 'pw'} />}
      <Heading>{purpose === 'conv' ? '통합회원 전환을 위해\n인증해 주세요.' : '인증 유형을\n선택해 주세요.'}</Heading>
      <div className="flex flex-col gap-2.5" role="radiogroup">
        {AUTH_OPTS.map((o) => (
          <button
            key={o.k}
            type="button"
            role="radio"
            aria-checked={sel === o.k}
            onClick={() => setSel(o.k)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
              sel === o.k ? 'border-brand bg-brand-50/50' : 'border-p-line hover:border-p-faint'
            }`}
          >
            <Radio on={sel === o.k} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-semibold text-p-ink">{o.title}</span>
              <span className="text-[12.5px] text-p-mute">{o.sub}</span>
            </span>
            {expected === o.k && <span className="shrink-0 rounded-full bg-[#FFF6D6] px-2 py-0.5 text-[11px] font-bold text-[#8A6400]">이 케이스</span>}
          </button>
        ))}
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          {isFind ? '닫기' : '뒤로가기'}
        </Btn>
        <Btn disabled={!sel} onClick={next}>
          다음
        </Btn>
      </BtnRow>
      {guardian && (
        <Modal>
          <div className="flex flex-col gap-4 text-center">
            <div className="flex flex-col gap-1.5">
              <p className="text-[17px] font-bold text-p-ink">법정대리인 인증</p>
              <p className="text-[13.5px] leading-relaxed text-p-mute">만 14세 미만은 부모님(법정대리인)의 동의가 필요합니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Btn kind="ghost" onClick={() => { setGuardian(false); c.log('법정대리인 모달 · 취소') }}>
                취소
              </Btn>
              <Btn
                onClick={() => {
                  setGuardian(false)
                  c.pass({
                    title: 'PASS 법정대리인 동의',
                    desc: '법정대리인 명의 휴대폰으로 인증하고 동의 이력을 저장합니다.',
                    onResult: (r) => (r === 'ok' ? afterAuth('under14') : failToast()),
                  })
                }}
              >
                인증하기
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  )
}

const COUNTRIES = [
  ['+1', '미국/캐나다'],
  ['+81', '일본'],
  ['+86', '중국'],
  ['+886', '대만'],
  ['+852', '홍콩'],
  ['+63', '필리핀'],
  ['+84', '베트남'],
  ['+66', '태국'],
  ['+975', '부탄'],
  ['+44', '영국'],
  ['+49', '독일'],
  ['+61', '호주'],
]

function OverseasPhone() {
  const c = useMock()
  const s = c.session
  const [cc, setCc] = useState('')
  const [num, setNum] = useState('')
  useSim((e) => {
    if (e === 'send10') {
      c.patch({ overseasSends: 10 })
      c.toast('오늘 발송 횟수를 10회로 설정했습니다. [다음]을 눌러 보세요.')
    }
  })
  const next = () => {
    if (s.overseasSends >= 10) {
      return c.alert({ msg: '해외인증 시도는 일 최대 10회까지 가능합니다.\n이용을 계속하시려면 고객센터로 문의해 주세요.' })
    }
    c.patch({ overseasSends: s.overseasSends + 1, overseasNumber: `${cc} ${num}` })
    c.go('overseasCode', `인증번호 발송 (${s.overseasSends + 1}/10)`)
  }
  return (
    <Card eyebrow="본인 인증">
      <Heading>{'해외 휴대폰\n인증해 주세요.'}</Heading>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cc" className="text-[13px] font-semibold text-p-ink">
          국가번호
        </label>
        <select id="cc" value={cc} onChange={(e) => setCc(e.target.value)} className="h-12 rounded-[10px] border border-p-line bg-white px-3 text-[15px] text-p-ink outline-none focus:border-brand">
          <option value="">선택</option>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>
              {name} ({code})
            </option>
          ))}
        </select>
      </div>
      <Field id="ph" label="전화번호" inputMode="numeric" placeholder="특수문자 없이 번호만 입력" value={num} onChange={(v) => setNum(v.replace(/\D/g, ''))} />
      <p className="text-[12px] text-p-faint">오늘 발송 {s.overseasSends}/10회 · 대한민국, 아프리카, 아프가니스탄 국가번호는 선택할 수 없습니다.</p>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn disabled={!cc || num.length < 1} onClick={next}>
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function OverseasCode() {
  const c = useMock()
  const s = c.session
  const [code, setCode] = useState('')
  const [retries, setRetries] = useState(3)
  const [resends, setResends] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const [dead, setDead] = useState(false)
  const [sec, setSec] = useCountdown(600, !dead)

  useEffect(() => {
    if (sec === 0 && !dead) {
      setMsg('인증번호 입력시간이 초과되었습니다.\n처음부터 다시 시도하여 주시기 바랍니다.')
      setDead(true)
    }
  }, [sec, dead])

  useSim((e) => {
    if (e === 'expire') setSec(0)
    if (e === 'resend10') {
      setResends(10)
      c.toast('재전송 횟수를 10회로 설정했습니다. [재전송]을 눌러 보세요.')
    }
  })

  const resend = () => {
    const n = resends + 1
    setResends(n)
    if (n > 10) {
      setMsg('재전송 요청건수를 초과하였습니다.\n처음부터 다시 시도하여 주시기 바랍니다.')
      setDead(true)
      return
    }
    setSec(600)
    setRetries(3)
    setDead(false)
    setMsg(null)
    setCode('')
    c.toast('인증번호를 재전송했습니다.')
    c.log(`인증번호 재전송 (${n}/10)`)
  }

  const next = () => {
    if (code === TEST.code) {
      c.patch({ authKind: 'overseas' })
      return c.go(s.authPurpose === 'conv' ? 'convSelectInfo' : 'createId', '해외 휴대폰 인증 완료')
    }
    if (retries === 0) {
      setDead(true)
      setMsg('인증 실패 시, 추가 인증은 3분 후에 다시 시도할 수 있습니다.\n잠시 후 다시 시도해 주세요.')
      c.alert({ msg: '인증이 실패되었습니다.\n처음부터 다시 시도하여 주시기 바랍니다.' })
      return
    }
    setRetries(retries - 1)
    setMsg('인증번호가 일치하지 않습니다.\n확인 후 다시 입력해 주세요.')
    c.log(`인증번호 불일치 · 남은 재시도 ${retries - 1}`)
  }

  return (
    <Card eyebrow="본인 인증">
      <Heading sub={<><b className="text-p-ink">{s.overseasNumber}</b><br />전송받은 인증 번호를 입력해주세요.</>}>{'해외 휴대폰\n인증해 주세요.'}</Heading>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ocode" className="text-[13px] font-semibold text-p-ink">
          인증번호
        </label>
        <div className="flex gap-2">
          <input
            id="ocode"
            value={code}
            disabled={dead}
            inputMode="numeric"
            maxLength={6}
            placeholder="인증 번호 입력"
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`h-12 min-w-0 flex-1 rounded-[10px] border px-3.5 font-mono text-[16px] tracking-[0.2em] text-p-ink outline-none focus:border-brand disabled:bg-p-soft ${msg ? 'border-p-danger' : 'border-p-line'}`}
          />
          <Btn kind="ghost" className="shrink-0" onClick={resend}>
            재전송
          </Btn>
        </div>
        <p className="font-mono text-[12.5px] tabular-nums text-p-mute">
          남은 시간 : <span className={sec < 60 ? 'text-p-danger' : ''}>{mmss(sec)}</span> / 재시도 가능 횟수 : {retries}
        </p>
        {msg && <p className="whitespace-pre-line text-[12.5px] text-p-danger">{msg}</p>}
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn disabled={code.length !== 6 || dead} onClick={next}>
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function CreateId() {
  const c = useMock()
  const s = c.session
  const conv = s.authPurpose === 'conv'
  const [nick, setNick] = useState(conv ? '송송송' : '')
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [t, setT] = useState({ nick: false, id: false, pw: false, pw2: false })
  const taken = [...TEST.takenIds, ...Object.keys(s.accounts)]
  const e = {
    nick: vNickname(nick, t.nick),
    id: vId(id, t.id, taken),
    pw: vPw(pw, t.pw),
    pw2: vPw2(pw, pw2, t.pw2),
  }
  const valid = !vNickname(nick, true) && !vId(id, true, taken) && !vPw(pw, true) && !vPw2(pw, pw2, true)
  const touch = (k: keyof typeof t) => () => setT((x) => ({ ...x, [k]: true }))

  const next = () => {
    const tag = randTag()
    c.patch({
      accounts: { ...s.accounts, [id]: { pw, nick, tag, joined: new Date().toISOString().slice(0, 10), status: '정상' } },
      createdId: id,
      nickname: nick,
      ...(conv ? { convToonId: id } : {}),
    })
    c.go(conv ? 'convDone' : 'signupDone', `ID 생성 · ${id}`)
  }

  return (
    <Card eyebrow={conv ? '통합회원 전환' : '회원가입'}>
      <Heading>{conv ? '투네이션 ID를\n생성해 주세요.' : '신규ID를\n생성해 주세요.'}</Heading>
      <div className="flex flex-col gap-3.5">
        {conv && <Field id="sns" label="SNS 계정" value={TEST.snsEmail} readOnly onChange={() => {}} />}
        <Field id="nick" label="닉네임" placeholder="이모지 제외, 최소 2자~16자" value={nick} error={e.nick} onBlur={touch('nick')} onChange={(v) => { setNick(v); touch('nick')() }} />
        <Field id="newid" label="아이디" placeholder="영문 또는 숫자 4자~25자" value={id} error={e.id} onBlur={touch('id')} onChange={(v) => { setId(v); touch('id')() }} />
        <Field id="newpw" label="비밀번호" type="password" placeholder="영문, 특수문자, 숫자 조합 10자 이상" value={pw} error={e.pw} onBlur={touch('pw')} onChange={(v) => { setPw(v); touch('pw')() }} />
        <Field id="newpw2" label="비밀번호 확인" type="password" placeholder="비밀번호 재입력" value={pw2} error={e.pw2} onBlur={touch('pw2')} onChange={(v) => { setPw2(v); touch('pw2')() }} />
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn disabled={!valid} onClick={next}>
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function SignupDone() {
  const c = useMock()
  const s = c.session
  const acc = s.createdId ? s.accounts[s.createdId] : undefined
  return (
    <Card eyebrow="회원가입">
      <Heading>가입 완료</Heading>
      <div className="rounded-xl bg-p-soft px-4 py-2">
        <KV k="투네이션 ID">{s.createdId}</KV>
        <KV k="고유식별번호">
          <span className="font-mono">
            {acc?.nick}#{acc?.tag}
          </span>
        </KV>
      </div>
      <p className="text-[14px] leading-relaxed text-p-mute">
        회원가입이 완료되었습니다.
        <br />
        SNS 계정과 연결하여 편리하게 로그인 할 수 있습니다.
        <br />
        생성하신 ID로 로그인 해주세요.
      </p>
      <Btn
        onClick={() => {
          c.patch({ loggedIn: undefined })
          c.go('login', '가입 완료 → 비로그인 로그인 화면')
          c.toast('생성하신 ID로 로그인해 주세요.')
        }}
      >
        가입 완료
      </Btn>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 통합홈                                                              */
/* ------------------------------------------------------------------ */

const LIVES = [
  ['새벽 랭겜 다이아 가자', '롤', '#2A3C78'],
  ['피아노 신청곡 받아요', '음악', '#6B4A2A'],
  ['오버워치 경쟁전', '오버워치', '#1F5E5B'],
  ['저챗 · 오늘 뭐 먹지', '토크', '#5C2B4A'],
  ['발로란트 내전', '발로란트', '#2E2E2E'],
  ['요리 방송 · 마라탕', '요리', '#7A3B1D'],
]

function Home() {
  const c = useMock()
  const s = c.session
  const acc = s.loggedIn ? s.accounts[s.loggedIn] : undefined
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-p-line/70 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-brand text-[15px] font-bold text-white">{acc?.nick.slice(0, 1)}</span>
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-p-ink">
              {acc?.nick}
              <span className="ml-1 font-mono text-[12.5px] font-medium text-p-faint">#{acc?.tag}</span>
            </span>
            <span className="text-[12.5px] text-p-mute">
              {s.loggedIn} · 보유 캐시 <b className="tabular-nums text-p-ink">12,500</b>
            </span>
          </div>
        </div>
        <Btn
          kind="ghost"
          className="h-9 text-[13px]"
          onClick={() => {
            c.patch({ loggedIn: undefined })
            c.go('login', '로그아웃')
          }}
        >
          로그아웃
        </Btn>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-bold text-p-ink">LIVE TOP 50</h2>
          <span className="text-[12.5px] text-p-mute">전체보기 ›</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LIVES.map(([title, cat, col], i) => (
            <div key={title} className="flex min-w-0 flex-col gap-1.5">
              <div className="relative aspect-video max-w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${col}, #11131a)` }}>
                <span className="absolute left-2 top-2 rounded bg-[#FF3B3B] px-1.5 text-[10px] font-bold text-white">LIVE</span>
                <span className="absolute bottom-2 right-2 font-mono text-[10.5px] text-white/80">{(9800 - i * 1370).toLocaleString()}명</span>
              </div>
              <p className="truncate text-[13px] font-semibold text-p-ink">{title}</p>
              <p className="text-[11.5px] text-p-mute">{cat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2차 인증                                                            */
/* ------------------------------------------------------------------ */

function TfaHelp() {
  const [tip, setTip] = useState(false)
  return (
    <div className="flex flex-col items-center gap-2 text-[12.5px] text-p-mute">
      <button type="button" onClick={() => setTip(!tip)} className="flex items-center gap-1 hover:text-p-ink">
        2차 인증 해지 방법 <span className="grid size-4 place-items-center rounded-full border border-p-faint text-[10px]">?</span>
      </button>
      {tip && <p className="rounded-lg bg-[#1c2130] px-3 py-2 text-white">마이페이지 &gt; 계정 관리 &gt; 2차 인증설정에서 해제</p>}
      <p>
        도움이 필요하신가요? <span className="font-semibold text-brand">고객센터 문의하기</span>
      </p>
    </div>
  )
}

function TfaSelect() {
  const c = useMock()
  const [m, setM] = useState<'phone' | 'email'>('phone')
  return (
    <Card eyebrow="2차 인증">
      <Heading sub="계정 보안을 위해 추가 인증이 필요합니다.">인증 방법 선택</Heading>
      <div className="flex flex-col gap-2.5">
        {(
          [
            ['phone', '휴대폰', TEST.phone],
            ['email', '이메일', TEST.email],
          ] as const
        ).map(([k, label, val]) => (
          <button key={k} type="button" onClick={() => setM(k)} className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left ${m === k ? 'border-brand bg-brand-50/50' : 'border-p-line'}`}>
            <Radio on={m === k} />
            <span className="w-14 text-[15px] font-semibold text-p-ink">{label}</span>
            <span className="font-mono text-[13.5px] text-p-mute">{val}</span>
          </button>
        ))}
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={() => { c.patch({ pendingLogin: undefined }); c.go('login', '로그인 취소') }}>
          로그인 취소
        </Btn>
        <Btn onClick={() => { c.patch({ tfaMethod: m }); c.go('tfaCode', `${m === 'phone' ? '휴대폰' : '이메일'} 인증 진행`) }}>인증 진행</Btn>
      </BtnRow>
      <TfaHelp />
    </Card>
  )
}

function untilMidnight() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(24, 0, 0, 0)
  const d = Math.floor((end.getTime() - now.getTime()) / 1000)
  return `${String(Math.floor(d / 3600)).padStart(2, '0')}시간 ${String(Math.floor((d % 3600) / 60)).padStart(2, '0')}분 ${String(d % 60).padStart(2, '0')}초`
}

function TfaCode() {
  const c = useMock()
  const s = c.session
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [wrong, setWrong] = useState(false)
  const [expired, setExpired] = useState(false)
  const [req, setReq] = useState(1)
  const [locked, setLocked] = useState(false)
  const [sec, setSec] = useCountdown(600, true)
  const [wait, setWait] = useCountdown(180, true)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => refs.current[0]?.focus(), [])
  useEffect(() => {
    if (sec === 0) setExpired(true)
  }, [sec])

  useSim((e) => {
    if (e === 'under1min') setSec(55)
    if (e === 'expire') setSec(0)
    if (e === 'skipWait') setWait(0)
    if (e === 'req7') {
      setReq(7)
      c.toast('오늘 요청 횟수를 7회로 설정했습니다. 재전송하면 8회째입니다.')
    }
  })

  const setAt = (i: number, v: string) => {
    const d = v.replace(/\D/g, '')
    if (expired) setExpired(false)
    if (d.length > 1) {
      const arr = d.slice(0, 6).split('')
      const next = Array(6).fill('').map((_, j) => arr[j] ?? '')
      setDigits(next)
      refs.current[Math.min(arr.length, 5)]?.focus()
      return
    }
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) refs.current[i + 1]?.focus()
  }

  const resend = () => {
    const n = req + 1
    setReq(n)
    if (n >= 10) {
      setLocked(true)
      c.log(`인증번호 요청 ${n}회 · 1일 한도 초과`)
      return
    }
    if (n === 8 || n === 9) c.toast(`요청이 너무 많습니다. (남은 횟수 : ${10 - n}회)`)
    else c.toast('새 인증번호를 발송했습니다.')
    setSec(600)
    setWait(180)
    setDigits(Array(6).fill(''))
    setWrong(false)
    setExpired(false)
    c.log(`인증번호 재전송 (${n}회)`)
    setTimeout(() => refs.current[0]?.focus(), 0)
  }

  const confirm = () => {
    if (sec === 0) return setExpired(true)
    if (digits.join('') === TEST.code) {
      c.patch({ loggedIn: s.pendingLogin, pendingLogin: undefined })
      c.toast('로그인되었습니다.')
      return c.go('home', '2차 인증 완료')
    }
    setWrong(true)
    c.log('2차 인증번호 불일치')
  }

  const err = locked
    ? `1일당 요청 횟수를 초과했습니다.\n(${untilMidnight()} 이후 다시 시도하실 수 있습니다.)`
    : wrong
      ? '인증번호가 올바르지 않습니다. 다시 시도해 주세요.\n인증번호를 재전송해 주세요.'
      : expired
        ? '인증시간이 만료되었습니다. 다시 시도해 주세요.'
        : null

  return (
    <Card eyebrow="2차 인증">
      <Heading sub="선택한 인증 수단으로 6자리 인증번호를 전송했습니다.">인증번호 입력</Heading>
      <p className="-mt-2 font-mono text-[14px] font-semibold text-p-ink">{s.tfaMethod === 'phone' ? TEST.phone : TEST.email}</p>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-6 gap-1.5">
          {digits.map((d, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              ref={(el) => { refs.current[i] = el }}
              value={d}
              disabled={wrong || locked}
              inputMode="numeric"
              aria-label={`인증번호 ${i + 1}번째 자리`}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus()
              }}
              className={`h-12 w-full min-w-0 rounded-[10px] border text-center font-mono text-[20px] font-semibold text-p-ink outline-none focus:border-brand disabled:bg-[#FFF5F5] ${
                wrong || expired || locked ? 'border-p-danger text-p-danger' : 'border-p-line'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[12.5px]">
          <span className={`font-mono tabular-nums ${sec < 60 ? 'font-semibold text-p-danger' : 'text-p-mute'}`}>남은 시간 {mmss(sec)}</span>
          {!locked &&
            (wait > 0 ? (
              <span className="font-mono tabular-nums text-p-faint">재전송 대기 ({msShort(wait)})</span>
            ) : (
              <button type="button" onClick={resend} className="font-semibold text-brand hover:underline">
                재전송하기
              </button>
            ))}
        </div>
        {err && <p className="whitespace-pre-line text-[12.5px] text-p-danger">{err}</p>}
        <button type="button" onClick={c.back} className="self-start text-[12.5px] text-p-mute underline-offset-2 hover:underline">
          다른 인증 방법 선택
        </button>
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={() => { c.patch({ pendingLogin: undefined }); c.go('login', '로그인 취소') }}>
          로그인 취소
        </Btn>
        <Btn disabled={digits.join('').length !== 6 || wrong || locked} onClick={confirm}>
          확인
        </Btn>
      </BtnRow>
      <TfaHelp />
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 차세대 통합회원 전환                                                */
/* ------------------------------------------------------------------ */

function ConvGuide() {
  const c = useMock()
  const sc = c.scenario
  const [v, setV] = useState<Record<string, boolean>>({})
  const next = () => {
    const to: Record<string, ScreenId> = { C11: 'convSelectSns', C12: 'nickname', C21: 'convSelectToonId', C22: 'authType' }
    if (sc.id === 'C22') c.patch({ authPurpose: 'conv' })
    if (sc.id === 'C11' || sc.id === 'C12') c.patch({ convToonId: TEST.id })
    c.go(to[sc.id], '통합회원 전환하기')
  }
  return (
    <Card eyebrow="통합회원 전환" wide>
      <Heading sub="도네이터와 크리에이터 계정이 투네이션 ID 하나로 통합됩니다. 통합회원 전환 후 서비스를 계속 이어가실 수 있어요.">통합회원 전환 안내</Heading>
      <ul className="flex flex-col gap-2.5">
        {['투네이션 ID 하나로 크리에이터와 도네이터 활동을 모두 이용해요.', '계정 구분 없이 아이디 하나로 편하게 이용할 수 있어요.', '기존 이력은 그대로 보관하거나, 새로 만들어 사용할 수 있어요.'].map((t, i) => (
          <li key={t} className="flex items-start gap-3 text-[14px] text-p-ink">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-[11px] font-bold text-brand">{i + 1}</span>
            {t}
          </li>
        ))}
      </ul>
      <Notice>기존 ID와 이용 이력은 그대로 유지됩니다. 여러 계정이 있다면 전환할 계정을 선택할 수 있고, 원하지 않으면 따로 사용할 수 있어요.</Notice>
      <TermsBlock conv value={v} onChange={setV} />
      <BtnRow>
        <Btn
          kind="ghost"
          onClick={() => {
            c.go('login', '로그아웃')
            c.toast('로그아웃되었습니다. 통합회원 전환 전까지 계속 안내됩니다.')
          }}
        >
          로그아웃
        </Btn>
        <Btn disabled={!termsOk(v)} onClick={next}>
          통합회원 전환하기
        </Btn>
      </BtnRow>
    </Card>
  )
}

type SnsRow = { type: ConvType; platform: string; ids: { creator?: string; donor?: string } }

function ConvSelectSns() {
  const c = useMock()
  const merge = c.variant === 'merge'
  const rows: SnsRow[] = merge
    ? [
        { type: 'merged', platform: 'youtube', ids: { creator: 'toonaone@gmail.com', donor: 'toonatwo@gmail.com' } },
        { type: 'creator', platform: 'twitch', ids: { creator: 'tunaking' } },
        { type: 'creator', platform: 'kakao', ids: { creator: 'yam34song' } },
        { type: 'donor', platform: 'payco', ids: { donor: 'toonalove' } },
      ]
    : [
        { type: 'creator', platform: 'twitch', ids: { creator: 'toonaone' } },
        { type: 'creator', platform: 'youtube', ids: { creator: 'toonatwo@gmail.com' } },
        { type: 'creator', platform: 'naver', ids: { creator: 'toonathree@naver.com' } },
        { type: 'donor', platform: 'kakao', ids: { donor: 'yam34song' } },
        { type: 'donor', platform: 'payco', ids: { donor: 'toonalove' } },
      ]
  const [sel, setSel] = useState(0)
  const plat = (p: string) => (
    <span className="flex items-center gap-1.5">
      <PlatformDot id={p} size={16} />
      {pname(p)}
    </span>
  )
  const table: Row[] = rows.map((r, i) => ({
    key: String(i),
    cells:
      r.type === 'merged'
        ? [
            <div className="flex flex-col gap-1.5" key="a">
              <span>{r.ids.creator}</span>
              <span>{r.ids.donor}</span>
            </div>,
            <div className="flex flex-col items-start gap-1.5" key="b">
              <TypeBadge t="creator" />
              <TypeBadge t="donor" />
            </div>,
            plat(r.platform),
          ]
        : [<span key="a" className="break-all">{r.ids.creator ?? r.ids.donor}</span>, <TypeBadge key="b" t={r.type as 'creator' | 'donor'} />, plat(r.platform)],
  }))
  return (
    <Card eyebrow="통합회원 전환" wide>
      <Heading>{'통합회원으로 전환할\nSNS 계정을 선택해 주세요.'}</Heading>
      <div className="rounded-xl bg-p-soft px-4 py-1">
        <KV k="투네이션 ID">{TEST.id}</KV>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-p-ink">연결 계정</p>
        <PickTable head={['선택', '플랫폼 ID', '계정 유형', '플랫폼']} rows={table} sel={sel} onSel={setSel} />
      </div>
      {!merge && <Notice>선택한 연결 계정 외의 다른 SNS 계정을 통합회원으로 전환하시려면, SNS 로그인을 통해 통합회원 전환 절차를 별도로 진행하셔야 합니다.</Notice>}
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn
          onClick={() => {
            const r = rows[sel]
            c.patch({ convType: r.type, convPlatform: r.platform, convIds: r.ids })
            c.go('nickname', `연결 계정 선택 · ${r.type === 'merged' ? '크리+도네 병합' : r.type === 'creator' ? '크리에이터' : '도네이터'}`)
          }}
        >
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function ConvSelectToonId() {
  const c = useMock()
  const merge = c.variant === 'merge'
  const rows = merge
    ? [{ type: 'merged' as ConvType, toon: 'toonathree' }]
    : [
        { type: 'creator' as ConvType, toon: 'toonaone' },
        { type: 'donor' as ConvType, toon: 'toonatwo' },
      ]
  const [sel, setSel] = useState(0)
  const table: Row[] = rows.map((r, i) => ({
    key: String(i),
    cells: [
      r.type === 'merged' ? (
        <div key="a" className="flex flex-col items-start gap-1.5">
          <TypeBadge t="creator" />
          <TypeBadge t="donor" />
        </div>
      ) : (
        <TypeBadge key="a" t={r.type as 'creator' | 'donor'} />
      ),
      <span key="b" className="flex items-center gap-1.5">
        <PlatformDot id="youtube" size={16} />
        유튜브
      </span>,
      <b key="c">{r.toon}</b>,
    ],
  }))
  return (
    <Card eyebrow="통합회원 전환" wide>
      <Heading>{'통합회원으로 전환할\n투네이션 ID를 선택해 주세요.'}</Heading>
      <div className="rounded-xl bg-p-soft px-4 py-1">
        <KV k="SNS 계정">{TEST.snsEmail}</KV>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-p-ink">투네이션 ID</p>
        <PickTable head={['선택', '계정 유형', '플랫폼', '투네이션 ID']} rows={table} sel={sel} onSel={setSel} fixed={merge} />
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn
          onClick={() => {
            const r = rows[sel]
            const ids = r.type === 'merged' ? { creator: TEST.snsEmail, donor: TEST.snsEmail } : { [r.type]: TEST.snsEmail }
            c.patch({ convType: r.type, convToonId: r.toon, convPlatform: 'youtube', convIds: ids })
            c.go('nickname', `투네이션 ID 선택 · ${r.toon}`)
          }}
        >
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function ConvSelectInfo() {
  const c = useMock()
  const rows: ('creator' | 'donor')[] = c.variant === 'creator' ? ['creator'] : c.variant === 'donor' ? ['donor'] : ['creator', 'donor']
  const [sel, setSel] = useState(0)
  const table: Row[] = rows.map((t) => ({
    key: t,
    cells: [
      <TypeBadge key="a" t={t} />,
      <span key="b" className="flex items-center gap-1.5">
        <PlatformDot id="youtube" size={16} />
        유튜브
      </span>,
      <span key="c" className="text-p-faint">-</span>,
    ],
  }))
  return (
    <Card eyebrow="통합회원 전환" wide>
      <Heading>{'통합회원으로 전환할\n계정 정보를 선택해 주세요.'}</Heading>
      <div className="rounded-xl bg-p-soft px-4 py-1">
        <KV k="SNS 계정">{TEST.snsEmail}</KV>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-p-ink">계정 정보</p>
        <PickTable head={['선택', '계정 유형', '플랫폼', '투네이션 ID']} rows={table} sel={sel} onSel={setSel} />
      </div>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn
          onClick={() => {
            const t = rows[sel]
            c.patch({ convType: t, convPlatform: 'youtube', convIds: { [t]: TEST.snsEmail } })
            c.go('createId', `계정 정보 선택 · ${t === 'creator' ? '크리에이터' : '도네이터'}`)
          }}
        >
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function Nickname() {
  const c = useMock()
  const s = c.session
  const [nick, setNick] = useState(s.nickname || '송송송')
  const [touched, setTouched] = useState(false)
  const err = vNickname(nick, touched)
  const next = () => {
    const target = s.convToonId ?? TEST.id
    const prev = s.accounts[target]
    c.patch({
      nickname: nick,
      accounts: { ...s.accounts, [target]: { ...(prev ?? { pw: TEST.pw, tag: randTag(), joined: '2022-04-08' }), nick } },
    })
    c.go(c.scenario.id === 'C12' ? 'snsConnect' : 'convDone', `닉네임 설정 · ${nick}`)
  }
  return (
    <Card eyebrow="통합회원 전환">
      <Heading>{'사용하실 닉네임을\n설정해 주세요.'}</Heading>
      <Field
        id="conv-nick"
        label="닉네임"
        placeholder="이모지 제외, 특수문자 허용 최소 2자~16자"
        value={nick}
        error={err}
        onBlur={() => setTouched(true)}
        onChange={(v) => {
          setNick(v)
          setTouched(true)
        }}
      />
      <p className="text-[12px] leading-relaxed text-p-faint">
        ※ 이모지 제외, 특수문자 허용 최소 2자 ~ 16자
        <br />※ 닉네임은 [마이페이지 &gt; 프로필 편집]에서 변경하실 수 있습니다.
      </p>
      <BtnRow>
        <Btn kind="ghost" onClick={c.back}>
          뒤로가기
        </Btn>
        <Btn disabled={!!vNickname(nick, true)} onClick={next}>
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function ConvDone() {
  const c = useMock()
  const s = c.session
  const t = s.convType ?? 'creator'
  const show: ('creator' | 'donor')[] = t === 'merged' ? ['creator', 'donor'] : [t]
  const p = PLATFORMS.find((x) => x.id === s.convPlatform)
  return (
    <Card eyebrow="통합회원 전환">
      <Heading>통합회원 전환 완료</Heading>
      <p className="-mt-2 text-[14px] leading-relaxed text-p-mute">
        통합회원 전환이 완료되었습니다.
        <br />
        SNS 계정으로 가입한 회원정보가 투네이션 ID로 통합되었습니다.
      </p>
      <div className="flex flex-col divide-y divide-p-line rounded-xl border border-p-line px-4">
        {c.scenario.id === 'C21' && <KV k="SNS 계정">{TEST.snsEmail}</KV>}
        <KV k="투네이션 ID">{s.convToonId}</KV>
        {show.map((k) => (
          <div key={k} className="flex items-center justify-between gap-3 py-2.5">
            <TypeBadge t={k} />
            <span className="flex min-w-0 items-center gap-1.5 text-[13.5px] text-p-ink">
              <PlatformDot id={s.convPlatform} size={16} />
              <span className="shrink-0 text-p-mute">{p?.name}</span>
              <span className="truncate font-semibold">{s.convIds[k]}</span>
            </span>
          </div>
        ))}
      </div>
      <Btn onClick={() => c.go('snsConnect', '통합회원 전환 완료')}>통합회원 전환 완료</Btn>
    </Card>
  )
}

const OAUTH_ERR: Record<string, string> = {
  notconv: '차세대 통합회원 미전환 계정은 연결할 수 없습니다.',
  taken: '이미 SNS 간편 로그인으로 연결된 계정입니다. 다른 계정으로 시도해 주세요.',
  session: '로그인 정보를 불러오지 못했습니다. 다시 시도해 주세요.',
}

function SnsConnect() {
  const c = useMock()
  const s = c.session
  const [errs, setErrs] = useState<Record<string, string>>({})
  const sample: Record<string, string> = { twitch: 'toona_live', youtube: TEST.snsEmail, kakao: 'toona@kakao.com', payco: 'toona***', naver: 'toona@naver.com' }
  const add = (pid: string) =>
    c.oauth({
      platform: pid,
      outcomes: [
        { label: `연결 성공 · ${sample[pid]}`, value: 'ok', tone: 'ok' },
        { label: '통합회원 미전환 SNS 계정', value: 'notconv', tone: 'fail' },
        { label: '다른 투네이션 ID에 이미 연결됨', value: 'taken', tone: 'fail' },
        { label: '세션 정보 가져오기 실패', value: 'session', tone: 'fail' },
      ],
      onResult: (r) => {
        if (r === 'ok') {
          c.patch({ linked: { ...s.linked, [pid]: sample[pid] } })
          setErrs((e) => ({ ...e, [pid]: '' }))
          c.log(`${pname(pid)} 간편 로그인 연결`)
        } else if (r !== 'cancel') {
          setErrs((e) => ({ ...e, [pid]: OAUTH_ERR[r] }))
          c.log(`${pname(pid)} 연결 실패 · ${r}`)
        }
      },
    })
  return (
    <Card eyebrow="통합회원 전환">
      <Heading>{'SNS 간편 로그인을\n추가할 수 있어요.'}</Heading>
      <ul className="flex flex-col divide-y divide-p-line rounded-xl border border-p-line">
        {PLATFORMS.map((p) => (
          <li key={p.id} className="flex flex-col gap-1 px-4 py-3">
            <div className="flex items-center gap-3">
              <PlatformDot id={p.id} size={28} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[14.5px] font-semibold text-p-ink">{p.name}</span>
                {s.linked[p.id] && <span className="truncate text-[12px] text-p-mute">{s.linked[p.id]}</span>}
              </div>
              {s.linked[p.id] ? (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-semibold text-brand">연결됨</span>
              ) : (
                <button type="button" onClick={() => add(p.id)} className="text-[13px] font-semibold text-brand hover:underline">
                  + 연결 추가
                </button>
              )}
            </div>
            {errs[p.id] && <p className="pl-10 text-[12px] text-p-danger">{errs[p.id]}</p>}
          </li>
        ))}
      </ul>
      <p className="text-[12px] leading-relaxed text-p-faint">SNS 간편 로그인 설정은 투네이션 ID로 로그인하신 후, [마이페이지 &gt; 간편 로그인]에서 언제든지 설정하실 수 있습니다.</p>
      <Btn
        onClick={() => {
          c.patch({ converted: true, loggedIn: undefined })
          c.go('login', '투네이션 시작하기 → 비로그인 로그인 화면')
          c.toast('통합회원 전환이 완료되었습니다. 투네이션 ID로 로그인해 주세요.')
        }}
      >
        투네이션 시작하기
      </Btn>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 아이디 / 비밀번호 찾기                                              */
/* ------------------------------------------------------------------ */

const FOUND = [
  { id: 'tunaking', joined: '2025-12-12', status: '정상' },
  { id: 'yam12song', joined: '2024-01-10', status: '탈퇴유예' },
  { id: 'yam34song', joined: '2022-04-08', status: '정상' },
]

function FindIdResult() {
  const c = useMock()
  const [sel, setSel] = useState(0)
  if (c.session.findIdEmpty) {
    return (
      <Card>
        <FindTabs active="id" />
        <Heading>{'조회되는 정보가\n없습니다.'}</Heading>
        <Notice>가입된 투네이션 ID가 없습니다.</Notice>
        <Btn onClick={() => c.go('login', '닫기')}>닫기</Btn>
      </Card>
    )
  }
  const rows: Row[] = FOUND.map((f) => ({
    key: f.id,
    cells: [
      <b key="a">{f.id}</b>,
      <span key="b" className="font-mono text-[12.5px] tabular-nums text-p-mute">{f.joined}</span>,
      <span key="c" className={f.status === '정상' ? 'text-p-ink' : 'font-semibold text-[#C77700]'}>{f.status}</span>,
    ],
  }))
  return (
    <Card>
      <FindTabs active="id" />
      <Heading>{'보유ID를\n확인해 주세요.'}</Heading>
      <PickTable head={['', '투네이션 ID', '가입일', '계정 상태']} rows={rows} sel={sel} onSel={setSel} />
      {FOUND[sel].status === '탈퇴유예' && (
        <Notice tone="warn">회원탈퇴를 신청한 SNS 계정입니다. 유예기간(30일) 이내에는 탈퇴 계정이 조회됩니다. 다시 서비스를 이용하시려면 로그인하여 탈퇴 계정을 복구해 주세요.</Notice>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Btn
          kind="ghost"
          onClick={() => {
            c.patch({ findPwTarget: FOUND[sel].id })
            c.go('findPwReset', `비밀번호 재설정 (재인증 없음) · ${FOUND[sel].id}`)
          }}
        >
          비밀번호 재설정
        </Btn>
        <Btn onClick={() => c.go('login', '로그인')}>로그인</Btn>
      </div>
    </Card>
  )
}

function FindPwId() {
  const c = useMock()
  const [id, setId] = useState('')
  const [touched, setTouched] = useState(false)
  const [nf, setNf] = useState(false)
  const err = nf ? '존재하지 않는 사용자입니다.' : touched && id.length === 0 ? '아이디를 입력해 주세요.' : touched ? vId(id, true, []) : null
  return (
    <Card>
      <FindTabs active="pw" />
      <Heading>{'아이디를\n입력해 주세요.'}</Heading>
      <Field id="fp-id" label="아이디" placeholder="아이디 입력" value={id} error={err} onBlur={() => setTouched(true)} onChange={(v) => { setId(v); setTouched(true); setNf(false) }} />
      <BtnRow>
        <Btn kind="ghost" onClick={() => c.go('login', '닫기')}>
          닫기
        </Btn>
        <Btn
          disabled={!id || !!vId(id, true, [])}
          onClick={() => {
            if (!c.session.accounts[id]) {
              setNf(true)
              c.log(`미등록 아이디 · ${id}`)
              return
            }
            c.patch({ findPwTarget: id, authPurpose: 'findPw' })
            c.go('authType', `아이디 확인 · ${id}`)
          }}
        >
          다음
        </Btn>
      </BtnRow>
    </Card>
  )
}

function FindPwReset() {
  const c = useMock()
  const s = c.session
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [t, setT] = useState({ pw: false, pw2: false })
  const ok = !vPw(pw, true) && !vPw2(pw, pw2, true)
  return (
    <Card>
      <FindTabs active="pw" />
      <Heading>{'비밀번호를\n재설정해 주세요.'}</Heading>
      <Field id="rs-id" label="아이디" value={s.findPwTarget ?? ''} readOnly onChange={() => {}} />
      <Field id="rs-pw" label="비밀번호" type="password" placeholder="영문, 특수문자, 숫자 조합 10자 이상" value={pw} error={vPw(pw, t.pw)} onBlur={() => setT({ ...t, pw: true })} onChange={(v) => { setPw(v); setT((x) => ({ ...x, pw: true })) }} />
      <Field id="rs-pw2" label="비밀번호 확인" type="password" placeholder="비밀번호 재입력" value={pw2} error={vPw2(pw, pw2, t.pw2)} onBlur={() => setT({ ...t, pw2: true })} onChange={(v) => { setPw2(v); setT((x) => ({ ...x, pw2: true })) }} />
      <Btn
        disabled={!ok}
        onClick={() => {
          const id = s.findPwTarget!
          const prev = s.accounts[id] ?? { nick: id, tag: randTag(), joined: '2024-01-01' }
          c.patch({ accounts: { ...s.accounts, [id]: { ...prev, pw } } })
          c.go('findPwDone', `비밀번호 변경 · ${id}`)
        }}
      >
        확인
      </Btn>
    </Card>
  )
}

function FindPwDone() {
  const c = useMock()
  return (
    <Card>
      <FindTabs active="pw" />
      <Heading>{'비밀번호가\n변경되었습니다.'}</Heading>
      <p className="-mt-2 text-[14px] text-p-mute">새로운 비밀번호로 다시 로그인 해주세요.</p>
      <Btn onClick={() => c.go('login', '로그인')}>로그인</Btn>
    </Card>
  )
}

export const SCREENS: Record<ScreenId, { C: () => ReactNode; path: string; name: string }> = {
  login: { C: Login, path: '/login', name: '로그인' },
  terms: { C: Terms, path: '/signup/terms', name: '약관 동의' },
  authType: { C: AuthType, path: '/auth/type', name: '인증 유형 선택' },
  overseasPhone: { C: OverseasPhone, path: '/auth/overseas', name: '해외 휴대폰 인증' },
  overseasCode: { C: OverseasCode, path: '/auth/overseas/code', name: '인증번호 입력' },
  createId: { C: CreateId, path: '/signup/account', name: '신규 ID 생성' },
  signupDone: { C: SignupDone, path: '/signup/done', name: '회원가입 완료' },
  home: { C: Home, path: '/', name: '통합홈' },
  tfaSelect: { C: TfaSelect, path: '/login/2fa', name: '2차 인증 방법 선택' },
  tfaCode: { C: TfaCode, path: '/login/2fa/code', name: '2차 인증번호 입력' },
  convGuide: { C: ConvGuide, path: '/convert', name: '통합회원 전환 안내' },
  convSelectSns: { C: ConvSelectSns, path: '/convert/sns', name: 'SNS 계정 선택' },
  convSelectToonId: { C: ConvSelectToonId, path: '/convert/toon-id', name: '투네이션 ID 선택' },
  convSelectInfo: { C: ConvSelectInfo, path: '/convert/account', name: '계정 정보 선택' },
  nickname: { C: Nickname, path: '/convert/nickname', name: '닉네임 설정' },
  convDone: { C: ConvDone, path: '/convert/done', name: '전환 완료' },
  snsConnect: { C: SnsConnect, path: '/convert/sns-link', name: 'SNS 간편 로그인 연결' },
  findIdResult: { C: FindIdResult, path: '/find/id', name: '보유 ID 확인' },
  findPwId: { C: FindPwId, path: '/find/password', name: '비밀번호 찾기' },
  findPwReset: { C: FindPwReset, path: '/find/password/reset', name: '비밀번호 재설정' },
  findPwDone: { C: FindPwDone, path: '/find/password/done', name: '재설정 완료' },
}
