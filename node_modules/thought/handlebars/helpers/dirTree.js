const _ = {
  groupBy: require('lodash.groupby')
}
const pify = require('pify')
const glob = pify(require('glob'))
const debug = require('debug')('thought:helpers')
const path = require('path')

module.exports = dirTree

/**
 * Return a drawing of a directory tree (using [archy](https://www.npmjs.com/package/archy))
 *
 * @param {string} baseDir the base directory from which the `globPattern` is applied
 * @param {string=} globPattern a pattern describing all files and directories to include into the tree-view.
 * (default: '**')
 * @param {object} options passsed in by Handlebars
 * @param {object} options.hash parameters passed in as `key=value`
 * @param {boolean} options.hash.links should a link be created for each file matching the glob?
 * @param {boolean} options.hash.dot should dot-files be displayed implicitely. This sets the 'dot' option
 in the 'glob'-module
 * @param {string|string[]} options.hash.ignore Glob pattern of files to ignore. This sets the 'ignore' option
 in the 'glob'-module.
 * @param {string} options.hash.label a label for the root node of the tree
 * @returns {string} a display of the directory tree of the selected files and directories.
 * @access public
 * @memberOf helpers
 */
async function dirTree(baseDir, globPattern, options) {
  // Is basedir is not a string, it is probably the handlebars "options" object
  if (typeof globPattern !== 'string' && options == null) {
    options = globPattern
    globPattern = undefined
  }

  if (globPattern == null) {
    globPattern = '**'
  }

  const hashOptions = (options && options.hash) || /* istanbul ignore next: never happens */ {}

  const files = await glob(globPattern, {
    cwd: baseDir,
    mark: true,
    dot: Boolean(hashOptions.dot),
    ignore: hashOptions.ignore
  })
  debug('dirTree glob result', files)
  if (files.length === 0) {
    throw new Error("Cannot find a single file for '" + globPattern + "' in '" + baseDir + "'")
  }
  files.sort()

  const rootNode = {
    label: hashOptions.label || '',
    nodes: treeFromPaths(files, baseDir, ({ parent, file, explicit }) => {
      if (explicit && hashOptions.links) {
        // Compute relative path from current target-file to the listed file
        const targetPath = path.relative(path.dirname(options.customize.targetFile), `${parent}/${file}`)
        return `<a href="${targetPath}">${file}</a>`
      }
      return file
    })
  }

  const treeObject = condense(rootNode)

  const tree = require('archy')(treeObject)
  return '<pre><code>\n' + tree.trim() + '\n</code></pre>'
}

/**
 * Transform an array of paths into an [archy](https://www.npmjs.com/package/archy)-compatible tree structure.
 *
 * ```
 * [ [ 'abc/cde/efg/' ], [ 'abc/cde/abc'], ['abc/zyx'] ]
 * ```
 * becomes
 * ```
 * {
 *   label: 'abc/',
 *   nodes: [{ label: 'cde/',nodes: ['efg/', 'abc']}, 'zyx']
 * }
 * ```
 *
 * Nodes with a single subnode are collapsed and the resulting node gets the label `node/subnode`.
 *
 * @param {string[]} files an array of sorted file paths relative to `parent`
 * @param {string} parent the directory of the files
 * @param {function({parent:string, file:string, explicit: boolean}):string} renderLabelFn function that renders the label
 *  of a node. It receives the parent and a filenpath as parameters.
 * @returns {object} a tree structure as needed by [archy](https://www.npmjs.com/package/archy)
 * @access private
 */
function treeFromPaths(files, parent, renderLabelFn) {
  const groups = _.groupBy(files, file => file.match(/^[^/]*\/?/))
  return Object.keys(groups).map(function(groupKey) {
    const group = groups[groupKey]
    // Is this group explicitly part of the result, or
    // just implicit through its children
    const explicit = group.indexOf(groupKey) >= 0
    return {
      label: renderLabelFn({ parent, file: groupKey, explicit }),
      nodes: treeFromPaths(
        // Remove parent directory from file paths
        group
          .map(node => node.substr(groupKey.length))
          // Skip the empty path
          .filter(node => node),
        // New parent..., add intermediate slash if necessary
        parent.replace(/\/?$/, '/') + groupKey,
        renderLabelFn
      )
    }
  })
}

/**
 * Merge an archy-node with its single child, but not with a leaf node.
 * Keep nodes with zero, two or more childs.
 * @access private
 */
function condense(node) {
  if (node.nodes.length === 1 && node.nodes[0].nodes.length > 0) {
    return condense({
      label: (node.label || '') + node.nodes[0].label,
      nodes: node.nodes[0].nodes
    })
  } else {
    return {
      label: node.label,
      nodes: node.nodes.map(condense)
    }
  }
}
