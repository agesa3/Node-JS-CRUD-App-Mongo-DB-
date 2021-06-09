const path = require('path')
const fs = require('fs-extra')
const debug = require('debug')('thought:resolve-package')

module.exports = { resolvePackageRoot }

/**
 * Find the `package.json` by walking up from a given file.
 * The result contains the following properties
 *
 * * **packageRoot**: The base-directory of the package containing the file (i.e. the parent of the `package.json`
 * * **relativeFile**: The path of "file" relative to the packageRoot
 * * **packageJson**: The required package.json
 *
 * @param file
 * @return {{packageRoot: string, packageJson: object, relativeFile: string}} the path to the package.json
 */
function resolvePackageRoot(file) {
  try {
    const fullPath = path.resolve(file)
    for (let lead = fullPath; path.dirname(lead) !== lead; lead = path.dirname(lead)) {
      debug('Looking for package.json in ' + lead)
      const packagePath = path.join(lead, 'package.json')
      try {
        if (fs.statSync(packagePath).isFile()) {
          return fs
            .readFile(packagePath, 'utf-8')
            .then(JSON.parse)
            .then(packageJson => {
              return {
                packageRoot: path.relative(process.cwd(), lead) || '.',
                relativeFile: path.relative(lead, fullPath),
                packageJson
              }
            })
        }
      } catch (e) {
        /* istanbul ignore else */
        switch (e.code) {
          case 'ENOTDIR':
          case 'ENOENT':
            continue
          default:
            throw e
        }
      }
    }
  } catch (e) {
    return Promise.reject(e)
  }
}
