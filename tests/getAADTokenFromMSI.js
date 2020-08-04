'use strict'
// @ts-check

const uut = require('../src/index')
const getAadAccessToken = uut.getAADTokenFromMSI

const tap = require('tap')

tap.test('getAADTokenFromMSI', {}, t => {
  t.test('throws returns rejected promise', ct => {
    process.env.MSI_SECRET = undefined
    getAadAccessToken('x')
      .then(() => {
        ct.fail()
      })
      .catch((err) => {
        ct.contains(err.message, 'Cannot fech AAD from MSI')
      })
      .finally(() => {
        ct.end()
      })
  })
  t.end()
})
