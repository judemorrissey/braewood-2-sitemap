const fs = require('fs')
const path = require('path')

const src = fs.readFileSync('index.html', 'utf8')

const result = src
  .replace(/<script src="([^"]+)"><\/script>/g, (match, file) => {
    if (file.startsWith('http')) return match
    const content = fs.readFileSync(file, 'utf8')
    return `<script>\n${content}\n</script>`
  })
  .replace(/<link rel="stylesheet" href="([^"]+)"[^>]*\/>/g, (match, file) => {
    if (file.startsWith('http')) return match
    const content = fs.readFileSync(file, 'utf8')
    return `<style>\n${content}\n</style>`
  })

fs.mkdirSync('dist', { recursive: true })
fs.writeFileSync(path.join('dist', 'braewood2-map.html'), result, 'utf8')
console.log('Bundled → dist/braewood2-map.html')
