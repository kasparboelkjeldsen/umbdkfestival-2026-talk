#!/usr/bin/env node
// npm run dkfestival: start everything the talk needs, in one terminal.
//
//   1. the Umbraco demo site (Umbraco.Community.Sinners' test site, https://localhost:44343),
//      unless it's already running;
//   2. once it answers, the deck's dev server on http://localhost:5180 (the port the site's
//      BackOfficeHost expects), opened in the browser.
//
// Ctrl+C stops both. The site is looked for in this repository first (sinners/Umbraco/18.2.1, where
// the talk's own repository keeps a copy), then beside it (../Umbraco.Community.Sinners, a checkout
// of the package). Override with SINNERS_SITE=<path>.
//
// The rig: a tiny control server on 127.0.0.1:5181 (the deck reaches it as /__rig through its proxy).
// POST /__rig/reset (the deck's reset: R or ↺) stops the site, runs the Sinners reset.ps1 (maximum sin,
// under the machine's own execution policy) and starts the site again. Only when this script
// started the site (or took it over, below).
// `npm run dkfestival -- --no-open` starts everything without opening a browser.
//
// THE SAVE-ME, for when the demo dies on stage:
//
//   npm run dkfestival -- --demo 8        (also --demo --8, --demo=8; --demo alone = from I)
//
// gets you back INTO the demo, on commandment 8, whatever state things are in:
//   - it takes over: an earlier dkfestival that is still running (or hanging) is stopped, with its
//     site and deck server, and the ports are freed;
//   - the site is started; if a commandment from 8 on has already been absolved (or --reset is
//     given, or the site doesn't say), it is reset to maximum sin first (about a minute more);
//   - the deck opens at /?ff=8#demo/2: the Penance Board absolves everything before VIII by
//     itself, in a few seconds, with a banner saying so, and stops on VIII ready for the clicker.
//     If I–VII were already absolved there is nothing to do and it is there at once.
// `--takeover` alone does the first part for a normal start; `--dry-run` only says what it would do.
//
// Before the talk: run Umbraco.Community.Sinners/reset.ps1 -Version 18.2.1 for maximum sin,
// and make sure the site has Sinners:AutoLoginEmail set (always logged in).
import { spawn, execSync } from 'node:child_process'
import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const INSIDE = path.join(ROOT, 'sinners', 'Umbraco', '18.2.1')
const SITE = path.resolve(process.env.SINNERS_SITE ?? (fs.existsSync(INSIDE) ? INSIDE : path.join(ROOT, '..', 'Umbraco.Community.Sinners', 'Umbraco', '18.2.1')))
const UMBRACO = 'https://localhost:44343/umbraco'
const SITE_PORTS = [44343, 8699]
const DECK_PORT = 5180
const RIG_PORT = 5181
const VERSION = path.basename(SITE)
const RESET = path.resolve(SITE, '..', '..', 'reset.ps1')
const isWin = process.platform === 'win32'

const args = process.argv.slice(2)
/** --demo 8, --demo --8, --demo=8 → 8; --demo → 1; no --demo → 0 */
function demoArg() {
  const i = args.findIndex((a) => a === '--demo' || a.startsWith('--demo='))
  if (i < 0) return 0
  const raw = args[i].includes('=') ? args[i].split('=')[1] : (args[i + 1] ?? '')
  const n = Number(String(raw).replace(/^-+/, ''))
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : 1
}
const DEMO = demoArg()
const DRY = args.includes('--dry-run')
const TAKEOVER = DEMO > 0 || args.includes('--takeover')
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const children = []
const log = (who, colour, line) => console.log(`\x1b[${colour}m[${who}]\x1b[0m ${line}`)

// Umbraco logs every request and login step at INF: only pass on what needs attention
// (log lines tagged WRN/ERR/FTL, crashes, build errors; not the JSON bodies OpenIddict logs at INF)
const UMBRACO_WORTH_SEEING = /\[\d\d:\d\d:\d\d (WRN|ERR|FTL)\]|Unhandled exception|error (CS|MSB|NETSDK)\d/

// Prefix a child's output, and drop the NuGet vulnerability warnings dotnet repeats on every build
function pipe(child, who, colour, keep = () => true) {
  for (const stream of [child.stdout, child.stderr]) {
    let rest = ''
    stream.setEncoding('utf8')
    stream.on('data', (chunk) => {
      const lines = (rest + chunk).split(/\r?\n/)
      rest = lines.pop()
      for (const l of lines) if (l.trim() && !/warning NU19/.test(l) && keep(l)) log(who, colour, l)
    })
  }
}

