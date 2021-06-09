# handlebars-source-locators 

[![NPM version](https://badge.fury.io/js/handlebars-source-locators.svg)](http://badge.fury.io/js/handlebars-source-locators)
[![Travis Build Status](https://travis-ci.org/nknapp/handlebars-source-locators.svg?branch=master)](https://travis-ci.org/nknapp/handlebars-source-locators)
[![Coverage Status](https://img.shields.io/coveralls/nknapp/handlebars-source-locators.svg)](https://coveralls.io/r/nknapp/handlebars-source-locators)


> Puts source-position markers into the Handlebars output


# Installation

```
npm install handlebars-source-locators
```

 
## Usage

The following example demonstrates how to use this module:

```js
const Handlebars = require('handlebars')
const addSourceLocators = require('handlebars-source-locators')

// Create a new Handlebars environment and add source-locators
const hbs = addSourceLocators(Handlebars.create())

hbs.registerPartial('info', `
Name: {{name}}
City: {{city}}
`)

hbs.registerPartial('hobbies', `
{{#each hobbies}}
- {{.}}
{{/each}}
`)

const template = hbs.compile(`
Info:
-----
{{> info}}

Hobbies:
-----
{{> hobbies}}
`)

console.log(template({
  name: 'Nils Knappmeier',
  city: 'Darmstadt',
  hobbies: [
    'Aikido',
    'Programming',
    'Theater',
    'Music'
  ]
}))
```

This will generate the following output

```
<sl line="1" col="0"></sl>
Info:
-----
<sl line="4" col="0"></sl><sl line="1" col="0" partial="info"></sl>
Name: <sl line="2" col="6" partial="info"></sl>Nils Knappmeier<sl line="2" col="14" partial="info"></sl>
City: <sl line="3" col="6" partial="info"></sl>Darmstadt<sl line="3" col="14" partial="info"></sl>
<sl line="4" col="0" partial="info"></sl><sl line="4" col="10"></sl>
Hobbies:
-----
<sl line="8" col="0"></sl><sl line="1" col="0" partial="hobbies"></sl>
<sl line="2" col="0" partial="hobbies"></sl><sl line="2" col="17" partial="hobbies"></sl>- <sl line="3" col="2" partial="hobbies"></sl>Aikido<sl line="3" col="7" partial="hobbies"></sl>
<sl line="4" col="0" partial="hobbies"></sl><sl line="2" col="17" partial="hobbies"></sl>- <sl line="3" col="2" partial="hobbies"></sl>Programming<sl line="3" col="7" partial="hobbies"></sl>
<sl line="4" col="0" partial="hobbies"></sl><sl line="2" col="17" partial="hobbies"></sl>- <sl line="3" col="2" partial="hobbies"></sl>Theater<sl line="3" col="7" partial="hobbies"></sl>
<sl line="4" col="0" partial="hobbies"></sl><sl line="2" col="17" partial="hobbies"></sl>- <sl line="3" col="2" partial="hobbies"></sl>Music<sl line="3" col="7" partial="hobbies"></sl>
<sl line="4" col="0" partial="hobbies"></sl>
```

##  API-reference

<a name="addSourceLocators"></a>

## addSourceLocators(handlebarsEnvironment)
Adds source-locators to a Handlebars-environment. The template-output
will include tags of the form `<sl line="1" col="4" [partial="partialName"]>`

The meaning is that the output directly after this tag originates from the
line/column in the tag. If the "partial" is not set, the output originates from the
main-template.

The "line"-property is based off 1. The "col"-property is based off 0.
This is consistent with the output of the "Handlebars.parse()"-function.

**Kind**: global function  
**Throws**:

- Error if `handlebarsEnvironment` is the default Handlebars-environment.
  Please use "Handlebars.create" to create a new environment and pass that to this function.
  The default instance may be used in many places of the dependency tree. Modifying it may
  cause unexpected behavior in other libraries that seem not connected to this one at all.

**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| handlebarsEnvironment | <code>Handlebars</code> | the Handlebars environment to modify |




## License

`handlebars-source-locators` is published under the MIT-license. 
See [LICENSE.md](LICENSE.md) for details.

## Release-Notes
 
For release notes, see [CHANGELOG.md](CHANGELOG.md)
 
## Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).