const { KV_PREFIX } = require('../src/index')

function cleanKvEnvVars () {
  Object.keys(process.env).filter(x => x.startsWith(KV_PREFIX)).forEach(x => {
    delete process.env[x]
  })
}

module.exports = {
  cleanKvEnvVars
}