function killPid(pid) {
  // dotnet run starts the site as its own child: kill the whole tree
  if (isWin) try { execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' }) } catch {}
  else try { process.kill(Number(pid), 'SIGTERM') } catch {}
}
function kill(c) {
  if (!c || c.exitCode != null) return
  killPid(c.pid)
}
function stopAll() {
  for (const c of children) kill(c)
}
process.on('SIGINT', () => { stopAll(); process.exit(0) })
process.on('SIGTERM', () => { stopAll(); process.exit(0) })

/** The processes listening on a port (not this one). */
function pidsOn(port) {
  try {
    const pids = isWin
      ? execSync('netstat -ano -p tcp', { encoding: 'utf8', maxBuffer: 64e6 })
          .split(/\r?\n/)
          .filter((l) => /LISTENING/.test(l) && new RegExp(`:${port}\\s`).test(l))
          .map((l) => l.trim().split(/\s+/).pop())
      : execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' }).split(/\s+/)
    return [...new Set(pids)].filter((p) => p && p !== '0' && p !== String(process.pid))
  } catch {
    return []
  }
}
function freePort(port, what) {
  for (const pid of pidsOn(port)) {
    log('rig', 33, `${DRY ? 'would stop' : 'stopping'} ${what} (process ${pid}, port ${port})`)
    if (!DRY) killPid(pid)
  }
}

const umbracoUp = () => new Promise((resolve) => {
  const req = https.get(UMBRACO, { rejectUnauthorized: false, timeout: 3000 }, (res) => { res.resume(); resolve(res.statusCode < 500) })
  req.on('error', () => resolve(false))
  req.on('timeout', () => { req.destroy(); resolve(false) })
})

/** { commandments: [{ number, sins, pretended, … }] } from the site, or null */
const sinStatus = () => new Promise((resolve) => {
  const req = https.get(`${UMBRACO}/sinners/status`, { rejectUnauthorized: false, timeout: 5000 }, (res) => {
    let body = ''
    res.setEncoding('utf8')
    res.on('data', (c) => { body += c })
    res.on('end', () => { try { resolve(JSON.parse(body)) } catch { resolve(null) } })
  })
  req.on('error', () => resolve(null))
  req.on('timeout', () => { req.destroy(); resolve(null) })
})
/** The commandments from `from` on that are already absolved (or pretended): the demo can't start at `from` with those. */
const spentFrom = (status, from) => (status?.commandments ?? []).filter((c) => c.number >= from && (c.sins === 0 || c.pretended)).map((c) => ROMAN[c.number])

const portFree = (port) => new Promise((resolve) => {
  const s = net.createServer().once('error', () => resolve(false)).once('listening', () => s.close(() => resolve(true)))
  s.listen(port, '127.0.0.1')
})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

if (TAKEOVER) {
  // an earlier dkfestival (the rig's own port) goes with everything it started; then whatever is
  // still on the deck's port. A site somebody started by hand is left running and taken over.
  freePort(RIG_PORT, 'the earlier dkfestival, its site and its deck server')
  if (!DRY) await sleep(800)
  freePort(DECK_PORT, 'the deck server')
  if (!DRY) for (let i = 0; i < 20 && !(await portFree(DECK_PORT)); i++) await sleep(250)
}

if (DRY) {
  const up = await umbracoUp()
  const status = up ? await sinStatus() : null
  const spent = spentFrom(status, DEMO)
  log('rig', 33, `the site is ${up ? 'up' : 'down: it would be started'}`)
  if (DEMO) {
    if (args.includes('--reset')) log('rig', 33, 'it would be reset to maximum sin (--reset)')
    else if (up && !status) log('rig', 33, 'it does not report its sins: it would be reset to maximum sin')
    else if (spent.length) log('rig', 33, `already absolved from ${ROMAN[DEMO]} on: ${spent.join(', ')}. It would be reset to maximum sin`)
    else if (up) log('rig', 33, `no reset needed: ${ROMAN[DEMO]} and everything after it still has its sins`)
    log('rig', 33, `then the deck would open at http://localhost:${DECK_PORT}/${DEMO > 1 ? `?ff=${DEMO}` : ''}#demo/2`)
  }
  process.exit(0)
}

if (!(await portFree(DECK_PORT))) {
  console.error(`Port ${DECK_PORT} is taken. Is the deck already running? The site's BackOfficeHost expects exactly this port.\n(npm run dkfestival -- --takeover stops what is running and starts again.)`)
  process.exit(1)
}

let site = null // the site process, when we started it
let resetting = false

function startSite() {
  log('umbraco', 35, `starting ${SITE}`)
  const child = spawn('dotnet', ['run', '--launch-profile', 'Umbraco.Web.UI'], { cwd: SITE })
  site = child
  children.push(child)
  pipe(child, 'umbraco', 35, (l) => UMBRACO_WORTH_SEEING.test(l))
  child.on('exit', (code) => {
    if (resetting || child !== site) return // the rig stopped it on purpose
    log('umbraco', 35, `exited (${code})`)
    stopAll()
    process.exit(code ?? 1)
  })
}

// first boot after reset.ps1 does an unattended install + the Clean import: allow a few minutes
async function waitForSite() {
  const t0 = Date.now()
  while (!(await umbracoUp())) {
    if (Date.now() - t0 > 5 * 60_000) throw new Error('Umbraco did not answer within 5 minutes.')
    await sleep(2000)
  }
  log('umbraco', 35, `up after ${Math.round((Date.now() - t0) / 1000)} s`)
}

async function resetSite() {
  resetting = true
  try {
    log('rig', 33, 'maximum sin: stopping the site')
    kill(site)
    // (a site this script didn't start, in a takeover: by its ports)
    if (TAKEOVER) for (const port of SITE_PORTS) freePort(port, 'the site')
    await sleep(1500)
    log('rig', 33, `running ${RESET} -Version ${VERSION}`)
    const ps = spawn(isWin ? 'powershell' : 'pwsh', ['-NoProfile', '-File', RESET, '-Version', VERSION], { cwd: path.dirname(RESET) })
    pipe(ps, 'rig', 33)
    const code = await new Promise((r) => ps.on('exit', r))
    if (code !== 0) log('rig', 33, `reset.ps1 exited ${code}`)
    startSite()
  } finally {
    resetting = false
  }
  await waitForSite()
  log('rig', 33, 'maximum sin restored')
}

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/__rig/reset') {
    if (!site && !TAKEOVER) return res.writeHead(409).end('the site was already running when dkfestival started: reset it by hand')
    if (resetting) return res.writeHead(202).end('already resetting')
    res.writeHead(202).end('resetting')
    resetSite().catch((e) => log('rig', 33, `reset failed: ${e.message}`))
    return
  }
  res.writeHead(404).end()
}).listen(RIG_PORT, '127.0.0.1').on('error', () => log('rig', 33, `port ${RIG_PORT} is taken: the deck's reset won't reset the site`))

