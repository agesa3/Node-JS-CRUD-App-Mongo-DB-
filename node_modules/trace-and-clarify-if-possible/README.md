# trace-and-clarify-if-possible 

[![NPM version](https://img.shields.io/npm/v/trace-and-clarify-if-possible.svg)](https://npmjs.com/package/trace-and-clarify-if-possible)
[![Travis Build Status](https://travis-ci.org/nknapp/trace-and-clarify-if-possible.svg?branch=master)](https://travis-ci.org/nknapp/trace-and-clarify-if-possible)
[![Coverage Status](https://img.shields.io/coveralls/nknapp/trace-and-clarify-if-possible.svg)](https://coveralls.io/r/nknapp/trace-and-clarify-if-possible)

> Use `trace` and `clarify` if supported by the current node version

[trace](https://npmjs.com/package/trace) and [clarify](https://npmjs.com/package/clarify) can help greatly to analyze stack-traces

* `trace` shows the part of the stack that would otherwise disappear due to asynchronous callbacks
* `clarify` removes uninteresting parts of the stack

Sadly, `trace` can is only compatible with NodeJS version >=4. It makes sense to include `trace` in your tests all the time (not in production code though). However, when you run the test in [Travis CI](https://travis-ci.org/) with multiple node versions <4, the tests will break.

This package include `trace` and `clarify` only for supported node versions.

# Installation

```
npm install trace-and-clarify-if-possible
```

## Usage

Put the following line a module that is loaded at the start of your program or testcase-spec (remember, do not use in production).

```js
require('trace-and-clarify-if-possible')
```




Or, you can put `--require trace-and-clarify-if-possible into your `test/mocha.opts` to activate it for all tests




# License

`trace-and-clarify-if-possible` is published under the MIT-license.

See [LICENSE.md](LICENSE.md) for details.


# Release-Notes
 
For release notes, see [CHANGELOG.md](CHANGELOG.md)
 
# Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).