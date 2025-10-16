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

// 2) Restore index.html to source version if it looks like a built file
try {
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8')
    const looksBuilt =
      html.includes('/assets/') || html.includes('crossorigin src="/assets/')

    if (looksBuilt) {
      try {
        // Prefer restoring from git to preserve any local customizations in HEAD
        const original = execSync('git show HEAD:index.html', {
          encoding: 'utf8',
        })
        const headLooksBuilt =
          original.includes('/assets/') ||
          original.includes('crossorigin src="/assets/')
        if (!headLooksBuilt) {
          fs.writeFileSync(indexPath, original, 'utf8')
          log('Restored index.html from git HEAD')
        } else {
          // HEAD contains a built index.html; restore to dev template instead
          const devHtml = `<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Mark Board - Markdown Kanban</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n`
          fs.writeFileSync(indexPath, devHtml, 'utf8')
          log('HEAD index.html looked built; rewrote to dev template')
        }
      } catch {
        // Fallback: write a minimal dev index.html known-good template
        const devHtml = `<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Mark Board - Markdown Kanban</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n`
        fs.writeFileSync(indexPath, devHtml, 'utf8')
        log('Rewrote index.html to dev template (git not available)')
      }
    } else {
      log('index.html already looks like a dev file')
    }
  } else {
    log('No index.html found to restore')
  }
} catch (err) {
  log(`Warning: issue handling index.html: ${err?.message || err}`)
}

log('Clean completed')
