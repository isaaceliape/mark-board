import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docsAssetsDir = path.join(root, 'docs', 'assets')
const publicDir = path.join(root, 'public')

function log(msg) {
  process.stdout.write(`[post-build] ${msg}\n`)
}

try {
  if (fs.existsSync(publicDir)) {
    fs.mkdirSync(docsAssetsDir, { recursive: true })
    const files = fs.readdirSync(publicDir)
    for (const file of files) {
      const srcPath = path.join(publicDir, file)
      const destPath = path.join(docsAssetsDir, file)
      fs.copyFileSync(srcPath, destPath)
    }
    log(`Copied ${files.length} file(s) from ./public to ./docs/assets`)
  } else {
    log('No ./public directory found')
  }
} catch (err) {
  log(
    `Warning: failed copying ./public to ./docs/assets: ${err?.message || err}`
  )
}

log('Post-build completed')
