#!/usr/bin/env node
/*!
 * thought <https://github.com/nknapp/thought>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
const thought = require('../')
const debug = require('debug')('thought:bin')
const { resolvePackageRoot } = require('../lib/utils/resolve-package-root')

/**
 * @thought-usage
 *
 * Called by the cli-script. Exports a function for better testability
 *
 */
module.exports = function(argv, console, done) {
  Error.stackTraceLimit = 0
  debug('started')

  const program = require('commander')
  program
    .version(require('../package').version)
    .option('-d, --debug', 'higher stack-trace-limit, long stack-traces', function(option) {
      Error.stackTraceLimit = 30
      require('trace-and-clarify-if-possible')
    })

  program
    .command('run')
    .option('-a, --add-to-git', 'git-add the modified files')
    .description('Generate documentation from your package.json and some templates.')
    .action(function(options) {
      changeDir()
        .then(() => resolvePackageRoot('package.json'))
        .then(root => {
          if (!(root.packageJson.scripts && root.packageJson.scripts.thought)) {
            /* eslint-disable no-console */
            console.log(
              '\nNot registered in package.json yet!\n' +
                'I can add a `scripts`-property to your package.json to ensure that ' +
                'documentation is generated automatically on version bumps.\n' +
                'If you want that, run `thought init`\n'
            )
            /* eslint-enable no-console */
          }
          debug('running thought')
        })
        .then(() => thought({ addToGit: options.addToGit, debug: program.debug }))
        .then(filenames => quit(null, 'The following files were updated: ' + filenames.join(', ')), quit)
    })

  program
    .command('init')
    .description("Register scripts in the current module's package.json")
    .action(function() {
      changeDir()
        .then(require('../lib/init.js'))
        .then(() => quit(null, 'OK'), quit)
    })

  program
    .command('eject [prefix] [filename]')
    .description("Extract part of thought's default templates into the local configuration directory")
    .action(function(prefix, filename) {
      changeDir()
        .then(() => require('../lib/eject.js')(prefix, filename))
        .then(() => quit(null, 'OK'), quit)
    })

  program
    .command('up-to-date')
    .description(
      'Perform up-to-date check of the current documentation. Exit with non-zero exit-code when thought must be run again.'
    )
    .action(function() {
      changeDir()
        .then(require('../lib/up-to-date.js'))
        .then(() => quit(null, 'OK'), quit)
    })

  program.parse(argv)

  /* istanbul ignore if: Not testable because it exits the process */
  if (program.rawArgs.length < 3) {
    program.help()
    quit(null, '')
  }

  // ----------------------------------------
  // chdir to local module root
  // ----------------------------------------
  function changeDir() {
    return resolvePackageRoot('package.json').then(root => {
      /* istanbul ignore if: Situation very hard to reproduce */
      if (!root.packageJson) {
        throw new Error(
          'package.json not found!\n' +
            'Please run me from within a node module.\n' +
            'My working directory is "' +
            process.cwd() +
            '".'
        )
      }
      process.chdir(root.packageRoot)
      // eslint-disable-next-line no-console
      console.log("I'm running inside module '" + root.packageJson.name + "' in '" + process.cwd())
    })
  }

  function quit(err, message) {
    /* eslint-disable no-console */
    if (err) {
      console.error(err, message)
      return done(1)
    }
    console.log(message)
    return done(0)
    /* eslint-enable no-console */
  }
}
