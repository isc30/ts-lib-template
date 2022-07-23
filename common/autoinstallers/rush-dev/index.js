console.log('Invoking ' + __filename)
const execSync = require('child_process').execSync
const autoinstallerPath = __dirname

// Rush Autoinstaller Initialization
// const rushPath = process.cwd()
// execSync('pnpm install', { cwd: autoinstallerPath, stdio: 'inherit' })

// The first two args will be node.exe and the script itself
const package = process.argv.splice(2).join(' ')

execSync(`node --unhandled-rejections=none rush-dev-watch.js ${package}`, {
  cwd: autoinstallerPath,
  stdio: 'inherit',
})
