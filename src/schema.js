/*
  Schema definitions (structured index and list)
  schema.js
*/

import _forOwn from 'lodash/forOwn'

let stringPatterns = {
  // FixMe: needs tests
  positiveIntegerString: '^[1-9]\\d*$',
  positiveIntegerRangeString: '^[1-9]\\d*]\\-[1-9]\\d*$',
  integerString: '^\\-?[1-9]\\d*$',
  isoUtcTimestamp: '^\\d{4}\\-\\d{2}\\-\\d{2}T\\d{2}\\:\\d{2}\\:\\d{2}Z$',
  maidenhead: '^^[a-rA-R]{2}[0-9]{2}([a-xA-X]{2}([0-9]{2})?)*$$', // FixMe: not quite right
  // callsign from https://gist.github.com/JoshuaCarroll/f6b2c64992dfe23feed49a117f5d1a43
  // callsign: '[a-zA-Z0-9]{1,3}[0123456789][a-zA-Z0-9]{0,3}[a-zA-Z]',
  callsign: '^.*$', // pskreporter may not have valid callsigns
  // emailAddress from https://emailregex.com/
  emailAddress: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
}

let schemaIdPrefix = 'http://schemas.js8path.net/js8path/data'

// compilation of all individual schemas
let schemaDefs = {
  general: {
    // FixMe: needs tests
    positiveIntegerString: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: schemaIdPrefix + '/general/positiveIntegerString.json',
      title: 'Positive Integer String',
      description: 'A positive integer string',
      type: 'string',
      pattern: stringPatterns.positiveIntegerString
    },
    integerString: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: schemaIdPrefix + '/general/integerString.json',
      title: 'Integer String',
      description: 'An integer string',
      type: 'string',
      pattern: stringPatterns.integerString
    }
  },
  reports: {
    receptionReportList: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: schemaIdPrefix + '/reports/receptionReportList.json',
      title: 'Reception Report List',
      description: 'List of Reception Reports',
      type: 'array',
      items: {$ref: schemaIdPrefix + '/reports/receptionReport.json'}
    },
    receptionReport: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: schemaIdPrefix + '/reports/receptionReport.json',
      title: 'Reception Report',
      description: 'Data about one reception report from the query results',
      type: 'object',
      properties: {
        timestamp: {
          title: 'report timestamp',
          description: 'ISO-8601 timestamp of report',
          type: 'string',
          pattern: stringPatterns.isoUtcTimestamp
        },
        freqHz: {
          title: 'Frequency (Hz)',
          description: 'The frequency of the receiver in Hertz',
          type: 'integer',
          minimum: 0
        },
        band: {
          title: 'Band',
          description: 'The name of the amateur radio band',
          type: 'string'
        },
        sNR: {
          title: 'sNR',
          description: 'Signal to Noise ratio in decibels, if reported',
          type: ['integer', 'null']
        },
        rxCall: {
          title: 'Receiver Callsign',
          description: 'The callsign of the receiver',
          type: 'string',
          pattern: stringPatterns.callsign
        },
        rxGrid: {
          title: 'Receiver Grid',
          description: 'The maidenhead locator of the receiver',
          type: 'string',
          pattern: stringPatterns.maidenhead
        },
        txCall: {
          title: 'Sender Callsign',
          description: 'The callsign of the sender',
          type: 'string',
          pattern: stringPatterns.callsign
        },
        txGrid: {
          title: 'Sender Grid',
          description: 'The maidenhead locator of the sender',
          type: 'string',
          pattern: stringPatterns.maidenhead
        },
        reportedBy: {
          title: 'Reported By',
          description: 'The call (or other identifier) for who created the reception report',
          type: ['string', 'null']
        },
        srcType: {
          title: 'Data Source Type',
          description: 'Code for the source of the data',
          type: ['string', 'null']
        },
        srcData: {
          title: 'Source Data',
          description: 'Raw source dataCode for the source of the data',
          type: ['object', 'array', 'string', 'null']
        }
      },
      required: [
        'timestamp', 'freqHz', 'sNR',
        'rxCall', 'rxGrid',
        'txCall', 'txGrid'
      ]
    }
  }
}

let schemaList = []
_forOwn(schemaDefs, function (value1) {
  if (value1.$schema) {
    schemaList.push(value1)
  } else {
    _forOwn(value1, function (value2) {
      if (value2.$schema) {
        schemaList.push(value2)
      }
    })
  }
})

export default {
  stringPatterns: stringPatterns,
  schemaIdPrefix: schemaIdPrefix,
  schemaDefs: schemaDefs,
  schemaList: schemaList
}
