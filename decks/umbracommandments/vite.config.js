// Dev-server only: the Umbraco demo site (Umbraco.Community.Sinners' test site) proxied
// through the deck's own origin, so the live backoffice can sit in a card as a same-origin
// iframe. The talk is presented from `npm run deck -- dev`, so a proxy is fine.
//
// The target must be the site's HTTPS port: the backoffice login (OpenIddict) refuses
// plain HTTP, and the proxy → Kestrel leg is what it checks.
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const UMBRACO = process.env.UMBRACO_URL ?? 'https://localhost:44343'

// Keep-alive on the proxy -> site leg. Without an agent the proxy asks the site to close after every
// request, the site answers "Connection: close", and that header goes on to the browser: every
// request of the backoffice (hundreds per page load, plus the deck's own status poll every 2 s)
// then costs a brand-new connection on BOTH legs, and each one a local port. On the presenting
// laptop closed connections linger for many minutes, the 16 384 dynamic ports run out, and the
// browser can't open another one: the deck and the backoffice both 'hang' with both servers fine.
// (It happened mid-demo, at VIII.) With an agent a handful of connections carry the whole talk.
const keepAlive = UMBRACO.startsWith('https')
  ? new https.Agent({ keepAlive: true, maxSockets: 48, rejectUnauthorized: false })
  : new http.Agent({ keepAlive: true, maxSockets: 48 })

// Kestrel sees HTTPS on the proxy leg, so its absolute redirects say https://<deck host>.
// The deck is plain http: point them back at it.
// (Also: no frame blocking, the backoffice lives in an iframe.)
function fixHeaders(res, req) {
  delete res.headers['x-frame-options']
  delete res.headers['content-security-policy']
  const loc = res.headers.location
  if (loc && req.headers.host) res.headers.location = loc.replace(`https://${req.headers.host}`, `http://${req.headers.host}`)
}
const fixResponse = (proxy) => proxy.on('proxyRes', fixHeaders)

// The same goes for the absolute URLs in the Management API's JSON (media thumbnails and previews:
// https://<deck host>/media/…, which the deck doesn't serve). JSON is buffered and pointed back at
// the deck; everything else streams through untouched. The headers need the same fixes as above:
// the login's authorize step lives here and redirects (a https:// Location left the iframe blank).
const fixApi = (proxy) => {
  proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('accept-encoding')) // plain text to rewrite
  proxy.on('proxyRes', (res, req, out) => {
    fixHeaders(res, req)
    const json = /json/.test(res.headers['content-type'] ?? '')
    const headers = { ...res.headers }
    // hop-by-hop: whether THIS connection stays open is between the browser and the deck's server
    delete headers.connection
    delete headers['keep-alive']
    if (json) delete headers['content-length']
    out.writeHead(res.statusCode, headers)
    if (!json || !req.headers.host) return res.pipe(out)
    let body = ''
    res.setEncoding('utf8')
    res.on('data', (chunk) => { body += chunk })
    res.on('end', () => out.end(body.replaceAll(`https://${req.headers.host}/`, `http://${req.headers.host}/`)))
  })
}

// The painted pictures (components/mountain/paint.js, ?repaint&save): PUT /__paint/<name>.jpg
// writes public/assets/<name>.jpg. This machine only, dev server only.
const ASSETS = fileURLToPath(new URL('./public/assets/', import.meta.url))
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const savePainted = () => ({
  name: 'umbracommandments-paint',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__paint', (req, res) => {
      const fail = (code, msg) => { res.statusCode = code; res.end(msg) }
      if (req.method !== 'PUT') return fail(405, 'PUT only')
      if (!LOOPBACK.has(req.socket.remoteAddress)) return fail(403, 'only on the machine the dev server runs on')
      const name = decodeURIComponent((req.url ?? '').replace(/^\/+/, '').split('?')[0])
      if (!/^[a-z0-9-]+\.(jpg|webp)$/.test(name)) return fail(400, 'bad name')
      const chunks = []
      let size = 0
      req.on('data', (chunk) => {
        chunks.push(chunk)
        size += chunk.length
        if (size > 30e6) { fail(413, 'too big'); req.destroy() }
      })
      req.on('end', () => {
        if (res.writableEnded) return
        fs.writeFileSync(path.join(ASSETS, name), Buffer.concat(chunks))
        res.end('ok')
      })
    })
  },
})

// …and on the browser -> deck leg: Node closes an idle connection after 5 s, so every page of the
// backoffice opened a fresh handful. Two minutes covers any pause in the talk.
const patient = () => ({
  name: 'umbracommandments-keep-alive',
  apply: 'serve',
  configureServer(server) {
    if (!server.httpServer) return
    server.httpServer.keepAliveTimeout = 120_000
    server.httpServer.headersTimeout = 125_000 // must be the longer of the two
  },
})

const route = { target: UMBRACO, secure: false, changeOrigin: false, ws: true, agent: keepAlive, configure: fixResponse }

export default {
  // Umbraco's own UI library (@umbraco-ui/uui, the version the backoffice runs): the trees, tabs and
  // boxes on the cards are the real components, not imitations
  customElements: ['uui-'],
  plugins: [savePainted(), patient()],
  server: {
    proxy: {
      // first: the most specific path wins (Vite takes the first match)
      '/umbraco/management/api': { target: UMBRACO, secure: false, changeOrigin: false, selfHandleResponse: true, agent: keepAlive, configure: fixApi },
      '/umbraco': route,
      '/App_Plugins': route,
      // the media the backoffice shows (thumbnails, previews)
      '/media': route,
      // the rehearsal rig in start.mjs (the deck's reset: maximum sin)
      '/__rig': { target: 'http://127.0.0.1:5181' },
    },
  },
}
