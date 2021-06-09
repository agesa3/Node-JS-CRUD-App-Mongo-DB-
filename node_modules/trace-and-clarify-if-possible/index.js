/*!
 * trace-and-clarify-if-possible <https://github.com/nknapp/trace-and-clarify-if-possible>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'

// Use "var" instead of const, in order to support node 0.10
var versionStr = process.version.match(/v(\d+).*/)[1]
var majorVersion = Number(versionStr)
if (majorVersion >= 8) {
  require('trace')
  require('clarify')
  console.log('Trace and clarify activated')
}
