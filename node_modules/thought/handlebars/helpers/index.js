const path = require('path')
const cp = require('child_process')
const _ = {
  escapeRegExp: require('lodash.escaperegexp')
}
const debug = require('debug')('thought:helpers')
const { resolvePackageRoot } = require('../../lib/utils/resolve-package-root')
const Handlebars = require('handlebars')
const fs = require('fs-extra')
const util = require('util')

/**
 * Default Handlebars-helpers for Thought
 * @name helpers
 */
module.exports = {
  json,
  include,
  includeRaw,
  example,
  exists,
  exec,
  dirTree: require('./dirTree'),
  renderTree,
  withPackageOf,
  github,
  githubRepo,
  repoWebUrl,
  npm,
  htmlId,
  hasCoveralls,
  hasCodecov,
  hasGreenkeeper,
  arr
}

/**
 * Display an object as indented JSON-String.
 *
 * This is mainly for testing purposes when adapting templates
 * @param {object} obj the object
 * @returns {string} JSON.stringify()
 * @access public
 * @memberOf helpers
 */
function json(obj) {
  return '```json\n' + JSON.stringify(obj, null, 2) + '\n```\n'
}

/**
 * Include a file into a markdown code-block
 *
 * @param filename
 * @param language the programming language used for the code-block
 * @returns {string}
 * @access public
 * @memberOf helpers
 */
function include(filename, language) {
  return fs.readFile(filename, 'utf-8').then(function(contents) {
    return (
      '```' + (typeof language === 'string' ? language : path.extname(filename).substr(1)) + '\n' + contents + '\n```\n'
    )
  })
}

/**
 * Directly include a file without markdown fences.
 *
 * @param filename
 * @access public
 * @memberOf helpers
 */
function includeRaw(filename) {
  return fs.readFile(filename, 'utf-8')
}

/**
 * Includes an example file into the template, replacing `require()` calls to the current
 * module by `require('module-name')` (only single-quotes are replaced)
 *
 * If your file is `examples/example.js`, you would do
 * ```js
 * var fn = require('../')
 * ```
 * to load your module. That way, you get an executable script.
 * The helper will when include
 * ```js
 * var fn = require('module-name')
 * ```
 * in your docs, which is what a user of the module will do.
 *
 * @param {string} filename the name of the example file
 * @param {object} options.hash
 * @param {boolean} options.hash.snippet If set to true, only the lines between
 *    &lt;snip> and &lt;/snip> will be included
 * @access public
 * @memberOf helpers
 */
function example(filename, options) {
  return fs.readFile(filename, 'utf-8').then(function(contents) {
    if (options && options.hash && options.hash.snippet) {
      contents = contents.match(/---<snip>---.*\n([\S\s]*?)\n.*---<\/snip>---/)[1]
    }

    contents = contents.trim()

    // Relative path to the current module (e.g. "../"). This path must be replaced
    // by the module name from package.json
    const modulePath = path.relative(path.dirname(filename), '.')
    debug('example modulepath', modulePath)
    const packageName = require(process.cwd() + '/package').name
    contents = replaceRequireModule(contents, modulePath, packageName, '"')
    contents = replaceRequireModule(contents, modulePath, packageName, '`')
    contents = replaceRequireModule(contents, modulePath, packageName, "'")

    return util.format('```%s\n%s\n```', path.extname(filename).substr(1), contents)
  })
}

function replaceRequireModule(contents, modulePath, packageName, quoteChar) {
  const requireModuleSingleQuoteRegex = new RegExp(regex`require\(${quoteChar}${modulePath}(/.*?)?${quoteChar}\)`, 'g')

  return contents.replace(requireModuleSingleQuoteRegex, function(match, suffix) {
    return `require(${quoteChar}${combineRequirePath(packageName, suffix)}${quoteChar})`
  })
}

function combineRequirePath(packageName, innerPath) {
  if (innerPath == null || innerPath === '' || innerPath === '/') {
    return packageName
  }
  return packageName + innerPath
}

/**
 * Return true if a file exists
 *
 * @param {string} filename the path to the file
 * @return {Promise<boolean>} true, if the file or diectory exists
 * @access public
 * @memberOf helpers
 */
function exists(filename) {
  return fs.exists(filename)
}

