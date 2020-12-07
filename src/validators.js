/*
    validators - Validate js8path data objects
    validators.js
*/
import _forEach from 'lodash/forEach'

import Ajv from 'ajv'

import schema from './schema.js'
import utilities from './utilities.js'

let ajv = new Ajv({schemas: schema.schemaList})
let ajvValidate = {
  // ajv validator Functions
  receptionReportList: ajv.compile(schema.schemaDefs.reports.receptionReportList),
  receptionReport: ajv.compile(schema.schemaDefs.reports.receptionReport)
}

let validate = {}

validate.receptionReportList = function (receptionReportList, validate = true) {
  // validate reception report list data
  // return promise with the receptionReportList or fail with ValidationError
  return utilities.validOrError (
    receptionReportList,
    ajvValidate.receptionReportList,
    'Invalid receptionReportList',
    validate
  )
}

validate.receptionReport = function (receptionReport, validate = true) {
  // validate reception report data
  // return promise with the receptionReport or fail with ValidationError
  return utilities.validOrError (
    receptionReport,
    ajvValidate.receptionReport,
    'Invalid receptionReport',
    validate
  )
}

let process = {}

process.filterReportList = function (receptionReportList) {
  // filter report list, returning promise with list of only valid reception reports
  return validate.receptionReportList(
    receptionReportList, true
  ).then(function (validatedList) {
    // easy case, all the original reception reports were good
    return Promise.resolve(validatedList)
  }).catch(function (err) {
    if (err.name !== 'ValidationError') {
      // oops, some non-validation error
      throw err
    }
    // validate the reports one-by-one, filtering out the bad ones
    let goodReports = []
    let p = Promise.resolve(goodReports) // dummy promise to start sequential promise chain
    _forEach(receptionReportList, function (receptionReport) {
      p = p.then(function (goodReports) {
        return validate.receptionReport(
          receptionReport
        ).then(function (validReceptionReport) {
          goodReports.push(validReceptionReport)
          return Promise.resolve(goodReports)
        }).catch(function (err) {
          if (err.name !== 'ValidationError') {
            // oops, some non-validation error
            throw err
          }
          // otherwise, just continue, skipping the invalid report
          return Promise.resolve(goodReports)
        })
      })
    })
    return p
  })
}

export default {
  ajvValidate: ajvValidate,
  validate: validate,
  process: process
}
