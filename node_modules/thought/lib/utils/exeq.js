/*!
 * thought <https://github.com/nknapp/thought>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
const cp = require('child_process')

/**
 * Call child_process.execFile with `{ encoding: utf-8 }` and return a promise of `[ stdout, stderr]`
 */
module.exports = function(cmd, args, options) {
  return new Promise(function(resolve, reject) {
    return cp.execFile(cmd, args, options, function(err, stdout, stderr) {
      if (err) {
        return reject(err)
      }
      return resolve([stdout, stderr])
    })
  })
}
