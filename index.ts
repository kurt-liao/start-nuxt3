/* eslint-disable no-console */
import * as path from 'node:path'
import * as fs from 'fs-extra'

import prompts from 'prompts'
import { bold, cyan, green, red } from 'kolorist'
import Mustache from 'mustache'

import greet from './helpers/greet'
import generateTemplate from './helpers/generateTemplate'
import renderCommand from './helpers/renderCommand'

import type { PromptResult } from './types'

function canSkipEmptying(dir: string) {
  if (!fs.existsSync(dir))
    return true

  const files = fs.readdirSync(dir)
  if (files.length === 0)
    return true

  // if only .git folder, skip
  if (files.length === 1 && files[0] === '.git')
    return true

  return false
}

(async () => {
  const DEFAULT_PROJECT_NAME = 'nuxt3-app'
  try {
    let result: PromptResult = {}

    console.log(`\n${greet}\n`)

    const cwd = process.cwd()

    let targetDir = cwd

    try {
      result = await prompts(
        [
          {
            name: 'projectName',
            type: 'text',
            message: 'Project name: ',
            initial: DEFAULT_PROJECT_NAME,
            onState: state => (targetDir = String(state.value).trim()),
          },
          {
            name: 'shouldOverwrite',
            type: () => (canSkipEmptying(targetDir) ? null : 'confirm'),
            message: () => {
              const overwritePrompt
              = targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`

              return `${overwritePrompt} is not empty. Remove existing files and continue?`
            },
          },
          {
            name: 'overwriteChecker',
            type: (_, values) => {
              if (values.shouldOverwrite === false)
                throw new Error(`${red('✖')} Operation cancelled`)

              return null
            },
          },
          {
            name: 'needPinia',
            type: 'toggle',
            message: 'Add Pinia?',
            initial: false,
            active: 'Y',
            inactive: 'N',
          },
          {
            name: 'needVueuse',
            type: 'toggle',
            message: 'Add Vueuse?',
            initial: false,
            active: 'Y',
            inactive: 'N',
          },
        ],
        {
          onCancel: () => {
            throw new Error(`${red('✖')} Operation cancelled`)
          },
        },
      )
    }
    catch (cancelled) {
      console.log(cancelled.message)
      process.exit(1)
    }

    const {
      projectName, shouldOverwrite, needPinia, needVueuse,
    } = result

    const projectDir = path.join(cwd, targetDir)

    if (fs.existsSync(projectDir) && shouldOverwrite)
      fs.emptyDirSync(projectDir)
    else if (!fs.existsSync(projectDir))
      fs.mkdirSync(projectDir)

    console.log(`\nScaffolding project in ${projectDir}...`)

    const pkg = { name: projectName, version: '0.0.0' }

    fs.writeFileSync(path.resolve(projectDir, 'package.json'), JSON.stringify(pkg, null, 2))

    const templateRoot = path.resolve(__dirname, 'template')
    const generate = (templateName: string) => {
      const templateDir = path.resolve(templateRoot, templateName)
      generateTemplate(templateDir, projectDir)
    }

    generate('base')

    const modules = []

    if (needPinia) {
      generate('modules/pinia')
      modules.push('@pinia/nuxt')
    }

    if (needVueuse) {
      generate('modules/vueuse')
      modules.push('@vueuse/nuxt')
    }

    if (modules.length > 0) {
      const nuxtConfig = fs.readFileSync(path.resolve(projectDir, 'nuxt.config.ts'))
      const output = Mustache.render(nuxtConfig.toString(), { modules })
      fs.writeFileSync(path.resolve(projectDir, 'nuxt.config.ts'), output)
    }

    const userAgent = process.env.npm_config_user_agent ?? ''
    const pkgManager = /pnpm/.test(userAgent) ? 'pnpm' : /yarn/.test(userAgent) ? 'yarn' : 'npm'

    console.log(green('\nDone. Now run:\n'))

    if (projectDir !== cwd)
      console.log(` ${bold(cyan(`cd ${path.relative(cwd, projectDir)}`))}`)

    console.log(` ${bold(cyan(renderCommand(pkgManager, 'install')))}`)
    console.log(` ${bold(cyan(renderCommand(pkgManager, 'dev')))}`)
  }
  catch (error) {
    console.log(error)
  }
})()
