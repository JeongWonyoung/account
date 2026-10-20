export type ScreenId =
  | 'login'
  | 'terms'
  | 'authType'
  | 'overseasPhone'
  | 'overseasCode'
  | 'createId'
  | 'signupDone'
  | 'home'
  | 'tfaSelect'
  | 'tfaCode'
  | 'convGuide'
  | 'convSelectSns'
  | 'convSelectToonId'
  | 'convSelectInfo'
  | 'nickname'
  | 'convDone'
  | 'snsConnect'
  | 'findIdResult'
  | 'findPwId'
  | 'findPwReset'
  | 'findPwDone'

export type Sim = { label: string; event: string }

export type Step = {
  screens: ScreenId[]
  title: string
  page: string
  checks: string[]
  sims?: Sim[]
}

export type Variant = { id: string; label: string; desc: string }

export type GroupId = 'A' | 'B' | 'C' | 'D'

export type Scenario = {
  id: string
  group: GroupId
  code: string
  title: string
  condition: string
  hint: string
  variants?: Variant[]
  steps: Step[]
}

export const GROUPS: { id: GroupId; title: string; pages: string; desc: string }[] = [
  { id: 'A', title: '신규 회원가입', pages: 'p.19–30', desc: '약관 동의 → 인증 유형 3종 → 신규 ID 생성' },
  { id: 'B', title: '로그인', pages: 'p.36–41', desc: '통합회원 전환을 마친 계정의 로그인과 2차 인증' },
  { id: 'C', title: '차세대 통합회원 전환', pages: 'p.47–79', desc: '런칭 직전 투네이션 ID 연결 여부에 따른 4개 플로우' },
  { id: 'D', title: '아이디 · 비밀번호 찾기', pages: 'p.80–82', desc: '본인인증 기반 보유 ID 조회와 비밀번호 재설정' },
]

export const TEST = {
  id: 'toonaone',
  pw: 'toona1234!',
  code: '123456',
  snsEmail: 'toona144@gmail.com',
  takenIds: ['toonaone', 'toonatwo', 'toonathree', 'tunaking', 'yam34song', 'yam12song', 'admin'],
  phone: '010-****-0000',
  email: 'to*******@naver.com',
}

const loginStep = (page: string, checks: string[]): Step => ({ screens: ['login'], title: '로그인', page, checks })
const endStep: Step = {
  screens: ['login'],
  title: '로그인 화면 복귀 (비로그인)',
  page: 'V3.4',
  checks: ['완료 후 비로그인 상태로 로그인 화면 이동 (History V3.4 기준)', '전환/가입한 계정으로 다시 로그인하면 통합홈 진입'],
}
const guideStep = (page: string): Step => ({
  screens: ['convGuide'],
  title: '통합회원 전환 안내 & 약관 동의',
  page,
  checks: [
    '필수 2개 체크 전 [통합회원 전환하기] 비활성',
    '전체 동의 시 선택 항목까지 일괄 체크',
    '[로그아웃] 클릭 시 로그인 화면 이동',
  ],
})
const snsStep = (page: string): Step => ({
  screens: ['snsConnect'],
  title: 'SNS 간편 로그인 계정 연결',
  page,
  checks: [
    '[+ 연결 추가] → OAuth 결과 선택',
    '성공 시 "연결됨" + 플랫폼 ID 표시',
    '실패 3종 유효성 메시지 (미전환 / 타 ID 연결 / 세션 실패)',
    '[투네이션 시작하기] → 비로그인 로그인 화면',
  ],
})
const nickStep = (page: string, next: string): Step => ({
  screens: ['nickname'],
  title: '닉네임 설정',
  page,
  checks: ['진입 시 닉네임 자동 입력 (송송송)', '모두 지우면 "닉네임을 입력해 주세요." + 에러 라인', `[다음] → ${next}`],
})

