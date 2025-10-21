import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const indexPath = path.join(root, 'index.html')

function log(msg) {
  process.stdout.write(`[pre-build] ${msg}\n`)
}

// 1) Remove built assets directory in project root
try {
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true })
    log('Removed ./docs directory')
  } else {
    log('No ./docs directory found')
  }
} catch (err) {
  log(`Warning: failed removing ./docs: ${err?.message || err}`)
}

// 2) Ensure index.html is a dev template before build
try {
  const devHtml = `<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Mark Board - Markdown Kanban</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n`
  fs.writeFileSync(indexPath, devHtml, 'utf8')
  log('Wrote dev index.html before build')
} catch (err) {
  log(`Warning: issue handling index.html: ${err?.message || err})`)
}

log('Pre-build completed')