/**
 * Execute a command and include the output in a fenced code-block.
 *
 * @param {string} command the command, passed to `child-process#execSync()`
 * @param {object} options optional arguments and Handlebars internal args.
 * @param {string} options.hash.lang the language tag that should be attached to the fence
 *    (like `js` or `bash`). If this is set to `raw`, the output is included as-is, without fences.
 * @param {string} options.hash.cwd the current working directory of the example process
 * @returns {string} the output of `execSync`, enclosed in fences.
 * @access public
 * @memberOf helpers
 */
function exec(command, options) {
  const cwd = options.hash && options.hash.cwd
  const lang = options.hash && options.hash.lang

  const output = cp.execSync(command, {
    encoding: 'utf8',
    cwd: cwd
  })
  const trimmedOutput = output.trim()

  if (lang === 'raw') {
    return trimmedOutput
  }
  if (lang === 'inline') {
    return '`' + trimmedOutput + '`'
  }
  if (lang == null) {
    return '```\n' + trimmedOutput + '\n```'
  }
  return '```' + lang + '\n' + trimmedOutput + '\n```'
}

/**
 * Render an object hierarchy.
 *
 * The expected input is of the form
 *
 * ```
 * {
 *   prop1: 'value',
 *   prop2: 'value',
 *   ...,
 *   children: [
 *     {
 *        prop1: 'value',
 *        propt2: 'value',
 *        ...,
 *        children: ...
 *     }
 *   ]
 * }
 * ```
 *
 * The tree is transformed and rendered using [archy](https://www.npmjs.com/package/archy)
 *
 * @param object
 * @param options
 * @param {function} options.fn computes the label for a node based on the node itself
 * @returns {string}
 * @access public
 * @memberOf helpers
 */
function renderTree(object, options) {
  const tree = require('archy')(transformTree(object, options.fn))
  return '<pre><code>\n' + tree + '</code></pre>'
}

/**
 * Set special variable for accessing information from the context of a file (possibly in a dependency)
 *
 * This block helper executes the block in the current context but sets special variables:
 *
 * * `@url`: The github-url of the given file in the current package version is stored into
 * * `@rawUrl`: The url to the raw file contents on `https://raw.githubusercontent.com`
 * * `@package`: The `package.json` of the file's module is stored into
 * * `@relativePath`: The relative path of the file within the repository
 *
 * @param {string} filePath file that is used to find that package.json
 * @param {object} options options passed in by Handlebars
 * @access public
 * @memberOf helpers
 */
function withPackageOf(filePath, options) {
  return resolvePackageRoot(path.resolve(filePath)).then(function(resolvedPackageRoot) {
    const data = Handlebars.createFrame(options.data)
    data.url = _githubUrl(resolvedPackageRoot)
    data.package = resolvedPackageRoot.packageJson
    data.relativePath = resolvedPackageRoot.relativeFile
    data.rawUrl = _rawGithubUrl(resolvedPackageRoot)
    return options.fn(this, { data: data })
  })
}

/**
 * Create a link to the npm-page of a package
 *
 * @param {string} packageName the name of the package
 * @access public
 * @memberOf helpers
 */
function npm(packageName) {
  return '[' + packageName + '](https://npmjs.com/package/' + packageName + ')'
}

/**
 * Convert a name into a valid id (like github does with header names)
 *
 * This helper creates valid html-ids from header name. It attempts to
 * follow the same rules that github uses to convert header names (h1, h2) into the
 * hash-part of the URL referencing this header.
 *
 * ```js
 * htmlId('abc') === 'abc'
 * htmlId('abc cde') === 'abc-cde' // Replace spaces by '-'
 * htmlId('a$b&c%d') === 'abcd'  // Remove all characters execpt alpahnumericals and minus
 * htmlId('mäxchen' === 'mäxchen' // Do not remove german umlauts
 * htmlId('ハッピークリスマス') === 'ハッピークリスマス' // Do not remove japanase word characters
 * htmlId('ABCDE') === 'abcde'   // Convert to lowercase
 * ```
 *
 * @param {string} value the input value of the URL (e.g. the header name)
 * @return {string} a string value
 *
 * @access public
 * @memberOf helpers
 */