const signupSteps = (kind: 'over14' | 'under14' | 'overseas'): Step[] => {
  const steps: Step[] = [
    loginStep('p.36', ['하단 [회원가입] 클릭']),
    {
      screens: ['terms'],
      title: '약관 동의',
      page: 'p.19',
      checks: ['필수 2개 체크 시 [다음] 활성', '[전체 동의하기] 일괄 체크/해제', '[>] 클릭 시 약관 상세 팝업'],
    },
    {
      screens: ['authType'],
      title: '인증 유형 선택',
      page: 'p.20',
      checks: ['미선택 Default, 1개만 선택 가능', '선택 시 [다음] 활성'],
    },
  ]
  if (kind === 'over14') {
    steps[2].checks.push('"국내 만14세 이상" → PASS 본인인증')
  } else if (kind === 'under14') {
    steps[2].checks.push('"국내 만14세 미만" → PASS 미성년자 본인인증 → 법정대리인 모달 (p.21)')
    steps[2].checks.push('모달 [취소] → 인증 유형 선택 복귀 / [인증하기] → 법정대리인 PASS (p.22)')
  } else {
    steps[2].checks.push('"해외 회원" → 해외 휴대폰 인증')
    steps.push({
      screens: ['overseasPhone'],
      title: '해외 휴대폰 인증',
      page: 'p.26',
      checks: ['국가번호 드롭다운 (대한민국·아프리카·아프가니스탄 제외)', '전화번호 숫자만 입력', '국가번호 + 1자 이상 입력 시 [다음] 활성'],
      sims: [{ label: '일 발송 10회 초과', event: 'send10' }],
    })
    steps.push({
      screens: ['overseasCode'],
      title: '인증번호 입력',
      page: 'p.27·29',
      checks: ['남은 시간 10:00 / 재시도 가능 횟수 3', '6자리 입력 시 [다음] 활성', `인증번호 ${TEST.code} 입력 시 통과`, '오입력 시 횟수 차감, 4번째 실패 시 알럿'],
      sims: [
        { label: '입력시간 초과', event: 'expire' },
        { label: '재전송 10회 초과', event: 'resend10' },
      ],
    })
  }
  steps.push({
    screens: ['createId'],
    title: '신규 ID 생성',
    page: kind === 'overseas' ? 'p.28·30' : kind === 'under14' ? 'p.22·30' : 'p.24·30',
    checks: [
      '닉네임: 이모지 제외 2–16자, 금칙어 차단',
      `아이디: 영문/숫자 4–25자, 중복(${TEST.id}) 차단`,
      '비밀번호: 10–25자, 영문·숫자·특수문자 중 2종 이상',
      '모든 항목 유효 시 [다음] 활성',
    ],
  })
  steps.push({
    screens: ['signupDone'],
    title: '회원가입 완료',
    page: kind === 'overseas' ? 'p.28' : kind === 'under14' ? 'p.23' : 'p.25',
    checks: ['생성한 투네이션 ID 표시', '고유식별번호(닉네임#영문숫자6) 생성'],
  })
  steps.push(endStep)
  return steps
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'A1',
    group: 'A',
    code: 'A-1',
    title: '국내 만 14세 이상',
    condition: '신규 사용자 · 본인 명의 휴대폰 PASS 인증',
    hint: '로그인 화면 하단 [회원가입]으로 시작하세요.',
    steps: signupSteps('over14'),
  },
  {
    id: 'A2',
    group: 'A',
    code: 'A-2',
    title: '국내 만 14세 미만',
    condition: '신규 사용자 · 법정대리인 동의 필요',
    hint: '인증 유형에서 "국내 만14세 미만"을 선택하세요.',
    steps: signupSteps('under14'),
  },
  {
    id: 'A3',
    group: 'A',
    code: 'A-3',
    title: '해외 회원',
    condition: '신규 사용자 · 해외 휴대폰 문자 인증',
    hint: '인증 유형에서 "해외 회원"을 선택하세요.',
    steps: signupSteps('overseas'),
  },
  {
    id: 'B1',
    group: 'B',
    code: 'B-1',
    title: '일반 로그인',
    condition: '통합회원 전환 완료 · 2차 인증 OFF',
    hint: `테스트 계정 ${TEST.id} / ${TEST.pw}`,
    steps: [
      loginStep('p.36–37', [
        '아이디·비밀번호 모두 입력 시 [로그인] 활성',
        '입력 후 지우면 "아이디를 입력해주세요." 등 필드 하단 노출',
        '불일치 시 비밀번호 하단 "아이디 또는 비밀번호가 일치하지 않습니다."',
      ]),
      { screens: ['home'], title: '통합홈 (로그인 상태)', page: 'p.89', checks: ['GNB 보유캐시·알림·프로필 노출', '닉네임#고유식별번호 표시'] },
    ],
  },
  {
    id: 'B2',
    group: 'B',
    code: 'B-2',
    title: '2차 인증 ON 계정',
    condition: '통합회원 전환 완료 · 2차 인증 설정',
    hint: `테스트 계정으로 로그인 후 인증번호 ${TEST.code}`,
    steps: [
      loginStep('p.36', ['정상 로그인 시 바로 세션 부여하지 않고 2차 인증 노출']),
      {
        screens: ['tfaSelect'],
        title: '2차 인증 방법 선택',
        page: 'p.38',
        checks: ['기본 선택: 휴대폰', '휴대폰/이메일 마스킹 노출', '[?] 2차 인증 해지 방법 툴팁', '[로그인 취소] → 로그인 화면'],
      },
      {
        screens: ['tfaCode'],
        title: '인증번호 입력',
        page: 'p.39–40',
        checks: [
          '첫 칸 자동 포커스, 숫자 입력 시 다음 칸 이동',
          '남은 시간 10:00 · 1분 미만 붉은 표시',
          '재전송 대기 3:00 후 [재전송하기] 노출',
          '오입력 시 붉은 표기 + 입력 disabled → 재전송 필요',
          '1일 8·9회 요청 토스트, 10회 이상 재전송 비노출',
        ],
        sims: [
          { label: '남은 시간 1분 미만', event: 'under1min' },
          { label: '인증시간 만료', event: 'expire' },
          { label: '재전송 대기 건너뛰기', event: 'skipWait' },
          { label: '요청 횟수 7회로 설정', event: 'req7' },
        ],
      },
      { screens: ['home'], title: '로그인 완료 → 통합홈', page: 'p.89', checks: ['정상 로그인 시 인증 제한 건수 리셋'] },
    ],
  },
  {
    id: 'C11',
    group: 'C',
    code: 'C-1-1',
    title: '투네이션 ID 로그인 › 연결된 SNS 있음',
    condition: '기존 투네이션 ID에 SNS 계정이 연결된 활성 회원',
    hint: `기존 ID ${TEST.id} / ${TEST.pw} 로 로그인하세요.`,
    variants: [
      { id: 'merge', label: 'CASE 1 · 병합 조건 부합', desc: '크리에이터·도네이터가 같은 플랫폼(유튜브) → 병합 행 최상단' },
      { id: 'nomerge', label: 'CASE 2 · 병합 조건 미부합', desc: '동일 플랫폼 없음 → 계정 1개를 골라 전환' },
    ],
    steps: [
      loginStep('p.53', ['미전환 계정 로그인 시 전환 안내로 이동']),
      guideStep('p.54'),
      {
        screens: ['convSelectSns'],
        title: '전환할 SNS 계정 선택',
        page: 'p.55',
        checks: [
          '로그인한 투네이션 ID 표시',
          'Default 선택: 리스트 최상단',
          '정렬: 크리에이터→도네이터, 트위치→유튜브→카카오→페이코→네이버',
          'CASE 2: 다른 SNS 계정 전환 안내 문구',
        ],
      },
      nickStep('p.56', '전환 완료'),
      {
        screens: ['convDone'],
        title: '통합회원 전환 완료',
        page: 'p.57',
        checks: ['선택에 따라 크리+도네 / 크리에이터 / 도네이터 표시', '[통합회원 전환 완료] → SNS 간편 로그인 연결'],
      },
      snsStep('p.58'),
      endStep,
    ],
  },
  {
    id: 'C12',
    group: 'C',
    code: 'C-1-2',
    title: '투네이션 ID 로그인 › 연결된 SNS 없음',
    condition: '기존 투네이션 ID만 있고 연결 SNS 없음',
    hint: `기존 ID ${TEST.id} / ${TEST.pw} 로 로그인하세요.`,
    steps: [
      loginStep('p.61', ['미전환 계정 로그인 시 전환 안내로 이동']),
      guideStep('p.61'),
      nickStep('p.62', 'SNS 간편 로그인 연결 (전환 완료 화면 없음)'),
      snsStep('p.62'),
      endStep,
    ],
  },
  {
    id: 'C21',
    group: 'C',
    code: 'C-2-1',
    title: 'SNS 로그인 › 투네이션 ID 연결 상태',
    condition: 'SNS 계정이 기존 투네이션 ID에 연결된 활성 회원',
    hint: '로그인 화면에서 [YouTube] SNS 로그인을 누르세요.',
    variants: [
      { id: 'diff', label: 'CASE 1 · 유형별 다른 투네이션 ID', desc: '크리에이터 toonaone / 도네이터 toonatwo 중 선택' },
      { id: 'merge', label: 'CASE 2 · 병합 조건 부합', desc: '하나의 투네이션 ID(toonathree)에 크리·도네 병합' },
    ],
    steps: [
      loginStep('p.65', ['SNS 로그인 시 미전환이면 전환 안내로 이동']),
      guideStep('p.66'),
      {
        screens: ['convSelectToonId'],
        title: '전환할 투네이션 ID 선택',
        page: 'p.67',
        checks: ['로그인한 SNS 계정 ID 표시', '연결된 기존 투네이션 ID 목록, 첫 행 Default 선택'],
      },
      nickStep('p.68', '전환 완료'),
      { screens: ['convDone'], title: '통합회원 전환 완료', page: 'p.69', checks: ['SNS 계정 / 투네이션 ID 정보 표시'] },
      snsStep('p.70'),
      endStep,
    ],
  },
  {
    id: 'C22',
    group: 'C',
    code: 'C-2-2',
    title: 'SNS 로그인 › 투네이션 ID 미연결 (유령 회원)',
    condition: 'SNS 계정만 있고 투네이션 ID 없음 → 신규 ID 발급',
    hint: '로그인 화면에서 [YouTube] SNS 로그인을 누르세요.',
    variants: [
      { id: 'creator', label: 'CASE 1 · 크리에이터만', desc: '크리에이터 계정 정보 1건' },
      { id: 'donor', label: 'CASE 2 · 도네이터만', desc: '도네이터 계정 정보 1건' },
      { id: 'both', label: 'CASE 3 · 둘 다 존재', desc: '크리에이터·도네이터 중 선택' },
    ],
    steps: [
      loginStep('p.73', ['SNS 로그인 시 미전환이면 전환 안내로 이동']),
      guideStep('p.74'),
      {
        screens: ['authType'],
        title: '인증 유형 선택 & 사용자 인증',
        page: 'p.75',
        checks: ['통합회원 전환을 위한 본인인증 (CI 저장 전제)', '해외는 휴대폰 문자 인증'],
      },
      {
        screens: ['convSelectInfo'],
        title: '전환할 계정 정보 선택',
        page: 'p.76',
        checks: ['SNS 계정 ID 텍스트 표시(수정 불가)', '투네이션 ID 컬럼 "-" 표시', '첫 행 Default, [다음] 기본 활성'],
      },
      {
        screens: ['createId'],
        title: '신규 투네이션 ID 생성',
        page: 'p.77',
        checks: ['닉네임 자동 입력', '아이디·비밀번호 규칙은 회원가입과 동일', '[뒤로가기] → 계정 정보 선택'],
      },
      { screens: ['convDone'], title: '통합회원 전환 완료', page: 'p.78', checks: ['크리에이터 또는 도네이터 계정 표시'] },
      snsStep('p.79'),
      endStep,
    ],
  },
  {
    id: 'D1',
    group: 'D',
    code: 'D-1',
    title: '아이디 찾기',
    condition: '본인인증으로 보유 투네이션 ID 조회',
    hint: '로그인 화면에서 [아이디 찾기]를 누르세요.',
    steps: [
      loginStep('p.36', ['[아이디 찾기] 클릭']),
      { screens: ['authType'], title: '인증 유형 선택', page: 'p.80', checks: ['PASS 결과: 보유 ID 있음 / 조회 정보 없음 / 인증 실패 토스트'] },
      {
        screens: ['findIdResult'],
        title: '보유 ID 확인',
        page: 'p.80',
        checks: ['1행 Default 선택', '투네이션 ID · 가입일 · 계정 상태(정상/탈퇴유예)', '[비밀번호 재설정]은 재인증 없이 이동'],
      },
      { screens: ['findPwReset', 'findPwDone'], title: '비밀번호 재설정 (선택)', page: 'p.81–82', checks: ['회원가입과 동일한 비밀번호 규칙'] },
      { screens: ['login', 'home'], title: '로그인', page: 'p.36', checks: ['변경한 비밀번호로 로그인 가능'] },
    ],
  },
  {
    id: 'D2',
    group: 'D',
    code: 'D-2',
    title: '비밀번호 찾기',
    condition: '아이디 입력 → 본인인증 → 비밀번호 재설정',
    hint: '로그인 화면에서 [비밀번호 찾기]를 누르세요.',
    steps: [
      loginStep('p.36', ['[비밀번호 찾기] 클릭']),
      {
        screens: ['findPwId'],
        title: '아이디 입력',
        page: 'p.81',
        checks: ['4–25자, 영문/숫자 유효성', '미등록 아이디 → "존재하지 않는 사용자입니다."'],
      },
      { screens: ['authType'], title: '인증 유형 선택', page: 'p.81', checks: ['PASS 결과: 인증 완료 / 아이디 불일치 토스트'] },
      { screens: ['findPwReset'], title: '비밀번호 재설정', page: 'p.81', checks: ['회원가입 비밀번호 규칙과 동일'] },
      { screens: ['findPwDone'], title: '재설정 완료', page: 'p.82', checks: ['[로그인] → 로그인 화면'] },
      { screens: ['login', 'home'], title: '새 비밀번호로 로그인', page: 'p.36', checks: ['이전 비밀번호는 불일치 처리'] },
    ],
  },
]

