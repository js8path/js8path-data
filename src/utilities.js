/*
    utilities - js8path-data utility functions
    utilities.js
*/

import _assign from 'lodash/assign'
import _find from 'lodash/find'
import _join from 'lodash/join'
import _map from 'lodash/map'
import moment from 'moment'
import AnnotatedError from '@js8path/annotated-error'

function timestampIsoToUnix (isoTimestamp) {
  // convert an ISO 8601 timestamp to a unix seconds value
  let m = moment(isoTimestamp)
  return m.unix()
}

function timestampUnixToIso (unixSeconds) {
  // convert a unix seconds value to an ISO 8601 timestamp
  // FixMe: add parameter flag to allow decimal seconds in ISO timestamp
  let m = moment.unix(unixSeconds).utc()
  return m.format()
}

function validOrError (dataToValidate, ajvValidator, errorMessage, validate = true) {
  // validates the dataToValidate
  // return promise with the dataToValidate or fail with ValidationError
  if (validate && !ajvValidator(dataToValidate)) {
    return Promise.reject(
      new AnnotatedError(
        {
          name: 'ValidationError',
          data: ajvValidator.errors,
          message: errorMessage
        }
      )
    )
  }
  return Promise.resolve(dataToValidate)
}

let defaultOptions = {
  bandInfoTable: [
    { band: '2200m', hzMin: 135700, hzMax: 137800 },
    { band: '600m', hzMin: 472000, hzMax: 479000 },
    { band: '160m', hzMin: 1842000, hzMax: 1845000 },
    { band: '160m!', hzMin: 1800000, hzMax: 2000000 },
    { band: '80m', hzMin: 3578000, hzMax: 3581000 },
    { band: '80m!', hzMin: 3500000, hzMax: 4000000 },
    { band: '60m', hzMin: 5060000, hzMax: 5450000 },
    { band: '40m', hzMin: 7078000, hzMax: 7081000 },
    { band: '40m!', hzMin: 7000000, hzMax: 7300000 },
    { band: '30m', hzMin: 10130000, hzMax: 10133000 },
    { band: '30m!', hzMin: 10100000, hzMax: 10150000 },
    { band: '20m', hzMin: 14078000, hzMax: 14081000 },
    { band: '20m!', hzMin: 14000000, hzMax: 14350000 },
    { band: '17m', hzMin: 18104000, hzMax: 18107000 },
    { band: '17m!', hzMin: 18068000, hzMax: 18168000 },
    { band: '15m', hzMin: 21078000, hzMax: 21081000 },
    { band: '15m!', hzMin: 21000000, hzMax: 21450000 },
    { band: '12m', hzMin: 24922000, hzMax: 24925000 },
    { band: '12m!', hzMin: 24890000, hzMax: 24990000 },
    { band: '11m', hzMin: 26960000, hzMax: 27410000 },
    { band: '10m', hzMin: 28078000, hzMax: 28081000 },
    { band: '10m!', hzMin: 28000000, hzMax: 29700000 },
    { band: '6m', hzMin: 50318000, hzMax: 50321000 },
    { band: '6m!', hzMin: 50000000, hzMax: 54000000 },
    { band: '2m', hzMin: 144178000, hzMax: 144181000 },
    { band: '2m!', hzMin: 14400000, hzMax: 148000000 },
    { band: '1.25m', hzMin: 22200000, hzMax: 225000000 },
    { band: '70cm', hzMin: 42000000, hzMax: 450000000 }
  ],
  unknownBandFunc: (/* freqHz */) => {
    // return MHz portion of frequency as string
    return '??'
  },
  receptionReportKeyForKey: '_key',
  receptionReportKeySeparator: '|',
  receptionReportKeyItems: [
    'timestamp',
    'band',
    'rxCall',
    'txCall',
    'rxGrid',
    'txGrid',
    'reportedBy',
    'srcType'
  ]
}

let freqHzToBandBandOptsDefault = {
  bandInfoTable: defaultOptions.bandInfoTable,
  unknownBandFunc: defaultOptions.unknownBandFunc
}

