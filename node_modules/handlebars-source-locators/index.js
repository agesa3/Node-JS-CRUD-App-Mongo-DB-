/*!
 * handlebars-source-locators <https://github.com/nknapp/handlebars-source-locators>
 *
 * Copyright (c) 2017 Nils Knappmeier.
 * Released under the MIT license.
 */
var Handlebars = require('handlebars')

module.exports = addSourceLocators
/**
 * Adds source-locators to a Handlebars-environment. The template-output
 * will include tags of the form `<sl line="1" col="4" [partial="partialName"]>`
 *
 * The meaning is that the output directly after this tag originates from the
 * line/column in the tag. If the "partial" is not set, the output originates from the
 * main-template.
 *
 * The "line"-property is based off 1. The "col"-property is based off 0.
 * This is consistent with the output of the "Handlebars.parse()"-function.
 *
 * @param handlebarsEnvironment {Handlebars} the Handlebars environment to modify
 *
 * @throws Error if `handlebarsEnvironment` is the default Handlebars-environment.
 *   Please use "Handlebars.create" to create a new environment and pass that to this function.
 *   The default instance may be used in many places of the dependency tree. Modifying it may
 *   cause unexpected behavior in other libraries that seem not connected to this one at all.
 *
 * @public
 */
function addSourceLocators (handlebarsEnvironment) {
  if (handlebarsEnvironment === Handlebars) {
    throw new Error('Refusing to apply source-locators to the default Handlebars environment. Please use "Handlebars.create()"')
  }

  handlebarsEnvironment.JavaScriptCompiler = SourceMapCompiler

  // Wrap "registerPartial":
  // Register the parsed AST of the partial and make sure the the 'source'-property is set on all node
  // so that we can pass the partial-name of to the source-locator
  const originalRegisterPartial = handlebarsEnvironment.registerPartial.bind(handlebarsEnvironment)
  handlebarsEnvironment.registerPartial = function registerPartialWithSourceLocators (name, value) {
    if (Object.prototype.toString.call(name) === '[object Object]') {
      var partials = name
      Object.keys(partials).forEach((name) => this.registerPartial(name, partials[name]))
    } else {
      // create AST
      const parse = this.parse(value, { srcName: name })
      // call wrapped function
      originalRegisterPartial(name, parse)
    }
  }
  return handlebarsEnvironment
}

class SourceMapCompiler extends Handlebars.JavaScriptCompiler {
  constructor () {
    super()
    this.compiler = SourceMapCompiler
  }

  formatSourceLocator (position, srcName) {
    return srcName
      ? `<sl line="${position.line}" col="${position.column}" partial="${srcName}"></sl>`
      : `<sl line="${position.line}" col="${position.column}"></sl>`
  }

  appendToBuffer (source, location, explicit) {
    if (!location) {
      return super.appendToBuffer(source, location, explicit)
    }
    return [
      super.appendToBuffer(`'${this.formatSourceLocator(location.start, location.source)}'`, location, true),
      super.appendToBuffer(source, location, true),
      super.appendToBuffer(`'${this.formatSourceLocator(location.end, location.source)}'`, location, true)
    ]
  }
}
