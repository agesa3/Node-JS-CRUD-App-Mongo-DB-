# [4.0.0](https://github.com/nknapp/thought/compare/v3.0.1...v4.0.0) (2020-07-02)


### chore

* drop support for Node 8 ([1153f00](https://github.com/nknapp/thought/commit/1153f00bd5f977acf46030ac7a0b1897c9b2832c))


### Features

* add command "eject" to override default files in the current project ([8040572](https://github.com/nknapp/thought/commit/8040572d3853cf3d53374a03d283c0d3277a3f43))


### BREAKING CHANGES

* drops support for Node 8



## [3.0.1](https://github.com/nknapp/thought/compare/v3.0.0...v3.0.1) (2020-06-08)


### Bug Fixes

* replace module-path in examples with different quotes ([a88eb0a](https://github.com/nknapp/thought/commit/a88eb0aceb670c60b510ef0843364e32016dfce8))



# [3.0.0](https://github.com/nknapp/thought/compare/v2.0.0...v3.0.0) (2020-01-27)


### Bug Fixes

* do not generate CONTRIBUTING.md by default ([0348d34](https://github.com/nknapp/thought/commit/0348d3421823d915deecbc683836c22ec5342454))
* support for modules inside a mono-repo ([1346e33](https://github.com/nknapp/thought/commit/1346e33def668cb246452eb694a0d4e99ed8899f))


### Code Refactoring

* remove "check-engines"-option ([721f34d](https://github.com/nknapp/thought/commit/721f34d95ab6acfe36b138ce44214984e2cd9c06))


### BREAKING CHANGES

* "check-engines"-options removed
* CONTRIBUTING.md is not generated anymore


# Version 2.0.0 (Wed, 20 Feb 2019 22:02:31 GMT)

* BREAKING CHANGES
  * [b437746](https://github.com/nknapp/thought/commit/b437746) auto-drop support for unsupported versions NodeJS - Nils Knappmeier (BREAKING CHANGE):
    In the future, only supported versions (LTS and active) of NodeJS will be supported by this package. 
  * [15ed4b6](https://github.com/nknapp/thought/commit/15ed4b6) feat: remove greenkeeper autodetection in `hasGreenkeeper`-helper - Nils Knappmeier
    The Greenkeeper badge now has to be configured in `.thought/config.js`

* refactorings
  * [043ff2a](https://github.com/nknapp/thought/commit/043ff2a) refactor: use promise-based fs-extra instead of pify(fs()) - Nils Knappmeier
  * [a0011fd](https://github.com/nknapp/thought/commit/a0011fd) refactor: remove obsolete packages - Nils Knappmeier
  * [a84fdd9](https://github.com/nknapp/thought/commit/a84fdd9) fix: remove implicit use of Q - Nils Knappmeier
  * [b19ea37](https://github.com/nknapp/thought/commit/b19ea37) chore: remove unneeded devDependency "recursive-copy" - Nils Knappmeier
  * [02760c5](https://github.com/nknapp/thought/commit/02760c5) refactor: replace 'm-io' by 'fs-extra' and 'glob' - Nils Knappmeier
  * [22e58cc](https://github.com/nknapp/thought/commit/22e58cc) chore: bump dependency versions, use nyc instead of istanbul - Nils Knappmeier

* bump dependency versions
  * [c3eac5d](https://github.com/nknapp/thought/commit/c3eac5d), 
    [22e58cc](https://github.com/nknapp/thought/commit/22e58cc), 
    [f44963f](https://github.com/nknapp/thought/commit/f44963f),
    [4a4702f](https://github.com/nknapp/thought/commit/4a4702f),
    [f44963f](https://github.com/nknapp/thought/commit/f44963f)
    [11734aa](https://github.com/nknapp/thought/commit/11734aa)

* bugfixes
  * [def3693](https://github.com/nknapp/thought/commit/def3693) fix: fix silently rejected promise warning in dirTree helper - Nils Knappmeier
  * [003e932](https://github.com/nknapp/thought/commit/003e932) fix: handle missing plugins properly in config - Nils Knappmeier


# Version 1.5.2 (Fri, 25 Aug 2017 21:01:33 GMT)

* [c1d5831](https://github.com/nknapp/thought/commit/c1d5831) Remove NodeJS 7 from travis build. Add NodeJS 8 - Nils Knappmeier
* [28d3171](https://github.com/nknapp/thought/commit/28d3171) Bump dependency versions, fix code style - Nils Knappmeier
  * It also bumps the dependency of "trace-and-clarify-if-possible", which disables "trace@2" for NodeJS 8.



# Version 1.5.1 (Sun, 02 Jul 2017 21:56:57 GMT)

*  Fix tests for npm-badge from shields.io - Nils Knappmeier
* [6f7b912](https://github.com/nknapp/thought/commit/6f7b912) Remove "preversion"-script from package.json - Nils Knappmeier
* [314d5c3](https://github.com/nknapp/thought/commit/314d5c3) Remove "find-package"-dependency from cli-script (+ refactoring) - Nils Knappmeier
* [6e2f575](https://github.com/nknapp/thought/commit/6e2f575) [372a953](https://github.com/nknapp/thought/commit/372a953) Use npm-badge from shields.io - Nils Knappmeier
  * This one may be controversial in terms of Semver, because tests of old Thought versions are failing due to this change, but I 
    consider this to be a patch-change only, because it fixes the badge for scoped packages and the badge is not really supposed to 
    be parsed (humans still see mainly the same badge)

# Version 1.5.0 (Sun, 25 Jun 2017 08:52:58 GMT)

* [0a694ac](https://github.com/nknapp/thought/commit/0a694ac) Generate codecov-badge if codecov appears in .travis.yml or appveyor.yml - Nils Knappmeier

# Version 1.4.0 (Sat, 24 Jun 2017 21:24:30 GMT)

* [d97570f](https://github.com/nknapp/thought/commit/d97570f) Add @rawUrl special-variable to "#withPackageOf"-helper - Nils Knappmeier

# Version 1.3.0 (Sat, 10 Jun 2017 20:44:35 GMT)

* [b52a6fe](https://github.com/nknapp/thought/commit/b52a6fe) Helper '#withPackageOf' adds file-path relative to the project root - Nils Knappmeier

# Version 1.2.0 (Mon, 22 May 2017 19:17:41 GMT)

* [a3405c5](https://github.com/nknapp/thought/commit/a3405c5) Helper "withPackageOf" now also supports github-ssh-urls in package.json - Nils Knappmeier
* [134ac29](https://github.com/nknapp/thought/commit/134ac29) New helper "repoWebUrl" - Nils Knappmeier

# Version 1.1.5 (Sun, 21 May 2017 15:02:04 GMT)

* [4f22c1f](https://github.com/nknapp/thought/commit/4f22c1f) Fixed "thought init" process - Nils Knappmeier

# Version 1.1.4 (Sun, 21 May 2017 12:35:54 GMT)

* [3475e8f](https://github.com/nknapp/thought/commit/3475e8f) Fix removal of q (2) - Nils Knappmeier

# Version 1.1.3 (Sun, 21 May 2017 12:34:06 GMT)

* [4ff79e3](https://github.com/nknapp/thought/commit/4ff79e3) Fix removal of q - Nils Knappmeier
* [61204e1](https://github.com/nknapp/thought/commit/61204e1) fix(package): update customize-write-files to version 2.0.0 - greenkeeper[bot]

# Version 1.1.2 (Sun, 09 Apr 2017 08:57:35 GMT)

* [68adcb4](https://github.com/nknapp/thought/commit/68adcb4) Fix removal of q-deep - Nils Knappmeier

# Version 1.1.1 (Sat, 08 Apr 2017 22:17:20 GMT)

* [6c9b552](https://github.com/nknapp/thought/commit/6c9b552) chore(package): update customize to version 2.0.1 - greenkeeper[bot]
* [6a21993](https://github.com/nknapp/thought/commit/6a21993) Remove use of q-specific function "Promise~done()" - Nils Knappmeier
* [8731a6f](https://github.com/nknapp/thought/commit/8731a6f) chore(package): update dependencies - greenkeeper[bot]

# Version 1.1.0 (Fri, 07 Apr 2017 11:39:49 GMT)

* [35e700d](https://github.com/nknapp/thought/commit/35e700d) Generell documentation overhaul - Nils Knappmeier
* [cd9f970](https://github.com/nknapp/thought/commit/cd9f970) Add "arr"-helper and options "dot" and "ignore" to `{{dirtree}}`-helper - Nils Knappmeier
* [4579887](https://github.com/nknapp/thought/commit/4579887) option "links='true'" to generate links in the `{{dirTree}}`-helper - Nils Knappmeier
* [a6b3fe4](https://github.com/nknapp/thought/commit/a6b3fe4) Update "init"-command for use with node 6+ - Nils Knappmeier
* [12d151a](https://github.com/nknapp/thought/commit/12d151a) Add "badges.greenkeeper"-option to .thought/config.js - Nils Knappmeier


# Version 1.0.4 (Sat, 25 Mar 2017 00:25:36 GMT)

* [5d7fe7c](https://github.com/nknapp/thought/commit/5d7fe7c) Replace call to lodash in preprocessor - Nils Knappmeier

# Version 1.0.3 (Sat, 25 Mar 2017 00:19:43 GMT)

* [bada175](https://github.com/nknapp/thought/commit/bada175) Bump version of customize-engine-handlebars (reduce size) - Nils Knappmeier
* [075e30d](https://github.com/nknapp/thought/commit/075e30d) "customize-engine-handlebars" must be a normal dependency - Nils Knappmeier
* [52e9ca7](https://github.com/nknapp/thought/commit/52e9ca7) Add "files"-property to package.json (reduce size) - Nils Knappmeier
* [9b2c076](https://github.com/nknapp/thought/commit/9b2c076) Use "popsicle" instead of request-promise (smaller) - Nils Knappmeier



# Version 1.0.2 (Fri, 24 Mar 2017 16:29:01 GMT)

* [f6a19c6](https://github.com/nknapp/thought/commit/f6a19c6) Replace lodash-dependency by smaller functions - Nils Knappmeier


# Version 1.0.1 (Fri, 24 Mar 2017 12:23:35 GMT)

* [2963a51](https://github.com/nknapp/thought/commit/2963a51) Fix link to handlebars-directory in README - Nils Knappmeier

# Version 1.0.0 (Fri, 24 Mar 2017 10:47:13 GMT)

* [1c68d98](https://github.com/nknapp/thought/commit/1c68d98) More documentation (especially API-docs of the helpers) - Nils Knappmeier
* [84446b4](https://github.com/nknapp/thought/commit/84446b4) Support for loading plugins - Nils Knappmeier
* [dac01c6](https://github.com/nknapp/thought/commit/dac01c6) "hasGreenkeeper" now returns "false" for projects without repo-url - Nils Knappmeier


# Version 0.11.0 (Sun, 19 Mar 2017 16:41:52 GMT)

* [0f2b229](https://github.com/nknapp/thought/commit/0f2b229) Update depedency-versions - Nils Knappmeier
* [00452b4](https://github.com/nknapp/thought/commit/00452b4) BREAKING: Change "htmlId"-helper to match the GitHub way of creating url-hashes - Nils Knappmeier
* [5ad6c17](https://github.com/nknapp/thought/commit/5ad6c17) Add tests for all helpers - Nils Knappmeier
* [8f2cc3b](https://github.com/nknapp/thought/commit/8f2cc3b) BREAKING: Do not resolve "directories"-property in preprocessor - Nils Knappmeier
* [d7e0f94](https://github.com/nknapp/thought/commit/d7e0f94) Add tests for "addToGit" and projects with examples - Nils Knappmeier
* [2c12bf1](https://github.com/nknapp/thought/commit/2c12bf1) BREAKING: Remove jsdoc-helper, apidoc-helper + a lot of chore - Nils Knappmeier
* [2909051](https://github.com/nknapp/thought/commit/2909051) BREAKING: Remove support for old node versions + Support for greenkeeper - Nils Knappmeier
* [afb708f](https://github.com/nknapp/thought/commit/afb708f) Simple framework for integration-tests - Nils Knappmeier



# Version 0.10.0 (Fri, 13 Jan 2017 13:38:25 GMT)

* [05cfa0e](https://github.com/nknapp/thought/commit/05cfa0e) Add parameter 'up-to-date-hook' for checking generated files (#4) - Nils Knappmeier

# Version 0.9.4 (Tue, 20 Dec 2016 00:19:44 GMT)

* [6fc2471](https://github.com/nknapp/thought/commit/6fc2471) Use new customize-version from github - Nils Knappmeier


# Version 0.9.3 (Tue, 20 Dec 2016 00:03:45 GMT)

* [a5ce38b](https://github.com/nknapp/thought/commit/a5ce38b) Update m-io version for handling of missing "templates" directory - Nils Knappmeier

# Version 0.9.2 (Mon, 19 Dec 2016 23:52:15 GMT)

* [f2dd765](https://github.com/nknapp/thought/commit/f2dd765) More replacements of q-io by m-io - Nils Knappmeier

# Version 0.9.1 (Mon, 19 Dec 2016 23:05:19 GMT)

* [d360f70](https://github.com/nknapp/thought/commit/d360f70) Use "m-io/fs" instead of "q-io/fs" - Nils Knappmeier

# Version 0.9.0 (Mon, 19 Dec 2016 22:19:10 GMT)

* [c76f64c](https://github.com/nknapp/thought/commit/c76f64c) Use "trace-and-clarify-if-possible" - Nils Knappmeier
* [2ecdeba](https://github.com/nknapp/thought/commit/2ecdeba) Upgrade package dependencies - Nils Knappmeier
* [1467cf9](https://github.com/nknapp/thought/commit/1467cf9) Reduce size by replacing jsdoc-to-markdown with jsdoc-parse and dmd - Nils Knappmeier

# Version 0.8.1 (Tue, 12 Jul 2016 20:54:47 GMT)

* [b3cbd2b](https://github.com/nknapp/thought/commit/b3cbd2b) Use "thoughtful-release" to update the changelog on version bumps - Nils Knappmeier

# Version 0.8.0 (Tue, 12 Jul 2016 20:46:16 GMT)

* [1c8a344](https://github.com/nknapp/thought/commit/1c8a344) Minor JSDoc comments added - Nils Knappmeier
* [8465f12](https://github.com/nknapp/thought/commit/8465f12) Add White-space control to badge-partials - Nils Knappmeier
* [c02604f](https://github.com/nknapp/thought/commit/c02604f) Appveyor badge must be there only if 'appveyor.yml' is present - Nils Knappmeier
* [d761a92](https://github.com/nknapp/thought/commit/d761a92) Badges are now in separate partials. Badge for Appveyor - Nils Knappmeier

# Version 0.7.0 (Wed, 27 Jan 2016 19:22:15 GMT)

* [f6d322b](https://github.com/nknapp/thought/commit/f6d322b) Add release anchor to CHANGELOG.md - Nils Knappmeier
* [fd46555](https://github.com/nknapp/thought/commit/fd46555) Fix for travis and Coveralls badges - Nils Knappmeier
* [4857c6e](https://github.com/nknapp/thought/commit/4857c6e) Added "github" helper to create links to github files. - Nils Knappmeier
* [781f63e](https://github.com/nknapp/thought/commit/781f63e) Use "customize-write-files" to save the resulting files to disk. - Nils Knappmeier
* [8ad63d2](https://github.com/nknapp/thought/commit/8ad63d2) Remove "API"-header if no main-file is configured - Nils Knappmeier
* [327adcb](https://github.com/nknapp/thought/commit/327adcb) Only show "npm install..." if package is not marked as private. - Nils Knappmeier
* [f9b117e](https://github.com/nknapp/thought/commit/f9b117e) Show badges based on conditions - Nils Knappmeier
* [1bbdc8f](https://github.com/nknapp/thought/commit/1bbdc8f) Remove redundant badge - Nils Knappmeier
* [af24469](https://github.com/nknapp/thought/commit/af24469) {{withPackageOf}}: Remove leading "git+" from dependency repository urls - Nils Knappmeier



## v0.6.1 - 2015-11-29

### Doc

* Remove development notice in README.md

## v0.6.0 - 2015-11-29

### Change

* Renamed helper "dirtree" to "dirTree"
* dirTree-helper is no async
* Using [archy](https://www.npmjs.com/package/archy) for tree-rendering

## v0.5.3 - 2015-11-08

### Fix

* Accept all unstable version of `customize`.

## v0.5.2 - 2015-10-05

### Fix 

* Apply workaround for [issue in the `write()`-method of `q-io/fs`](https://github.com/kriskowal/q-io/issues/149) 

## v0.5.1 - 2015-09-28

### Fix

* Typo while loading `helpers.js`. Custom helpers did not load.

## v0.5.0 - 2015-08-17

### Add

* The `example` helper now has an additional hash-argument `snippet`. It this is set to `true`,
  only contents within the lines containing `---<snip>---` and `---</snip>---` is 
  included.
  
* The `exec` helper now has the special lang-value `inline` which wraps the process output
  with single backquotes instead of fences.

## v0.4.1 and v0.4.2 - 2015-08-15

### Fix

* Docs and formatting

## v0.4.0 - 2015-08-15

### Fix

* Documentation cleanup, more documentation about customizing the documentation templates.

## Change

* The files to override helpers and the preprocessor are now
    `.thought/helpers.js` and `.thought/preprocessor.js` to consolidate
     with the structure of the `handlebars/`-directory in Thought.

## v0.3.0 - 2015-08-15

### Change

* Generate CONTRIBUTING.md instead of including guidelines into README 
  (https://github.com/blog/1184-contributing-guidelines)

### Fix

* `htmlId` helper now always returns lowercase


## v0.2.1 - 2015-08-06

### Fix

* If the `jsdoc`-helper did not create any docs, the whole output file was not written.

## v0.2.0 - 2015-08-04
### Change

* `rendertree` is now a block-helper, the label of each node is determined by the block-contents
* `example`-helper now also converts `require('../file')` into `require('package-name/file')
* `include`-helper: Determines fence-type from file-extension if not explicitly provided
* In order to run thought, `thought run` must be called.

... and many more changes

### Add

* Additional helper `jsdoc` to generate documentation for javscript-files. `multilang-apidocs` is by 
  far not as powerful as `jsdoc-to-markdown`
* `npm`-helper to link to the npm-page of a page

## v0.0.1 - 2015-07-02
### Initial version