function freqHzToBand (freqHz, opts = {}) {
  // generate a band string from an integer frequenzy in Hz
  opts = _assign({}, freqHzToBandBandOptsDefault, opts)
  let bandInfoEntry = _find(opts.bandInfoTable, (bandInfoEntry) => {
    return freqHz >= bandInfoEntry.hzMin && freqHz <= bandInfoEntry.hzMax
  })
  return  bandInfoEntry ? bandInfoEntry.band : opts.unknownBandFunc(freqHz)
}

let computeReceptionReportBandOptsDefault = {
  force: false,
  bandInfoTable: defaultOptions.bandInfoTable,
  unknownBandFunc: defaultOptions.unknownBandFunc
}

function computeReceptionReportBand (receptionReport, opts = {}) {
  // compute and set the band for the given reception report
  // if force is true, the band value will be
  opts = _assign({}, computeReceptionReportBandOptsDefault, opts)
  if (!receptionReport.band || opts.force) {
    receptionReport.band = freqHzToBand(
      receptionReport.freqHz,
      {
        bandInfoTable: opts.bandInfoTable,
        unknownBandFunc: opts.unknownBandFunc
      }
    )
  }
}

let generateReceptionReportKeyOptsDefault = {
  receptionReportKeySeparator: defaultOptions.receptionReportKeySeparator,
  receptionReportKeyItems: defaultOptions.receptionReportKeyItems,
  bandInfoTable: defaultOptions.bandInfoTable,
  unknownBandFunc: defaultOptions.unknownBandFunc
}

function generateReceptionReportKey (receptionReport, opts = {}) {
  // generate a unique key for a reception report
  opts = _assign({}, generateReceptionReportKeyOptsDefault, opts)
  let band = receptionReport.band
  if (!band) {
    band = freqHzToBand (
      receptionReport.freqHz,
      {
      bandInfoTable: opts.bandInfoTable,
      unknownBandFunc: opts.unknownBandFunc
      }
    )
  }
  let keyData = _map(opts.receptionReportKeyItems, (keyItem) => {
    let keyValue = receptionReport[keyItem]
    if (keyItem === 'band' && !keyValue) {
      keyValue = freqHzToBand(
        receptionReport.freqHz,
        {
          bandInfoTable: opts.bandInfoTable,
          unknownBandFunc: opts.unknownBandFunc
        }
      )
    }
    return keyValue
  })
  return _join(keyData, opts.receptionReportKeySeparator)
}

let computeReceptionReportKeyOptsDefault = {
  force: false,
  keyForKey: defaultOptions.receptionReportKeyForKey,
  receptionReportKeySeparator: defaultOptions.receptionReportKeySeparator,
  receptionReportKeyItems: defaultOptions.receptionReportKeyItems,
  bandInfoTable: defaultOptions.bandInfoTable,
  unknownBandFunc: defaultOptions.unknownBandFunc
}

function computeReceptionReportKey (receptionReport, opts = {}) {
  // compute and set the key for the given reception report
  // if force is true, the band and key values will be recomputed
  opts = _assign({}, computeReceptionReportKeyOptsDefault, opts)
  computeReceptionReportBand (
    receptionReport,
    {
      force: opts.force,
      bandInfoTable: opts.bandInfoTable,
      unknownBandFunc: opts.unknownBandFunc
    }
  )
  if (!receptionReport[opts.keyForKey] || opts.force) {
    receptionReport[opts.keyForKey] = generateReceptionReportKey(
      receptionReport,
      {
        receptionReportKeySeparator: opts.receptionReportKeySeparator,
        receptionReportKeyItems: opts.receptionReportKeyItems,
        bandInfoTable: opts.bandInfoTable,
        unknownBandFunc: opts.unknownBandFunc
      }
    )
  }
}

export default {
  timestampIsoToUnix: timestampIsoToUnix,
  timestampUnixToIso: timestampUnixToIso,
  validOrError: validOrError,
  defaultOptions: defaultOptions,
  freqHzToBand: freqHzToBand,
  computeReceptionReportBand: computeReceptionReportBand,
  generateReceptionReportKey: generateReceptionReportKey,
  computeReceptionReportKey: computeReceptionReportKey
}
