/*
mocha tests for example data
test-example-data.js
*/

/* global describe, it */
import _isArray from 'lodash/isArray'

import js8pathData from '../../src/main.js'

let chai = require('chai')
let assert = chai.assert

describe('example-data module', function () {
  let exampleData = js8pathData.exampleData

  describe('exampleData.receptionReportList', function () {
    it('is an array', function () {
      assert.isOk(_isArray(exampleData.receptionReportList), 'isArray')
    })
    it('is validated against schema in test-validator: validators.ajvValidate.receptionReportList', function () {
    })
  })
})

/*
        assert.isNotOk(validate(dataToValidate))
        let errors = validate.errors
        console.log(JSON.stringify(errors))
        assert.equal(JSON.stringify(errors), '...')
 */
