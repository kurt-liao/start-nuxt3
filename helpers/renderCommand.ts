const renderCommand = (pkgManager: string, command: string) => {
  if (command === 'install')
    return pkgManager === 'yarn' ? 'yarn' : pkgManager === 'pnpm' ? 'pnpm install --shamefully-hoist' : `${pkgManager} install`
  else return pkgManager === 'npm' ? `npm run ${command}` : `${pkgManager} ${command}`
}

export default renderCommand
