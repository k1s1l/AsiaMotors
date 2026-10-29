// Renders CGI media for the site: node tools/render.mjs [shot|all|film|stills] [--preview]
import { createServer } from 'vite'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH ?? 'playwright')
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const out = path.join(root, 'tools/.frames')
const pub = path.join(root, 'public/media')
const arg = process.argv[2] ?? 'all'
const preview = process.argv.includes('--preview')

const FPS = 30
const FILM = ['film-disc', 'film-gears', 'film-spring', 'film-piston']
const FILM_DUR = 3.6
const CATS = ['cat-engine', 'cat-transmission', 'cat-brakes', 'cat-suspension', 'cat-electrics', 'cat-body', 'cat-optics', 'cat-cooling', 'cat-maintenance', 'cat-steering']
const PRODUCTS = ['p-hood', 'p-alternator', 'p-sensor', 'p-starter', 'p-tensioner', 'p-sprocket', 'p-headlight']

const sizes = (name) =>
  name.startsWith('film') ? [1600, 900] : name === 'story-macro' ? [2400, 1200] : name.startsWith('cat') ? [1600, 1200] : [1200, 1200]

const server = await createServer({ root, configFile: false, logLevel: 'error', server: { port: 5199, hmr: false, watch: null } })
await server.listen()
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
mkdirSync(out, { recursive: true })
mkdirSync(pub, { recursive: true })

async function render(name, frames, scale = 1) {
  let [w, h] = sizes(name)
  w = Math.round(w * scale); h = Math.round(h * scale)
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  page.on('pageerror', (e) => console.error(name, e.message))
  page.on('console', (m) => m.type() === 'error' && console.error(name, m.text()))
  await page.goto('http://localhost:5199/tools/studio/index.html')
  await page.waitForFunction(() => window.__ready === true)
  await page.evaluate(([n, w, h]) => window.__init(n, w, h), [name, w, h])
  const dir = path.join(out, name)
  mkdirSync(dir, { recursive: true })
  const t0 = Date.now()
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.__frame(t), preview && frames === 1 && name.startsWith("film") ? FILM_DUR / 2 : i / FPS)
    await page.locator('canvas').screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.png`) })
  }
  console.log(`${name}: ${frames} frame(s) in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  await page.close()
  return dir
}

const grade = 'vignette=angle=PI/4.2,noise=alls=5:allf=t'
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a], { stdio: 'inherit' })

async function still(name, outName, q = 82) {
  const dir = await render(name, 1, preview ? 0.5 : 1)
  const mood = name.startsWith('p-') ? 'noise=alls=2:allf=t' : grade
  ff('-i', path.join(dir, '0000.png'), '-vf', mood, '-c:v', 'libwebp', '-quality', String(q), path.join(pub, `${outName}.webp`))
}

async function film() {
  const n = Math.round(FILM_DUR * FPS)
  const dirs = []
  // RERENDER=film-gears,... re-renders only those shots and reuses the other frame folders
  const only = process.env.RERENDER?.split(',')
  for (const s of FILM) {
    const dir = path.join(out, s)
    if (!preview && only && !only.includes(s) && existsSync(dir) && readdirSync(dir).length >= n) dirs.push(dir)
    else dirs.push(await render(s, preview ? 1 : n, preview ? 0.5 : 1))
  }
  if (preview) { for (const s of FILM) execFileSync("cp", [path.join(out, s, "0000.png"), path.join(out, s + ".png")]); return }
  // crossfade the four shots; fade from/to black so the loop seam is invisible
  const X = 0.6
  const inputs = dirs.flatMap((d) => ['-framerate', String(FPS), '-i', path.join(d, '%04d.png')])
  let chain = ''
  let last = '[0:v]'
  let offset = 0
  for (let i = 1; i < dirs.length; i++) {
    offset += FILM_DUR - X
    const lbl = `[x${i}]`
    chain += `${last}[${i}:v]xfade=transition=fade:duration=${X}:offset=${offset.toFixed(2)}${lbl};`
    last = lbl
  }
  const total = FILM_DUR * dirs.length - X * (dirs.length - 1)
  chain += `${last}fade=t=in:st=0:d=0.5,fade=t=out:st=${(total - 0.5).toFixed(2)}:d=0.5,${grade},format=yuv420p[v]`
  const master = path.join(out, 'film-master.mkv')
  ff(...inputs, '-filter_complex', chain, '-map', '[v]', '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', master)
  // web encodes: desktop 1600x900 and a lighter 960x540 for phones
  ff('-i', master, '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart', '-an', path.join(pub, 'hero-1600.mp4'))
  ff('-i', master, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-an', path.join(pub, 'hero-1600.webm'))
  ff('-i', master, '-vf', 'scale=960:-2', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart', '-an', path.join(pub, 'hero-960.mp4'))
  // poster = a frame from the brake-disc shot, after the fade-in
  ff('-ss', '1.6', '-i', master, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', path.join(pub, 'hero-poster.webp'))
}

try {
  if (arg === 'film') await film()
  else if (arg === 'stills' || arg === 'all') {
    for (const c of CATS) await still(c, c)
    await still('story-macro', 'story-macro', 80)
    for (const p of PRODUCTS) await still(p, p, 84)
    if (arg === 'all') await film()
  } else for (const n of arg.split(',')) await still(n, n)
} finally {
  await browser.close()
  await server.close()
}