try {
  if (await umbracoUp()) {
    log('umbraco', 35, `already running at ${UMBRACO}`)
  } else {
    startSite()
    await waitForSite()
  }
  if (DEMO) {
    // the demo can only start at N if N and everything after it still has its sins
    const status = await sinStatus()
    const spent = spentFrom(status, DEMO)
    if (args.includes('--reset') || !status || spent.length) {
      log('rig', 33, args.includes('--reset') ? 'reset asked for' : !status ? 'the site does not report its sins' : `already absolved from ${ROMAN[DEMO]} on: ${spent.join(', ')}`)
      await resetSite()
    } else {
      log('rig', 33, `no reset needed: ${ROMAN[DEMO]} and everything after it still has its sins`)
    }
  }
} catch (e) {
  console.error(e.message)
  stopAll()
  process.exit(1)
}

// the save-me opens the deck IN the demo, and has the board fast-forward itself (curse/sins.js, ?ff)
const landing = DEMO ? `/${DEMO > 1 ? `?ff=${DEMO}` : ''}#demo/2` : ''
const open = args.includes('--no-open') ? [] : landing ? ['--open', landing] : ['--open']
const deck = spawn(process.execPath, [path.join(ROOT, 'scripts', 'deck.mjs'), 'dev', 'umbracommandments', '--port', String(DECK_PORT), '--strictPort', ...open], { cwd: ROOT })
children.push(deck)
pipe(deck, 'deck', 36)
deck.on('exit', (code) => {
  log('deck', 36, `exited (${code})`)
  stopAll()
  process.exit(code ?? 1)
})
log('deck', 36, `http://localhost:${DECK_PORT}${landing}  · Ctrl+C stops both`)
if (DEMO > 1) log('rig', 33, `the Penance Board will absolve everything before ${ROMAN[DEMO]} by itself: wait for its banner to go, then the clicker is yours`)
