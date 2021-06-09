/*!
 * thought <https://github.com/nknapp/thought>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

const customize = require('customize')
const debug = require('debug')('thought:run')
const write = require('customize-write-files')

module.exports = thought

/**
 * Execute Thought in the current directory
 * @param {object} options
 * @param {string} [options.cwd] the working directory to use as project root (**deprecated** because it does not always
 *  work as expected)
 * @param {boolean} [options.addToGit] add created files to git
 * @api public
 */
function thought(options) {
  options = options || {}
  debug('options', options)
  return (
    customize()
      // Load `customize`-spec
      .load(require('./customize.js')(options.cwd || '.'))
      .run()
      .then(write(options.cwd || '.'))
      .then(async function(filenames) {
        if (options.addToGit) {
          const git = require('simple-git/promise')()
          debug('Adding ' + filenames.join(', ') + ' to git index')
          await git.add(filenames)
        }
        return filenames
      })
  )
}
