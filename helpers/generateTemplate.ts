import * as path from 'node:path'
import * as fs from 'fs-extra'

import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'

const generateTemplate = (src: string, dest: string) => {
  const stats = fs.statSync(src)

  if (stats.isDirectory()) {
    // if is directory, copied recursively
    fs.mkdirSync(dest, { recursive: true })
    for (const file of fs.readdirSync(src))
      generateTemplate(path.resolve(src, file), path.resolve(dest, file))

    return
  }

  const fileName = path.basename(src)

  // if is package.json or nuxt.config.ts, merge it
  if (fileName === 'package.json' && fs.existsSync(dest)) {
    const existFile = fs.readFileSync(dest, 'utf-8')
    const newFile = fs.readFileSync(src, 'utf-8')

    const existData = JSON.parse(existFile)
    const newData = JSON.parse(newFile)

    const pkgJSON = sortDependencies(deepMerge(existData, newData))

    fs.writeFileSync(dest, `${JSON.stringify(pkgJSON, null, 2)}\n`)
    return
  }

  if (fileName === 'nuxt.config.mustache')
    dest = path.resolve(path.dirname(dest), fileName.replace(/mustache/, 'ts'))

  if (fileName.startsWith('_')) {
    // replace '_filename' to '.filename'
    dest = path.resolve(path.dirname(dest), fileName.replace(/^_/, '.'))
  }

  if (fileName === '_gitignore' && fs.existsSync(dest)) {
    const existsFile = fs.readFileSync(dest, 'utf-8')
    const newFile = fs.readFileSync(src, 'utf-8')
    fs.writeFileSync(dest, `${existsFile}\n${newFile}`)
    return
  }

  fs.copyFileSync(src, dest)
}

export default generateTemplate
