const entrypoint = require('./src/index.js').enrichEnvvarsWithKvSecrets

module.exports = {
    enrichEnvvarsWithKvSecrets: entrypoint
}