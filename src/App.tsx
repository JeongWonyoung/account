import { useState } from 'react'
import { Entry } from './mock/Entry'
import { Runner } from './mock/Runner'
import type { Scenario } from './mock/data'

export default function App() {
  const [run, setRun] = useState<{ sc: Scenario; v: string; k: number } | null>(null)
  return (
    <div className="shell mx-auto w-full max-w-[1280px]">
      {run ? (
        <Runner
          key={`${run.sc.id}-${run.v}-${run.k}`}
          scenario={run.sc}
          variant={run.v}
          onVariant={(v) => setRun({ ...run, v, k: run.k + 1 })}
          onExit={() => setRun(null)}
        />
      ) : (
        <Entry onStart={(sc, v) => setRun({ sc, v, k: Date.now() })} />
      )}
    </div>
  )
}
