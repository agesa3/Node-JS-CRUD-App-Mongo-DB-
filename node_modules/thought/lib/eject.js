/* eslint-disable no-console */

const customize = require('customize')
const debug = require('debug')('though:eject')
const fs = require('fs-extra')
const path = require('path')

module.exports = async function eject(optionalPrefix, filename) {
  if (filename == null) {
    return logEjectableFiles(optionalPrefix)
  }

  const config = await customize()
    // Load `customize`-spec
    .load(require('../customize')('.'))
    .buildConfig()

  switch (optionalPrefix) {
    case 'template':
      return ejectFile({
        source: config.handlebars.templates[filename],
        targetFile: path.join('.thought', 'templates', filename),
        notFoundMessage: `There is no template "${filename}"!`
      })
    case 'partial':
      return ejectFile({
        source: config.handlebars.partials[filename],
        targetFile: path.join('.thought', 'partials', filename),
        notFoundMessage: `There is no partial "${filename}"!`
      })
  }
}

async function logEjectableFiles(optionalPrefix) {
  const config = await customize()
    // Load `customize`-spec
    .load(require('../customize')('.'))
    .buildConfig()

  debug(config)

  console.log('I can eject the following files for you: ')
  switch (optionalPrefix) {
    case undefined:
    case null:
      logDefaultFiles(config.handlebars.templates, { prefix: 'template' })
      logDefaultFiles(config.handlebars.partials, { prefix: 'partial' })
      break
    case 'template':
      logDefaultFiles(config.handlebars.templates, { prefix: 'template' })
      break
    case 'partial':
      logDefaultFiles(config.handlebars.partials, { prefix: 'partial' })
      break
    default:
      throw new Error(`Unknown prefix "${optionalPrefix}", try without prefix!"`)
  }
}

function logDefaultFiles(fileObject, { prefix }) {
  Object.entries(fileObject).forEach(([fileName, file]) => {
    if (!isOverridden(file)) {
      console.log(`  ${prefix} ${fileName}`)
    }
  })
}

async function ejectFile({ source, targetFile, notFoundMessage }) {
  if (source == null) {
    throw new Error(notFoundMessage)
  }
  if (isOverridden(source)) {
    throw new Error(`File "${source.path}" already exists in this project!`)
  }

  console.log(`Ejecting "${targetFile}"`)
  await fs.copy(source.path, targetFile)
}

function isOverridden(file) {
  return file.path.match(/^\.thought/)
}
