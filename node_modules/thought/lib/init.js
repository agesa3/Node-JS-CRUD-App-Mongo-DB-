/*!
 * thought <https://github.com/nknapp/thought>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
const fs = require('fs-extra')
const debug = require('debug')('thought:init')
const exec = require('./utils/exeq')
const thoughtPackageJson = require('../package.json')

module.exports = function() {
  let packageJson
  return checkPackageJsonInGit()
    .then(() => npmInstallThought())
    .then(() => fs.readFile('package.json', 'utf-8'))
    .then(function(contents) {
      packageJson = JSON.parse(contents)
      if (packageJson.scripts && packageJson.scripts.thought) {
        throw new Error("I think scripts are already in your package.json ('scripts.thought' exists)")
      }
    })
    .then(function() {
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.thought = 'thought run -a'
      if (packageJson.scripts.version) {
        packageJson.scripts.version = 'npm run thought && ' + packageJson.scripts.version
      } else {
        packageJson.scripts.version = 'npm run thought'
      }
      packageJson.devDependencies.thought = `^${thoughtPackageJson.version}`
      return fs.writeFile('package.json', JSON.stringify(packageJson, null, 2))
    })
    .then(function() {
      return exec('git', ['commit', 'package.json', '-m', '[Thought] Added scripts to run thought on version-bumps'])
    })
    .then(function(stdio) {
      debug('git commit package.json...', 'stdout', stdio[0], 'stderr', stdio[1])
      // eslint-disable-next-line no-console
      console.log('\nI have committed a new package.json. Please verify the changes made to the file!')
    })
}

/**
 * Ensure that package.json is checked in and unmodified
 * @return {Promise<boolean>} true, if everything is fine
 */

function checkPackageJsonInGit() {
  return exec('git', ['status', '--porcelain', 'package.json']).then(function([stdout, stderr]) {
    debug('git status --porcelain package.json', 'stdout', stdout, 'stderr', stderr)
    if (stdout.indexOf('package.json') >= 0) {
      throw new Error(
        'package.json has changes!\n' +
          'I would like to add scripts to your package.json, but ' +
          'there are changes that have not been commited yet.\n' +
          "I don't want to damage anything, so I'm not doing anyhting right now. " +
          'Please commit your package.json'
      )
    }
  })
}

function npmInstallThought() {
  return new Promise((resolve, reject) => {
    const cp = require('child_process')
    const child = cp.spawn('npm', ['install', '--save-dev', 'thought'], {
      stdio: 'inherit'
    })
    child.on('error', reject)
    child.on('exit', code => {
      /* istanbul ignore else */
      if (code === 0) {
        resolve()
      } else {
        reject(new Error('Process exited with code ' + code))
      }
    })
  })
}
