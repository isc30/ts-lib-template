#!/usr/bin/env node
// COPIED FROM https://github.com/dimfeld/rush-dev-watcher

const terminate = require('terminate')
let childProcesses = []
var cleanExit = function (code) {
  console.log('killing', childProcesses.length, 'child processes')
  childProcesses.forEach(function (child) {
    terminate(child.pid, 'SIGINT', { timeout: 1000 }, () => {
      terminate(child.pid)
      childProcesses = childProcesses.filter((c) => c != child)
      if (childProcesses.length == 0) {
        process.exit(code ?? 0)
      }
    })
  })
}
process.on('SIGINT', cleanExit) // catch ctrl-c
process.on('SIGTERM', cleanExit) // catch kill

const rushLib = require('@microsoft/rush-lib')
const execa = require('execa')
const path = require('path')
const { default: Dag } = require('dag-map')
const { Transform } = require('stream')
const { EventEmitter } = require('events')
const chalk = require('chalk')
const yargs = require('yargs')

const args = yargs
  .scriptName('dev')
  .option('to', {
    alias: 't',
    type: 'string',
    nargs: 1,
  })
  .option('to-except', {
    alias: 'T',
    type: 'string',
    nargs: 1,
  })
  // .option('from', {
  //   alias: 'f',
  //   type: 'string',
  //   nargs: 1,
  // })
  .option('only', {
    alias: 'o',
    type: 'string',
    nargs: 1,
  })
  // .option('impacted-by', {
  //   alias: 'i',
  //   type: 'string',
  //   nargs: 1,
  // })
  // .option('to-version-policy', {
  //   type: 'string',
  //   nargs: 1,
  // })
  // .option('from-version-policy', {
  //   type: 'string',
  //   nargs: 1,
  // })
  // .boolean('changed-projects-only')
  .help().argv

function transformer(prefix) {
  let emitter = new EventEmitter()
  let transform = new Transform({
    transform(chunk, enc, cb) {
      chunk = chunk.toString()
      if (
        // TSC watcher
        chunk.includes('Watching for file changes') ||
        // Webpack finished
        chunk.includes('Built at:') ||
        // API
        chunk.includes('[nodemon]') ||
        // Storybook watcher
        chunk.includes('On your network:') ||
        // Rollup
        /created .* in .*s/.test(chunk)
      ) {
        emitter.emit('initial-build-done')
      }

      let lines = chunk
        .split('\n')
        .map((line) => `${chalk.blue(prefix)}: ${line}`)
        .join('\n')
      if (!lines.endsWith('\n')) {
        lines += '\n'
      }
      cb(null, lines)
    },
    flush(cb) {
      emitter.emit('initial-build-done')
      cb()
    },
  })

  return { emitter, transform }
}

async function startBuilding(project) {
  console.log(`${chalk.green('dev')}: Starting to build ${chalk.bold.blue(project.packageName)}`)

  let devCommand = require(path.join(project.projectFolder, 'package.json')).scripts.dev
  if (!devCommand) {
    console.error(`${chalk.yellow('Warning')}: ${project.packageName} has no dev command`)
    return Promise.resolve()
  }

  let args = ['dev']
  if (devCommand.includes('tsc')) {
    args.push('--preserveWatchOutput')
  }

  let pr = execa('rushx', args, {
    cwd: project.projectFolder,
  })

  childProcesses.push(pr)

  let { emitter, transform } = transformer(project.packageName)

  pr.stderr.pipe(transform)
  pr.stdout.pipe(transform)
  transform.pipe(process.stdout)

  return new Promise(async (resolve, reject) => {
    emitter.once('initial-build-done', resolve)
    await pr
  })
}

function recurseProjectDeps(project, projects) {
  for (let dep of project.localDependencyProjects) {
    if (projects.has(dep.packageName)) {
      continue
    }

    projects.set(dep.packageName, dep)
    recurseProjectDeps(dep, projects)
  }
}

function gatherProjects() {
  const rushConfig = rushLib.RushConfiguration.loadFromDefaultLocation({
    startingFolder: process.cwd(),
  })

  let projects = new Map()

  if (args['to'] != null || args['to-except'] != null) {
    const actualArg = args['to'] || args['to-except']
    const project = rushConfig.findProjectByShorthandName(actualArg)
    projects.set(project.packageName, project)
    recurseProjectDeps(project, projects)
  }

  if (args['to-except'] != null) {
    const actualArg = args['to-except']
    if (projects.has(actualArg)) {
      projects.delete(actualArg)
    }
  }

  if (args['only'] != null) {
    const actualArg = args['only']
    const project = rushConfig.findProjectByShorthandName(actualArg)
    projects.set(project.packageName, project)
  }

  // if no option was specified, use all projects
  if (projects.size === 0) {
    projects = new Map(rushConfig.projects.map((p) => [p.packageName, p]))
  }

  return projects
}

async function run() {
  let projects = gatherProjects()

  let dag = new Dag()
  for (let [name, project] of projects.entries()) {
    let deps = project.localDependencyProjects.map((p) => p.packageName).filter((p) => projects.has(p))
    dag.add(name, project, [], deps)
  }

  let inOrder = []
  dag.each((_name, project) => {
    inOrder.push(project)
  })

  for (let project of inOrder) {
    await startBuilding(project)
  }

  console.log(chalk.green('\n\nAll watchers started!'))
}

run().catch((e) => {
  console.error(e)
  cleanExit(1)
})
