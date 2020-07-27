'use strict'
// @ts-check

const rewire = require('rewire')
const uut = rewire('../src/index')
const getAadAccessToken = uut.__get__('getAadAccessToken') // __get__ also works for non-exported fields

const sinon = require('sinon')
const tap = require('tap')
const lib = require('./lib')

tap.test('getAadAccessToken call', {}, t => {
  t.test('with function argument and withoout kv vars', ct => {
    const argumentStub = sinon.stub().returns('TESTVAL')
    const stub = sinon.stub().returns('TESTVAL2')
    const revert = uut.__set__({ getAADTokenFromMSI: stub })

    getAadAccessToken(argumentStub)
      .then((result) => {
        ct.isEqual(result, undefined)
        ct.ok(argumentStub.notCalled, 'argument was not called')
        ct.ok(stub.notCalled, 'getAADTokenFromMSI not called')
      })
      .then(() => {
        lib.cleanKvEnvVars()
        revert()
        ct.end()
      })
  })

  t.test('with function argument and kv vars', ct => {
    const argumentStub = sinon.stub().returns('TESTVAL')
    const stub = sinon.stub().returns('TESTVAL2')
    const revert = uut.__set__({ getAADTokenFromMSI: stub })
    process.env.KV_FOO = 'BAR'

    getAadAccessToken(argumentStub)
      .then((result) => {
        ct.isEqual(result, 'TESTVAL')
        ct.ok(argumentStub.called, 'argument was called')
        ct.ok(stub.notCalled, 'getAADTokenFromMSI not called')
      })
      .then(() => {
        lib.cleanKvEnvVars()
        revert()
        ct.end()
      })
  })

  t.test('with string argument and without kv vars', ct => {
    const stub = sinon.stub().returns('TESTVAL')
    const revert = uut.__set__({ getAADTokenFromMSI: stub })

    getAadAccessToken('TST')
      .then((result) => {
        ct.isEqual(result, undefined)
        ct.ok(stub.notCalled, 'getAADTokenFromMSI not called')
      })
      .then(() => {
        revert()
        lib.cleanKvEnvVars()
        ct.end()
      })
  })

  t.test('with string argument and kv vars', ct => {
    const stub = sinon.stub().returns('TESTVAL')
    const revert = uut.__set__({ getAADTokenFromMSI: stub })
    process.env.KV_FOO = 'BAR'

    getAadAccessToken('TST')
      .then((result) => {
        ct.isEqual(result, 'TST')
        ct.ok(stub.notCalled, 'getAADTokenFromMSI not called')
      })
      .then(() => {
        revert()
        lib.cleanKvEnvVars()
        ct.end()
      })
  })

  t.test('with undefined argument and without kv vars', ct => {
    const stub = sinon.stub().returns('TESTVAL')
    const revert = uut.__set__({ getAADTokenFromMSI: stub })

    getAadAccessToken(undefined)
      .then((result) => {
        ct.isEqual(result, undefined)
        ct.ok(stub.notCalled, 'getAADTokenFromMSI not called')
      })
      .then(() => {
        revert()
        lib.cleanKvEnvVars()
        ct.end()
      })
  })

  t.test('with undefined argument and kv vars', ct => {
    const stub = sinon.stub().returns('TESTVAL')
    const revert = uut.__set__({ getAADTokenFromMSI: stub })
    process.env.KV_FOO = 'BAR'

    getAadAccessToken(undefined)
      .then((result) => {
        ct.isEqual(result, 'TESTVAL')
        ct.ok(stub.called, 'getAADTokenFromMSI called')
      })
      .then(() => {
        revert()
        lib.cleanKvEnvVars()
        ct.end()
      })
  })

  t.test('fail with unsupported data', ct => {
    process.env.KV_FOO = 'BAR'
    getAadAccessToken({ aa: 'bb' })
      .then(() => {
        ct.fail()
      })
      .catch((err) => {
        ct.contains(err.message, 'Unsupported aadAccessToken')
      })
      .finally(() => {
        lib.cleanKvEnvVars()
        ct.end()
      })
  })

  t.test('fail with unsupported data 2', ct => {
    process.env.KV_FOO = 'BAR'
    getAadAccessToken(Promise.resolve('AA'))
      .then(() => {
        ct.fail()
      })
      .catch((err) => {
        ct.contains(err.message, 'Unsupported aadAccessToken')
      })
      .finally(() => {
        lib.cleanKvEnvVars()
        ct.end()
      })
  })

  t.end()
})
