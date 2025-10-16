import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const indexPath = path.join(root, 'index.html')

function log(msg) {
  process.stdout.write(`[ensure-dev-index] ${msg}\n`)
}

try {
  if (!fs.existsSync(indexPath)) {
    log('index.html not found; nothing to do')
    process.exit(0)
  }
  const html = fs.readFileSync(indexPath, 'utf8')
  const looksBuilt =
    html.includes('/assets/') ||
    html.includes('crossorigin src="/assets/') ||
    html.includes('/mark-board/assets/')

  if (looksBuilt) {
    const devHtml = `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Mark Board - Markdown Kanban</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`
    fs.writeFileSync(indexPath, devHtml, 'utf8')
    log('rewrote index.html to dev template')
  } else {
    log('index.html already looks like a dev file')
  }
} catch (err) {
  log(`Warning: ${err?.message || err}`)
}