function htmlId(value) {
  // see http://stackoverflow.com/questions/19001140/amend-regular-expression-to-allow-german-umlauts-french-accents-and-other-valid
  // and https://github.com/mathiasbynens/unicode-data/blob/17a920119b8015c6f7fe922ee7ab9fe29bef4394/4.0.1/blocks/Katakana-regex.js
  // There are probably a lot of characters missing. Please make a PR, if you want to include more ranges in the valid characters.
  // Make sure to add a test-case
  const validChars = /[^A-Za-z0-9-_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u30A0-\u30FF]/g
  return value
    .replace(/ /g, '-')
    .replace(validChars, '')
    .toLowerCase()
}

/**
 * Check, if [coveralls.io](https://coveralls.io) is configured in this package
 *
 * Check the .travis.yml and the appveyor.yml files for the string 'coveralls'
 * and return true if any of them exists and contains the string.
 * We expect coveralls to be configured then.
 *
 * @return {Promise<boolean>} true, if coveralls is configured
 *
 * @access public
 * @memberOf helpers
 */
function hasCoveralls() {
  return _searchCiConfig('coveralls')
}

/**
 * Check, if [codecov.io](https://codecov.io) is configured in this package
 *
 * Check the .travis.yml and the appveyor.yml files for the string 'codecov'
 * and return true if any of them exists and contains the string.
 * We expect coveralls to be configured then.
 *
 * @return {Promise<boolean>} true, if coveralls is configured
 *
 * @access public
 * @memberOf helpers
 */
async function hasCodecov() {
  return _searchCiConfig('codecov')
}

/**
 * Internal function to look for a given string in popular CI config files (like .travis.yml and appveyor.yml)
 * @param {string} searchString the string to search for within the ci files
 * @return {Promise<boolean>} true, if the given string is either part of .travis.yml or appveyor.yml
 * @private
 */
async function _searchCiConfig(searchString) {
  return _anyResolvesToTrue(
    ['.travis.yml', 'appveyor.yml'].map(async filename => _fileContainsString(filename, searchString))
  )
}

async function _anyResolvesToTrue(promises) {
  const results = await Promise.all(promises)
  return results.includes(true)
}

async function _fileContainsString(filename, searchString) {
  try {
    const contents = await fs.readFile(filename, 'utf-8')
    return contents.includes(searchString)
  } catch (e) {
    /* istanbul ignore else: very difficult to test */
    if (e.code === 'ENOENT') {
      return ''
    }
    /* istanbul ignore next */
    throw e
  }
}

/**
 * Check, if [Greenkeeper](https://greenkeeper.io) is enabled for this repository
 *
 * This can be configured in the `.thought/config.js`-file
 *
 * ```
 * module.exports = {
 *   badges: {
 *     greenkeeper: true
 *   }
 * }
 * ```
 *  *
 * @param {object} options options passed in by Handlebars
 * @access public
 * @throws Error if no badge is enabled but not github-repo url is found in package.json
 * @memberOf helpers
 */
function hasGreenkeeper(options) {
  const config = options.data.root.config
  const showBadge = !!(config && config.badges && config.badges.greenkeeper) // coerce to boolean
  if (showBadge && !githubRepo(options)) {
    throw new Error('Greenkeeper badge should be enabled, but no github-repo was found.')
  }
  return showBadge
}

/**
 * Transfrom an object hierarchy into `archy`'s format
 *
 * Transform a tree-structure of the form
 * ```
 * {
 *   prop1: 'value',
 *   prop2: 'value',
 *   ...,
 *   children: [
 *     {
 *        prop1: 'value',
 *        propt2: 'value',
 *        ...,
 *        children: ...
 *     }
 *   ]
 * }
 * ```
 * Into an [archy](https://www.npmjs.com/package/archy)-compatible format, by passing each node to a block-helper function.
 * The result of the function should be a string which is then used as label for the node.
 *
 * @param {object} object the tree data
 * @param fn the block-helper function (options.fn) of Handlebars (http://handlebarsjs.com/block_helpers.html)
 *
 * @access private
 */
function transformTree(object, fn) {
  const label = fn(object).trim()
  if (object.children) {
    return {
      label: label,
      nodes: object.children.map(function(child) {
        return transformTree(child, fn)
      })
    }
  } else {
    return label
  }
}

