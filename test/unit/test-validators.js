/*
mocha tests for js9path-data validators (and example-data)
test-validators.js
*/

/* global describe, it */
import _cloneDeep from 'lodash/cloneDeep'

import js8pathData from '../../src/main.js'
let exampleData = js8pathData.exampleData

let chai = require('chai')
let assert = chai.assert

describe('pskReporter validators module', function () {
  let validators = js8pathData.validators

  describe('validators.ajvValidate', function () {
    describe('validators.ajvValidate.receptionReportList', function () {
      let validate = validators.ajvValidate.receptionReportList
      let validExampleData = _cloneDeep(exampleData.receptionReportList)

      it ('validates valid example data', function () {
        let dataToValidate = _cloneDeep(validExampleData)
        assert.isOk(validate(dataToValidate), 'validates against schema')
      })

      describe('invalid data', function () {
        it ('fails to validate completely invalid reception report', function () {
          let dataToValidate = _cloneDeep(validExampleData)
          dataToValidate.push('123')
          assert.isNotOk(validate(dataToValidate))
          let errors = validate.errors
          assert.equal(errors[0].keyword, 'type', 'bad reception report in list')
        })

        it ('fails to validate reception report with bad reportedBy', function () {
          let dataToValidate = _cloneDeep(validExampleData)
          dataToValidate[0].reportedBy = {}
          assert.isNotOk(validate(dataToValidate))
          let errors = validate.errors
          assert.equal(errors[0].keyword, 'type', 'bad reception report in list ' + errors[0].keyword)
        })
      })
    })

    describe('validators.ajvValidate.receptionReport', function () {
      let validate = validators.ajvValidate.receptionReport
      let validExampleData = _cloneDeep(exampleData.receptionReportList[0])

      it ('validates valid example data', function () {
        let dataToValidate = _cloneDeep(validExampleData)
        assert.isOk(validate(dataToValidate), 'validates against schema')
      })

      it ('fails to validate invalid example data', function () {
        let dataToValidate = _cloneDeep(validExampleData)
        dataToValidate.timestamp = {}
        assert.isNotOk(validate(dataToValidate))
        let errors = validate.errors
        assert.equal(errors[0].keyword, 'type', 'bad timestamp')
      })
    })
  })

  describe('validators.validate', function () {
    describe('validators.validate.receptionReportList', function () {
      let validate = validators.validate.receptionReportList
      let validExampleData = _cloneDeep(exampleData.receptionReportList)

      it ('validates valid example data', function () {
        let dataToValidate = _cloneDeep(validExampleData)
        return validate(
          dataToValidate
        ).then(function (validatedData) {
          assert.deepEqual(dataToValidate, validatedData, 'returns validated data')
        })
      })

      describe('invalid example data', function () {
        let invalidExampleData = _cloneDeep(validExampleData)
        invalidExampleData.push('123')

        it ('fails to validate invalid example data', function () {
          let dataToValidate = _cloneDeep(invalidExampleData)
          return validate(
            dataToValidate
          ).then(function () {
            assert.fail('expected validation to fail')
          }).catch(function (err) {
            // console.log('err: ' + JSON.stringify(err))
            assert.equal(err.name, 'ValidationError')
            assert.equal(err.data[0].keyword, 'type', 'bad list entry')
            assert.deepEqual(String(err), 'ValidationError: Invalid receptionReportList', 'Invalid receptionReportList')
          })
        })

        it ('validate with invalid data if validation is disabled', function () {
          let dataToValidate = _cloneDeep(invalidExampleData)
          return validate(
            dataToValidate,
            false
          ).then(function (validatedData) {
            assert.deepEqual(validatedData, dataToValidate, 'returns unvalidated invalid data as expected')
          }).catch(function (err) {
            // console.log('err: ' + JSON.stringify(err))
            assert.fail('expected validation to pass: ' + JSON.stringify(err))
          })
        })
      })
    })

    describe('validators.validate.receptionReport', function () {
      let validate = validators.validate.receptionReport
      let validExampleData = _cloneDeep(exampleData.receptionReportList[0])

      it ('validates valid example data', function () {
        let dataToValidate = _cloneDeep(validExampleData)
        return validate(
          dataToValidate
        ).then(function (validatedData) {
          assert.deepEqual(dataToValidate, validatedData, 'returns validated data')
        })
      })

      describe('invalid example data', function () {
        let invalidExampleData = _cloneDeep(validExampleData)
        invalidExampleData.timestamp = {}

        it ('fails to validate invalid example data', function () {
          let dataToValidate = _cloneDeep(invalidExampleData)
          return validate(
            dataToValidate
          ).then(function () {
            assert.fail('expected validation to fail')
          }).catch(function (err) {
            // console.log('err: ' + JSON.stringify(err))
            assert.equal(err.name, 'ValidationError')
            assert.equal(err.data[0].keyword, 'type', 'bad timestamp')
            assert.deepEqual(String(err), 'ValidationError: Invalid receptionReport', 'Invalid receptionReport')
          })
        })

        it ('validate with invalid data if validation is disabled', function () {
          let dataToValidate = _cloneDeep(invalidExampleData)
          return validate(
            dataToValidate,
            false
          ).then(function (validatedData) {
            assert.deepEqual(validatedData, dataToValidate, 'returns unvalidated invalid data as expected')
          }).catch(function (err) {
            // console.log('err: ' + JSON.stringify(err))
            assert.fail('expected validation to pass: ' + JSON.stringify(err))
          })
        })
      })
    })
  })

  describe('validators.process', function () {
    describe('validators.process.filterReportList', function () {
      let filterReportList = validators.process.filterReportList
      let validExampleData = _cloneDeep(exampleData.receptionReportList)

      it ('filter passes all valid example data', function () {
        let dataToFilter = _cloneDeep(validExampleData)
        return filterReportList(
          dataToFilter
        ).then(function (filteredReports) {
          assert.deepEqual(filteredReports, dataToFilter, 'filtered data same as original valid list')
        })
      })

      it ('filter skips invalid reports', function () {
        let dataToFilter = _cloneDeep(validExampleData)
        dataToFilter.splice( 1, 0, 123) // not a valid report
        dataToFilter.push('abc') // not a valid report
        return filterReportList(
          dataToFilter
        ).then(function (filteredReports) {
          assert.deepEqual(filteredReports, validExampleData, 'filtered data same as original valid list, without added invalid entries')
        })
      })
    })
  })
})

/*
        assert.isNotOk(validate(dataToValidate))
        let errors = validate.errors
        console.log('errors: ' + JSON.stringify(errors))
        assert.equal(JSON.stringify(errors), '...')
 */
