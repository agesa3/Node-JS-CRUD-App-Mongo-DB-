const customize = require('customize')

const thought = customize().load(require('../customize.js')('.'))

function handleMessage(message) {
  switch (message.cmd) {
    case 'run': {
      // eslint-disable-next-line no-console
      console.log('Running thought')
      return thought.run()
    }
  }
}

process.on('message', message => {
  handleMessage(message).then(
    result => {
      process.send({ message: message, result: result })
    },
    err => {
      process.send({ error: err })
    }
  )
})
