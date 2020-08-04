const m = require('./src/index.js')

module.exports = {
  enrichEnvvarsWithKvSecrets: m.enrichEnvvarsWithKvSecrets,
  getAADTokenFromMSI: m.getAADTokenFromMSI
}
