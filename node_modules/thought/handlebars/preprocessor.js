const fs = require('fs-extra')
const path = require('path')
const deep = require('deep-aplus')(Promise)
const debug = require('debug')('thought:preprocessor')

/**
 * This function modifies the Handlebars input data prior to
 * executing the template.
 * @param {object} data the data object of the configuration
 * @returns {*}
 */
module.exports = function(data) {
  // shallow clone
  data = Object.assign({}, data)

  // Detect license file and read contents
  debug('workingdir', data.workingDir)
  data.licenseFile = fs.readdir(data.workingDir).then(function(files) {
    debug('project files', files)
    const licenseFiles = files.filter(function(filename) {
      return filename.lastIndexOf('LICENSE', 0) === 0
    })
    if (licenseFiles.length > 0) {
      return {
        filename: licenseFiles[0],
        contents: fs.readFile(path.join(data.workingDir, licenseFiles[0]), 'utf-8'),
        fences: path.extname(licenseFiles[0]) !== '.md'
      }
    }
    return null
  })

  return deep(data).then(result => {
    debug('preprocessed', result)
    return result
  })
}
