/*
mocha tests for js8path-data utilities
test-utilities.js
*/

/* global describe, it */
import _cloneDeep from 'lodash/cloneDeep'
import _forEach from 'lodash/forEach'
import Ajv from 'ajv'

import js8pathData from '../../src/main.js'

let chai = require('chai')
let assert = chai.assert

describe('js8path-data utilities module', function () {
  describe('timestamp conversions', function () {
    let exampleUnixTimestamp = 1556282040
    let exampleIsoTimestamp = '2019-04-26T12:34:00Z'

    describe('utilities.timestampUnixToIso()', function () {
      let timestampUnixToIso = js8pathData.utilities.timestampUnixToIso
      it ('converts unix seconds to ISO 8601 timestamp string', function () {
        let isoFromUnix = timestampUnixToIso(exampleUnixTimestamp)
        assert.equal(isoFromUnix, exampleIsoTimestamp)
      })
    })

    describe('utilities.timestampIsoToUnix()', function () {
      let timestampIsoToUnix = js8pathData.utilities.timestampIsoToUnix
      it ('converts ISO 8601 timestamp string to unix seconds', function () {
        let unixFromIso = timestampIsoToUnix(exampleIsoTimestamp)
        assert.equal(unixFromIso, exampleUnixTimestamp)
      })
    })
  })

  describe('utilities.validOrError()', function () {
    let validOrError = js8pathData.utilities.validOrError
    let exampleDataSchema = {
      $id: 'http://example.com/schemas/exampleDataSchema.json',
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: { type: 'string' }
      }
    }
    var ajv = new Ajv({schemas: [exampleDataSchema]});
    var ajvValidator = ajv.getSchema('http://example.com/schemas/exampleDataSchema.json');
    let validExampleData = {foo: 1, bar: 'abc'}
    let exampleErrorMessage = 'this is an error'

    it ('validates valid example data', function () {
      let dataToValidate = _cloneDeep(validExampleData)
      return validOrError(
        dataToValidate,
        ajvValidator,
        exampleErrorMessage
      ).then(function (validatedData) {
        assert.deepEqual(dataToValidate, validatedData, 'returns validated error')
      })
    })

    describe('invalid example data', function () {
      let invalidExampleData = _cloneDeep(validExampleData)
      invalidExampleData.foo = {}

      it ('fails to validate invalid example data', function () {
        let dataToValidate = _cloneDeep(invalidExampleData)
        return validOrError(
          dataToValidate,
          ajvValidator,
          exampleErrorMessage
        ).then(function () {
          assert.fail('expected validation to fail')
        }).catch(function (err) {
          // console.log('err: ' + JSON.stringify(err))
          assert.equal(err.name, 'ValidationError')
          assert.equal(err.data[0].keyword, 'type', 'bad property type')
          assert.deepEqual(String(err), 'ValidationError: ' + exampleErrorMessage)
        })
      })

      it ('validate with invalid data if validation is disabled', function () {
        let dataToValidate = _cloneDeep(invalidExampleData)
        return validOrError(
          dataToValidate,
          ajvValidator,
          exampleErrorMessage,
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

  describe('utilities.freqHzToBand()', function () {
    let freqHzToBand = js8pathData.utilities.freqHzToBand

    describe('default band info table', function () {
      it ('generates a band string for a known frequency', function () {
        let band = freqHzToBand(7078000)
        assert.equal(band, '40m')
      })

      it ('generates a band string for an unknown frequency', function () {
        let band = freqHzToBand(1)
        assert.equal(band, '??')
      })
    })

    describe('alternate band info table and unknown band function', function () {
      let testOpts = {
        unknownBandFunc: (freqHz) => { return 'x' + Math.floor(freqHz / 1000000) },
        bandInfoTable: [
          { band: '0m', hzMin: 0, hzMax: 10 }
        ]
      }
      it ('generates a band string for a known frequency', function () {
        let band = freqHzToBand(1, testOpts)
        assert.equal(band, '0m')
      })

      it ('generates a band string for an unknown frequency', function () {
        let band = freqHzToBand(7078000, testOpts)
        assert.equal(band, 'x7')
      })
    })
  })

  describe('utilities.computeReceptionReportBand()', function () {
    let computeReceptionReportBand = js8pathData.utilities.computeReceptionReportBand

    it ('computes the band for a reception report without a band', function () {
      let exampleReport = {
        freqHz: 7079485
      }
      computeReceptionReportBand(exampleReport)
      assert.equal(exampleReport.band, '40m')
    })

    it ('does not re-compute the band for a reception report with a band', function () {
      let exampleReport = {
        freqHz: 7079485,
        band: 'xyz'
      }
      computeReceptionReportBand(exampleReport)
      assert.equal(exampleReport.band, 'xyz')
    })

    it ('can force a recompute of the band for a reception report with a band', function () {
      let exampleReport = {
        freqHz: 7079485,
        band: 'xyz'
      }
      computeReceptionReportBand(exampleReport, {force: true})
      assert.equal(exampleReport.band, '40m')
    })
  })

  describe('utilities.generateReceptionReportKey()', function () {
    let generateReceptionReportKey = js8pathData.utilities.generateReceptionReportKey
    let exampleReports = _cloneDeep(js8pathData.exampleData.receptionReportList)

    it ('generates key as expected', function () {
      let exampleReport = {
        timestamp: "2019-06-03T20:31:30Z",
        freqHz: 7079485,
        rxCall: "WB0SIO",
        rxGrid: "EN24WS05SK",
        txCall: "K4WLO",
        txGrid: "EM65WM",
        reportedBy: "N0JUH",
        srcType: "PSKReporter"
      }
      let expectedKey = '2019-06-03T20:31:30Z|40m|WB0SIO|K4WLO|EN24WS05SK|EM65WM|N0JUH|PSKReporter'
      let generatedKey = generateReceptionReportKey(exampleReport)
      assert.equal(generatedKey, expectedKey)
    })

    it ('generates same key for same reports', function () {
      _forEach(exampleReports, (exampleReport, reportIx) => {
        let key1 = generateReceptionReportKey(exampleReport)
        let key2 = generateReceptionReportKey(exampleReport)
        assert.equal(key1, key2, 'first example report')
      })
    })

    it ('generates different keys for different reports', function () {
      _forEach(exampleReports, (exampleReport1, reportIx1) => {
        let key1 = generateReceptionReportKey(exampleReport1)
        _forEach(exampleReports, (exampleReport2, reportIx2) => {
          if (reportIx2 !== reportIx1) {
            let key2 = generateReceptionReportKey(exampleReport2)
            assert.notEqual(key1, key2, 'example reports ' + reportIx1 + ' and ' + reportIx2)
          }
        })
      })
    })
  })

  describe('utilities.computeReceptionReportKey()', function () {
    let computeReceptionReportKey = js8pathData.utilities.computeReceptionReportKey
    let exampleReport = {
      timestamp: "2019-06-03T20:31:30Z",
      freqHz: 7079485,
      rxCall: "WB0SIO",
      rxGrid: "EN24WS05SK",
      txCall: "K4WLO",
      txGrid: "EM65WM",
      reportedBy: "N0JUH",
      srcType: "PSKReporter"
    }
    let expectedKey = '2019-06-03T20:31:30Z|40m|WB0SIO|K4WLO|EN24WS05SK|EM65WM|N0JUH|PSKReporter'


    describe ('missing key and missing key', function () {
      describe ('default keyForKey', function () {
        let reportToTest = _cloneDeep(exampleReport)
        computeReceptionReportKey(reportToTest)
        it ('computes the missing key', function () {
          assert.equal(reportToTest._key, expectedKey)
        })
        it ('also computes the missing band', function () {
          assert.equal(reportToTest.band, '40m', 'also computes the band')
        })
      })

      describe ('specified keyForKey', function () {
        let reportToTest = _cloneDeep(exampleReport)
        computeReceptionReportKey(reportToTest, {keyForKey: 'keyabc'})
        it ('computes the missing key', function () {
          assert.equal(reportToTest.keyabc, expectedKey)
        })
        it ('also computes the missing band', function () {
          assert.equal(reportToTest.band, '40m')
        })
      })
    })

    describe ('existing band and key', function () {
      describe ('do not replace', function () {
        let reportToTest = _cloneDeep(exampleReport)
        reportToTest.band = 'abc'
        reportToTest._key = 'myKey'
        computeReceptionReportKey(reportToTest)
        it ('does not recompute the existing key', function () {
          assert.equal(reportToTest._key, 'myKey')
        })
        it ('does not recomputes the existing band', function () {
          assert.equal(reportToTest.band, 'abc')
        })
      })

      describe ('force replace', function () {
        let reportToTest = _cloneDeep(exampleReport)
        reportToTest.band = 'abc'
        reportToTest._key = 'myKey'
        computeReceptionReportKey(reportToTest, {force: true})
        it ('recomputes the key', function () {
          assert.equal(reportToTest._key, expectedKey)
        })
        it ('also recomputes the missing band', function () {
          assert.equal(reportToTest.band, '40m')
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
