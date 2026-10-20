import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ---------- product (toonation) primitives: always light, brand #375FF4 ---------- */

export function Heading({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="whitespace-pre-line text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-p-ink [text-wrap:balance]">{children}</h1>
      {sub && <p className="text-[13.5px] leading-relaxed text-p-mute">{sub}</p>}
    </div>
  )
}

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  kind?: 'primary' | 'ghost' | 'text'
  className?: string
  type?: 'button' | 'submit'
}
export function Btn({ children, onClick, disabled, kind = 'primary', className = '', type = 'button' }: BtnProps) {
  const base = 'h-12 rounded-[10px] px-4 text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
  const look =
    kind === 'primary'
      ? 'bg-brand text-white hover:bg-brand-600 disabled:bg-p-line disabled:text-p-faint'
      : kind === 'ghost'
        ? 'border border-p-line bg-white text-p-ink hover:bg-p-soft disabled:text-p-faint'
        : 'h-auto px-0 text-[13px] font-medium text-p-mute underline-offset-2 hover:underline'
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${look} ${className}`}>
      {children}
    </button>
  )
}

export function BtnRow({ children }: { children: ReactNode }) {
  return <div className="mt-2 grid grid-cols-[1fr_1.6fr] gap-2">{children}</div>
}

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string | null
  readOnly?: boolean
  inputMode?: 'numeric' | 'text'
  onBlur?: () => void
  autoFocus?: boolean
}
export function Field({ id, label, value, onChange, placeholder, type = 'text', error, readOnly, inputMode, onBlur, autoFocus }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-p-ink">
        {label}
      </label>
      <input
        id={id}
        value={value}
        type={type}
        readOnly={readOnly}
        inputMode={inputMode}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-p-ink outline-none transition-colors placeholder:text-p-faint focus:border-brand ${
          error ? 'border-p-danger focus:border-p-danger' : 'border-p-line'
        } ${readOnly ? 'bg-p-soft text-p-mute' : ''}`}
      />
      {error && <p className="text-[12.5px] text-p-danger">{error}</p>}
    </div>
  )
}

export function Check({ checked, onChange, children, strong }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; strong?: boolean }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-w-0 items-center gap-2.5 text-left">
      <span
        className={`grid size-[20px] shrink-0 place-items-center rounded-[5px] border transition-colors ${
          checked ? 'border-brand bg-brand text-white' : 'border-p-line bg-white text-transparent'
        }`}
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 6.2 5 8.5l4.5-5" />
        </svg>
      </span>
      <span className={`min-w-0 text-[14px] ${strong ? 'font-bold text-p-ink' : 'text-p-ink'}`}>{children}</span>
    </button>
  )
}

export function Tag({ req }: { req: boolean }) {
  return (
    <span className={`mr-1.5 rounded px-1.5 py-[1px] text-[11px] font-bold ${req ? 'bg-brand-50 text-brand' : 'bg-p-soft text-p-mute'}`}>
      {req ? '필수' : '선택'}
    </span>
  )
}

export function Radio({ on }: { on: boolean }) {
  return (
    <span className={`grid size-[18px] shrink-0 place-items-center rounded-full border-2 ${on ? 'border-brand' : 'border-p-line'}`}>
      {on && <span className="size-2 rounded-full bg-brand" />}
    </span>
  )
}

export function Modal({ children, onClose, wide }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/45 p-4" onClick={onClose}>
      <div
        role="dialog"
        className={`w-full ${wide ? 'max-w-[400px]' : 'max-w-[320px]'} rounded-2xl bg-white p-5 shadow-[0_20px_50px_-12px_rgba(20,30,70,.45)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="max-w-[360px] rounded-xl bg-[#1c2130]/95 px-4 py-3 text-center text-[13px] leading-snug text-white shadow-lg">{msg}</div>
    </div>
  )
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p className={`rounded-[10px] px-3.5 py-3 text-[12.5px] leading-relaxed ${tone === 'warn' ? 'bg-[#FFF1F1] text-[#C13030]' : 'bg-p-soft text-p-mute'}`}>
      {children}
    </p>
  )
}

export const PLATFORMS = [
  { id: 'twitch', name: 'Twitch', color: '#9146FF', short: 'T' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', short: '▶' },
  { id: 'kakao', name: 'Kakao', color: '#FEE500', short: 'K', dark: true },
  { id: 'payco', name: 'Payco', color: '#FA2828', short: 'P' },
  { id: 'naver', name: 'Naver', color: '#03C75A', short: 'N' },
] as const

export function PlatformDot({ id, size = 22 }: { id: string; size?: number }) {
  const p = PLATFORMS.find((x) => x.id === id) ?? PLATFORMS[1]
  return (
    <span
      className="grid shrink-0 place-items-center rounded-md text-[11px] font-black"
      style={{ width: size, height: size, background: p.color, color: 'dark' in p && p.dark ? '#191600' : '#fff' }}
      aria-hidden
    >
      {p.short}
    </span>
  )
}

/* ---------- hooks ---------- */

export function useCountdown(initial: number, running: boolean) {
  const [sec, setSec] = useState(initial)
  const ref = useRef(running)
  ref.current = running
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [running])
  return [sec, setSec] as const
}

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
export const msShort = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/* ---------- validation (설계서 p.30, p.81) ---------- */

const EMOJI = /\p{Extended_Pictographic}/u
const BLACKLIST = ['바보', '멍청', 'fuck', 'shit', '운영자']
export const graphemes = (s: string) => Array.from(s).length

export function vNickname(v: string, touched: boolean): string | null {
  if (!touched) return null
  if (v.length === 0) return '닉네임을 입력해 주세요.'
  if (EMOJI.test(v)) return '이모지는 사용하실 수 없습니다.'
  const n = graphemes(v)
  if (n < 2 || n > 16) return '닉네임은 2자에서 16자 사이여야 합니다.'
  if (BLACKLIST.some((w) => v.toLowerCase().includes(w))) return '부적절한 표현이 포함되어 있습니다.'
  return null
}
export function vId(v: string, touched: boolean, taken: string[]): string | null {
  if (!touched) return null
  if (v.length === 0) return '아이디를 입력해 주세요.'
  if (!/^[A-Za-z0-9]+$/.test(v)) return '아이디에는 영문 또는 숫자만 쓸 수 있습니다.'
  if (v.length < 4 || v.length > 25) return '아이디는 4자에서 25자 사이여야 합니다.'
  if (taken.includes(v.toLowerCase())) return '사용할 수 없는 아이디입니다.'
  return null
}
export function vPw(v: string, touched: boolean): string | null {
  if (!touched) return null
  if (v.length === 0) return '비밀번호를 입력해 주세요.'
  if (v.length < 10 || v.length > 25) return '비밀번호는 10자에서 25자 사이여야 합니다.'
  const kinds = [/[A-Za-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length
  if (kinds < 2) return '영문, 특수문자, 숫자 중 2가지 이상을 조합하세요.'
  return null
}
export function vPw2(pw: string, v: string, touched: boolean): string | null {
  if (!touched) return null
  if (v.length === 0) return '비밀번호를 다시 한번 입력해 주세요.'
  if (v !== pw) return '비밀번호가 일치 하지 않습니다.'
  return null
}

export function randTag() {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join('')
}
