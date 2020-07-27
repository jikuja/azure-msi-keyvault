'use strict'
// @ts-check

const rewire = require('rewire')
const uut = rewire('../src/index')
const enrichEnvvarsWithKvSecrets = uut.enrichEnvvarsWithKvSecrets

const tap = require('tap')
const lib = require('./lib')

const ServerMock = require('mock-http-server')

tap.test('integration', {}, t => {
  const msiServer = new ServerMock({ host: 'localhost', port: 9000 }, undefined)
  const kvServer = new ServerMock({ host: 'localhost', port: 9001 }, undefined)
  const { MSI_ENDPOINT, MSI_SECRET } = process.env
  t.beforeEach((done) => {
    process.env.MSI_ENDPOINT = 'http://localhost:9000'
    process.env.MSI_SECRET = 'MY_SECRET_KEY'
    msiServer.start(() => {
      kvServer.start(done)
    })
  })
  t.afterEach((done) => {
    process.env.MSI_ENDPOINT = MSI_ENDPOINT
    process.env.MSI_SECRET = MSI_SECRET
    lib.cleanKvEnvVars()
    kvServer.stop(() => {
      msiServer.stop(done)
    })
  })
  t.test('one kv variable', ct => {
    msiServer.on({
      method: 'GET',
      path: '*',
      reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          access_token: 'eyJ0eXAiblahblah',
          expires_on: '09/14/2018 00:00:00 PM +00:00',
          resource: 'https://vault.azure.net',
          token_type: 'Bearer'
        })
      }
    })

    kvServer.on({
      method: 'GET',
      path: '*',
      reply: {
        status: 200,
        body: JSON.stringify({
          attributes: 'attr',
          contentType: 'thing',
          id: 'id',
          kid: 'string',
          managed: 'true',
          value: 'MYSECRETVALUE'
        })
      }
    })

    process.env.KV_FOO = 'http://localhost:9001/secrets/MYSECRET'

    enrichEnvvarsWithKvSecrets(undefined)
      .then((result) => {
        ct.deepEqual(result, ['MYSECRETVALUE'])
        ct.equal(msiServer.requests(undefined).length, 1)
        ct.equal(msiServer.requests(undefined)[0].headers.secret, process.env.MSI_SECRET)
        ct.equal(kvServer.requests(undefined).length, 1)
        ct.equal(kvServer.requests(undefined)[0].headers.authorization, 'Bearer eyJ0eXAiblahblah')
        ct.equal(process.env.FOO, 'MYSECRETVALUE')
      })
      .catch((err) => {
        console.log(err)
        ct.fail()
      })
      .finally(() => {
        ct.end()
      })
  })

  t.end()
})