export const DOC_ISSUES: { page: string; title: string; detail: string; applied: string }[] = [
  {
    page: 'p.23 · 52 · 60 vs V3.4',
    title: '가입·전환 완료 후 이동 화면',
    detail: '본문은 "로그인 상태로 통합홈 이동", History V3.4는 "비로그인 상태로 통합 로그인 화면 이동"으로 통일.',
    applied: 'V3.4 기준: 로그인 화면(비로그인)으로 이동',
  },
  {
    page: 'p.26 · 27',
    title: '해외 인증 재시도 횟수',
    detail: '"문자 1회당 재시도 4회(최초 입력 후 3 표시)", "3회 초과 오류 시 에러", "총 4회 재시도"가 혼재.',
    applied: '표시값 3에서 시작, 4번째 오입력 시 실패 알럿',
  },
  {
    page: 'p.39 · 40',
    title: '2차 인증 재전송 대기 시간',
    detail: 'p.39는 3분, p.40 2-3은 "재전송 대기 30초 지나면 버튼 노출".',
    applied: 'V3.4 수정 내역 기준 3분',
  },
  {
    page: 'p.55',
    title: 'CASE 1 예시 데이터',
    detail: '"yam34song / 크리에이터 / 카카오" 행이 있으나 크리에이터 SNS 플랫폼은 유튜브·트위치·네이버(p.49)뿐.',
    applied: '설계서 예시 그대로 표시 (확인 필요)',
  },
  {
    page: 'p.41',
    title: '인증번호 유효시간 문구',
    detail: '발송 메일 폼은 "유효시간 : 3분", 입력 화면 타이머는 10분.',
    applied: '입력 화면 10:00 적용',
  },
]