/**
 * Resolve the display-URL of a file on github.
 *
 * This works for files in the current package and in dependencies, as long as the repository-url is
 * set correctly in package.json
 *
 * @param {string} filePath the path to the file
 * @returns {string} the URL
 * @access public
 * @memberOf helpers
 */
function github(filePath) {
  // Build url to correct version and file in githubs
  return resolvePackageRoot(path.resolve(filePath)).then(_githubUrl)
}

/**
 * Returns the http-url for viewing a git-repository in the browser given a repo-url from the package.json
 * Currently, only github urls are supported
 * @param {string} gitUrl the git url from the repository.url-property of package.json
 * @access public
 * @memberOf helpers
 */
function repoWebUrl(gitUrl) {
  if (!gitUrl) {
    return undefined
  }
  const orgRepo = _githubOrgRepo(gitUrl)
  if (orgRepo) {
    return 'https://github.com/' + orgRepo
  } else {
    return null
  }
}

/**
 * Returns the current repository group and name (e.g. `nknapp/thought` for this project)
 *
 * @returns {string}
 * @access public
 * @memberOf helpers
 */
function githubRepo(options) {
  try {
    const url = options.data.root.package.repository.url
    const match = url.match(/.*?(:\/\/|@)github\.com[/:](.*?)(#.*?)?$/)
    if (match) {
      return match[2].replace(/\.git$/, '')
    } else {
      return null
    }
  } catch (e) {
    // No repository-url exists
    return null
  }
}

/**
 * Helper function for composing template-literals to properly escaped regexes
 * @param strings
 * @param args
 * @returns {string}
 * @access private
 */
function regex(strings, ...args) {
  return String.raw(strings, ...args.map(_.escapeRegExp))
}

/**
 * Returns an array of the passed arguments (excluding the `options`-parameter).
 * This helper can be used like `{{dirTree 'dir' ignore=(arr 'file1' 'file2')}}`
 * to provide array-arguments to other helpers.
 * @param {...*} args a list of arguments
 * @access public
 * @memberOf helpers
 */
function arr(...args) {
  return args.slice(0, args.length - 1)
}

/**
 * Computes the github-url of a file based on the information retrieved by the {@link resolvePackageRoot}
 * function. The code is extracted into a function because it is used in multiple places.
 * @param {object} resolvedPackageRoot
 * @param {object} resolvedPackageRoot.packageJson the contents of the package.json as javascript object
 * @param {string} resolvePackageRoot.relativeFile the relative path of the file within the package
 * @returns {string}
 * @private
 */
function _githubUrl(resolvedPackageRoot) {
  const { packageJson, relativeFile } = resolvedPackageRoot
  const url = repoWebUrl(packageJson && packageJson.repository && packageJson.repository.url)
  const relativePathWithinRepo = _relativePathWithinRepository(packageJson, relativeFile)
  if (url && url.match(/github.com/)) {
    return `${url}/blob/v${packageJson.version}/${relativePathWithinRepo}`
  }
}

/**
 * Return the raw url of a file in a githb repository
 * @private
 */
function _rawGithubUrl(resolvedPackageRoot) {
  const { packageJson, relativeFile } = resolvedPackageRoot
  const orgRepo = _githubOrgRepo(packageJson && packageJson.repository && packageJson.repository.url)
  const relativePathWithinRepo = _relativePathWithinRepository(packageJson, relativeFile)

  if (orgRepo) {
    return `https://raw.githubusercontent.com/${orgRepo}/v${packageJson.version}/${relativePathWithinRepo}`
  }
}

/**
 * Returns the "org/repo"-part of a github url
 * @param {string=} gitUrl the full repository url
 * @return {string|null} org and repository, separated by a "/"
 * @private
 */
function _githubOrgRepo(gitUrl) {
  if (!gitUrl) {
    return null
  }
  const match = gitUrl.match(/.*?(:\/\/|@)github\.com[/:](.*?)(#.*?)?$/)
  return match && match[2] && match[2].replace(/\.git$/, '')
}

function _relativePathWithinRepository(packageJson, fileRelativeToPackageJson) {
  const directory = packageJson && packageJson.repository && packageJson.repository.directory
  if (directory) {
    // This is a monorepo and the package.json is in a sub-directory
    return `${directory}/${fileRelativeToPackageJson}`
  }
  return fileRelativeToPackageJson
}
