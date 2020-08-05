# azure-msi-keyvault

![Travis (.org)](https://img.shields.io/travis/jikuja/azure-msi-keyvault)
![npm](https://img.shields.io/npm/v/azure-msi-keyvault)
![GitHub](https://img.shields.io/github/license/jikuja/azure-msi-keyvault)

Azure-msi-keyvault is a set of helper functions to enrich Azure function app environment variables with Keyvault secrets and to fetch Azure AD(AAD)
tokens with Managed Service Identity(MSI) service.

Environment variables matching with `KV_{basename}` are assumed to contain keyvault URL and for all matching environment variable secret is fetch from
keyvault and stored into mathing environment variables named as `{basename}`. Alternatively AAD token can be fetched and used with other Azure services.

## Installation

Install the package
* `npm install --save-prod azure-msi-keyvault`

## Usage

### Keyvault secrets

Import package and start "background" process to enrich environment variables. Third line is optional but recommended:
```javascript
const amk = require('azure-msi-keyvault')
const p = amk.enrichEnvvarsWithKvSecrets()
p.catch(() => {})
```

then use result in the Azure function app handler
```javascript
module.exports = async function (context, req) {
    return p.then((result) => {
        context.log('kv ok: ' + result)
        context.res = {
            status: 200,
            body : {
                "secretValue" : process.env.MY_SECRET_KV_VALUE,
                "source": process.env.KV_MY_SECRET_KV_VALUE
            }
        }
    }).catch((err) => {
        context.log('kv fail: ' + err)
        throw err
    })
}
```

Using this code requires setting up MSI for function app, keyvault, keyvault authorziation for MSI, source environment variable
and the secret itself.

See TBD for full example.

### Azure AD tokens

To fetch AAD token just call function `getAADTokenFromMSI()`:

```javascript
const getAADTokenFromMSI = require('azure-msi-keyvault').getAADTokenFromMSI

module.exports = async function (context, req) {
    return getAADTokenFromMSI().then((token) => {
        const result = await(doSomething(token))
        context.res = {
            status: 200,
            body : {
                "token" : result
            }
        }
    }).catch((err) => {
        throw err
    })
}
```

## License

Copyright 2020 jikuja

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
