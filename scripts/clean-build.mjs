import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const root = process.cwd()
const assetsDir = path.join(root, 'assets')
const indexPath = path.join(root, 'index.html')

function log(msg) {
  process.stdout.write(`[clean-build] ${msg}\n`)
}

// 1) Remove built assets directory in project root
try {
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true })
    log('Removed ./assets directory')
  } else {
    log('No ./assets directory found')
  }
} catch (err) {
  log(`Warning: failed removing ./assets: ${err?.message || err}`)
}

// 2) Ensure index.html is a dev template before build
try {
  const devHtml = `<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Mark Board - Markdown Kanban</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n`
  fs.writeFileSync(indexPath, devHtml, 'utf8')
  log('Wrote dev index.html before build')
} catch (err) {
  log(`Warning: issue handling index.html: ${err?.message || err})`)
}

log('Clean completed')
