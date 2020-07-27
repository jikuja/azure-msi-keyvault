'use strict'
// @ts-check

const bent = require('bent')
const getJson = bent('json')

const KV_PREFIX = 'KV_'

/**
 * @param {string} endpoint
 * @param {string} secret
 * @param {string} resource
 * @returns {Promise<string>} the Active Directory Access token
 */
async function getAADTokenFromMSI (endpoint, secret, resource) {
  const apiVersion = '2017-09-01'
  const p = getJson(`${endpoint}/?resource=${resource}&api-version=${apiVersion}`, '', { Secret: secret })

  // @ts-ignore
  return p.then(response => response.access_token)
}

/**
 * @param {() => any} aadAccessToken
 */
async function getAadAccessToken (aadAccessToken) {
  if (!Object.keys(process.env).find(x => x.startsWith(KV_PREFIX))) {
    // no values starting with 'kv:' => no data to fetch from KV => no need to fetch AAD Token
    return
  }

  let aadToken
  if (!aadAccessToken) {
    // no token - get one using Managed Service Identity inside process.env
    const resource = 'https://vault.azure.net'
    aadToken = getAADTokenFromMSI(process.env.MSI_ENDPOINT, process.env.MSI_SECRET, resource)
  } else if (typeof aadAccessToken === 'function') {
    aadToken = aadAccessToken()
  } else if (typeof aadAccessToken === 'string') {
    aadToken = aadAccessToken
    // TODO: add more types? Promises?
  } else {
    throw new Error('Unsupported aadAccessToken: ' + aadAccessToken)
  }
  return aadToken
}

/**
 * @param {any} aadAccessToken
 */
async function enrichEnvvarsWithKvSecrets (aadAccessToken) {
  const token = await getAadAccessToken(aadAccessToken)

  const kvPromises = Object.keys(process.env).filter(x => x.startsWith(KV_PREFIX)).map(key => {
    const url = process.env[key].replace('kv:', '')
    const valuePromise = getJson(url + '?api-version=7.0', '', { Authorization: `Bearer ${token}` }).then(data => {
      // @ts-ignore
      const secretValue = data.value
      process.env[key.replace(KV_PREFIX, '')] = secretValue
      return secretValue
    })
    return valuePromise
  })

  return Promise.all(kvPromises)
}

module.exports = {
  enrichEnvvarsWithKvSecrets,
  getAadAccessToken,
  getAADTokenFromMSI,
  KV_PREFIX
}
