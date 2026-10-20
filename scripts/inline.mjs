// vite build 결과(dist)를 Artifact로 게시할 단일 HTML(bundle.html)로 합친다.
// Artifact는 <html>/<head>/<body> 골격을 게시 시점에 감싸므로 본문 조각만 출력한다.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const dir = 'dist/assets/'
const files = readdirSync(dir)
const css = readFileSync(dir + files.find((f) => f.endsWith('.css')), 'utf8')
const js = readFileSync(dir + files.find((f) => f.endsWith('.js')), 'utf8').replace(/<\/script/gi, '<\\/script')

const html = `<title>투네이션 계정 플로우 목업</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700;900&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync('bundle.html', html)
console.log(`bundle.html ${(html.length / 1024).toFixed(0)} KB`)
